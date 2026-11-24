const cors = require('cors');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');
const { createHash, randomBytes } = require('node:crypto');
const { z } = require('zod');
const { createRepository } = require('./data/repository');

const petSpecies = [
  'cat', 'dog', 'bird', 'hamster', 'sugar-glider', 'rabbit', 'turtle', 'fish', 'hedgehog',
];
const petStatuses = ['available', 'reserved', 'adopted'];
const applicationStatuses = ['pending', 'reviewing', 'approved', 'declined', 'closed'];
const uuidSchema = z.string().uuid();
const httpsUrlSchema = z.string().url().refine((value) => new URL(value).protocol === 'https:');
const imageUrlSchema = z.union([httpsUrlSchema, z.literal('')]).optional();

const petPayloadSchema = z.object({
  shelter_id: uuidSchema,
  name: z.string().trim().min(1).max(80),
  species: z.enum(petSpecies),
  breed: z.string().trim().max(100),
  age_months: z.number().int().min(0).max(600),
  sex: z.enum(['male', 'female']),
  description: z.string().trim().min(1).max(2000),
  status: z.enum(petStatuses),
  image_url: imageUrlSchema,
  is_published: z.boolean(),
}).strict();

const shelterPayloadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  location: z.string().trim().min(1).max(200),
  phone: z.string().trim().max(32),
  email: z.union([z.string().trim().email().max(254), z.literal('')]),
  description: z.string().trim().min(1).max(2000),
  image_url: imageUrlSchema,
  is_published: z.boolean(),
}).strict();

const applicationPayloadSchema = z.object({
  pet_id: uuidSchema,
  applicant_name: z.string().trim().min(2).max(80),
  email: z.union([z.string().trim().email().max(254), z.literal('')]).optional(),
  domicile: z.string().trim().min(2).max(150),
  adoption_reason: z.string().trim().min(10).max(1000),
  pet_experience: z.string().trim().min(2).max(1000),
  message: z.string().trim().max(1000).optional().default(''),
  consent: z.literal(true),
}).strict();

const applicationAccessTokenSchema = z.string().regex(/^[a-f0-9]{64}$/);
const petListQuerySchema = z.object({
  species: z.enum(petSpecies).or(z.literal('all')).optional(),
  status: z.enum(petStatuses).or(z.literal('all')).optional(),
  q: z.string().trim().max(80).optional(),
  ageMin: z.coerce.number().int().min(0).max(600).optional(),
  ageMax: z.coerce.number().int().min(0).max(600).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
}).strict().refine(
  (value) => value.ageMin === undefined || value.ageMax === undefined || value.ageMin <= value.ageMax,
  { message: 'Rentang usia tidak valid.' },
);

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function asyncHandler(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

function parseBody(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ApiError(400, 'INVALID_INPUT', result.error.issues[0]?.message || 'Data tidak valid.');
  }
  return result.data;
}

function redactSensitiveText(value) {
  let text = String(value || '');
  const secretVariablePattern = /(?:KEY|TOKEN|SECRET|PASSWORD|PASSWD|DATABASE_URL)/i;
  for (const [name, secret] of Object.entries(process.env)) {
    if (secret && secretVariablePattern.test(name)) {
      text = text.split(secret).join('[REDACTED]');
    }
  }

  return text
    .replace(/\b(Bearer|Basic)\s+[^\s"'`]+/gi, '$1 [REDACTED]')
    .replace(
      /\b([\w-]*(?:key|token|secret|password|passwd|authorization))\s*([:=])\s*["']?[^&\s,"'`;]+/gi,
      (_match, name, separator) => `${name}${separator}[REDACTED]`,
    )
    .replace(/(https?:\/\/)[^/\s:@]+:[^/@\s]+@/gi, '$1[REDACTED]@');
}

function requireAdmin(repository, adminId) {
  return asyncHandler(async (request, _response, next) => {
    if (typeof repository.verifyAccessToken !== 'function' || !adminId) {
      throw new ApiError(503, 'ADMIN_NOT_CONFIGURED', 'Akses admin belum dikonfigurasi.');
    }

    const authorization = request.get('authorization') || '';
    const token = authorization.match(/^Bearer ([^\s]+)$/i)?.[1];
    if (!token) throw new ApiError(401, 'AUTH_REQUIRED', 'Login admin diperlukan.');

    const user = await repository.verifyAccessToken(token);
    if (!user) throw new ApiError(401, 'INVALID_SESSION', 'Sesi login tidak valid.');
    if (user.id !== adminId) {
      throw new ApiError(403, 'ADMIN_ONLY', 'Akses hanya untuk admin PawLoka.');
    }

    request.admin = { id: user.id };
    next();
  });
}

function createApp({ repository = createRepository(), adminId = process.env.ADMIN_USER_ID } = {}) {
  const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean)

if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://127.0.0.1:4173',
    'http://localhost:4173'
  )
}

  app.set('trust proxy', process.env.VERCEL ? 1 : false);
  app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Origin is not allowed by CORS'))
  },
}));
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_request, response) => {
    response.json({ data: { status: 'ok' } });
  });

  app.get('/api/pets', asyncHandler(async (request, response) => {
    const filters = parseBody(petListQuerySchema, request.query);
    response.json({ data: await repository.listPets(filters) });
  }));

  app.get('/api/pets/:id', asyncHandler(async (request, response) => {
    if (!uuidSchema.safeParse(request.params.id).success) {
      throw new ApiError(400, 'INVALID_ID', 'ID hewan tidak valid.');
    }
    const pet = await repository.getPet(request.params.id);
    if (!pet) throw new ApiError(404, 'PET_NOT_FOUND', 'Hewan tidak ditemukan.');
    response.json({ data: pet });
  }));

  app.get('/api/shelters', asyncHandler(async (_request, response) => {
    response.json({ data: await repository.listShelters() });
  }));

  app.get('/api/shelters/:id', asyncHandler(async (request, response) => {
    if (!uuidSchema.safeParse(request.params.id).success) {
      throw new ApiError(400, 'INVALID_ID', 'ID shelter tidak valid.');
    }
    const shelter = await repository.getShelter(request.params.id);
    if (!shelter) throw new ApiError(404, 'SHELTER_NOT_FOUND', 'Shelter tidak ditemukan.');
    response.json({ data: shelter });
  }));

  const applicationRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      error: { code: 'RATE_LIMITED', message: 'Terlalu banyak percobaan. Coba lagi nanti.' },
    },
  });
  const applicationHistoryRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      error: { code: 'RATE_LIMITED', message: 'Terlalu banyak percobaan. Coba lagi nanti.' },
    },
  });

  app.post('/api/applications', applicationRateLimit, asyncHandler(async (request, response) => {
    const input = parseBody(applicationPayloadSchema, request.body);
    const pet = await repository.getPet(input.pet_id);
    if (!pet || pet.status !== 'available') {
      throw new ApiError(409, 'PET_UNAVAILABLE', 'Hewan ini tidak tersedia untuk pengajuan.');
    }
    if (typeof repository.createApplication !== 'function') {
      throw new ApiError(503, 'DATA_MODE_READ_ONLY', 'Pengajuan belum aktif pada mode demo lokal.');
    }

    const accessToken = randomBytes(32).toString('hex');
    const application = await repository.createApplication({
      pet_id: pet.id,
      shelter_id: pet.shelter_id,
      applicant_name: input.applicant_name,
      email: input.email || null,
      phone: null,
      domicile: input.domicile,
      adoption_reason: input.adoption_reason,
      pet_experience: input.pet_experience,
      message: input.message,
      consent_at: new Date().toISOString(),
      status: 'pending',
      access_token_hash: createHash('sha256').update(accessToken).digest('hex'),
    });
    response.status(201).json({
      data: {
        id: application.id,
        status: application.status,
        created_at: application.created_at,
        access_token: accessToken,
      },
    });
  }));

  app.get('/api/applications', (_request, _response, next) => {
    next(new ApiError(404, 'APPLICATION_LIST_UNAVAILABLE', 'Daftar pengajuan tidak tersedia.'));
  });

  app.get('/api/applications/:id', applicationHistoryRateLimit, asyncHandler(async (request, response) => {
    response.set('Cache-Control', 'no-store');
    if (!uuidSchema.safeParse(request.params.id).success) {
      throw new ApiError(400, 'INVALID_ID', 'ID pengajuan tidak valid.');
    }

    const accessToken = request.get('x-application-access-token') || '';
    if (!applicationAccessTokenSchema.safeParse(accessToken).success) {
      throw new ApiError(404, 'APPLICATION_NOT_FOUND', 'Riwayat pengajuan tidak ditemukan.');
    }
    if (typeof repository.getClaimedApplication !== 'function') {
      throw new ApiError(503, 'DATA_MODE_READ_ONLY', 'Riwayat pengajuan belum aktif pada mode demo lokal.');
    }

    const tokenHash = createHash('sha256').update(accessToken).digest('hex');
    const application = await repository.getClaimedApplication(request.params.id, tokenHash);
    if (!application) {
      throw new ApiError(404, 'APPLICATION_NOT_FOUND', 'Riwayat pengajuan tidak ditemukan.');
    }

    response.json({ data: application });
  }));

  app.use('/api/admin', requireAdmin(repository, adminId));

  app.get('/api/admin/applications', asyncHandler(async (_request, response) => {
    response.json({ data: await repository.listApplications() });
  }));

  app.patch('/api/admin/applications/:id', asyncHandler(async (request, response) => {
    if (!uuidSchema.safeParse(request.params.id).success) {
      throw new ApiError(400, 'INVALID_ID', 'ID pengajuan tidak valid.');
    }
    const input = parseBody(z.object({ status: z.enum(applicationStatuses) }).strict(), request.body);
    const application = await repository.updateApplication(request.params.id, input);
    if (!application) throw new ApiError(404, 'APPLICATION_NOT_FOUND', 'Pengajuan tidak ditemukan.');
    response.json({ data: application });
  }));

  app.delete('/api/admin/applications/:id', asyncHandler(async (request, response) => {
    if (!uuidSchema.safeParse(request.params.id).success) {
      throw new ApiError(400, 'INVALID_ID', 'ID pengajuan tidak valid.');
    }
    const application = await repository.deleteApplication(request.params.id);
    if (!application) throw new ApiError(404, 'APPLICATION_NOT_FOUND', 'Pengajuan tidak ditemukan.');
    response.status(204).end();
  }));

  for (const resource of ['pets', 'shelters']) {
    const collectionPath = `/api/admin/${resource}`;
    const itemPath = `${collectionPath}/:id`;
    const schema = resource === 'pets' ? petPayloadSchema : shelterPayloadSchema;
    const listMethod = resource === 'pets' ? 'listAdminPets' : 'listAdminShelters';
    const createMethod = resource === 'pets' ? 'createPet' : 'createShelter';
    const updateMethod = resource === 'pets' ? 'updatePet' : 'updateShelter';
    const deleteMethod = resource === 'pets' ? 'deletePet' : 'deleteShelter';

    app.get(collectionPath, asyncHandler(async (_request, response) => {
      response.json({ data: await repository[listMethod]({ limit: 100 }) });
    }));

    app.post(collectionPath, asyncHandler(async (request, response) => {
      const input = parseBody(schema, request.body);
      response.status(201).json({ data: await repository[createMethod](input) });
    }));

    app.patch(itemPath, asyncHandler(async (request, response) => {
      if (!uuidSchema.safeParse(request.params.id).success) {
        throw new ApiError(400, 'INVALID_ID', 'ID data tidak valid.');
      }
      const input = parseBody(schema.partial().strict(), request.body);
      if (!Object.keys(input).length) {
        throw new ApiError(400, 'EMPTY_UPDATE', 'Tidak ada perubahan untuk disimpan.');
      }
      const item = await repository[updateMethod](request.params.id, input);
      if (!item) throw new ApiError(404, 'ITEM_NOT_FOUND', 'Data tidak ditemukan.');
      response.json({ data: item });
    }));

    app.delete(itemPath, asyncHandler(async (request, response) => {
      if (!uuidSchema.safeParse(request.params.id).success) {
        throw new ApiError(400, 'INVALID_ID', 'ID data tidak valid.');
      }
      const item = await repository[deleteMethod](request.params.id);
      if (!item) throw new ApiError(404, 'ITEM_NOT_FOUND', 'Data tidak ditemukan.');
      response.status(204).end();
    }));
  }

  app.use((error, request, response, _next) => {
    if (error.message === 'Origin is not allowed by CORS') {
      response.status(403).json({
        error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Origin tidak diizinkan.' },
      });
      return;
    }

    if (error.type === 'entity.too.large') {
      response.status(413).json({
        error: { code: 'REQUEST_TOO_LARGE', message: 'Data yang dikirim terlalu besar.' },
      });
      return;
    }

    if (error instanceof SyntaxError && 'body' in error) {
      response.status(400).json({
        error: { code: 'INVALID_JSON', message: 'Format data tidak valid.' },
      });
      return;
    }

    if (error.code === '23503') {
      response.status(409).json({
        error: { code: 'RELATED_DATA_EXISTS', message: 'Data masih digunakan oleh pengajuan.' },
      });
      return;
    }

    if (error instanceof ApiError) {
      response.status(error.status).json({
        error: { code: error.code, message: error.message },
      });
      return;
    }

    const detailCauseCode = typeof error.details === 'string'
      ? error.details.match(/\(([A-Z][A-Z0-9_]+)\)/)?.[1]
      : undefined;
    const errorDetails = {
      path: request.path,
      errorName: error.name || 'Error',
      errorCode: error.code || error.cause?.code || detailCauseCode || 'UNKNOWN',
    };
    if (process.env.NODE_ENV !== 'production') {
      errorDetails.errorMessage = redactSensitiveText(error.message);
      if (error.stack) errorDetails.errorStack = redactSensitiveText(error.stack);
      if (error.details) errorDetails.errorDetails = redactSensitiveText(error.details);
      if (error.hint) errorDetails.errorHint = redactSensitiveText(error.hint);
      if (error.cause) {
        errorDetails.causeMessage = redactSensitiveText(error.cause.message);
        if (error.cause.stack) errorDetails.causeStack = redactSensitiveText(error.cause.stack);
      }
    }
    console.error('API request failed', errorDetails);
    response.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Permintaan gagal. Coba lagi.' },
    });
  });

  return app;
}

module.exports = { ApiError, createApp };
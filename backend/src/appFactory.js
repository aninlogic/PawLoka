const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const { z } = require('zod');
const { createRepository } = require('./data/repository');
const { createPetModel } = require('./models/petModel');

const { createPetController } = require('./controllers/petController');
const {
  createPetRoutes,
  createAdminPetRoutes,
} = require('./routes/petRoutes');

const { createShelterModel } = require('./models/shelterModel');

const { createShelterController } = require('./controllers/shelterController');

const {
  createShelterRoutes,
  createAdminShelterRoutes,
} = require('./routes/shelterRoutes');

const { createApplicationModel } = require('./models/applicationModel');

const { createApplicationController } = require('./controllers/applicationController');

const {
  createApplicationRoutes,
  createAdminApplicationRoutes,
} = require('./routes/applicationRoutes');

const { asyncHandler } = require('./middleware/asyncHandler');
const petSpecies = [
  'cat', 'dog', 'bird', 'hamster', 'sugar-glider', 'rabbit', 'turtle', 'fish', 'hedgehog',
];
const petStatuses = ['available', 'reserved', 'adopted'];
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
const petModel = createPetModel(repository);

const petController = createPetController({
  petModel,
  ApiError,
  parseBody,
  uuidSchema,
  petListQuerySchema,
  petPayloadSchema,
});

const shelterModel = createShelterModel(repository);

const shelterController = createShelterController({
  shelterModel,
  ApiError,
  parseBody,
  uuidSchema,
  shelterPayloadSchema,
});

const applicationModel = createApplicationModel(repository);

const applicationController = createApplicationController({
  applicationModel,
  ApiError,
  parseBody,
  uuidSchema,
});

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:4173',
    'http://127.0.0.1:4173'
  );
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
app.use('/api/pets', createPetRoutes(petController));
app.use('/api/shelters', createShelterRoutes(shelterController));
app.use(
  '/api/applications',
  createApplicationRoutes(applicationController)
);
  app.get('/api/health', (_request, response) => {
    response.json({ data: { status: 'ok' } });
  });

  app.use('/api/admin', requireAdmin(repository, adminId));
app.use(
  '/api/admin/pets',
  createAdminPetRoutes(petController)
);
app.use(
  '/api/admin/shelters',
  createAdminShelterRoutes(shelterController)
);
app.use(
  '/api/admin/applications',
  createAdminApplicationRoutes(applicationController)
);

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
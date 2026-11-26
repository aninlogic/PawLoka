const { createHash, randomBytes } = require('node:crypto');
const { z } = require('zod');

const applicationStatuses = [
  'pending',
  'reviewing',
  'approved',
  'declined',
  'closed',
];

const applicationPayloadSchema = z.object({
  pet_id: z.string().uuid(),
  applicant_name: z.string().trim().min(2).max(80),
  email: z.union([
    z.string().trim().email().max(254),
    z.literal(''),
  ]).optional(),
  domicile: z.string().trim().min(2).max(150),
  adoption_reason: z.string().trim().min(10).max(1000),
  pet_experience: z.string().trim().min(2).max(1000),
  message: z.string().trim().max(1000).optional().default(''),
  consent: z.literal(true),
}).strict();

const applicationAccessTokenSchema =
  z.string().regex(/^[a-f0-9]{64}$/);

const applicationStatusSchema = z.object({
  status: z.enum(applicationStatuses),
}).strict();

function createApplicationController({
  applicationModel,
  ApiError,
  parseBody,
  uuidSchema,
}) {
  return {
    async create(request, response) {
      const input = parseBody(
        applicationPayloadSchema,
        request.body
      );

      const pet = await applicationModel.getPet(input.pet_id);

      if (!pet || pet.status !== 'available') {
        throw new ApiError(
          409,
          'PET_UNAVAILABLE',
          'Hewan ini tidak tersedia untuk pengajuan.'
        );
      }

      if (!applicationModel.canCreate()) {
        throw new ApiError(
          503,
          'DATA_MODE_READ_ONLY',
          'Pengajuan belum aktif pada mode demo lokal.'
        );
      }

      const accessToken = randomBytes(32).toString('hex');

      const application = await applicationModel.create({
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
        access_token_hash: createHash('sha256')
          .update(accessToken)
          .digest('hex'),
      });

      response.status(201).json({
        data: {
          id: application.id,
          status: application.status,
          created_at: application.created_at,
          access_token: accessToken,
        },
      });
    },

    async listUnavailable() {
      throw new ApiError(
        404,
        'APPLICATION_LIST_UNAVAILABLE',
        'Daftar pengajuan tidak tersedia.'
      );
    },

    async getById(request, response) {
      response.set('Cache-Control', 'no-store');

      const { id } = request.params;

      if (!uuidSchema.safeParse(id).success) {
        throw new ApiError(
          400,
          'INVALID_ID',
          'ID pengajuan tidak valid.'
        );
      }

      const accessToken =
        request.get('x-application-access-token') || '';

      if (!applicationAccessTokenSchema.safeParse(accessToken).success) {
        throw new ApiError(
          404,
          'APPLICATION_NOT_FOUND',
          'Riwayat pengajuan tidak ditemukan.'
        );
      }

      if (!applicationModel.canGetClaimed()) {
        throw new ApiError(
          503,
          'DATA_MODE_READ_ONLY',
          'Riwayat pengajuan belum aktif pada mode demo lokal.'
        );
      }

      const tokenHash = createHash('sha256')
        .update(accessToken)
        .digest('hex');

      const application = await applicationModel.getClaimed(
        id,
        tokenHash
      );

      if (!application) {
        throw new ApiError(
          404,
          'APPLICATION_NOT_FOUND',
          'Riwayat pengajuan tidak ditemukan.'
        );
      }

      response.json({ data: application });
    },

    async getAdminAll(request, response) {
      const applications = await applicationModel.listAdmin();

      response.json({ data: applications });
    },

    async updateAdmin(request, response) {
      const { id } = request.params;

      if (!uuidSchema.safeParse(id).success) {
        throw new ApiError(
          400,
          'INVALID_ID',
          'ID pengajuan tidak valid.'
        );
      }

      const input = parseBody(
        applicationStatusSchema,
        request.body
      );

      const application = await applicationModel.update(id, input);

      if (!application) {
        throw new ApiError(
          404,
          'APPLICATION_NOT_FOUND',
          'Pengajuan tidak ditemukan.'
        );
      }

      response.json({ data: application });
    },

    async deleteAdmin(request, response) {
      const { id } = request.params;

      if (!uuidSchema.safeParse(id).success) {
        throw new ApiError(
          400,
          'INVALID_ID',
          'ID pengajuan tidak valid.'
        );
      }

      const application = await applicationModel.remove(id);

      if (!application) {
        throw new ApiError(
          404,
          'APPLICATION_NOT_FOUND',
          'Pengajuan tidak ditemukan.'
        );
      }

      response.status(204).end();
    },
  };
}

module.exports = { createApplicationController };
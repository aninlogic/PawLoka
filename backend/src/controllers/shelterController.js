function createShelterController({
  shelterModel,
  ApiError,
  parseBody,
  uuidSchema,
  shelterPayloadSchema,
}) {
  return {
    async getAll(request, response) {
      const shelters = await shelterModel.list();
      response.json({ data: shelters });
    },

    async getById(request, response) {
      const { id } = request.params;

      if (!uuidSchema.safeParse(id).success) {
        throw new ApiError(
          400,
          'INVALID_ID',
          'ID shelter tidak valid.'
        );
      }

      const shelter = await shelterModel.getById(id);

      if (!shelter) {
        throw new ApiError(
          404,
          'SHELTER_NOT_FOUND',
          'Shelter tidak ditemukan.'
        );
      }

      response.json({ data: shelter });
    },

    async getAdminAll(request, response) {
      const shelters = await shelterModel.listAdmin();
      response.json({ data: shelters });
    },

    async create(request, response) {
      const input = parseBody(
        shelterPayloadSchema,
        request.body
      );

      const shelter = await shelterModel.create(input);

      response.status(201).json({ data: shelter });
    },

    async update(request, response) {
      const { id } = request.params;

      if (!uuidSchema.safeParse(id).success) {
        throw new ApiError(
          400,
          'INVALID_ID',
          'ID data tidak valid.'
        );
      }

      const input = parseBody(
        shelterPayloadSchema.partial().strict(),
        request.body
      );

      if (!Object.keys(input).length) {
        throw new ApiError(
          400,
          'EMPTY_UPDATE',
          'Tidak ada perubahan untuk disimpan.'
        );
      }

      const shelter = await shelterModel.update(id, input);

      if (!shelter) {
        throw new ApiError(
          404,
          'ITEM_NOT_FOUND',
          'Data tidak ditemukan.'
        );
      }

      response.json({ data: shelter });
    },

    async remove(request, response) {
      const { id } = request.params;

      if (!uuidSchema.safeParse(id).success) {
        throw new ApiError(
          400,
          'INVALID_ID',
          'ID data tidak valid.'
        );
      }

      const shelter = await shelterModel.remove(id);

      if (!shelter) {
        throw new ApiError(
          404,
          'ITEM_NOT_FOUND',
          'Data tidak ditemukan.'
        );
      }

      response.status(204).end();
    },
  };
}

module.exports = { createShelterController };
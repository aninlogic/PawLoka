function createPetController({
  petModel,
  ApiError,
  parseBody,
  uuidSchema,
  petListQuerySchema,
  petPayloadSchema,
}) {
  return {
    async getAll(request, response) {
      const filters = parseBody(
        petListQuerySchema,
        request.query
      );

      const pets = await petModel.list(filters);

      response.json({ data: pets });
    },

    async getById(request, response) {
      const { id } = request.params;

      if (!uuidSchema.safeParse(id).success) {
        throw new ApiError(
          400,
          'INVALID_ID',
          'ID hewan tidak valid.'
        );
      }

      const pet = await petModel.getById(id);

      if (!pet) {
        throw new ApiError(
          404,
          'PET_NOT_FOUND',
          'Hewan tidak ditemukan.'
        );
      }

      response.json({ data: pet });
    },

    async getAdminAll(request, response) {
      const pets = await petModel.listAdmin();

      response.json({ data: pets });
    },

    async create(request, response) {
      const input = parseBody(
        petPayloadSchema,
        request.body
      );

      const pet = await petModel.create(input);

      response.status(201).json({ data: pet });
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
        petPayloadSchema.partial().strict(),
        request.body
      );

      if (!Object.keys(input).length) {
        throw new ApiError(
          400,
          'EMPTY_UPDATE',
          'Tidak ada perubahan untuk disimpan.'
        );
      }

      const pet = await petModel.update(id, input);

      if (!pet) {
        throw new ApiError(
          404,
          'ITEM_NOT_FOUND',
          'Data tidak ditemukan.'
        );
      }

      response.json({ data: pet });
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

      const pet = await petModel.remove(id);

      if (!pet) {
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

module.exports = { createPetController };
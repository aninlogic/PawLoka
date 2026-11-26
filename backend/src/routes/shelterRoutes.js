const express = require('express');
const { asyncHandler } = require('../middleware/asyncHandler');

function createShelterRoutes(controller) {
  const router = express.Router();

  router.get(
    '/',
    asyncHandler(controller.getAll)
  );

  router.get(
    '/:id',
    asyncHandler(controller.getById)
  );

  return router;
}

function createAdminShelterRoutes(controller) {
  const router = express.Router();

  router.get(
    '/',
    asyncHandler(controller.getAdminAll)
  );

  router.post(
    '/',
    asyncHandler(controller.create)
  );

  router.patch(
    '/:id',
    asyncHandler(controller.update)
  );

  router.delete(
    '/:id',
    asyncHandler(controller.remove)
  );

  return router;
}

module.exports = {
  createShelterRoutes,
  createAdminShelterRoutes,
};
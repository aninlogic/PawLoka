const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { asyncHandler } = require('../middleware/asyncHandler');

function createApplicationRoutes(controller) {
  const router = express.Router();

  const applicationRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMITED',
        message: 'Terlalu banyak percobaan. Coba lagi nanti.',
      },
    },
  });

  const applicationHistoryRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMITED',
        message: 'Terlalu banyak percobaan. Coba lagi nanti.',
      },
    },
  });

  router.post(
    '/',
    applicationRateLimit,
    asyncHandler(controller.create)
  );

  router.get(
    '/',
    asyncHandler(controller.listUnavailable)
  );

  router.get(
    '/:id',
    applicationHistoryRateLimit,
    asyncHandler(controller.getById)
  );

  return router;
}

function createAdminApplicationRoutes(controller) {
  const router = express.Router();

  router.get(
    '/',
    asyncHandler(controller.getAdminAll)
  );

  router.patch(
    '/:id',
    asyncHandler(controller.updateAdmin)
  );

  router.delete(
    '/:id',
    asyncHandler(controller.deleteAdmin)
  );

  return router;
}

module.exports = {
  createApplicationRoutes,
  createAdminApplicationRoutes,
};
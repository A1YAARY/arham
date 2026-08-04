const express = require('express');
const createPortalController = require('../controllers/portalController');
const mockBseRouter = require('../../mockBse/server');

function setupRouteMap(app, dependencies) {
  app.use('/api/bse', mockBseRouter);

  const { router, bseSyncManager } = createPortalController(dependencies);
  app.use('/api/portal', router);

  return { bseSyncManager };
}

module.exports = setupRouteMap;

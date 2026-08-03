const express = require('express');
const createPortalController = require('../controllers/portalController');
const mockBseRouter = require('../../mockBse/server');

function setupRouteMap(app, dependencies) {
  // Part A: Mock BSE simulator routes
  app.use('/api/bse', mockBseRouter);

  // Part B: Internal Portal routes
  const portalRouter = createPortalController(dependencies);
  app.use('/api/portal', portalRouter);
}

module.exports = setupRouteMap;

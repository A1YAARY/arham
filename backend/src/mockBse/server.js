const express = require('express');
const { clients, trades, employees, mappings } = require('./seedData');

const mockBseRouter = express.Router();

// Configurable Delay & Failure Rates
// By default delay is set low for snappy local development (e.g. 500ms chunk delay),
// but configurable via headers or environment variables up to 10 minutes.
let pullDelayMs = parseInt(process.env.MOCK_BSE_DELAY_MS || '500', 10);
let failureRate = parseFloat(process.env.MOCK_BSE_FAILURE_RATE || '0.20'); // 20% random drop

// Endpoint to change simulator settings dynamically
mockBseRouter.post('/config', (req, res) => {
  if (req.body.delayMs !== undefined) pullDelayMs = parseInt(req.body.delayMs, 10);
  if (req.body.failureRate !== undefined) failureRate = parseFloat(req.body.failureRate);
  res.json({ success: true, pullDelayMs, failureRate });
});

mockBseRouter.get('/config', (req, res) => {
  res.json({ pullDelayMs, failureRate });
});

// Part A: Simulated Slow & Error-Prone BSE Clients Endpoint
mockBseRouter.get('/clients', async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const pageSize = parseInt(req.query.pageSize || '100', 10);

  // Simulate network processing delay per pull request
  if (pullDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, Math.min(pullDelayMs, 2000))); 
  }

  // Simulate 20% random mid-pull drop / HTTP disconnect
  if (Math.random() < failureRate) {
    res.status(500);
    return res.end('BSE Exchange API Error: Mid-pull network stream drop (Simulated 20% failure)');
  }

  const start = (page - 1) * pageSize;
  const paginatedClients = clients.slice(start, start + pageSize);

  res.json({
    page,
    pageSize,
    total: clients.length,
    totalPages: Math.ceil(clients.length / pageSize),
    data: paginatedClients
  });
});

// Part A: Simulated Slow & Error-Prone BSE Trades Endpoint
mockBseRouter.get('/trades', async (req, res) => {
  const { client_id, start_date, end_date } = req.query;
  const page = parseInt(req.query.page || '1', 10);
  const pageSize = parseInt(req.query.pageSize || '200', 10);

  if (pullDelayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, Math.min(pullDelayMs, 2000)));
  }

  // Simulate 20% random failure rate
  if (Math.random() < failureRate) {
    res.status(503);
    return res.end('BSE Exchange API Error: Server timeout / Connection reset midway');
  }

  let filtered = [...trades];
  if (client_id) {
    filtered = filtered.filter((t) => t.client_id === client_id);
  }
  if (start_date) {
    filtered = filtered.filter((t) => t.trade_date >= start_date);
  }
  if (end_date) {
    filtered = filtered.filter((t) => t.trade_date <= end_date);
  }

  const start = (page - 1) * pageSize;
  const paginatedTrades = filtered.slice(start, start + pageSize);

  res.json({
    page,
    pageSize,
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / pageSize),
    data: paginatedTrades
  });
});

// Part A: Instant, Reliable Internal Endpoint for Employees and Mappings
mockBseRouter.get('/internal/employees-and-mappings', (req, res) => {
  // Guaranteed zero delay, zero failure
  res.json({
    employees,
    mappings
  });
});

module.exports = mockBseRouter;

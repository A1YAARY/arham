const express = require('express');

function createPortalController({ clientModel, tradeModel, employeeModel, incentiveManager, bseSyncManager }) {
  const router = express.Router();

  // Part B View 1: Clients (Sub-second response guaranteed from DB cache)
  router.get('/clients', async (req, res) => {
    try {
      const clients = await clientModel.getAllClients();
      res.json({ success: true, data: clients });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Part B View 2: Trades (Filterable by client and date range)
  router.get('/trades', async (req, res) => {
    try {
      const { client_id, start_date, end_date } = req.query;
      const trades = await tradeModel.getTrades({ client_id, start_date, end_date });
      res.json({ success: true, data: trades });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Part B View 3: My Clients (Filter by logged-in / selected employee RM)
  router.get('/my-clients', async (req, res) => {
    try {
      const { employee_id } = req.query;
      if (!employee_id) {
        return res.status(400).json({ success: false, error: 'employee_id query parameter is required' });
      }
      const clients = await employeeModel.getMappedClients(employee_id);
      res.json({ success: true, data: clients });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Part B View 4: Employees
  router.get('/employees', async (req, res) => {
    try {
      const employees = await employeeModel.getAllEmployees();
      res.json({ success: true, data: employees });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Part B View 5: Incentives (Management sees all, RM sees own)
  router.get('/incentives', async (req, res) => {
    try {
      const { employee_id } = req.query;
      if (employee_id) {
        const data = await incentiveManager.calculateIncentivesForEmployee(employee_id);
        res.json({ success: true, data: data ? [data] : [] });
      } else {
        const data = await incentiveManager.calculateAllIncentives();
        res.json({ success: true, data });
      }
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Trigger manual sync on demand
  router.post('/sync/trigger', async (req, res) => {
    // Non-blocking trigger: returns immediately so client doesn't wait
    bseSyncManager.triggerFullSync();
    res.json({ success: true, message: 'Sync process initiated in background' });
  });

  return router;
}

module.exports = createPortalController;

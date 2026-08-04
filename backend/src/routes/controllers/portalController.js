const express = require('express');
const ClientModel = require('../../models/ClientModel');
const TradeModel = require('../../models/TradeModel');
const EmployeeModel = require('../../models/EmployeeModel');
const IncentiveManager = require('../../businesslogic/managers/IncentiveManager');
const BseSyncManager = require('../../businesslogic/managers/BseSyncManager');

function createPortalController({ knex, io }) {
  const router = express.Router();

  const clientModel = new ClientModel(knex);
  const tradeModel = new TradeModel(knex);
  const employeeModel = new EmployeeModel(knex);

  const incentiveManager = new IncentiveManager(tradeModel, employeeModel);
  const bseSyncManager = new BseSyncManager(knex, io, clientModel, tradeModel, employeeModel);

  router.get('/clients', async (req, res) => {
    try {
      const clients = await clientModel.getAllClients();
      res.json({ success: true, data: clients });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/trades', async (req, res) => {
    try {
      const { client_id, start_date, end_date } = req.query;
      const trades = await tradeModel.getTrades({ client_id, start_date, end_date });
      res.json({ success: true, data: trades });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

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

  router.get('/employees', async (req, res) => {
    try {
      const employees = await employeeModel.getAllEmployees();
      res.json({ success: true, data: employees });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

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

  router.post('/sync/trigger', async (req, res) => {
    bseSyncManager.triggerFullSync();
    res.json({ success: true, message: 'Sync process initiated in background' });
  });

  return { router, bseSyncManager };
}

module.exports = createPortalController;

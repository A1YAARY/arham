const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig.development);

// Models
const ClientModel = require('./src/models/ClientModel');
const TradeModel = require('./src/models/TradeModel');
const EmployeeModel = require('./src/models/EmployeeModel');

// Managers
const BseSyncManager = require('./src/businesslogic/managers/BseSyncManager');
const IncentiveManager = require('./src/businesslogic/managers/IncentiveManager');

// Route Mapper
const setupRouteMap = require('./src/routes/middleware/RouteMap');

const app = express();
const server = http.createServer(app);

// WebSocket Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Initialize Database & Start Express Server
async function bootstrap() {


  // Instantiate Models & Managers
  const clientModel = new ClientModel(knex);
  const tradeModel = new TradeModel(knex);
  const employeeModel = new EmployeeModel(knex);

  const incentiveManager = new IncentiveManager(tradeModel, employeeModel);
  const bseSyncManager = new BseSyncManager(knex, io, clientModel, tradeModel, employeeModel);

  // Setup Routes
  setupRouteMap(app, {
    clientModel,
    tradeModel,
    employeeModel,
    incentiveManager,
    bseSyncManager
  });

  // Socket Connection Listener
  io.on('connection', (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);
    socket.emit('syncStatus', { status: 'IDLE', progress: 100, message: 'Connected to live feed.' });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Arham Operations Backend & Mock BSE running on port ${PORT}`);
    console.log(`📡 Part A Simulator URL: http://localhost:${PORT}/api/bse`);
    console.log(`📊 Part B Portal API URL: http://localhost:${PORT}/api/portal`);
    console.log(`====================================================`);

    // Initial background sync on startup
    setTimeout(() => {
      console.log('[Bootstrap] Triggering initial BSE sync...');
      bseSyncManager.triggerFullSync();
    }, 2000);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal initialization failure:', err);
});

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig.development);
const setupRouteMap = require('./src/routes/middleware/RouteMap');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

async function bootstrap() {
  

  const { bseSyncManager } = setupRouteMap(app, { knex, io });

  io.on('connection', (socket) => {
    socket.emit('syncStatus', { status: 'IDLE', progress: 100, message: 'Connected to live feed.' });
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    setTimeout(() => {
      bseSyncManager.triggerFullSync();
    }, 2000);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal initialization failure:', err);
});

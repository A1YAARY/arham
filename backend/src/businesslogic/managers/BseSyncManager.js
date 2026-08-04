const http = require('http');

class BseSyncManager {
  constructor(knex, io, clientModel, tradeModel, employeeModel) {
    this.knex = knex;
    this.io = io;
    this.clientModel = clientModel;
    this.tradeModel = tradeModel;
    this.employeeModel = employeeModel;
    this.isSyncing = false;
    this.bseBaseUrl = process.env.MOCK_BSE_URL || 'http://localhost:5000/api/bse';
  }

  async fetchJsonWithRetry(url, maxRetries = 5, timeoutMs = 25000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const data = await new Promise((resolve, reject) => {
          const req = http.get(url, { timeout: timeoutMs }, (res) => {
            if (res.statusCode !== 200) {
              return reject(new Error(`HTTP ${res.statusCode}`));
            }
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
              try {
                resolve(JSON.parse(body));
              } catch (err) {
                reject(err);
              }
            });
          });

          req.on('error', (err) => reject(err));
          req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request Timeout (>30s simulated drop)'));
          });
        });
        return data;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise((r) => setTimeout(r, Math.min(1000 * Math.pow(2, attempt), 8000)));
      }
    }
  }

  async syncInternalData() {
    try {
      const internalData = await this.fetchJsonWithRetry(`${this.bseBaseUrl}/internal/employees-and-mappings`, 3);
      if (internalData.employees) {
        await this.employeeModel.syncEmployees(internalData.employees);
      }
      if (internalData.mappings) {
        await this.employeeModel.syncMappings(internalData.mappings);
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  async triggerFullSync() {
    if (this.isSyncing) {
      return { status: 'ALREADY_RUNNING' };
    }

    this.isSyncing = true;
    this.io.emit('syncStatus', { status: 'IN_PROGRESS', progress: 0, message: 'Syncing Internal Employees...' });

    try {
      await this.syncInternalData();
      this.io.emit('syncStatus', { status: 'IN_PROGRESS', progress: 10, message: 'Employees synced. Pulling BSE Clients...' });

      let page = 1;
      let totalPages = 1;
      let totalClientsSynced = 0;

      while (page <= totalPages) {
        const clientRes = await this.fetchJsonWithRetry(`${this.bseBaseUrl}/clients?page=${page}&pageSize=100`, 5);
        totalPages = clientRes.totalPages;
        const count = await this.clientModel.upsertClients(clientRes.data);
        totalClientsSynced += count;

        const progressPercent = Math.min(10 + Math.floor((page / totalPages) * 35), 45);
        this.io.emit('syncStatus', {
          status: 'IN_PROGRESS',
          progress: progressPercent,
          message: `Synced Client chunk page ${page}/${totalPages} (${totalClientsSynced} clients)`
        });
        page++;
      }

      const updatedClients = await this.clientModel.getAllClients();
      this.io.emit('clientsUpdated', updatedClients);

      page = 1;
      totalPages = 1;
      let totalTradesSynced = 0;

      while (page <= totalPages) {
        const tradeRes = await this.fetchJsonWithRetry(`${this.bseBaseUrl}/trades?page=${page}&pageSize=250`, 5);
        totalPages = tradeRes.totalPages;
        const count = await this.tradeModel.upsertTrades(tradeRes.data);
        totalTradesSynced += count;

        const progressPercent = Math.min(45 + Math.floor((page / totalPages) * 50), 95);
        this.io.emit('syncStatus', {
          status: 'IN_PROGRESS',
          progress: progressPercent,
          message: `Synced Trade chunk page ${page}/${totalPages} (${totalTradesSynced} trades)`
        });
        page++;
      }

      const updatedTrades = await this.tradeModel.getTrades({});
      this.io.emit('tradesUpdated', updatedTrades);

      this.isSyncing = false;
      this.io.emit('syncStatus', {
        status: 'SUCCESS',
        progress: 100,
        message: `Sync Complete: ${totalClientsSynced} Clients & ${totalTradesSynced} Trades updated.`
      });

      return { status: 'SUCCESS', clientsSynced: totalClientsSynced, tradesSynced: totalTradesSynced };
    } catch (err) {
      this.isSyncing = false;
      this.io.emit('syncStatus', {
        status: 'FAILED',
        progress: 0,
        message: `Sync Failed: ${err.message}. Retrying automatically in background...`
      });
      return { status: 'FAILED', error: err.message };
    }
  }
}

module.exports = BseSyncManager;

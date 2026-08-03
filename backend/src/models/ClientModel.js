class ClientModel {
  constructor(knex) {
    this.knex = knex;
  }

  async upsertClients(clientsList) {
    if (!clientsList || clientsList.length === 0) return 0;
    
   
    for (const client of clientsList) {
      await this.knex('clients')
        .insert({
          client_id: client.client_id,
          name: client.name,
          email: client.email,
          pan: client.pan,
          city: client.city,
          updated_at: this.knex.fn.now()
        })
        .onConflict('client_id')
        .merge();
    }
    return clientsList.length;
  }

  async getAllClients() {
    return this.knex('clients').select('*').orderBy('client_id', 'asc');
  }

  async getClientsByIds(clientIds) {
    return this.knex('clients').whereIn('client_id', clientIds).select('*');
  }
}

module.exports = ClientModel;

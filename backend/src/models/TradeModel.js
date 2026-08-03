class TradeModel {
  constructor(knex) {
    this.knex = knex;
  }

  async upsertTrades(tradesList) {
    if (!tradesList || tradesList.length === 0) return 0;

    for (const trade of tradesList) {
      await this.knex('trades')
        .insert({
          trade_id: trade.trade_id,
          client_id: trade.client_id,
          symbol: trade.symbol,
          quantity: trade.quantity,
          price: trade.price,
          brokerage: trade.brokerage,
          trade_date: trade.trade_date
        })
        .onConflict('trade_id')
        .merge();
    }
    return tradesList.length;
  }

  async getTrades({ client_id, client_ids, start_date, end_date }) {
    let query = this.knex('trades')
      .join('clients', 'trades.client_id', 'clients.client_id')
      .select('trades.*', 'clients.name as client_name');

    if (client_id) {
      query = query.where('trades.client_id', client_id);
    }
    if (client_ids && client_ids.length > 0) {
      query = query.whereIn('trades.client_id', client_ids);
    }
    if (start_date) {
      query = query.where('trades.trade_date', '>=', start_date);
    }
    if (end_date) {
      query = query.where('trades.trade_date', '<=', end_date);
    }

    return query.orderBy('trades.trade_date', 'desc');
  }
}

module.exports = TradeModel;

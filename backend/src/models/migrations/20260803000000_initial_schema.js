exports.up = function(knex) {
  return knex.schema
    .createTable('clients', function(table) {
      table.string('client_id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable();
      table.string('pan').notNullable();
      table.string('city').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('trades', function(table) {
      table.string('trade_id').primary();
      table.string('client_id').notNullable();
      table.string('symbol').notNullable();
      table.integer('quantity').notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.decimal('brokerage', 10, 2).notNullable();
      table.string('trade_date').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.foreign('client_id').references('clients.client_id');
    })
    .createTable('employees', function(table) {
      table.string('employee_id').primary();
      table.string('name').notNullable();
      table.string('role').notNullable(); // 'RM' or 'MANAGEMENT'
      table.string('email').notNullable();
      table.decimal('commission_pct', 5, 2).defaultTo(10.00); // e.g. 10% brokerage incentive
    })
    .createTable('employee_client_mappings', function(table) {
      table.increments('id').primary();
      table.string('employee_id').notNullable();
      table.string('client_id').notNullable();
      table.unique(['employee_id', 'client_id']);
      table.foreign('employee_id').references('employees.employee_id');
      table.foreign('client_id').references('clients.client_id');
    })
    .createTable('sync_logs', function(table) {
      table.increments('id').primary();
      table.string('status').notNullable(); // 'IN_PROGRESS', 'SUCCESS', 'FAILED', 'RETRIED'
      table.integer('records_synced').defaultTo(0);
      table.string('error_message');
      table.timestamp('started_at').defaultTo(knex.fn.now());
      table.timestamp('completed_at');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('sync_logs')
    .dropTableIfExists('employee_client_mappings')
    .dropTableIfExists('employees')
    .dropTableIfExists('trades')
    .dropTableIfExists('clients');
};

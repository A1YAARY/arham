const { clients, trades, employees, mappings } = require('../../mockBse/seedData');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  console.log('[Seed Script] Seeding database tables for PostgreSQL / SQLite...');

  await knex('sync_logs').del();
  await knex('employee_client_mappings').del();
  await knex('trades').del();
  await knex('clients').del();
  await knex('employees').del();

 
  await knex('employees').insert(employees);
  console.log(`[Seed Script] Inserted ${employees.length} employees.`);


  const chunkSize = 100;
  for (let i = 0; i < clients.length; i += chunkSize) {
    const chunk = clients.slice(i, i + chunkSize);
    await knex('clients').insert(chunk);
  }
  console.log(`[Seed Script] Inserted ${clients.length} clients.`);


  for (let i = 0; i < mappings.length; i += chunkSize) {
    const chunk = mappings.slice(i, i + chunkSize);
    await knex('employee_client_mappings').insert(chunk);
  }
  console.log(`[Seed Script] Inserted ${mappings.length} employee-client mappings.`);


  for (let i = 0; i < trades.length; i += chunkSize) {
    const chunk = trades.slice(i, i + chunkSize);
    await knex('trades').insert(chunk);
  }
  console.log(`[Seed Script] Inserted ${trades.length} trade records.`);

  console.log('[Seed Script] Database seeding completed successfully!');
};

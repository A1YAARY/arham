class EmployeeModel {
  constructor(knex) {
    this.knex = knex;
  }

  async syncEmployees(employeesList) {
    for (const emp of employeesList) {
      await this.knex('employees')
        .insert(emp)
        .onConflict('employee_id')
        .merge();
    }
  }

  async syncMappings(mappingsList) {
    await this.knex('employee_client_mappings').del();
    for (const m of mappingsList) {
      await this.knex('employee_client_mappings').insert(m);
    }
  }

  async getAllEmployees() {
    return this.knex('employees').select('*').orderBy('employee_id', 'asc');
  }

  async getEmployeeById(employeeId) {
    return this.knex('employees').where('employee_id', employeeId).first();
  }

  async getMappedClients(employeeId) {
    return this.knex('employee_client_mappings')
      .join('clients', 'employee_client_mappings.client_id', 'clients.client_id')
      .where('employee_client_mappings.employee_id', employeeId)
      .select('clients.*');
  }

  async getAllMappings() {
    return this.knex('employee_client_mappings').select('*');
  }
}

module.exports = EmployeeModel;

class IncentiveManager {
  constructor(tradeModel, employeeModel) {
    this.tradeModel = tradeModel;
    this.employeeModel = employeeModel;
  }

  async calculateIncentivesForEmployee(employeeId) {
    const employee = await this.employeeModel.getEmployeeById(employeeId);
    if (!employee) return null;

    const mappedClients = await this.employeeModel.getMappedClients(employeeId);
    const clientIds = mappedClients.map((c) => c.client_id);

    let totalBrokerage = 0;
    let totalTrades = 0;

    if (clientIds.length > 0) {
      const trades = await this.tradeModel.getTrades({ client_ids: clientIds });
      totalTrades = trades.length;
      totalBrokerage = trades.reduce((sum, t) => sum + parseFloat(t.brokerage || 0), 0);
    }

    const commissionPct = parseFloat(employee.commission_pct || 0);
    const incentiveAmount = (totalBrokerage * commissionPct) / 100;

    return {
      employee_id: employee.employee_id,
      name: employee.name,
      role: employee.role,
      mapped_clients_count: mappedClients.length,
      total_trades_count: totalTrades,
      total_brokerage: parseFloat(totalBrokerage.toFixed(2)),
      commission_pct: commissionPct,
      incentive_amount: parseFloat(incentiveAmount.toFixed(2))
    };
  }

  async calculateAllIncentives() {
    const employees = await this.employeeModel.getAllEmployees();
    const results = [];
    for (const emp of employees) {
      const incentive = await this.calculateIncentivesForEmployee(emp.employee_id);
      results.push(incentive);
    }
    return results;
  }
}

module.exports = IncentiveManager;

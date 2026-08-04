const clients = [];
const trades = [];
const employees = [];
const mappings = [];

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Ahmedabad', 'Pune', 'Hyderabad', 'Kolkata', 'Surat'];
const SYMBOLS = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'TATAMOTORS', 'SBIN', 'BHARTIARTL'];

function initSeedData() {
  if (clients.length > 0) return;

  for (let i = 1; i <= 20; i++) {
    const empId = `EMP${String(i).padStart(3, '0')}`;
    const role = i <= 2 ? 'MANAGEMENT' : 'RM';
    employees.push({
      employee_id: empId,
      name: i <= 2 ? `Executive Manager ${i}` : `Relationship Manager ${i - 2}`,
      role: role,
      email: `employee${i}@arhamfintech.ai`,
      commission_pct: role === 'MANAGEMENT' ? 0.00 : 12.50
    });
  }

  for (let i = 1; i <= 300; i++) {
    const clientId = `CLT${String(i).padStart(4, '0')}`;
    clients.push({
      client_id: clientId,
      name: `Investor Client ${i}`,
      email: `client${i}@example.com`,
      pan: `ABCDE${String(1000 + i).slice(-4)}F`,
      city: CITIES[i % CITIES.length]
    });

    const assignedEmpIndex = 2 + (i % 18);
    mappings.push({
      employee_id: employees[assignedEmpIndex].employee_id,
      client_id: clientId
    });
  }

  const startDate = new Date('2026-06-01');
  for (let i = 1; i <= 2500; i++) {
    const randomClientIndex = Math.floor(Math.random() * clients.length);
    const client = clients[randomClientIndex];
    const tradeDate = new Date(startDate.getTime() + Math.floor(Math.random() * 60) * 86400000).toISOString().split('T')[0];
    const qty = Math.floor(Math.random() * 50) + 10;
    const price = parseFloat((Math.random() * 1500 + 100).toFixed(2));
    const brokerage = parseFloat((qty * price * 0.005).toFixed(2));

    trades.push({
      trade_id: `TRD${String(i).padStart(6, '0')}`,
      client_id: client.client_id,
      symbol: SYMBOLS[i % SYMBOLS.length],
      quantity: qty,
      price: price,
      brokerage: brokerage,
      trade_date: tradeDate
    });
  }
}

initSeedData();

module.exports = {
  clients,
  trades,
  employees,
  mappings
};

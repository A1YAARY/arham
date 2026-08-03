import React, { useEffect, useState } from 'react';
import { DollarSign, Shield } from 'lucide-react';

interface Incentive {
  employee_id: string;
  name: string;
  role: string;
  mapped_clients_count: number;
  total_trades_count: number;
  total_brokerage: number;
  commission_pct: number;
  incentive_amount: number;
}

interface Props {
  selectedEmployeeId: string;
}

export const IncentivesView: React.FC<Props> = ({ selectedEmployeeId }) => {
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewScope, setViewScope] = useState<'MANAGEMENT' | 'OWN'>('MANAGEMENT');

  useEffect(() => {
    async function loadIncentives() {
      setLoading(true);
      const startTime = performance.now();
      try {
        const env = (import.meta as any).env
        const baseUrl = env.VITE_API_BASE_URL 
        const url = viewScope === 'OWN'
          ? `${baseUrl}/api/portal/incentives?employee_id=${selectedEmployeeId}`
          : `${baseUrl}/api/portal/incentives`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success) {
          setIncentives(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        console.log(`[IncentivesView] Loaded in ${(performance.now() - startTime).toFixed(2)}ms`);
      }
    }
    loadIncentives();
  }, [selectedEmployeeId, viewScope]);

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <DollarSign size={20} color="var(--accent-emerald)" />
          <h2 className="card-title">Brokerage Incentives Calculator</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`nav-tab ${viewScope === 'MANAGEMENT' ? 'active' : ''}`}
            onClick={() => setViewScope('MANAGEMENT')}
          >
            <Shield size={14} /> Management View (All)
          </button>
          <button
            className={`nav-tab ${viewScope === 'OWN' ? 'active' : ''}`}
            onClick={() => setViewScope('OWN')}
          >
            My Incentives Only ({selectedEmployeeId})
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Relationship Manager</th>
              <th>Role</th>
              <th>Mapped Clients</th>
              <th>Trades Count</th>
              <th>Generated Brokerage</th>
              <th>Commission Rate</th>
              <th>Computed Incentive</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                  Calculating brokerage incentives...
                </td>
              </tr>
            ) : (
              incentives.map((item) => (
                <tr key={item.employee_id}>
                  <td>
                    <span className="badge badge-blue">{item.employee_id}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{item.name}</td>
                  <td>
                    <span className={`badge ${item.role === 'MANAGEMENT' ? 'badge-amber' : 'badge-green'}`}>
                      {item.role}
                    </span>
                  </td>
                  <td>{item.mapped_clients_count}</td>
                  <td>{item.total_trades_count}</td>
                  <td>₹{item.total_brokerage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td>{item.commission_pct}%</td>
                  <td style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.95rem' }}>
                    ₹{item.incentive_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

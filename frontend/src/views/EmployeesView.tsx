import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';

interface Employee {
  employee_id: string;
  name: string;
  role: string;
  email: string;
  commission_pct: number;
}

export const EmployeesView: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployees() {
      const startTime = performance.now();
      try {
        const env = (import.meta as any).env
        const baseUrl = env.VITE_API_BASE_URL
        const res = await fetch(`${baseUrl}/api/portal/employees`);
        const json = await res.json();
        if (json.success) {
          setEmployees(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        console.log(`[EmployeesView] Loaded in ${(performance.now() - startTime).toFixed(2)}ms`);
      }
    }
    loadEmployees();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} color="var(--accent-blue)" />
          <h2 className="card-title">Employee Directory ({employees.length})</h2>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>System Role</th>
              <th>Email Address</th>
              <th>Incentive Commission %</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading employee data...
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.employee_id}>
                  <td>
                    <span className="badge badge-blue">{emp.employee_id}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{emp.name}</td>
                  <td>
                    <span className={`badge ${emp.role === 'MANAGEMENT' ? 'badge-amber' : 'badge-green'}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td>{emp.email}</td>
                  <td style={{ fontWeight: 600 }}>{emp.commission_pct}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

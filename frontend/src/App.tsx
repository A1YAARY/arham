import React, { useState, useEffect } from 'react';
import { SyncStatusBar } from './components/SyncStatusBar';
import { ClientsView } from './views/ClientsView';
import { TradesView } from './views/TradesView';
import { MyClientsView } from './views/MyClientsView';
import { EmployeesView } from './views/EmployeesView';
import { IncentivesView } from './views/IncentivesView';
import { Layers, Users, TrendingUp, UserCheck, DollarSign, User } from 'lucide-react';

type Tab = 'clients' | 'trades' | 'my-clients' | 'employees' | 'incentives';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('clients');
  const [employees, setEmployees] = useState<{ employee_id: string; name: string }[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('EMP003');

  useEffect(() => {
    const env = (import.meta as any).env;
    const baseUrl = env.VITE_API_BASE_URL ;
    fetch(`${baseUrl}/api/portal/employees`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          setEmployees(json.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="app-container">
      {/* Real-time status & manual sync trigger bar */}
      <SyncStatusBar />

      {/* Top Navigation */}
      <header className="header">
        <div className="brand">
          <Layers size={24} color="var(--accent-blue)" />
          <span>ARHAM FINTECH</span>
          <span className="brand-badge">Internal Operations</span>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            <Users size={16} /> Clients
          </button>
          <button
            className={`nav-tab ${activeTab === 'trades' ? 'active' : ''}`}
            onClick={() => setActiveTab('trades')}
          >
            <TrendingUp size={16} /> Trades
          </button>
          <button
            className={`nav-tab ${activeTab === 'my-clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-clients')}
          >
            <UserCheck size={16} /> My Clients
          </button>
          <button
            className={`nav-tab ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            <User size={16} /> Employees
          </button>
          <button
            className={`nav-tab ${activeTab === 'incentives' ? 'active' : ''}`}
            onClick={() => setActiveTab('incentives')}
          >
            <DollarSign size={16} /> Incentives
          </button>
        </nav>

        {/* Employee Switcher */}
        <div className="employee-selector">
          <span>Viewing as:</span>
          <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
            {employees.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.name} ({emp.employee_id})
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main View Area */}
      <main className="main-content">
        {activeTab === 'clients' && <ClientsView />}
        {activeTab === 'trades' && <TradesView />}
        {activeTab === 'my-clients' && <MyClientsView selectedEmployeeId={selectedEmployee} />}
        {activeTab === 'employees' && <EmployeesView />}
        {activeTab === 'incentives' && <IncentivesView selectedEmployeeId={selectedEmployee} />}
      </main>
    </div>
  );
};

export default App;

import React, { useEffect, useState } from 'react';
import { UserCheck } from 'lucide-react';

interface Client {
  client_id: string;
  name: string;
  email: string;
  pan: string;
  city: string;
}

interface Props {
  selectedEmployeeId: string;
}

export const MyClientsView: React.FC<Props> = ({ selectedEmployeeId }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMyClients() {
      setLoading(true);
      const startTime = performance.now();
      try {
        const env = (import.meta as any ).env
        const baseUrl = env.VITE_API_BASE_URL 
        const res = await fetch(`${baseUrl}/api/portal/my-clients?employee_id=${selectedEmployeeId}`);
        const json = await res.json();
        if (json.success) {
          setClients(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        console.log(`[MyClientsView] Loaded in ${(performance.now() - startTime).toFixed(2)}ms`);
      }
    }
    loadMyClients();
  }, [selectedEmployeeId]);

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserCheck size={20} color="var(--accent-emerald)" />
          <h2 className="card-title">My Mapped Clients ({clients.length})</h2>
        </div>
        <span className="badge badge-green">Assigned RM: {selectedEmployeeId}</span>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Client ID</th>
              <th>Client Name</th>
              <th>Email</th>
              <th>PAN Number</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading assigned clients...
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  No mapped clients found for Relationship Manager {selectedEmployeeId}.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.client_id}>
                  <td>
                    <span className="badge badge-blue">{client.client_id}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{client.name}</td>
                  <td>{client.email}</td>
                  <td>{client.pan}</td>
                  <td>{client.city}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

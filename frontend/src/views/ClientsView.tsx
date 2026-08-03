import React, { useEffect, useState } from 'react';
import { wsService } from '../services/websocket';
import { Users, Search } from 'lucide-react';

interface Client {
  client_id: string;
  name: string;
  email: string;
  pan: string;
  city: string;
}

export const ClientsView: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchClients = async () => {
    const startTime = performance.now();
    try {
      const env = (import.meta as any).env;
      const baseUrl = env.VITE_API_BASE_URL 
      const res = await fetch(`${baseUrl}/api/portal/clients`);
      const json = await res.json();
      if (json.success) {
        setClients(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      console.log(`[ClientsView] Loaded in ${(performance.now() - startTime).toFixed(2)}ms`);
    }
  };

  useEffect(() => {
    fetchClients();

    // Listen for WebSocket live updates
    const socket = wsService.connect();
    socket.on('clientsUpdated', (updatedClients: Client[]) => {
      console.log('[ClientsView] Live WebSocket clients update received');
      setClients(updatedClients);
    });

    return () => {
      socket.off('clientsUpdated');
    };
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.client_id.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={20} color="var(--accent-blue)" />
          <h2 className="card-title">All Clients Master Data ({clients.length})</h2>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by client ID, name, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              padding: '0.4rem 0.8rem 0.4rem 2rem',
              borderRadius: '6px',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              width: '280px'
            }}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Client ID</th>
              <th>Investor Name</th>
              <th>Email</th>
              <th>PAN Number</th>
              <th>City</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading clients...
                </td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  No clients found. Trigger BSE sync to pull latest feed.
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
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

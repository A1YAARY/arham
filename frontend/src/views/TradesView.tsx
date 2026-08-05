import React, { useEffect, useState } from 'react';
import { wsService } from '../services/websocket';
import { TrendingUp, Filter } from 'lucide-react';

interface Trade {
  trade_id: string;
  client_id: string;
  client_name?: string;
  symbol: string;
  quantity: number;
  price: number;
  brokerage: number;
  trade_date: string;
}

export const TradesView: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientIdFilter, setClientIdFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTrades = async () => {
    const startTime = performance.now();
    try {
      const params = new URLSearchParams();
      if (clientIdFilter) params.append('client_id', clientIdFilter);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const env =  (import.meta as any ).env
      const baseUrl =env.VITE_API_BASE_URL 
      const res = await fetch(`${baseUrl}/api/portal/trades?${params.toString()}`);
      const json = await res.json();
      
      if (json.success) {
        setTrades(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      console.log(`[TradesView] Loaded in ${(performance.now() - startTime).toFixed(2)}ms`);
    }
  };

  useEffect(() => {
    fetchTrades();

    const socket = wsService.connect();
    socket.on('tradesUpdated', (updatedTrades: Trade[]) => {
      console.log('[TradesView] Live WebSocket trades update received');
      setTrades(updatedTrades);
    });

    return () => {
      socket.off('tradesUpdated');
    };
  }, [clientIdFilter, startDate, endDate]);

  return (
    <div className="card">
      <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--accent-cyan)" />
            <h2 className="card-title">Trade Records Feed ({trades.length})</h2>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%', background: 'var(--bg-main)', padding: '0.75rem', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filter Client:</span>
            <input
              type="text"
              placeholder="e.g. CLT0005"
              value={clientIdFilter}
              onChange={(e) => setClientIdFilter(e.target.value)}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}
            />
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Trade ID</th>
              <th>Client ID</th>
              <th>Client Name</th>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Execution Price</th>
              <th>Brokerage</th>
              <th>Trade Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading trades...
                </td>
              </tr>
            ) : trades.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                  No trades found for selected filters.
                </td>
              </tr>
            ) : (
              trades.slice(0, 100).map((t) => (
                <tr key={t.trade_id}>
                  <td>
                    <span className="badge badge-amber">{t.trade_id}</span>
                  </td>
                  <td>{t.client_id}</td>
                  <td style={{ fontWeight: 500 }}>{t.client_name || 'N/A'}</td>
                  <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{t.symbol}</td>
                  <td>{t.quantity}</td>
                  <td>₹{Number(t.price).toFixed(2)}</td>
                  <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>₹{Number(t.brokerage).toFixed(2)}</td>
                  <td>{t.trade_date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

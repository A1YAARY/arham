import React, { useEffect, useState } from 'react';
import { wsService } from '../services/websocket';
import { RefreshCw } from 'lucide-react';

interface SyncStatus {
  status: 'IDLE' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
  progress: number;
  message: string;
}

export const SyncStatusBar: React.FC = () => {
  const [syncState, setSyncState] = useState<SyncStatus>({
    status: 'IDLE',
    progress: 100,
    message: 'Connected to live feed.'
  });

  useEffect(() => {
    const socket = wsService.connect();
    socket.on('syncStatus', (data: SyncStatus) => {
      setSyncState(data);
    });

    return () => {
      socket.off('syncStatus');
    };
  }, []);

  const triggerSync = async () => {
    setSyncState({ status: 'IN_PROGRESS', progress: 5, message: 'Initiating sync with BSE Exchange...' });
    try {
      const env = (import.meta as any ).env
      const baseUrl = env.VITE_API_BASE_URL
      await fetch(`${baseUrl}/api/portal/sync/trigger`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="sync-bar">
      <div className="sync-info">
        <div className={`pulse-dot ${syncState.status === 'IN_PROGRESS' ? 'syncing' : ''}`} />
        <span>
          <strong>BSE Feed Status:</strong> {syncState.message}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {syncState.status === 'IN_PROGRESS' && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{syncState.progress}%</span>
        )}
        <button className="btn" onClick={triggerSync} disabled={syncState.status === 'IN_PROGRESS'}>
          <RefreshCw size={14} className={syncState.status === 'IN_PROGRESS' ? 'animate-spin' : ''} style={{ marginRight: '6px' }} />
          {syncState.status === 'IN_PROGRESS' ? 'Syncing BSE...' : 'Sync BSE Data'}
        </button>
      </div>
    </div>
  );
};

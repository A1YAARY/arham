import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      const env = (import.meta as any).env;
      const socketUrl = env.VITE_SOCKET_URL ;
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('[WebSocket] Connected to Arham backend gateway');
      });
    }
    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const wsService = new WebSocketService();

import { io } from 'socket.io-client';

const getSocketURL = () => {
  const envUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    let url = envUrl.trim().replace(/^['"]+|['"]+$/g, '');
    // Strip /api suffix if derived from VITE_API_URL
    url = url.replace(/\/api\/?$/, '').replace(/\/+$/, '');
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  }
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:3000';
  }
  return 'https://campus-skill-exchange-api.onrender.com';
};

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(getSocketURL(), {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

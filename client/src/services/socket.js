import { io } from 'socket.io-client';

const getSocketURL = () => {
  const envUrl = import.meta.env.VITE_SOCKET_URL;
  if (envUrl) {
    if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
      return envUrl;
    }
    return `https://${envUrl}`;
  }
  return window.location.origin;
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

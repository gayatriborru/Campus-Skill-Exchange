import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { toastInfo, toastBadge } = useToast();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocketConnected(false);
      }
      return;
    }

    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      setSocketConnected(true);
      socket.emit('user:join', user._id);
    };

    const onDisconnect = () => {
      setSocketConnected(false);
    };

    const onUsersOnline = (usersList) => {
      setOnlineUsers(usersList);
    };

    const onNotificationReceive = (notif) => {
      setUnreadCount((prev) => prev + 1);
      if (notif.type === 'BADGE_UNLOCKED') {
        toastBadge(notif.badgeName || 'New Achievement', notif.message);
      } else {
        toastInfo(notif.message || 'You received a new campus notification.', notif.title || 'Notification');
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('users:online', onUsersOnline);
    socket.on('notification:receive', onNotificationReceive);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('users:online', onUsersOnline);
      socket.off('notification:receive', onNotificationReceive);
    };
  }, [isAuthenticated, user?._id, toastBadge, toastInfo]);

  const sendMessage = useCallback((recipientId, content, sessionId = null) => {
    if (!socketRef.current || !user?._id) return;
    socketRef.current.emit('message:send', {
      senderId: user._id,
      recipientId,
      content,
      sessionId,
    });
  }, [user?._id]);

  const sendTyping = useCallback((recipientId, isTyping) => {
    if (!socketRef.current || !user?._id) return;
    const eventName = isTyping ? 'typing:start' : 'typing:stop';
    socketRef.current.emit(eventName, {
      senderId: user._id,
      recipientId,
    });
  }, [user?._id]);

  const isUserOnline = useCallback(
    (userId) => {
      if (!userId) return false;
      return onlineUsers.includes(userId.toString());
    },
    [onlineUsers]
  );

  const value = {
    socket: socketRef.current,
    socketConnected,
    onlineUsers,
    isUserOnline,
    unreadCount,
    setUnreadCount,
    sendMessage,
    sendTyping,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

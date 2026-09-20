const Message = require('../models/Message');
const Notification = require('../models/Notification');

// Map active user IDs to socket IDs: { userId: Set([socketId1, socketId2]) }
const onlineUsers = new Map();

const emitToUser = (io, userId, event, data) => {
  if (!io || !userId) return;
  const userSockets = onlineUsers.get(userId.toString());
  if (userSockets && userSockets.size > 0) {
    userSockets.forEach((sockId) => {
      io.to(sockId).emit(event, data);
    });
  }
};

const initializeSocket = (io) => {
  io.emitToUser = (userId, event, data) => emitToUser(io, userId, event, data);

  io.on('connection', (socket) => {
    // 1. User joins online pool
    socket.on('user:join', (userId) => {
      if (!userId) return;
      socket.userId = userId;

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);

      // Broadcast updated online users list
      io.emit('users:online', Array.from(onlineUsers.keys()));
    });

    // 2. Typing status events
    socket.on('typing:start', ({ senderId, recipientId }) => {
      const recipientSockets = onlineUsers.get(recipientId);
      if (recipientSockets) {
        recipientSockets.forEach((sockId) => {
          io.to(sockId).emit('typing:status', { senderId, isTyping: true });
        });
      }
    });

    socket.on('typing:stop', ({ senderId, recipientId }) => {
      const recipientSockets = onlineUsers.get(recipientId);
      if (recipientSockets) {
        recipientSockets.forEach((sockId) => {
          io.to(sockId).emit('typing:status', { senderId, isTyping: false });
        });
      }
    });

    // 3. Direct Message transmission
    socket.on('message:send', async (data) => {
      try {
        const { senderId, recipientId, content, sessionId } = data;
        if (!senderId || !recipientId || !content?.trim()) return;

        // Save message to database
        const newMessage = await Message.create({
          sender: senderId,
          recipient: recipientId,
          content: content.trim(),
          session: sessionId || null,
        });

        const populatedMsg = await Message.findById(newMessage._id)
          .populate('sender', 'name profileImage')
          .populate('recipient', 'name profileImage');

        // Deliver to recipient if online
        const recipientSockets = onlineUsers.get(recipientId);
        if (recipientSockets) {
          recipientSockets.forEach((sockId) => {
            io.to(sockId).emit('message:receive', populatedMsg);
          });
        }

        // Echo back to sender
        socket.emit('message:sent', populatedMsg);
      } catch (err) {
        console.error('Socket message send error:', err.message);
      }
    });

    // 4. Notifications delivery
    socket.on('notification:send', (data) => {
      const recipientSockets = onlineUsers.get(data.recipientId);
      if (recipientSockets) {
        recipientSockets.forEach((sockId) => {
          io.to(sockId).emit('notification:receive', data);
        });
      }
    });

    // 5. User disconnect
    socket.on('disconnect', () => {
      if (socket.userId && onlineUsers.has(socket.userId)) {
        const userSockets = onlineUsers.get(socket.userId);
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(socket.userId);
        }
        io.emit('users:online', Array.from(onlineUsers.keys()));
      }
    });
  });
};

module.exports = { initializeSocket, emitToUser };

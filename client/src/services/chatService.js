import api from './api';

export const chatService = {
  getConversations: async () => {
    const res = await api.get('/messages/conversations');
    return res.data.conversations;
  },

  getMessagesWithUser: async (userId) => {
    const res = await api.get(`/messages/${userId}`);
    return res.data.messages;
  },

  sendMessage: async (data) => {
    const res = await api.post('/messages', data);
    return res.data.message;
  },
};

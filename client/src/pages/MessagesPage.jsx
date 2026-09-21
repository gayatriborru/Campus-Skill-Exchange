import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { chatService } from '../services/chatService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import BookSessionModal from '../components/sessions/BookSessionModal';
import ReportUserModal from '../components/common/ReportUserModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Send,
  Calendar,
  ShieldAlert,
  Search,
  MessageSquare,
  Sparkles,
  User,
  Circle,
  MoreVertical,
} from 'lucide-react';

const MessagesPage = () => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { socket, isUserOnline, sendMessage, sendTyping } = useSocket();
  const { toastError } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeRecipient, setActiveRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  // Modals
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations list
  const loadConversations = async () => {
    if (!isAuthenticated) {
      setLoadingConvos(false);
      return;
    }
    try {
      setLoadingConvos(true);
      const list = await chatService.getConversations();
      setConversations(list || []);
      return list;
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConvos(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    } else {
      setConversations([]);
      setLoadingConvos(false);
    }
  }, [isAuthenticated]);

  // Handle URL param ?recipient=...
  useEffect(() => {
    const targetId = searchParams.get('recipient');
    if (targetId && targetId !== user?._id) {
      const selectTarget = async () => {
        try {
          const student = await userService.getUserById(targetId);
          if (student) {
            setActiveRecipient(student);
          }
        } catch (err) {
          console.error('Failed to resolve target student:', err);
        }
      };
      selectTarget();
    }
  }, [searchParams, user?._id]);

  // Load messages when activeRecipient changes
  useEffect(() => {
    if (!activeRecipient?._id) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        const msgs = await chatService.getMessagesWithUser(activeRecipient._id);
        setMessages(msgs || []);
        scrollToBottom();
      } catch (err) {
        console.error('Failed to load messages with user:', err);
        toastError('Failed to load chat history.');
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [activeRecipient?._id]);

  // Socket listener for incoming messages and typing events
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceive = (msg) => {
      if (
        msg.sender?._id === activeRecipient?._id ||
        msg.recipient?._id === activeRecipient?._id
      ) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
      loadConversations();
    };

    const handleMessageSent = (msg) => {
      setMessages((prev) => {
        // Prevent duplicate if already in state
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      scrollToBottom();
      loadConversations();
    };

    const handleTypingStatus = ({ senderId, isTyping }) => {
      if (activeRecipient?._id === senderId) {
        setIsPeerTyping(isTyping);
      }
    };

    socket.on('message:receive', handleMessageReceive);
    socket.on('message:sent', handleMessageSent);
    socket.on('typing:status', handleTypingStatus);

    return () => {
      socket.off('message:receive', handleMessageReceive);
      socket.off('message:sent', handleMessageSent);
      socket.off('typing:status', handleTypingStatus);
    };
  }, [socket, activeRecipient?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!activeRecipient?._id) return;

    // Emit typing status
    sendTyping(activeRecipient._id, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(activeRecipient._id, false);
    }, 1500);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRecipient?._id) return;

    const content = inputText.trim();
    setInputText('');
    sendTyping(activeRecipient._id, false);

    try {
      // Send via socket for real-time delivery
      sendMessage(activeRecipient._id, content);
    } catch (err) {
      console.error('Socket send failed, using REST fallback:', err);
      try {
        const savedMsg = await chatService.sendMessage({
          recipient: activeRecipient._id,
          content,
        });
        setMessages((prev) => [...prev, savedMsg]);
        loadConversations();
      } catch (fallbackErr) {
        toastError('Failed to send message.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-140px)] flex flex-col md:flex-row"
      >
        {/* Left Sidebar: Conversations list */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              Messages
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingConvos ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No conversations yet. Visit the Explore or Matchmaker page to connect with peers!
              </div>
            ) : (
              conversations.map((convo) => {
                const isSelected = activeRecipient?._id === convo.user._id;
                const online = isUserOnline(convo.user._id);

                return (
                  <motion.button
                    key={convo.user._id}
                    whileHover={{ x: 2 }}
                    type="button"
                    onClick={() => setActiveRecipient(convo.user)}
                    className={`btn-press w-full text-left p-4 flex items-start gap-3 transition-colors hover:bg-slate-100/60 cursor-pointer ${
                      isSelected ? 'bg-brand-50/70 border-l-4 border-brand-600' : 'bg-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          convo.user.profileImage ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                            convo.user.name
                          )}`
                        }
                        alt={convo.user.name}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200"
                      />
                      {online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {convo.user.name}
                        </h4>
                        {convo.lastMessage?.createdAt && (
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {new Date(convo.lastMessage.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 truncate">
                        {convo.lastMessage?.content || 'Started a conversation'}
                      </p>
                    </div>

                    {convo.unreadCount > 0 && (
                      <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-600 text-white animate-pulse">
                        {convo.unreadCount}
                      </span>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {activeRecipient ? (
            <>
              {/* Chat Header */}
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-white"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <img
                      src={
                        activeRecipient.profileImage ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                          activeRecipient.name
                        )}`
                      }
                      alt={activeRecipient.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    {isUserOnline(activeRecipient._id) && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-white" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {activeRecipient.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      {activeRecipient.department || 'Student'} •{' '}
                      {isUserOnline(activeRecipient._id) ? (
                        <span className="text-emerald-600 font-semibold">Active Now</span>
                      ) : (
                        'Offline'
                      )}
                    </p>
                  </div>
                </div>

                {/* Header action buttons */}
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => setBookingModalOpen(true)}
                    className="btn-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Schedule Session</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    type="button"
                    onClick={() => setReportModalOpen(true)}
                    className="btn-press p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Report Safety Issue"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
                {loadingMessages ? (
                  <LoadingSpinner text="Loading message history..." />
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400">
                    Say hello to {activeRecipient.name}! Suggest a skill exchange topic or discuss availability.
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;

                    return (
                      <motion.div
                        key={msg._id || i}
                        initial={{ opacity: 0, scale: 0.94, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <img
                            src={
                              activeRecipient.profileImage ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                                activeRecipient.name
                              )}`
                            }
                            alt=""
                            className="w-7 h-7 rounded-full object-cover mb-1"
                          />
                        )}

                        <div
                          className={`max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed transition-shadow hover:shadow-sm ${
                            isMe
                              ? 'bg-brand-600 text-white rounded-br-none'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <span
                            className={`text-[9px] block mt-1 text-right ${
                              isMe ? 'text-brand-200' : 'text-slate-400'
                            }`}
                          >
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}

                {isPeerTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-xs text-slate-400 italic py-1"
                  >
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>{activeRecipient.name} is typing...</span>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder={`Message ${activeRecipient.name}...`}
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50 focus:bg-white transition-all duration-200"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!inputText.trim()}
                  className="btn-press p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-40 transition-all shadow-xs cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400"
            >
              <MessageSquare className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
              <h3 className="text-base font-bold text-slate-700">Select a conversation</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Choose a peer from the list on the left to start collaborating and exchanging skills.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Booking Modal */}
      {activeRecipient && (
        <BookSessionModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          initialTeacher={activeRecipient}
        />
      )}

      {/* Safety Report Modal */}
      {activeRecipient && (
        <ReportUserModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          targetUser={activeRecipient}
        />
      )}
    </div>
  );
};

export default MessagesPage;

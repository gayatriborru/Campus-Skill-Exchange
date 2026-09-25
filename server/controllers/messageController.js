const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get active conversations for logged in user
// @route   GET /api/messages/conversations
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all messages involving user
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name profileImage department gender')
      .populate('recipient', 'name profileImage department gender');

    const conversationMap = new Map();

    for (const msg of messages) {
      const isSender = msg.sender._id.toString() === userId.toString();
      const partner = isSender ? msg.recipient : msg.sender;
      const partnerId = partner._id.toString();

      if (!conversationMap.has(partnerId)) {
        const unreadCount = await Message.countDocuments({
          sender: partnerId,
          recipient: userId,
          read: false,
        });

        conversationMap.set(partnerId, {
          partner,
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt,
            sender: msg.sender._id,
            read: msg.read,
          },
          unreadCount,
        });
      }
    }

    const conversations = Array.from(conversationMap.values());

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages between current user and target user
// @route   GET /api/messages/:userId
const getMessagesWithUser = async (req, res, next) => {
  try {
    const myId = req.user._id;
    const targetUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: targetUserId },
        { sender: targetUserId, recipient: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name profileImage gender')
      .populate('recipient', 'name profileImage gender');

    // Mark received messages as read
    await Message.updateMany(
      { sender: targetUserId, recipient: myId, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message via HTTP REST
// @route   POST /api/messages
const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, content, sessionId } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Recipient and content are required.',
      });
    }

    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content: content.trim(),
      session: sessionId || null,
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name profileImage gender')
      .populate('recipient', 'name profileImage gender');

    return res.status(201).json({
      success: true,
      message: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getMessagesWithUser,
  sendMessage,
};

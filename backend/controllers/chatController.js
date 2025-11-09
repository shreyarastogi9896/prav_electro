import Message from '../models/messageModel.js';

/**
 * Send a message to a group (real-time + DB)
 */
export const sendMessage = async (groupId, userId, text, io) => {
  try {
    const msg = await Message.create({ groupId, sender: userId, text });
    io.to(groupId).emit('newMessage', msg); // broadcast to all group members
    return msg;
  } catch (err) {
    console.error('Error sending message:', err.message);
    throw err;
  }
};

/**
 * Fetch chat messages for a group
 */
export const fetchMessages = async (groupId, limit = 50) => {
  try {
    const messages = await Message.find({ groupId })
      .sort({ createdAt: 1 }) // oldest first
      .limit(limit)
      .populate('sender', 'name email'); // optional
    return messages;
  } catch (err) {
    console.error('Error fetching messages:', err.message);
    throw err;
  }
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId, userId) => {
  try {
    const msg = await Message.findById(messageId);
    if (!msg) throw new Error('Message not found');
    if (msg.sender.toString() !== userId) throw new Error('Unauthorized');
    await msg.remove();
    return { message: 'Message deleted' };
  } catch (err) {
    console.error('Error deleting message:', err.message);
    throw err;
  }
};

/**
 * Edit a message
 */
export const editMessage = async (messageId, userId, newText) => {
  try {
    const msg = await Message.findById(messageId);
    if (!msg) throw new Error('Message not found');
    if (msg.sender.toString() !== userId) throw new Error('Unauthorized');
    msg.text = newText;
    await msg.save();
    return msg;
  } catch (err) {
    console.error('Error editing message:', err.message);
    throw err;
  }
};

/**
 * Initialize Socket.io chat with JWT authentication
 */
export const initChat = (io) => {
  // Authenticate socket connection
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Not authorized'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id; // attach userId
      next();
    } catch (err) {
      next(new Error('Token invalid'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected', socket.userId);

    // Join group room
    socket.on('joinGroup', async (groupId) => {
      try {
        const group = await Group.findById(groupId);
        if (!group) return socket.emit('errorMessage', 'Group not found');

        // Check if user is a member
        if (!group.members.includes(socket.userId) && group.admin.toString() !== socket.userId) {
          return socket.emit('errorMessage', 'You are not a member of this group');
        }

        socket.join(groupId);
        console.log(`User ${socket.userId} joined group ${groupId}`);
      } catch (err) {
        console.error(err);
        socket.emit('errorMessage', 'Failed to join group');
      }
    });

    // Real-time send message
    socket.on('sendMessage', async ({ groupId, text }) => {
      try {
        const group = await Group.findById(groupId);
        if (!group) return socket.emit('errorMessage', 'Group not found');

        // Only allow if user is a member
        if (!group.members.includes(socket.userId) && group.admin.toString() !== socket.userId) {
          return socket.emit('errorMessage', 'You are not a member of this group');
        }

        // Save and broadcast message
        const msg = await Message.create({ groupId, sender: socket.userId, text });
        io.to(groupId).emit('newMessage', msg);
      } catch (err) {
        console.error(err);
        socket.emit('errorMessage', 'Failed to send message');
      }
    });

    // Typing indicator
    socket.on('typing', async ({ groupId }) => {
      const group = await Group.findById(groupId);
      if (!group) return;

      if (!group.members.includes(socket.userId) && group.admin.toString() !== socket.userId) return;

      socket.to(groupId).emit('userTyping', { userId: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected', socket.userId);
    });
  });
};

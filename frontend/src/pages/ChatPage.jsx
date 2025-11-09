import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, User, MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import SplitBillModal from '../components/SplitBillModal';
import io from 'socket.io-client';
import { useEffect, useRef, useCallback } from 'react';
import debounce from 'lodash.debounce';

// Initialize socket connection
const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') },
  autoConnect: false, // we will connect manually
});

const ChatPage = () => {
  const { groupId } = useParams();

  const navigate = useNavigate();
  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Typing debounce
  const handleTyping = useCallback(
    debounce(() => {
      socket.emit('typing', { groupId });
    }, 500),
    [groupId]
  );

  useEffect(() => {
    // Connect socket
    if (!socket.connected) socket.connect();

    // Join group room
    socket.emit('joinGroup', groupId);

    // Listen for messages
    socket.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Listen for typing
    socket.on('userTyping', ({ userId }) => {
      setTypingUsers((prev) => [...prev, userId]);
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== userId));
      }, 1000);
    });

    // Listen for recent messages (optional)
    socket.on('recentMessages', (msgs) => setMessages(msgs));

    // Listen for errors
    socket.on('errorMessage', (msg) => alert(msg));

    return () => {
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('recentMessages');
      socket.off('errorMessage');
    };
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const handleSend = () => {
    if (!text.trim()) return;
    socket.emit('sendMessage', { groupId, text });
    setText('');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <header className="bg-gray-800 shadow-md p-4 flex items-center justify-between z-10">
        <div className="flex items-center">
          <button onClick={() => navigate('/rooms')} className="mr-4 text-gray-300 hover:text-white">
            <ArrowLeft />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Room {groupId} Chat</h1>
            <p className="text-sm text-gray-400">{messages.length} messages</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => navigate(`/track/${groupId}`)}
            className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
          >
            <MapPin />
          </button>
          <button
            onClick={() => setIsSplitBillOpen(true)}
            className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
          >
            <CreditCard />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex items-start space-x-3 ${
              msg.sender._id.toString() === localStorage.getItem('userId') ? 'justify-end' : ''
            }`}
          >
            {msg.sender._id.toString() !== localStorage.getItem('userId') && (
              <div className="bg-indigo-500 rounded-full h-10 w-10 flex items-center justify-center font-bold text-white shrink-0">
                {msg.sender.name.charAt(0)}
              </div>
            )}
            <div
              className={`${
                msg.sender._id.toString() === localStorage.getItem('userId') ? 'bg-gray-700' : 'bg-gray-800'
              } rounded-lg p-3 max-w-xs`}
            >
              <p className="text-sm">{msg.text}</p>
              <span className="text-xs text-gray-500 block text-right mt-1">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {msg.sender._id.toString() === localStorage.getItem('userId') && (
              <div className="bg-green-500 rounded-full h-10 w-10 flex items-center justify-center font-bold text-white shrink-0">
                You
              </div>
            )}
          </div>
        ))}

        {typingUsers.length > 0 && (
          <div className="text-gray-400 text-sm">{typingUsers.join(', ')} typing...</div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-gray-800 p-4">
        <div className="flex items-center">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            className="ml-4 bg-indigo-600 text-white p-3 rounded-full"
          >
            <Send className="h-5 w-5" />
          </motion.button>
        </div>
      </footer>

      <SplitBillModal isOpen={isSplitBillOpen} onClose={() => setIsSplitBillOpen(false)} />
    </div>
  );
};

export default ChatPage;
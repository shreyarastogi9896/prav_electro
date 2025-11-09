import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, User, MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import SplitBillModal from '../components/SplitBillModal';

const ChatPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);

    return (
        <div className="h-screen flex flex-col bg-gray-900">
            <header className="bg-gray-800 shadow-md p-4 flex items-center justify-between z-10">
                <div className="flex items-center">
                    <button onClick={() => navigate('/rooms')} className="mr-4 text-gray-300 hover:text-white">
                        <ArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white">Room {id} Chat</h1>
                        <p className="text-sm text-gray-400">4 members active</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <button onClick={() => navigate(`/track/${id}`)} className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                        <MapPin />
                    </button>
                    <button onClick={() => setIsSplitBillOpen(true)} className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                        <CreditCard />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Chat messages would be rendered here */}
                <div className="flex items-start space-x-3">
                    <div className="bg-indigo-500 rounded-full h-10 w-10 flex items-center justify-center font-bold text-white shrink-0">A</div>
                    <div className="bg-gray-800 rounded-lg p-3 max-w-xs">
                        <p className="text-sm">Hey everyone! Ready for the trip?</p>
                        <span className="text-xs text-gray-500 block text-right mt-1">10:30 AM</span>
                    </div>
                </div>
                 <div className="flex items-start space-x-3 justify-end">
                    <div className="bg-gray-700 rounded-lg p-3 max-w-xs">
                        <p className="text-sm">Yep, all set! Can't wait.</p>
                        <span className="text-xs text-gray-500 block text-right mt-1">10:31 AM</span>
                    </div>
                    <div className="bg-green-500 rounded-full h-10 w-10 flex items-center justify-center font-bold text-white shrink-0">Y</div>
                </div>
            </main>

            <footer className="bg-gray-800 p-4">
                <div className="flex items-center">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="ml-4 bg-indigo-600 text-white p-3 rounded-full"
                    >
                        <Send className="h-5 w-5" />
                    </motion.button>
                </div>
            </footer>

            <SplitBillModal 
                isOpen={isSplitBillOpen} 
                onClose={() => setIsSplitBillOpen(false)} 
            />
        </div>
    );
};

export default ChatPage;

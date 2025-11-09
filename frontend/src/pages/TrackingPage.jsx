import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Play, Square, ArrowLeft } from 'lucide-react';

const TrackingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isTracking, setIsTracking] = useState(false);

    return (
        <div className="h-screen flex flex-col bg-gray-900">
            <header className="bg-gray-800 shadow-md p-4 flex items-center justify-between z-10">
                <div className="flex items-center">
                    <button onClick={() => navigate(`/room/${id}`)} className="mr-4 text-gray-300 hover:text-white">
                        <ArrowLeft />
                    </button>
                    <h1 className="text-xl font-bold text-white">Live Tracking</h1>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative">
                <div className="absolute inset-0 bg-gray-800 opacity-50 z-0">
                    {/* Placeholder for map */}
                    <div className="w-full h-full flex items-center justify-center">
                        <Map size={100} className="text-gray-600" />
                    </div>
                </div>
                
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 bg-gray-900/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-700"
                >
                    <h2 className="text-2xl font-bold mb-4">
                        {isTracking ? "Tracking in Progress..." : "Start Your Journey"}
                    </h2>
                    <p className="text-gray-400 mb-8">
                        {isTracking ? "Your location is being shared with the group." : "Press start to begin sharing your location."}
                    </p>
                    
                    <motion.button
                        onClick={() => setIsTracking(!isTracking)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-colors text-white ${isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {isTracking ? (
                            <>
                                <Square className="mr-2 h-5 w-5" />
                                Drop Location
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-5 w-5" />
                                Start Tracking
                            </>
                        )}
                    </motion.button>
                </motion.div>
            </main>
        </div>
    );
};

export default TrackingPage;

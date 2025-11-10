import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RoomPage from './pages/RoomPage';
import ChatPage from './pages/ChatPage';
import TrackingPage from './pages/TrackingPage';
import NotFoundPage from './pages/NotFoundPage';
import CartPage from './pages/CartPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';




function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/rooms" element={<RoomPage />} />
                    <Route path="/room/:groupId" element={<CartPage />} />
                    <Route path="/track/:id" element={<TrackingPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                    <Route path="/chat/:groupId" element={<ChatPage />} />
                    <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

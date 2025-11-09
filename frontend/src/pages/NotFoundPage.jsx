import React from 'react';
import { Link } from 'react-router-dom';
import { Frown } from 'lucide-react';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <Frown className="w-24 h-24 text-indigo-500 mb-4" />
            <h1 className="text-6xl font-bold text-white mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-gray-300 mb-4">Page Not Found</h2>
            <p className="text-gray-400 mb-8">Sorry, the page you are looking for does not exist.</p>
            <Link to="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Go to Homepage
            </Link>
        </div>
    );
};

export default NotFoundPage;

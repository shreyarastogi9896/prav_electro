import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, ArrowRight, Loader2 } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    defaultUpi: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate("/rooms");
      } else {
        const success = await register({
          name: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          defaultUpi: formData.defaultUpi,
        });
        if (success) {
          alert("✅ Registration successful! Please log in.");
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError("❌ " + (err.response?.data?.message || "Something went wrong."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
          <h2 className="text-4xl font-bold text-center text-white mb-2">
            CampusConnect
          </h2>
          <p className="text-center text-gray-400 mb-8">
            Share rides and group food orders.
          </p>

          <div className="flex justify-center mb-6">
            <div className="bg-gray-700 p-1 rounded-full flex">
              <button
                onClick={() => setIsLogin(true)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isLogin
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-600"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                  !isLogin
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-600"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {!isLogin && (
                  <>
                    <div className="mb-4">
                      <label
                        className="block text-gray-400 text-sm font-bold mb-2"
                        htmlFor="username"
                      >
                        Username
                      </label>
                      <input
                        id="username"
                        type="text"
                        placeholder="Choose a username"
                        onChange={handleChange}
                        value={formData.username}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        className="block text-gray-400 text-sm font-bold mb-2"
                        htmlFor="phone"
                      >
                        Phone
                      </label>
                      <input
                        id="phone"
                        type="text"
                        placeholder="Your phone number"
                        onChange={handleChange}
                        value={formData.phone}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        className="block text-gray-400 text-sm font-bold mb-2"
                        htmlFor="address"
                      >
                        Address
                      </label>
                      <input
                        id="address"
                        type="text"
                        placeholder="Your address"
                        onChange={handleChange}
                        value={formData.address}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        className="block text-gray-400 text-sm font-bold mb-2"
                        htmlFor="defaultUpi"
                      >
                        Default UPI
                      </label>
                      <input
                        id="defaultUpi"
                        type="text"
                        placeholder="UPI ID (optional)"
                        onChange={handleChange}
                        value={formData.defaultUpi}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </>
                )}

                <div className="mb-4">
                  <label
                    className="block text-gray-400 text-sm font-bold mb-2"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your.email@university.edu"
                    onChange={handleChange}
                    value={formData.email}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="mb-6">
                  <label
                    className="block text-gray-400 text-sm font-bold mb-2"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="******************"
                    onChange={handleChange}
                    value={formData.password}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                  type="submit"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : isLogin ? (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Login
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Create Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

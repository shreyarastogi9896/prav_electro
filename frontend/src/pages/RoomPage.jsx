import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Utensils, Car, LogOut } from "lucide-react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";

const RoomPage = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("all");
  const [newGroup, setNewGroup] = useState({
    name: "",
    restaurantName: "",
    zomatoLink: "",
    thresholdMinutes: 30,
  });

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/groups/nearby", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRooms(res.data || []);
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };
    if (token) fetchGroups();
    else navigate("/login");
  }, [token, navigate]);

  //  Join group
  const handleJoinRoom = async (groupId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/groups/join",
        { groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Joined group successfully!");
      navigate(`/room/${groupId}`);
    } catch (err) {
      console.error("Join error:", err);
      alert("Could not join group.");
    }
  };

  //  Create group
  const handleCreate = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/groups/create",
        newGroup,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Group created!");
      setRooms((prev) => [...prev, res.data.group]);
      setShowCreate(false);
      setNewGroup({
        name: "",
        restaurantName: "",
        zomatoLink: "",
        thresholdMinutes: 30,
      });
    } catch (err) {
      console.error("Create group error:", err);
      alert("Error creating group.");
    }
  };

  //  Logout button handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  //  Filter logic
  const filteredRooms = Array.isArray(rooms)
    ? rooms.filter((room) => {
        if (filter === "all") return true;
        if (filter === "ride") return !room.restaurant?.name;
        if (filter === "food") return !!room.restaurant?.name;
        return true;
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Find a Group
          </h1>

          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
            >
              <Plus className="mr-2 h-5 w-5" /> Create Room
            </button>

            {/*  Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
            >
              <LogOut className="mr-2 h-5 w-5" /> Logout
            </button>
          </div>
        </motion.div>

        {/* Create Group Form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 rounded-lg p-6 mb-8 overflow-hidden"
            >
              <h2 className="text-2xl font-bold mb-4 text-white">
                Create a New Room
              </h2>

              <input
                value={newGroup.name}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, name: e.target.value })
                }
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="text"
                placeholder="Group Name"
              />

              <input
                value={newGroup.restaurantName}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, restaurantName: e.target.value })
                }
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="text"
                placeholder="Restaurant Name (optional)"
              />

              <input
                value={newGroup.zomatoLink}
                onChange={(e) =>
                  setNewGroup({ ...newGroup, zomatoLink: e.target.value })
                }
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="text"
                placeholder="Zomato Link (optional)"
              />

              <input
                value={newGroup.thresholdMinutes}
                onChange={(e) =>
                  setNewGroup({
                    ...newGroup,
                    thresholdMinutes: Number(e.target.value),
                  })
                }
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-3 px-4 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                type="number"
                placeholder="Deadline in minutes"
              />

              <button
                onClick={handleCreate}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Create
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Section */}
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">
            Active Rooms
          </h2>
          <div className="bg-gray-800 p-1 rounded-full flex space-x-1 border border-gray-700">
            {["all", "ride", "food"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center ${
                  filter === f
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                {f === "all" && "All"}
                {f === "ride" && (
                  <>
                    <Car className="mr-1.5 h-4 w-4" /> Rides
                  </>
                )}
                {f === "food" && (
                  <>
                    <Utensils className="mr-1.5 h-4 w-4" /> Food
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredRooms.map((room) => (
              <motion.div
                key={room._id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {room.name}
                    </h3>
                    <div
                      className={`p-2 rounded-full ${
                        room.restaurant?.name
                          ? "bg-orange-500/20"
                          : "bg-blue-500/20"
                      }`}
                    >
                      {room.restaurant?.name ? (
                        <Utensils className="h-5 w-5 text-orange-400" />
                      ) : (
                        <Car className="h-5 w-5 text-blue-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{room.members?.length || 0} members</span>
                  </div>
                </div>
                <div className="bg-gray-700/50 p-4">
                  <button
                    onClick={() => handleJoinRoom(room._id)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Join Group
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredRooms.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <p className="text-gray-400 text-lg">
              No active rooms found for this category.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;

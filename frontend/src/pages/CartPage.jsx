import React, { useEffect, useState } from "react";
import axios from "axios";
import ChatPage from "./ChatPage";
import { useParams } from "react-router-dom";

const CartPage = () => {
  const { groupId } = useParams();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false); // New state for chat modal
  const token = localStorage.getItem("token");

  // State for the new item form inputs
  const [newItemDetails, setNewItemDetails] = useState({
    itemName: "",
    price: "",
    quantity: 1,
  });


  // Fetch cart
  const fetchCart = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/cart/${groupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(data);
    } catch (err) {
      console.error(" Fetch cart error:", err);
      setError(err.response?.data?.message || "Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  // Add item 
  const handleAdd = async () => {
    // Input validation
    if (!newItemDetails.itemName || !newItemDetails.price) {
        alert("Please enter item name and price.");
        return;
    }

    try {
      const itemToSend = {
        groupId,
        itemName: newItemDetails.itemName,
        price: Number(newItemDetails.price),
        image: "https://via.placeholder.com/100", 
        quantity: Number(newItemDetails.quantity),
      };
      const { data } = await axios.post(
        `http://localhost:5000/api/cart/add`,
        itemToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(data.cart);
      
      // Reset form state
      setNewItemDetails({
          itemName: "",
          price: "",
          quantity: 1,
      });

    } catch (err) {
      console.error(" Add item error:", err);
      setError(err.response?.data?.message || "Error adding item");
    }
  };

  // Remove item
  const handleRemove = async (itemName) => {
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/cart/remove`,
        { groupId, itemName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(data.cart);
    } catch (err) {
      console.error(" Remove item error:", err);
      setError(err.response?.data?.message || "Error removing item");
    }
  };

  useEffect(() => {
    if (token && groupId) {
        fetchCart();
    } else {
        setLoading(false);
    }
  }, [groupId, token]);

  if (loading)
    return <div className="p-10 text-center text-gray-500">Loading cart...</div>;
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!cart)
    return <div className="p-10 text-center text-gray-500">No active cart found.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6 space-y-6">
      {/* Cart Section */}
      <div className="w-full max-w-3xl bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-indigo-400">🛒 Group Cart</h2>
        </div>

        {/* INPUT FORM AREA */}
        <div className="grid grid-cols-4 gap-3 mb-6 p-4 bg-gray-700 rounded-lg">
            <input
                type="text"
                placeholder="Item Name"
                value={newItemDetails.itemName}
                onChange={(e) => setNewItemDetails({...newItemDetails, itemName: e.target.value})}
                className="col-span-2 bg-gray-800 text-white p-2 rounded-lg border border-gray-600 focus:outline-none focus:border-indigo-500"
            />
            <input
                type="number"
                placeholder="Price"
                value={newItemDetails.price}
                onChange={(e) => setNewItemDetails({...newItemDetails, price: e.target.value})}
                className="bg-gray-800 text-white p-2 rounded-lg border border-gray-600 focus:outline-none focus:border-indigo-500"
                min="0"
            />
             <button
                onClick={handleAdd}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
            >
                + Add Item
            </button>
        </div>
        {/* END INPUT FORM AREA */}

        {cart.items?.length === 0 ? (
          <p className="text-gray-400 text-center py-6">Your cart is empty.</p>
        ) : (
          <ul className="divide-y divide-gray-700">
            {cart.items.map((item, index) => (
              <li
                key={index}
                className="flex justify-between items-center py-3 hover:bg-gray-700/30 rounded-lg px-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image || "https://via.placeholder.com/60"}
                    alt={item.itemName}
                    className="w-14 h-14 rounded-lg border border-gray-600 object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-medium">{item.itemName}</h3>
                    <p className="text-sm text-gray-400">
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(item.itemName)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 text-right text-lg font-semibold text-indigo-400">
          Total: ₹{cart.total}
        </div>
      </div>

      {/* Chat Button (Replaces Chat Section) */}
      <div className="w-full max-w-3xl">
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
        >
           Open Group Chat
        </button>
      </div>


      {/* --- Chat Overlay/Modal --- */}
      {isChatOpen && (
          <div className="fixed inset-0 bg-gray-900/95 z-50 flex flex-col">
              <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
                  <span className="text-xl font-semibold">💬 Group Chat</span>
                  <button
                      onClick={() => setIsChatOpen(false)}
                      className="text-white hover:text-gray-200 text-3xl font-light leading-none"
                  >
                      &times;
                  </button>
              </div>
              <div className="flex-grow overflow-hidden">
                  <ChatPage groupId={groupId} />
              </div>
          </div>
      )}
    </div>
  );
};

export default CartPage;
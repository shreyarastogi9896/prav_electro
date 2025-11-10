import React, { useEffect, useState } from "react";
import axios from "axios";
import ChatPage from "./ChatPage";
import { useParams,useNavigate } from "react-router-dom";

const CartPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const token = localStorage.getItem("token");
  const [groupData, setGroupData] = useState(null); // Stores { admin: 'ID_STRING' }
  const [invoiceFile, setInvoiceFile] = useState(null);

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
      const { cart: cartData, admin: adminId } = data;

      setCart(cartData);
      setGroupData({ admin: adminId });
    } catch (err) {
      console.error("Fetch cart error:", err);
      setError(err.response?.data?.message || "Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  // Add item
  const handleAdd = async () => {
    if (!newItemDetails.itemName || !newItemDetails.price) return;

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

      setNewItemDetails({ itemName: "", price: "", quantity: 1 });
    } catch (err) {
      console.error("Add item error:", err);
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
      console.error("Remove item error:", err);
      setError(err.response?.data?.message || "Error removing item");
    }
  };

  // Checkout
  const handleCheckout = async () => {
    if (!invoiceFile) return console.error("Please select an invoice file.");

    const formData = new FormData();
    formData.append("invoice", invoiceFile);
    formData.append("groupId", groupId);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/cart/checkout",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Checkout successful!");
      setCart(res.data.cart); // update cart with invoice link & status
      setInvoiceFile(null);
      localStorage.setItem("lastCheckout", JSON.stringify(res.data));
      console.log("Checkout response:", res.data);


      navigate("/checkout-success", { state: { checkoutResult: res.data } });
  
    } catch (err) {
      console.error("Checkout error:", err);
      console.error(err.response?.data?.message || "Checkout failed");
    }
  };

  useEffect(() => {
    if (token && groupId) fetchCart();
    else setLoading(false);
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
          <h2 className="text-2xl font-bold text-indigo-400">Group Cart</h2>
        </div>

        {/* INPUT FORM AREA */}
        <div className="grid grid-cols-4 gap-3 mb-6 p-4 bg-gray-700 rounded-lg">
          <input
            type="text"
            placeholder="Item Name"
            value={newItemDetails.itemName}
            onChange={(e) =>
              setNewItemDetails({ ...newItemDetails, itemName: e.target.value })
            }
            className="col-span-2 bg-gray-800 text-white p-2 rounded-lg border border-gray-600 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="number"
            placeholder="Price"
            value={newItemDetails.price}
            onChange={(e) =>
              setNewItemDetails({ ...newItemDetails, price: e.target.value })
            }
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

        {/* Cart Items */}
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

        {/* Invoice Link */}
        {cart.invoice && (
          <div className="mt-4">
            <a
              href={cart.invoice}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:underline"
            >
              View Invoice
            </a>
          </div>
        )}
      </div>

      {/* Admin Checkout Section */}
      {groupData?.admin === localStorage.getItem("userId") &&
        cart.items?.length > 0 &&
        cart.status === "active" && (
          <div className="mt-6 w-full max-w-3xl bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-lg font-semibold text-indigo-400 mb-2">
              Admin Checkout
            </h2>

            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setInvoiceFile(e.target.files[0])}
              className="mb-3 text-sm text-white"
            />

            <button
              onClick={handleCheckout}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              disabled={!invoiceFile}
            >
              Checkout & Upload Invoice
            </button>
          </div>
        )}

      {/* Chat Button */}
      <div className="w-full max-w-3xl">
        <button onClick={() => navigate(`/chat/${groupId}`)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2">
          Open Group Chat </button>
      </div>

      
    </div>
  );
};

export default CartPage;

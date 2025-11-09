import mongoose from 'mongoose';
import Cart from '../models/cartModel.js';
import Group from '../models/groupModel.js';

// Helper function to cast groupId string to ObjectId
const getGroupIdObjectId = (groupId) => {
    if (mongoose.Types.ObjectId.isValid(groupId)) {
        return new mongoose.Types.ObjectId(groupId);
    }
    // Handle error or return null/throw if validation is desired here
    throw new Error("Invalid Group ID provided.");
};


// 1. Add item to cart
export const addItemToCart = async (req, res) => {
    try {
        const { groupId, itemName, price, image, quantity } = req.body;
        // userId is already an ObjectId from auth middleware
        const userId = req.user._id; 
        
        // --- FIX: Ensure groupId is an ObjectId for all queries/saves ---
        const groupIdObjectId = getGroupIdObjectId(groupId);

        const group = await Group.findById(groupIdObjectId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        const now = new Date();
        if (group.checkoutDeadline < now)
            return res.status(400).json({ message: 'Cannot add items, deadline passed' });

        // Query using ObjectId
        let cart = await Cart.findOne({ groupId: groupIdObjectId, status: 'active' });
        if (!cart) cart = new Cart({ groupId: groupIdObjectId, items: [] });

        // Add or update item
        // Use .equals() for reliable ObjectId comparison
        const existingItem = cart.items.find(
            i => i.itemName === itemName && i.userId.equals(userId)
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ userId, itemName, price, image, quantity });
        }

        cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        await cart.save();

        res.json({ message: 'Item added', cart });
    } catch (err) {
        console.error("addItemToCart error:", err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// 2. Remove item from cart
export const removeItemFromCart = async (req, res) => {
    try {
        const { groupId, itemName } = req.body;
        const userId = req.user._id;

        // --- FIX: Ensure groupId is an ObjectId for all queries/saves ---
        const groupIdObjectId = getGroupIdObjectId(groupId);

        const cart = await Cart.findOne({ groupId: groupIdObjectId, status: 'active' });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        // Filter items: !(itemName match AND userId match)
        cart.items = cart.items.filter(
            // Use .equals() for reliable ObjectId comparison
            i => !(i.itemName === itemName && i.userId.equals(userId))
        );
        
        cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        await cart.save();

        res.json({ message: 'Item removed', cart });
    } catch (err) {
        console.error("removeItemFromCart error:", err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// 3. View cart (The primary endpoint being debugged)
export const viewCart = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;
        
        // --- FIX: Ensure groupId is an ObjectId for the query ---
        const groupIdObjectId = getGroupIdObjectId(groupId);


        const cart = await Cart.findOne({ 
            groupId: groupIdObjectId, 
            status: "active" 
        });

        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        // Authorization check
        const group = await Group.findById(groupIdObjectId);
        // Use .some(m => m.equals(userId)) for reliable ObjectId comparison
        if (!group.members.some(m => m.equals(userId)))
            return res.status(403).json({ message: 'You are not a member of this group' });

        res.json(cart);
    } catch (err) {
        console.error("viewCart error:", err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// 4. Checkout cart (admin only)
export const checkoutCart = async (req, res) => {
    try {
        const { groupId } = req.body;
        const userId = req.user._id;

        // --- FIX: Ensure groupId is an ObjectId for all queries/saves ---
        const groupIdObjectId = getGroupIdObjectId(groupId);

        const group = await Group.findById(groupIdObjectId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Use .equals() for reliable ObjectId comparison
        if (!group.admin.equals(userId))
            return res.status(403).json({ message: 'Only admin can checkout' });

        const now = new Date();
        if (group.checkoutDeadline < now)
            return res.status(400).json({ message: 'Cannot checkout, deadline passed' });

        const cart = await Cart.findOne({ groupId: groupIdObjectId, status: 'active' });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.status = 'checkedout';
        await cart.save();

        group.status = 'checkedout';
        await group.save();

        res.json({ message: 'Order placed successfully', cart });
    } catch (err) {
        console.error("checkoutCart error:", err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
import mongoose from 'mongoose';
import Cart from '../models/cartModel.js';
import Group from '../models/groupModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { extractPdfText } from '../helpers/pdfHelpers.js';
import { parseInvoiceWithGroqLlama } from '../helpers/llamaHelpers.js';


// ---------- Multer setup for invoice uploads ----------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/invoices';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `invoice_${Date.now()}${ext}`);
  }
});

export const uploadInvoice = multer({ storage }).single('invoice');

// ---------- Helper ----------
const getGroupObjectId = (groupId) => {
  if (!mongoose.Types.ObjectId.isValid(groupId))
    throw new Error('Invalid groupId');
  return new mongoose.Types.ObjectId(groupId);
};





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

// 3. View cart 
export const viewCart = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;
        
        
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

        res.json({ cart, admin: group.admin.toString() });
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
    const groupIdObj = getGroupObjectId(groupId);

    const group = await Group.findById(groupIdObj);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (!group.admin.equals(userId))
      return res.status(403).json({ message: 'Only admin can checkout' });

    const now = new Date();
    if (group.checkoutDeadline < now)
      return res.status(400).json({ message: 'Cannot checkout, deadline passed' });

    const cart = await Cart.findOne({ groupId: groupIdObj, status: 'active' });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    if (!req.file) return res.status(400).json({ message: 'Invoice file is required' });

    const invoiceUrl = `${req.protocol}://${req.get('host')}/uploads/invoices/${req.file.filename}`;
    group.invoiceUrl = invoiceUrl;

    // Parse invoice using Llama API
    const pdfText = await extractPdfText(req.file.path);
    const invoiceItems = await parseInvoiceWithGroqLlama(pdfText);

    // Update cart prices based on invoice
    cart.items = cart.items.map(cartItem => {
      const matched = invoiceItems.find(
        i => i.itemName.toLowerCase() === cartItem.itemName.toLowerCase()
      );
      if (matched) cartItem.price = matched.price; // overwrite price
      return cartItem;
    });

    // Recompute total
    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    
    cart.status = 'checkedout';
    await cart.save();

    group.status = 'checkedout';
    await group.save();

    res.json({ message: 'Order placed successfully', cart, invoiceUrl, invoiceItems });
  } catch (err) {
    console.error("checkoutCart error:", err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

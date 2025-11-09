import mongoose from 'mongoose';
import Cart from '../models/cartModel.js';
import Group from '../models/groupModel.js';

// Add item to cart
export const addItemToCart = async (req, res) => {
  try {
    const { groupId, itemName, price, image, quantity } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const now = new Date();
    if (group.checkoutDeadline < now)
      return res.status(400).json({ message: 'Cannot add items, deadline passed' });

    let cart = await Cart.findOne({ groupId, status: 'active' });
    if (!cart) cart = new Cart({ groupId, items: [] });

    // Add or update item
    const existingItem = cart.items.find(
      i => i.itemName === itemName && i.userId.equals(userId)
    );

    if (existingItem) existingItem.quantity += quantity;
    else cart.items.push({ userId, itemName, price, image, quantity });

    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();

    res.json({ message: 'Item added', cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Remove item from cart
export const removeItemFromCart = async (req, res) => {
  try {
    const { groupId, itemName } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ groupId, status: 'active' });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(
      i => !(i.itemName === itemName && i.userId.equals(userId))
    );
    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();

    res.json({ message: 'Item removed', cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// View cart
export const viewCart = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const cart = await Cart.findOne({ groupId, status: 'active' });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const group = await Group.findById(groupId);
    if (!group.members.some(m => m.equals(userId)))
      return res.status(403).json({ message: 'You are not a member of this group' });

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Checkout cart (admin only)
export const checkoutCart = async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (!group.admin.equals(userId))
      return res.status(403).json({ message: 'Only admin can checkout' });

    const now = new Date();
    if (group.checkoutDeadline < now)
      return res.status(400).json({ message: 'Cannot checkout, deadline passed' });

    const cart = await Cart.findOne({ groupId, status: 'active' });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.status = 'checkedout';
    await cart.save();

    group.status = 'checkedout';
    await group.save();

    res.json({ message: 'Order placed successfully', cart });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

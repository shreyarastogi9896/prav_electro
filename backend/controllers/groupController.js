import mongoose from 'mongoose';
import Group from '../models/groupModel.js';

// Create a new group (admin is logged-in user)
export const createGroup = async (req, res) => {
  try {
    const { name, restaurantName, zomatoLink, thresholdMinutes } = req.body;

    const adminId = req.user._id; // set by auth middleware
    const adminObjectId = new mongoose.Types.ObjectId(adminId);

    const now = new Date();
    const checkoutDeadline = new Date(now.getTime() + thresholdMinutes * 60000);

    const group = new Group({
      name,
      admin: adminObjectId,
      members: [adminObjectId], // admin is automatically a member
      restaurant: { name: restaurantName, zomatoLink },
      checkoutDeadline
    });

    await group.save();
    res.status(201).json({ message: 'Group created', group });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Join an existing group (user is logged-in user)
export const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid groupId' });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const userId = req.user._id; // logged-in user
    const userObjectId = new mongoose.Types.ObjectId(userId);

    if (!group.members.some(member => member.equals(userObjectId))) {
      group.members.push(userObjectId);
      await group.save();
    }

    res.json({ message: 'Joined group', group });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get active nearby groups (optional location filtering)
export const getNearbyGroups = async (req, res) => {
  try {
    const { lng, lat, radiusKm = 5 } = req.query;
    const now = new Date();

    const activeGroups = await Group.find({
      status: 'active',
      checkoutDeadline: { $gte: now }
    });

    res.json(activeGroups);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

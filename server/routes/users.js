import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get current user
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search users by mobile number
router.get('/search', async (req, res) => {
  try {
    const { mobile } = req.query;
    
    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }
    
    const users = await User.find({ 
      mobile: { $regex: mobile, $options: 'i' },
      _id: { $ne: req.user.id } // Exclude current user
    }).select('_id name mobile');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
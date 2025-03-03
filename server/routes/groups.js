import express from 'express';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import User from '../models/User.js';

const router = express.Router();

// Get all groups for current user
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user.id
    });

    // Get total expenses for each group
    const groupsWithExpenses = await Promise.all(groups.map(async (group) => {
      const expenses = await Expense.find({ group: group._id });
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        _id: group._id,
        name: group.name,
        members: group.members.length,
        totalExpenses
      };
    }));

    res.json(groupsWithExpenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new group
router.post('/', async (req, res) => {
  try {
    const { name, members } = req.body;
    
    // Get current user
    const currentUser = await User.findById(req.user.id);
    
    // Prepare members array with current user
    const groupMembers = [
      {
        user: currentUser._id,
        name: currentUser.name,
        mobile: currentUser.mobile
      }
    ];
    
    // Add other members
    for (const member of members) {
      // Check if member exists in database
      let user = await User.findOne({ mobile: member.mobile });
      
      if (user) {
        // If user exists, add with reference
        groupMembers.push({
          user: user._id,
          name: user.name,
          mobile: user.mobile
        });
      } else {
        // If user doesn't exist, add without reference
        groupMembers.push({
          name: member.name,
          mobile: member.mobile
        });
      }
    }
    
    // Create new group
    const group = new Group({
      name,
      creator: req.user.id,
      members: groupMembers
    });
    
    await group.save();
    
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get group details
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member of the group
    const isMember = group.members.some(member => 
      member.user && member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get expenses for this group
    const expenses = await Expense.find({ group: group._id })
      .populate('paidBy', 'name')
      .sort({ date: -1 });
    
    res.json({
      _id: group._id,
      name: group.name,
      members: group.members,
      expenses
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get group members
router.get('/:id/members', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member of the group
    const isMember = group.members.some(member => 
      member.user && member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Format members for response
    const members = group.members.map(member => ({
      _id: member.user || member._id,
      name: member.name
    }));
    
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add expense to group
router.post('/:id/expenses', async (req, res) => {
  try {
    const { description, amount, paidBy, splitWith, splitType } = req.body;
    
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member of the group
    const isMember = group.members.some(member => 
      member.user && member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Create new expense
    const expense = new Expense({
      group: group._id,
      description,
      amount,
      paidBy,
      splitWith,
      splitType
    });
    
    await expense.save();
    
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
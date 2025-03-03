import express from 'express';
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import User from '../models/User.js';

const router = express.Router();

// Get settlements for current user
router.get('/', async (req, res) => {
  try {
    // Find all groups the user is a member of
    const groups = await Group.find({
      'members.user': req.user.id
    });
    
    const groupIds = groups.map(group => group._id);
    
    // Get all expenses from these groups
    const expenses = await Expense.find({
      group: { $in: groupIds }
    }).populate('paidBy', 'name');
    
    // Calculate balances
    const balances = {};
    
    for (const expense of expenses) {
      const paidById = expense.paidBy._id.toString();
      const splitAmount = expense.amount / expense.splitWith.length;
      
      // Add credit to the person who paid
      if (!balances[paidById]) {
        balances[paidById] = {
          name: expense.paidBy.name,
          balance: 0
        };
      }
      
      // Credit the payer for the full amount
      balances[paidById].balance += expense.amount;
      
      // Debit each person who was part of the split
      for (const memberId of expense.splitWith) {
        const memberIdStr = memberId.toString();
        
        if (!balances[memberIdStr]) {
          // Find member name
          const group = groups.find(g => 
            g.members.some(m => m.user && m.user.toString() === memberIdStr)
          );
          
          const memberName = group ? 
            group.members.find(m => m.user && m.user.toString() === memberIdStr)?.name : 
            'Unknown';
          
          balances[memberIdStr] = {
            name: memberName,
            balance: 0
          };
        }
        
        // Debit this person's share
        balances[memberIdStr].balance -= splitAmount;
      }
    }
    
    // Calculate simplified settlements
    const settlements = simplifyDebts(balances);
    
    res.json(settlements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to simplify debts
function simplifyDebts(balances) {
  const debtors = [];
  const creditors = [];
  
  // Separate into debtors and creditors
  for (const [id, data] of Object.entries(balances)) {
    if (data.balance < 0) {
      debtors.push({
        _id: id,
        name: data.name,
        amount: Math.abs(data.balance)
      });
    } else if (data.balance > 0) {
      creditors.push({
        _id: id,
        name: data.name,
        amount: data.balance
      });
    }
  }
  
  // Sort by amount (descending)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);
  
  const settlements = [];
  
  // Create settlements
  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];
    
    const amount = Math.min(debtor.amount, creditor.amount);
    
    if (amount > 0.01) { // Ignore very small amounts
      settlements.push({
        from: {
          _id: debtor._id,
          name: debtor.name
        },
        to: {
          _id: creditor._id,
          name: creditor.name
        },
        amount: parseFloat(amount.toFixed(2))
      });
    }
    
    // Update amounts
    debtor.amount -= amount;
    creditor.amount -= amount;
    
    // Remove settled parties
    if (debtor.amount < 0.01) debtors.shift();
    if (creditor.amount < 0.01) creditors.shift();
  }
  
  return settlements;
}

export default router;
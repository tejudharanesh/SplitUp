import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  splitWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  splitType: {
    type: String,
    enum: ['equal'],
    default: 'equal'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
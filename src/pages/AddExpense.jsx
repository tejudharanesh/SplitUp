import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const AddExpense = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        const response = await axios.get(`/api/groups/${groupId}/members`);
        setMembers(response.data);
        setSelectedMembers(response.data.map(m => m._id));
        if (response.data.length > 0) {
          setPaidBy(response.data[0]._id);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load group members');
        setLoading(false);
      }
    };

    fetchGroupMembers();
  }, [groupId]);

  const handleSelectAll = () => {
    setSelectedMembers(members.map(m => m._id));
  };

  const handleUnselectAll = () => {
    setSelectedMembers([]);
  };

  const handleMemberToggle = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description || !amount || !paidBy || selectedMembers.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`/api/groups/${groupId}/expenses`, {
        description,
        amount: parseFloat(amount),
        paidBy,
        splitWith: selectedMembers,
        splitType
      });
      
      navigate(`/groups/${groupId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Add Expense</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="What was this expense for?"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 mb-2">
              Paid By
            </label>
            <select
              id="paidBy"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select who paid</option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="splitType" className="block text-sm font-medium text-gray-700 mb-2">
              Split Type
            </label>
            <select
              id="splitType"
              value={splitType}
              onChange={(e) => setSplitType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="equal">Split equally</option>
            </select>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Split With
              </label>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleUnselectAll}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Unselect All
                </button>
              </div>
            </div>
            
            <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
              {members.map((member) => (
                <div key={member._id} className="flex items-center p-3">
                  <input
                    type="checkbox"
                    id={`member-${member._id}`}
                    checked={selectedMembers.includes(member._id)}
                    onChange={() => handleMemberToggle(member._id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`member-${member._id}`} className="ml-3 block text-sm font-medium text-gray-700">
                    {member.name}
                  </label>
                </div>
              ))}
            </div>
            {selectedMembers.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                Splitting with {selectedMembers.length} people
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
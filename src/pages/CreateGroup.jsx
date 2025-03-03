import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, X, Plus, ArrowLeft } from 'lucide-react';

const CreateGroup = () => {
  const [groupName, setGroupName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberMobile, setMemberMobile] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const addMember = () => {
    if (!memberName || !memberMobile) {
      setError('Please enter both name and mobile number');
      return;
    }

    if (members.some(m => m.mobile === memberMobile)) {
      setError('This mobile number is already added');
      return;
    }

    setMembers([...members, { name: memberName, mobile: memberMobile }]);
    setMemberName('');
    setMemberMobile('');
    setError('');
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupName) {
      setError('Please enter a group name');
      return;
    }

    if (members.length === 0) {
      setError('Please add at least one member');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/groups', {
        name: groupName,
        members
      });
      
      navigate(`/groups/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Create New Group</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter group name"
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Add Members
              </label>
            </div>
            
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Name"
              />
              <input
                type="text"
                value={memberMobile}
                onChange={(e) => setMemberMobile(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mobile number"
              />
              <button
                type="button"
                onClick={addMember}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                <Plus size={20} />
              </button>
            </div>

            {members.length > 0 ? (
              <div className="border rounded-md divide-y">
                {members.map((member, index) => (
                  <div key={index} className="flex justify-between items-center p-3">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.mobile}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed rounded-md border-gray-300">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">No members added yet</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
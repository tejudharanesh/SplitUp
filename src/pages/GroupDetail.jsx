import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, ArrowLeft, Users, DollarSign } from "lucide-react";

const GroupDetail = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await axios.get(`/api/groups/${groupId}`);
        setGroup(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load group details");
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <span className="block sm:inline">{error || "Group not found"}</span>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        <h1 className="text-2xl font-bold text-gray-800">{group.name}</h1>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Expenses</h2>
        <Link
          to={`/groups/${groupId}/expenses/add`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Add Expense
        </Link>
      </div>

      {group.expenses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No expenses yet
          </h3>
          <p className="text-gray-600 mb-4">
            Add your first expense to start tracking
          </p>
          <Link
            to={`/groups/${groupId}/expenses/add`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus size={16} className="mr-2" />
            Add first expense
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md divide-y">
          {group.expenses.map((expense) => (
            <div key={expense._id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {expense.description}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Paid by {expense.paidBy.name} • {formatDate(expense.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${expense.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600">
                    Split with {expense.splitWith.length} people
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Members</h2>
        <div className="bg-white rounded-lg shadow-md divide-y">
          {group.members.map((member) => (
            <div key={member._id} className="p-4 flex items-center">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-600">{member.mobile}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;

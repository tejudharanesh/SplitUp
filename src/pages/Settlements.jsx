import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowRight } from 'lucide-react';

const Settlements = () => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        const response = await axios.get('/api/settlements');
        setSettlements(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load settlements');
        setLoading(false);
      }
    };

    fetchSettlements();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Settlements</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {settlements.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No settlements needed</h3>
          <p className="text-gray-600">Everyone is settled up! Add expenses to see who owes whom.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md divide-y">
          {settlements.map((settlement, index) => (
            <div key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3">
                    <p className="font-medium text-gray-900">{settlement.from.name}</p>
                    <p className="text-sm text-gray-600">pays</p>
                  </div>
                  <ArrowRight className="text-gray-400 mx-2" />
                  <div>
                    <p className="font-medium text-gray-900">{settlement.to.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${settlement.amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Settlements;
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Users, Calculator, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold text-blue-600 flex items-center">
            <Calculator className="mr-2" />
            SplitUp
          </Link>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Hi, {user?.name}</span>
            <button 
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-500 flex items-center"
            >
              <LogOut size={18} className="mr-1" />
              Logout
            </button>
          </div>
        </div>
        
        <div className="flex border-t py-2">
          <Link to="/" className="flex-1 flex flex-col items-center py-1 text-gray-700 hover:text-blue-600">
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/settlements" className="flex-1 flex flex-col items-center py-1 text-gray-700 hover:text-blue-600">
            <Calculator size={20} />
            <span className="text-xs mt-1">Settlements</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
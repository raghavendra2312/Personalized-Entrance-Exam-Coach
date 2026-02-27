import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User as UserIcon, LayoutDashboard, Settings } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white font-semibold text-xl">
          <BookOpen className="w-6 h-6 text-indigo-500" />
          <span>PrepCoach AI</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/courses" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Courses</Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/analyzer" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Skill Analyzer</Link>
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Dashboard</Link>
              
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <Link to="/profile" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <UserIcon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Log in</Link>
              <Link to="/register" className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

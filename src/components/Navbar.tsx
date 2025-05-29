import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Menu, X, User, LogOut } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className={`fixed w-full z-30 transition-all duration-300 ${scrolled || isOpen ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-primary-800">EnglishMaster</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors">
                Home
              </Link>
              <Link to="/courses" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors">
                Courses
              </Link>
              
              {currentUser ? (
                <>
                  <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors">
                    My Dashboard
                  </Link>
                  
                  {isAdmin() && (
                    <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors">
                      Admin
                    </Link>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 rounded-md text-sm font-medium text-primary-600 border border-primary-600 hover:bg-primary-50 transition-colors">
                    Log in
                  </Link>
                  <Link to="/signup" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 hover:text-primary-600 focus:outline-none"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-primary-600">
              Home
            </Link>
            <Link to="/courses" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-primary-600">
              Courses
            </Link>
            
            {currentUser ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-primary-600">
                  My Dashboard
                </Link>
                
                {isAdmin() && (
                  <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-primary-600">
                    Admin
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-primary-600"
                >
                  <LogOut className="h-5 w-5 mr-2" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-primary-600">
                  Log in
                </Link>
                <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-primary-50">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
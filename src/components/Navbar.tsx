import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Menu, X, User, LogOut } from 'lucide-react';
import './Navbar.css';

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

  // Effect to prevent background scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

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
                    {currentUser?.displayName && <span className="mr-2">Hi, {currentUser.displayName}</span>}
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
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 hover:text-primary-600 focus:outline-none"
            >
              <Menu className="block h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Overlay */}
        {isOpen && (
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}></div>
        )}
        
        {/* Sidebar */}
        <div className="relative w-64 max-w-xs h-full bg-white shadow-xl flex flex-col justify-between ml-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <span className="text-lg font-bold text-primary-800">Menu</span>
            <button onClick={() => setIsOpen(false)} className="p-2 rounded-md text-gray-900 hover:text-primary-600 focus:outline-none">
              <X className="block h-6 w-6" />
            </button>
          </div>
          <div className="flex flex-col flex-grow p-4 space-y-2">
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
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-primary-600">
                  Log in
                </Link>
                <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-primary-600">
                  Sign up
                </Link>
              </>
            )}
          </div>
          
          {currentUser && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-primary-600"
              >
                {currentUser?.displayName && <span className="mr-2">Hi, {currentUser.displayName}</span>}
                <LogOut className="h-5 w-5 mr-2" /> Logout
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}
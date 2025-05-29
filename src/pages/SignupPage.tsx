import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupFormData>();
  const password = watch('password');
  
  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setError('');
    
    try {
      // Create new user
      await signup(data.email, data.password);
      
      // Update profile with display name
      await updateUserProfile(data.name);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      setError(
        error.code === 'auth/email-already-in-use'
          ? 'Email already in use. Please try a different email or log in.'
          : error.code === 'auth/weak-password'
            ? 'Password is too weak. Please use a stronger password.'
            : 'Failed to create account. Please try again.'
      );
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  return (
    <div className="animate-fade-in min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <BookOpen className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-2 text-gray-600">
            Join EnglishMaster and start your language learning journey
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-error-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-error-700">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className={`pl-10 block w-full px-4 py-2 border ${errors.name ? 'border-error-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className={`pl-10 block w-full px-4 py-2 border ${errors.email ? 'border-error-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                  className={`pl-10 block w-full px-4 py-2 border ${errors.password ? 'border-error-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  className={`pl-10 block w-full px-4 py-2 border ${errors.confirmPassword ? 'border-error-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>}
            </div>
            
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the <a href="#" className="text-primary-600 hover:text-primary-500">Terms of Service</a> and <a href="#" className="text-primary-600 hover:text-primary-500">Privacy Policy</a>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'}`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                type="button"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                  </g>
                </svg>
                Sign up with Google
              </button>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
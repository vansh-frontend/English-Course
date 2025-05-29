import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';

interface LocationState {
  courseId: string;
  courseName: string;
  enrollmentId: string;
}

export function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  useEffect(() => {
    // Redirect to dashboard if no enrollment info is provided
    if (!state?.courseId || !state?.courseName) {
      navigate('/dashboard');
    }
  }, [state, navigate]);

  if (!state?.courseId) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-success-100 p-3">
              <CheckCircle className="h-12 w-12 text-success-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-lg text-gray-700 mb-6">
            Thank you for enrolling in <span className="font-medium">{state.courseName}</span>. Your enrollment has been confirmed.
          </p>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Steps:</h2>
            <ul className="space-y-4 text-left">
              <li className="flex items-start">
                <div className="flex-shrink-0 bg-primary-100 rounded-full p-1 mt-0.5">
                  <span className="text-primary-600 font-medium text-sm">1</span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">Access Your Course</h3>
                  <p className="text-gray-700 text-sm">
                    Visit your dashboard to access the course and Google Meet links for the upcoming sessions.
                  </p>
                </div>
              </li>
              
              <li className="flex items-start">
                <div className="flex-shrink-0 bg-primary-100 rounded-full p-1 mt-0.5">
                  <span className="text-primary-600 font-medium text-sm">2</span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">Check Your Email</h3>
                  <p className="text-gray-700 text-sm">
                    We've sent a confirmation email with your enrollment details and invoice.
                  </p>
                </div>
              </li>
              
              <li className="flex items-start">
                <div className="flex-shrink-0 bg-primary-100 rounded-full p-1 mt-0.5">
                  <span className="text-primary-600 font-medium text-sm">3</span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">Mark Your Calendar</h3>
                  <p className="text-gray-700 text-sm">
                    Note the schedule for your upcoming classes and be prepared for your first session.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors flex items-center justify-center"
            >
              Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition-colors flex items-center justify-center"
            >
              Browse More Courses
            </button>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600">
              For any questions or assistance, please contact <a href="mailto:support@englishmaster.com" className="text-primary-600 hover:text-primary-800">support@englishmaster.com</a>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Enrollment ID: {state.enrollmentId}
            </p>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 text-primary-600 mr-2" />
            Upcoming Classes
          </h2>
          <p className="text-gray-700 mb-4">
            Your first class will begin soon. Make sure to check your dashboard for the exact schedule and Google Meet links.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium rounded-md transition-colors"
          >
            View Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
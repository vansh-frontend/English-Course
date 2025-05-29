import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserEnrollments, getCourseById } from '../services/courseService';
import { useAuth } from '../context/AuthContext';
import { Course, Enrollment } from '../types/course';
import { Video, Calendar, Download, ExternalLink, Clock, Award, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

interface EnrolledCourse extends Enrollment {
  courseDetails?: Course | null;
}

export function UserDashboard() {
  const { currentUser, updateDisplayName } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [isUpdatingDisplayName, setIsUpdatingDisplayName] = useState(false);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        if (!currentUser) return;
        
        // Fetch user enrollments
        const enrollments = await getUserEnrollments(currentUser.uid);
        
        // Fetch course details for each enrollment
        const enrichedEnrollments = await Promise.all(
          enrollments.enrollments.map(async (enrollment: Enrollment) => {
            const courseDetails = await getCourseById(enrollment.courseId);
            return {
              ...enrollment,
              courseDetails
            };
          })
        );
        
        setEnrolledCourses(enrichedEnrollments);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();

    // Initialize display name state when currentUser is available
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
    }

  }, [currentUser]);

  // Filter courses based on active tab
  const filteredCourses = enrolledCourses.filter(course => {
    // Mock logic - in a real app, you'd have completion status
    if (activeTab === 'completed') {
      return false; // No completed courses for this demo
    }
    return true;
  });

  const handleDisplayNameUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsUpdatingDisplayName(true);
    try {
      await updateDisplayName(displayName.trim());
      toast.success('Display name updated successfully!');
    } catch (error) {
      console.error('Error updating display name:', error);
      toast.error('Failed to update display name.');
    } finally {
      setIsUpdatingDisplayName(false);
    }
  };

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="mt-2 text-gray-700">
            Access your enrolled courses and track your learning progress.
          </p>
        </div>
        
        {/* Welcome Message */}
        {currentUser && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Hi, {currentUser.displayName || currentUser.email}, welcome to the dashboard!
            </h2>
            {currentUser.displayName && (
              <p className="text-gray-700">Email: {currentUser.email}</p>
            )}

            {/* Display Name Update Form */}
            <form onSubmit={handleDisplayNameUpdate} className="mt-4 flex items-end gap-4">
              <div className="flex-grow">
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Update Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your name"
                  disabled={isUpdatingDisplayName}
                />
              </div>
              <button
                type="submit"
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 ${isUpdatingDisplayName ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'}`}
                disabled={isUpdatingDisplayName}
              >
                {isUpdatingDisplayName ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                ) : null}
                Update
              </button>
            </form>

          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('current')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'current'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                }`}
              >
                Current Courses
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'completed'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                }`}
              >
                Completed Courses
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg animate-pulse">
                    <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="space-y-6">
                {filteredCourses.map((enrollment) => (
                  <div key={enrollment.id} className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/4">
                        <img
                          src={enrollment.courseDetails?.imageUrl}
                          alt={enrollment.courseDetails?.name}
                          className="w-full h-40 object-cover rounded-md"
                        />
                      </div>
                      <div className="md:w-3/4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {enrollment.courseDetails?.name}
                        </h3>
                        <p className="text-gray-700 mb-4">
                          {enrollment.courseDetails?.description}
                        </p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-1 text-primary-500" />
                            <span>{enrollment.courseDetails?.duration}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <BookOpen className="h-4 w-4 mr-1 text-primary-500" />
                            <span>{enrollment.courseDetails?.lessons} lessons</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Award className="h-4 w-4 mr-1 text-primary-500" />
                            <span>{enrollment.courseDetails?.level}</span>
                          </div>
                        </div>
                        
                        {/* Next class info */}
                        <div className="mb-4 p-3 bg-primary-50 rounded-md border border-primary-100">
                          <h4 className="text-sm font-medium text-primary-800 mb-1">Next Class:</h4>
                          <div className="flex items-center text-sm text-gray-700">
                            <Calendar className="h-4 w-4 mr-1 text-primary-600" />
                            <span>Monday, June 10, 2025 - 7:00 PM IST</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          {enrollment.courseDetails?.meetLink && (
                            <a
                              href={enrollment.courseDetails.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors"
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Join Google Meet
                            </a>
                          )}
                          
                          <button
                            className="flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-md transition-colors"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Invoice
                          </button>
                          
                          <Link
                            to={`/courses/${enrollment.courseId}`}
                            className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-md transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Course Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-700 mb-6">
                  You haven't enrolled in any courses yet.
                </p>
                <Link
                  to="/courses"
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors"
                >
                  Browse Courses
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Learning Resources Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Resources</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Study Materials</h3>
              <p className="text-gray-700 mb-4">
                Access supplementary materials for your courses, including vocabulary lists and practice exercises.
              </p>
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                View Materials →
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Recorded Sessions</h3>
              <p className="text-gray-700 mb-4">
                Watch recordings of previous classes you've attended to review and reinforce your learning.
              </p>
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                View Recordings →
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Certificates</h3>
              <p className="text-gray-700 mb-4">
                View and download your earned certificates after completing your courses.
              </p>
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                View Certificates →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourseById, isUserEnrolled } from '../services/courseService';
import { useAuth } from '../context/AuthContext';
import { Course } from '../types/course';
import { Calendar, Clock, Users, BookOpen, CheckCircle, Award } from 'lucide-react';

export function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!id) return;
        const fetchedCourse = await getCourseById(id);
        setCourse(fetchedCourse);
        
        // Check if user is enrolled
        if (currentUser) {
          const userEnrolled = await isUserEnrolled(currentUser.uid, id);
          setEnrolled(userEnrolled);
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setLoading(false);
        setCheckingEnrollment(false);
      }
    };

    fetchCourse();
  }, [id, currentUser]);

  const handleEnrollClick = () => {
    if (!currentUser) {
      navigate('/login', { state: { redirectTo: `/enroll/${id}` } });
    } else {
      navigate(`/enroll/${id}`);
    }
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
        <p className="text-gray-700 mb-6">The course you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/courses"
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors"
        >
          Browse All Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.name}</h1>
              <p className="text-lg text-gray-200 mb-6">{course.description}</p>
              <div className="flex items-center mb-4">
                <img 
                  src={course.instructorAvatar} 
                  alt={course.instructorName}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                  <p className="font-medium">Instructor: {course.instructorName}</p>
                  <div className="flex items-center text-sm text-gray-300">
                    <Award className="h-4 w-4 mr-1" />
                    <span>Certified English Teacher</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1 text-primary-300" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-1 text-primary-300" />
                  <span>{course.enrollmentCount} students enrolled</span>
                </div>
                <div className="flex items-center text-sm">
                  <BookOpen className="h-4 w-4 mr-1 text-primary-300" />
                  <span>{course.lessons} lessons</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-1 text-primary-300" />
                  <span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {checkingEnrollment ? (
                  <div className="animate-pulse bg-gray-400 h-12 w-40 rounded-md"></div>
                ) : enrolled ? (
                  <button
                    onClick={handleDashboardClick}
                    className="px-6 py-3 bg-success-600 hover:bg-success-700 text-white font-medium rounded-md transition-colors flex items-center justify-center"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" /> Go to Dashboard
                  </button>
                ) : (
                  <button
                    onClick={handleEnrollClick}
                    className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-md transition-colors flex items-center justify-center"
                  >
                    Enroll Now - ₹{course.price}
                  </button>
                )}
                <Link
                  to="/courses"
                  className="px-6 py-3 bg-white hover:bg-gray-100 text-primary-800 font-medium rounded-md transition-colors text-center"
                >
                  Browse Other Courses
                </Link>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img 
                src={course.imageUrl} 
                alt={course.name}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Overview</h2>
              <p className="text-gray-700 mb-6">
                This comprehensive {course.level} level English course is designed to help students improve their language skills through interactive lessons and practical exercises. With a focus on real-world communication, students will gain confidence in speaking, listening, reading, and writing English.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">What You'll Learn</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Master essential vocabulary and grammar concepts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Develop confident speaking skills through regular practice sessions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Improve listening comprehension with authentic materials</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Enhance reading and writing abilities for academic and professional purposes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Gain practical communication strategies for real-life situations</span>
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Course Structure</h3>
              <p className="text-gray-700 mb-4">
                This course includes {course.lessons} lessons delivered through live interactive sessions via Google Meet. Each session is designed to be engaging and focused on practical language use.
              </p>
              <div className="space-y-4 mb-6">
                <div className="border-l-4 border-primary-600 pl-4">
                  <h4 className="font-medium text-gray-900">Live Interactive Classes</h4>
                  <p className="text-gray-700 text-sm">
                    Weekly sessions with direct instructor feedback and conversation practice
                  </p>
                </div>
                <div className="border-l-4 border-primary-600 pl-4">
                  <h4 className="font-medium text-gray-900">Homework Assignments</h4>
                  <p className="text-gray-700 text-sm">
                    Practical exercises to reinforce learning between sessions
                  </p>
                </div>
                <div className="border-l-4 border-primary-600 pl-4">
                  <h4 className="font-medium text-gray-900">Progress Assessments</h4>
                  <p className="text-gray-700 text-sm">
                    Regular feedback on your language development
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Prerequisites</h3>
              <p className="text-gray-700 mb-6">
                {course.level === 'Beginner' 
                  ? 'No prior English knowledge required. This course starts from the basics.' 
                  : course.level === 'Intermediate' 
                    ? 'Basic English vocabulary and grammar knowledge is recommended.' 
                    : 'Strong intermediate English skills are required for this advanced course.'}
              </p>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Details</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold text-gray-900">₹{course.price}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold text-gray-900">{course.duration}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Level</span>
                  <span className="font-semibold text-gray-900">{course.level}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Lessons</span>
                  <span className="font-semibold text-gray-900">{course.lessons}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Students</span>
                  <span className="font-semibold text-gray-900">{course.enrollmentCount}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Certificate</span>
                  <span className="font-semibold text-gray-900">Yes</span>
                </div>
              </div>
              
              {checkingEnrollment ? (
                <div className="animate-pulse bg-gray-400 h-12 w-full rounded-md"></div>
              ) : enrolled ? (
                <button
                  onClick={handleDashboardClick}
                  className="w-full px-6 py-3 bg-success-600 hover:bg-success-700 text-white font-medium rounded-md transition-colors flex items-center justify-center"
                >
                  <CheckCircle className="h-5 w-5 mr-2" /> Access Course
                </button>
              ) : (
                <button
                  onClick={handleEnrollClick}
                  className="w-full px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-md transition-colors flex items-center justify-center"
                >
                  Enroll Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
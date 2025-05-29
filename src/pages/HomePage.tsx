import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPopularCourses } from '../services/courseService';
import { CourseCard } from '../components/CourseCard';
import { Course } from '../types/course';
import { ArrowRight, CheckCircle, Book, AlignCenterVertical as Certificate, Globe } from 'lucide-react';

export function HomePage() {
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        const courses = await getPopularCourses(4);
        setPopularCourses(courses);
      } catch (error) {
        console.error('Error fetching popular courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCourses();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-800 to-primary-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10 z-10"></div>
          <img
            src="https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg"
            alt="English Learning"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-20">
          <div className="md:w-2/3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-slide-up">
              Master English with Professional Guidance
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Join our specialized English courses taught by expert instructors and take your language skills to the next level.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link
                to="/courses"
                className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-md transition-colors duration-300 text-center"
              >
                Explore Courses
              </Link>
              <Link
                to="/signup"
                className="px-6 py-3 bg-white hover:bg-gray-100 text-primary-800 font-medium rounded-md transition-colors duration-300 text-center"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose EnglishMaster?</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Our platform offers comprehensive English learning experiences with features designed to help you succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Book className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Instructors</h3>
              <p className="text-gray-700">
                Learn from certified English teachers with years of professional experience.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Interactive Classes</h3>
              <p className="text-gray-700">
                Join real-time sessions via Google Meet with direct instructor interaction.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Certificate className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Course Certificates</h3>
              <p className="text-gray-700">
                Receive official certificates upon successful course completion.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Learning</h3>
              <p className="text-gray-700">
                Choose from various course schedules to fit your personal timetable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Popular Courses</h2>
            <Link
              to="/courses"
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              View All <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden h-80 animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {popularCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Students Say</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Read success stories from students who have improved their English skills with our courses.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg"
                  alt="Student"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Priya Sharma</h4>
                  <p className="text-sm text-gray-600">Business English Student</p>
                </div>
              </div>
              <p className="text-gray-700">
                "The Business English course helped me secure a job at a multinational company. The instructor was knowledgeable and the live classes were interactive and engaging."
              </p>
              <div className="mt-4 flex text-accent-500">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg"
                  alt="Student"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Rajesh Kumar</h4>
                  <p className="text-sm text-gray-600">IELTS Preparation Student</p>
                </div>
              </div>
              <p className="text-gray-700">
                "I achieved a band score of 7.5 in IELTS after taking the preparation course. The practice materials and feedback from teachers were invaluable for my success."
              </p>
              <div className="mt-4 flex text-accent-500">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
                  alt="Student"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Anjali Patel</h4>
                  <p className="text-sm text-gray-600">Conversation Practice Student</p>
                </div>
              </div>
              <p className="text-gray-700">
                "The conversation practice classes helped me overcome my fear of speaking English. Now I confidently communicate with clients in my job as a customer service representative."
              </p>
              <div className="mt-4 flex text-accent-500">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Improve Your English Skills?</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">
            Join thousands of students who have transformed their English proficiency with our courses.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/courses"
              className="px-6 py-3 bg-white hover:bg-gray-100 text-primary-800 font-medium rounded-md transition-colors duration-300"
            >
              Browse Courses
            </Link>
            <Link
              to="/signup"
              className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-md transition-colors duration-300"
            >
              Sign Up Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { getAllEnrollments, getCourseById } from '../services/courseService';
import { sendEnrollmentConfirmations } from '../services/notificationService';
import { Enrollment, Course } from '../types/course';
import { BarChart3, Users, DollarSign, Mail, MessageSquare, Search, Calendar, Download } from 'lucide-react';

interface EnrollmentWithCourse extends Enrollment {
  courseDetails?: Course;
}

export function AdminDashboard() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentWithCourse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const fetchedEnrollments = await getAllEnrollments();
        
        // Fetch course details for each enrollment
        const enrichedEnrollments = await Promise.all(
          fetchedEnrollments.map(async (enrollment) => {
            const courseDetails = await getCourseById(enrollment.courseId);
            return {
              ...enrollment,
              courseDetails
            };
          })
        );
        
        setEnrollments(enrichedEnrollments);
        setFilteredEnrollments(enrichedEnrollments);
        
        // Calculate total revenue
        const revenue = enrichedEnrollments.reduce((total, enrollment) => {
          return total + (enrollment.paymentStatus === 'completed' ? enrollment.coursePrice : 0);
        }, 0);
        setTotalRevenue(revenue);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = enrollments.filter(enrollment => 
        enrollment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.userPhone.includes(searchTerm) ||
        enrollment.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEnrollments(filtered);
    } else {
      setFilteredEnrollments(enrollments);
    }
  }, [searchTerm, enrollments]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleViewDetails = (enrollment: EnrollmentWithCourse) => {
    setSelectedEnrollment(enrollment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEnrollment(null);
  };

  const handleSendNotification = async () => {
    if (!selectedEnrollment || !selectedEnrollment.courseDetails) return;
    
    setSendingNotification(true);
    
    try {
      await sendEnrollmentConfirmations(selectedEnrollment, selectedEnrollment.courseDetails);
      alert('Notification sent successfully!');
      closeModal();
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification. Please try again.');
    } finally {
      setSendingNotification(false);
    }
  };

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-700">
            Manage enrollments, courses, and student information.
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 mr-4">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-accent-100 mr-4">
                <DollarSign className="h-6 w-6 text-accent-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-success-100 mr-4">
                <BarChart3 className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(enrollments.map(e => e.courseId)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enrollments Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900">Student Enrollments</h2>
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search enrollments..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEnrollments.length > 0 ? (
                    filteredEnrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{enrollment.userName}</div>
                              <div className="text-sm text-gray-500">{enrollment.userEmail}</div>
                              <div className="text-sm text-gray-500">{enrollment.userPhone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{enrollment.courseName}</div>
                          <div className="text-sm text-gray-500">{enrollment.courseDetails?.level}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            enrollment.paymentStatus === 'completed'
                              ? 'bg-success-100 text-success-800'
                              : enrollment.paymentStatus === 'pending'
                                ? 'bg-warning-100 text-warning-800'
                                : 'bg-error-100 text-error-800'
                          }`}>
                            {enrollment.paymentStatus.charAt(0).toUpperCase() + enrollment.paymentStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{enrollment.coursePrice}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(enrollment)}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No enrollments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Enrollment Details Modal */}
      {isModalOpen && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Enrollment Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Student Information</h4>
                  <p className="text-lg font-semibold text-gray-900 mb-1">{selectedEnrollment.userName}</p>
                  <p className="text-gray-700">{selectedEnrollment.userEmail}</p>
                  <p className="text-gray-700">{selectedEnrollment.userPhone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Course Information</h4>
                  <p className="text-lg font-semibold text-gray-900 mb-1">{selectedEnrollment.courseName}</p>
                  <p className="text-gray-700">Level: {selectedEnrollment.courseDetails?.level}</p>
                  <p className="text-gray-700">Duration: {selectedEnrollment.courseDetails?.duration}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Enrollment Details</h4>
                  <p className="text-gray-700">Date: {new Date(selectedEnrollment.enrolledAt).toLocaleDateString()}</p>
                  <p className="text-gray-700">Time: {new Date(selectedEnrollment.enrolledAt).toLocaleTimeString()}</p>
                  <p className="text-gray-700">ID: {selectedEnrollment.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Payment Information</h4>
                  <p className="text-gray-700">Amount: ₹{selectedEnrollment.coursePrice}</p>
                  <p className="text-gray-700">Status: {selectedEnrollment.paymentStatus}</p>
                  <p className="text-gray-700">Payment ID: {selectedEnrollment.paymentId || 'N/A'}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Actions</h4>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleSendNotification}
                    disabled={sendingNotification}
                    className={`flex items-center px-4 py-2 rounded-md bg-primary-600 text-white ${
                      sendingNotification ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-700'
                    }`}
                  >
                    {sendingNotification ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send WhatsApp Reminder
                      </>
                    )}
                  </button>
                  
                  <button
                    className="flex items-center px-4 py-2 rounded-md bg-primary-100 text-primary-700 hover:bg-primary-200"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </button>
                  
                  <button
                    className="flex items-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Update Schedule
                  </button>
                  
                  <button
                    className="flex items-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
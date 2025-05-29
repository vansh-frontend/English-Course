import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getCourseById } from '../services/courseService';
import { createEnrollment, updateEnrollmentPayment } from '../services/courseService';
import { createRazorpayOrder, generatePaymentData, verifyRazorpayPayment } from '../services/paymentService';
import { sendEnrollmentConfirmations } from '../services/notificationService';
import { generateAndUploadInvoice } from '../services/invoiceService';
import { useAuth } from '../context/AuthContext';
import { Course } from '../types/course';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

interface EnrollFormData {
  name: string;
  email: string;
  phone: string;
}

export function EnrollPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EnrollFormData>();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchCourse = async () => {
      try {
        if (!id) return;
        const fetchedCourse = await getCourseById(id);
        setCourse(fetchedCourse);
        
        // Pre-fill form with user data if available
        if (currentUser.displayName) {
          setValue('name', currentUser.displayName);
        }
        if (currentUser.email) {
          setValue('email', currentUser.email);
        }
        if (currentUser.phoneNumber) {
          setValue('phone', currentUser.phoneNumber);
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
        setError('Failed to load course information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, currentUser, navigate, setValue]);

  const onSubmit = async (data: EnrollFormData) => {
    if (!course || !currentUser || !id) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      // Create enrollment record with pending payment status
      const enrollmentId = await createEnrollment({
        userId: currentUser.uid,
        courseId: id,
        userName: data.name,
        userEmail: data.email,
        userPhone: data.phone,
        courseName: course.name,
        coursePrice: course.price,
        paymentId: '',
        paymentStatus: 'pending'
      });
      
      // Create Razorpay order
      const paymentData = generatePaymentData(course, currentUser.uid);
      const orderData = await createRazorpayOrder(paymentData);
      
      // Initialize Razorpay
      setPaymentProcessing(true);
      
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "EnglishMaster",
        description: `Enrollment for ${course.name}`,
        order_id: orderData.orderId,
        handler: async function(response: any) {
          try {
            // Verify payment
            const isValid = await verifyRazorpayPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );
            
            if (isValid) {
              // Update enrollment with completed payment status
              await updateEnrollmentPayment(
                enrollmentId,
                response.razorpay_payment_id,
                'completed'
              );
              
              // Generate and upload invoice
              await generateAndUploadInvoice({
                id: enrollmentId,
                userId: currentUser.uid,
                courseId: id,
                userName: data.name,
                userEmail: data.email,
                userPhone: data.phone,
                courseName: course.name,
                coursePrice: course.price,
                paymentId: response.razorpay_payment_id,
                paymentStatus: 'completed',
                enrolledAt: new Date()
              });
              
              // Send notifications
              await sendEnrollmentConfirmations({
                id: enrollmentId,
                userId: currentUser.uid,
                courseId: id,
                userName: data.name,
                userEmail: data.email,
                userPhone: data.phone,
                courseName: course.name,
                coursePrice: course.price,
                paymentId: response.razorpay_payment_id,
                paymentStatus: 'completed',
                enrolledAt: new Date()
              }, course);
              
              // Redirect to success page
              navigate('/payment-success', { 
                state: { 
                  courseId: id,
                  courseName: course.name,
                  enrollmentId: enrollmentId
                } 
              });
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment processing error:', error);
            setError('Payment verification failed. Please contact support.');
            await updateEnrollmentPayment(enrollmentId, '', 'failed');
          } finally {
            setPaymentProcessing(false);
            setSubmitting(false);
          }
        },
        prefill: {
          name: data.name,
          email: data.email,
          contact: data.phone
        },
        theme: {
          color: "#1E40AF"
        }
      };
      
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      
      razorpay.on('payment.failed', async function(response: any) {
        console.error('Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description}`);
        await updateEnrollmentPayment(enrollmentId, '', 'failed');
        setPaymentProcessing(false);
        setSubmitting(false);
      });
    } catch (error) {
      console.error('Enrollment error:', error);
      setError('Failed to process enrollment. Please try again later.');
      setSubmitting(false);
      setPaymentProcessing(false);
    }
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
        <p className="text-gray-700 mb-6">The course you're trying to enroll in doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/courses')}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors"
        >
          Browse All Courses
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enroll in Course</h1>
          <p className="text-lg text-gray-700">Complete your enrollment for <span className="font-medium">{course.name}</span></p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-primary-50 border-b border-primary-100">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <img 
                src={course.imageUrl} 
                alt={course.name}
                className="w-32 h-32 object-cover rounded-md"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{course.name}</h2>
                <p className="text-gray-700 mb-2">{course.level} Level • {course.duration} • {course.lessons} lessons</p>
                <div className="flex items-center">
                  <img 
                    src={course.instructorAvatar} 
                    alt={course.instructorName}
                    className="w-8 h-8 rounded-full object-cover mr-2"
                  />
                  <span className="text-sm text-gray-700">Instructor: {course.instructorName}</span>
                </div>
                <div className="mt-2 text-2xl font-bold text-primary-600">₹{course.price}</div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-error-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-error-700">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className={`w-full px-4 py-2 border ${errors.name ? 'border-error-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                    disabled={submitting}
                  />
                  {errors.name && <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
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
                    className={`w-full px-4 py-2 border ${errors.email ? 'border-error-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                    disabled={submitting}
                  />
                  {errors.email && <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    {...register('phone', { 
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                        message: 'Invalid phone number format'
                      }
                    })}
                    className={`w-full px-4 py-2 border ${errors.phone ? 'border-error-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500`}
                    placeholder="+91XXXXXXXXXX"
                    disabled={submitting}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-error-600">{errors.phone.message}</p>}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-success-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">What's included:</h3>
                      <ul className="mt-2 text-sm text-gray-700 space-y-1">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                          <span>Full access to all course lessons</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                          <span>Live interactive sessions via Google Meet</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                          <span>Course completion certificate</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                          <span>Instructor support throughout the course</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting || paymentProcessing}
                  className={`w-full flex justify-center items-center px-6 py-3 bg-accent-500 ${submitting || paymentProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-accent-600'} text-white font-medium rounded-md transition-colors`}
                >
                  {submitting || paymentProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      {paymentProcessing ? 'Processing Payment...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Proceed to Payment (₹{course.price})
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>By enrolling, you agree to our <a href="#" className="text-primary-600 hover:text-primary-800">Terms of Service</a> and <a href="#" className="text-primary-600 hover:text-primary-800">Privacy Policy</a>.</p>
          <p className="mt-2">Need help? Contact us at <a href="mailto:support@englishmaster.com" className="text-primary-600 hover:text-primary-800">support@englishmaster.com</a></p>
        </div>
      </div>
    </div>
  );
}
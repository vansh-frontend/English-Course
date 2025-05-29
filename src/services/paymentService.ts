import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';
import { Course } from '../types/course';

interface CreateOrderParams {
  amount: number;
  currency: string;
  receipt: string;
  notes: Record<string, string>;
}

interface PaymentResponse {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  notes: Record<string, string>;
  key: string;
}

// Create Razorpay order
export const createRazorpayOrder = async (params: CreateOrderParams): Promise<PaymentResponse> => {
  try {
    const createOrder = httpsCallable<CreateOrderParams, PaymentResponse>(functions, 'createRazorpayOrder');
    const result = await createOrder(params);
    return result.data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Verify Razorpay payment
export const verifyRazorpayPayment = async (paymentId: string, orderId: string, signature: string): Promise<boolean> => {
  try {
    const verifyPayment = httpsCallable<{
      paymentId: string;
      orderId: string;
      signature: string;
    }, { valid: boolean }>(functions, 'verifyRazorpayPayment');
    
    const result = await verifyPayment({
      paymentId,
      orderId,
      signature
    });
    
    return result.data.valid;
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
  }
};

// Generate payment data for a course
export const generatePaymentData = (course: Course, userId: string): CreateOrderParams => {
  return {
    amount: course.price * 100, // Razorpay requires amount in paise
    currency: 'INR',
    receipt: `receipt_${userId}_${course.id}_${Date.now()}`,
    notes: {
      userId,
      courseId: course.id,
      courseName: course.name
    }
  };
};
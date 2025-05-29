import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';
import { Course, Enrollment } from '../types/course';

interface SendEmailParams {
  to: string;
  subject: string;
  templateId: string;
  dynamicTemplateData: Record<string, any>;
}

interface SendWhatsAppParams {
  to: string;
  templateName: string;
  templateData: Record<string, any>;
}

// Send email notification
export const sendEmailNotification = async (params: SendEmailParams): Promise<{ success: boolean; messageId?: string }> => {
  try {
    const sendEmail = httpsCallable<SendEmailParams, { success: boolean; messageId?: string }>(
      functions, 
      'sendEmail'
    );
    
    const result = await sendEmail(params);
    return result.data;
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

// Send WhatsApp notification
export const sendWhatsAppNotification = async (params: SendWhatsAppParams): Promise<{ success: boolean; messageId?: string }> => {
  try {
    const sendWhatsApp = httpsCallable<SendWhatsAppParams, { success: boolean; messageId?: string }>(
      functions, 
      'sendWhatsApp'
    );
    
    const result = await sendWhatsApp(params);
    return result.data;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    throw error;
  }
};

// Send enrollment confirmation notifications
export const sendEnrollmentConfirmations = async (
  enrollment: Enrollment, 
  course: Course,
  adminEmail: string = 'admin@englishmaster.com',
  adminPhone: string = '+1234567890'
): Promise<void> => {
  try {
    // Send email to user
    await sendEmailNotification({
      to: enrollment.userEmail,
      subject: `Your Enrollment in ${course.name} is Confirmed!`,
      templateId: 'enrollment-confirmation',
      dynamicTemplateData: {
        userName: enrollment.userName,
        courseName: course.name,
        amount: enrollment.coursePrice,
        enrollmentId: enrollment.id,
        paymentId: enrollment.paymentId,
        enrollmentDate: new Date().toLocaleDateString()
      }
    });
    
    // Send WhatsApp to user
    await sendWhatsAppNotification({
      to: enrollment.userPhone,
      templateName: 'enrollment_confirmation',
      templateData: {
        userName: enrollment.userName,
        courseName: course.name,
        enrollmentId: enrollment.id
      }
    });
    
    // Send email to admin
    await sendEmailNotification({
      to: adminEmail,
      subject: `New Enrollment: ${course.name}`,
      templateId: 'admin-enrollment-notification',
      dynamicTemplateData: {
        userName: enrollment.userName,
        userEmail: enrollment.userEmail,
        userPhone: enrollment.userPhone,
        courseName: course.name,
        amount: enrollment.coursePrice,
        enrollmentId: enrollment.id,
        paymentId: enrollment.paymentId,
        enrollmentDate: new Date().toLocaleDateString()
      }
    });
    
    // Send WhatsApp to admin
    await sendWhatsAppNotification({
      to: adminPhone,
      templateName: 'admin_enrollment_notification',
      templateData: {
        userName: enrollment.userName,
        courseName: course.name,
        enrollmentId: enrollment.id,
        amount: enrollment.coursePrice
      }
    });
  } catch (error) {
    console.error('Error sending enrollment confirmations:', error);
  }
};
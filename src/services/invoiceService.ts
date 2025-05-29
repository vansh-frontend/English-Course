import { jsPDF } from 'jspdf';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateDoc, doc } from 'firebase/firestore';
import { db, storage } from './firebase';
import { Enrollment } from '../types/course';

// Generate and download PDF invoice
export const generatePdfInvoice = (enrollment: Enrollment): void => {
  // Create a new PDF document
  const pdf = new jsPDF();
  
  // Set document properties
  pdf.setProperties({
    title: `Invoice for ${enrollment.courseName}`,
    subject: 'Course Enrollment Invoice',
    author: 'EnglishMaster',
    keywords: 'invoice, course, enrollment',
    creator: 'EnglishMaster Platform'
  });
  
  // Add company logo/header
  pdf.setFontSize(20);
  pdf.setTextColor(30, 64, 175); // primary-800
  pdf.text('EnglishMaster', 15, 20);
  
  // Add invoice title
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('INVOICE', 15, 30);
  
  // Add invoice details
  pdf.setFontSize(10);
  pdf.text(`Invoice Number: INV-${enrollment.id.substring(0, 8).toUpperCase()}`, 15, 40);
  pdf.text(`Date: ${new Date(enrollment.enrolledAt).toLocaleDateString()}`, 15, 45);
  
  // Add customer details
  pdf.setFontSize(12);
  pdf.text('Bill To:', 15, 55);
  pdf.setFontSize(10);
  pdf.text(enrollment.userName, 15, 60);
  pdf.text(enrollment.userEmail, 15, 65);
  pdf.text(enrollment.userPhone, 15, 70);
  
  // Add course details
  pdf.line(15, 80, 195, 80);
  pdf.setFontSize(10);
  pdf.text('Description', 15, 85);
  pdf.text('Amount', 160, 85);
  pdf.line(15, 90, 195, 90);
  
  pdf.text(enrollment.courseName, 15, 100);
  pdf.text(`₹${enrollment.coursePrice.toFixed(2)}`, 160, 100);
  
  // Add GST (if applicable) - example with 18% GST
  const gstAmount = enrollment.coursePrice * 0.18;
  pdf.text('GST (18%)', 15, 110);
  pdf.text(`₹${gstAmount.toFixed(2)}`, 160, 110);
  
  // Add total
  pdf.line(15, 120, 195, 120);
  pdf.setFontSize(12);
  pdf.text('Total', 15, 130);
  pdf.text(`₹${(enrollment.coursePrice + gstAmount).toFixed(2)}`, 160, 130);
  pdf.line(15, 135, 195, 135);
  
  // Add payment info
  pdf.setFontSize(10);
  pdf.text(`Payment ID: ${enrollment.paymentId}`, 15, 145);
  pdf.text('Payment Status: Completed', 15, 150);
  
  // Add footer
  pdf.setFontSize(8);
  pdf.text('Thank you for your enrollment!', 15, 170);
  pdf.text('For any queries, please contact us at support@englishmaster.com', 15, 175);
  pdf.text('© EnglishMaster, 2025', 15, 280);
  
  // Download the PDF
  pdf.save(`Invoice_${enrollment.id.substring(0, 8)}.pdf`);
};

// Generate and upload PDF invoice to Firebase Storage
export const generateAndUploadInvoice = async (enrollment: Enrollment): Promise<string> => {
  // Create a new PDF document
  const pdf = new jsPDF();
  
  // Set document properties
  pdf.setProperties({
    title: `Invoice for ${enrollment.courseName}`,
    subject: 'Course Enrollment Invoice',
    author: 'EnglishMaster',
    keywords: 'invoice, course, enrollment',
    creator: 'EnglishMaster Platform'
  });
  
  // Add company logo/header
  pdf.setFontSize(20);
  pdf.setTextColor(30, 64, 175); // primary-800
  pdf.text('EnglishMaster', 15, 20);
  
  // Add invoice title
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('INVOICE', 15, 30);
  
  // Add invoice details
  pdf.setFontSize(10);
  pdf.text(`Invoice Number: INV-${enrollment.id.substring(0, 8).toUpperCase()}`, 15, 40);
  pdf.text(`Date: ${new Date(enrollment.enrolledAt).toLocaleDateString()}`, 15, 45);
  
  // Add customer details
  pdf.setFontSize(12);
  pdf.text('Bill To:', 15, 55);
  pdf.setFontSize(10);
  pdf.text(enrollment.userName, 15, 60);
  pdf.text(enrollment.userEmail, 15, 65);
  pdf.text(enrollment.userPhone, 15, 70);
  
  // Add course details
  pdf.line(15, 80, 195, 80);
  pdf.setFontSize(10);
  pdf.text('Description', 15, 85);
  pdf.text('Amount', 160, 85);
  pdf.line(15, 90, 195, 90);
  
  pdf.text(enrollment.courseName, 15, 100);
  pdf.text(`₹${enrollment.coursePrice.toFixed(2)}`, 160, 100);
  
  // Add GST (if applicable) - example with 18% GST
  const gstAmount = enrollment.coursePrice * 0.18;
  pdf.text('GST (18%)', 15, 110);
  pdf.text(`₹${gstAmount.toFixed(2)}`, 160, 110);
  
  // Add total
  pdf.line(15, 120, 195, 120);
  pdf.setFontSize(12);
  pdf.text('Total', 15, 130);
  pdf.text(`₹${(enrollment.coursePrice + gstAmount).toFixed(2)}`, 160, 130);
  pdf.line(15, 135, 195, 135);
  
  // Add payment info
  pdf.setFontSize(10);
  pdf.text(`Payment ID: ${enrollment.paymentId}`, 15, 145);
  pdf.text('Payment Status: Completed', 15, 150);
  
  // Add footer
  pdf.setFontSize(8);
  pdf.text('Thank you for your enrollment!', 15, 170);
  pdf.text('For any queries, please contact us at support@englishmaster.com', 15, 175);
  pdf.text('© EnglishMaster, 2025', 15, 280);
  
  // Convert the PDF to a blob
  const pdfBlob = pdf.output('blob');
  
  // Upload to Firebase Storage
  const storageRef = ref(storage, `invoices/${enrollment.userId}/${enrollment.id}.pdf`);
  await uploadBytes(storageRef, pdfBlob);
  
  // Get download URL
  const downloadUrl = await getDownloadURL(storageRef);
  
  // Update enrollment with invoice URL
  await updateDoc(doc(db, 'enrollments', enrollment.id), {
    invoiceUrl: downloadUrl
  });
  
  return downloadUrl;
};
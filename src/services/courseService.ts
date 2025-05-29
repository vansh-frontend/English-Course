import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  serverTimestamp,
  orderBy,
  limit,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { Course, Enrollment } from '../types/course';

// Get all courses
export const getAllCourses = async (): Promise<Course[]> => {
  const coursesCollection = collection(db, 'courses');
  const coursesSnapshot = await getDocs(coursesCollection);
  
  return coursesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  } as Course));
};

// Get course by ID
export const getCourseById = async (id: string): Promise<Course | null> => {
  const courseDoc = await getDoc(doc(db, 'courses', id));
  
  if (!courseDoc.exists()) {
    return null;
  }
  
  return {
    id: courseDoc.id,
    ...courseDoc.data(),
    createdAt: courseDoc.data().createdAt?.toDate(),
    updatedAt: courseDoc.data().updatedAt?.toDate()
  } as Course;
};

// Get courses by level
export const getCoursesByLevel = async (level: string): Promise<Course[]> => {
  const coursesQuery = query(
    collection(db, 'courses'),
    where('level', '==', level)
  );
  
  const coursesSnapshot = await getDocs(coursesQuery);
  
  return coursesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  } as Course));
};

// Check if user is enrolled in a course
export const isUserEnrolled = async (userId: string, courseId: string): Promise<boolean> => {
  const enrollmentsQuery = query(
    collection(db, 'enrollments'),
    where('userId', '==', userId),
    where('courseId', '==', courseId),
    where('paymentStatus', '==', 'completed'),
    limit(1)
  );
  
  const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
  
  return !enrollmentsSnapshot.empty;
};

// Get user enrollments
export const getUserEnrollments = async (userId: string): Promise<Enrollment[]> => {
  const enrollmentsQuery = query(
    collection(db, 'enrollments'),
    where('userId', '==', userId),
    where('paymentStatus', '==', 'completed'),
    orderBy('enrolledAt', 'desc')
  );
  
  const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
  
  return enrollmentsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    enrolledAt: doc.data().enrolledAt?.toDate()
  } as Enrollment));
};

// Get all enrollments (admin only)
export const getAllEnrollments = async (): Promise<Enrollment[]> => {
  const enrollmentsQuery = query(
    collection(db, 'enrollments'),
    orderBy('enrolledAt', 'desc')
  );
  
  const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
  
  return enrollmentsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    enrolledAt: doc.data().enrolledAt?.toDate()
  } as Enrollment));
};

// Create enrollment record
export const createEnrollment = async (enrollmentData: Omit<Enrollment, 'id' | 'enrolledAt'>): Promise<string> => {
  const enrollmentRef = await addDoc(collection(db, 'enrollments'), {
    ...enrollmentData,
    enrolledAt: serverTimestamp()
  });
  
  return enrollmentRef.id;
};

// Update enrollment payment status
export const updateEnrollmentPayment = async (enrollmentId: string, paymentId: string, status: 'completed' | 'failed'): Promise<void> => {
  await updateDoc(doc(db, 'enrollments', enrollmentId), {
    paymentId,
    paymentStatus: status,
    updatedAt: serverTimestamp()
  });
};

// Get popular courses
export const getPopularCourses = async (limit: number = 4): Promise<Course[]> => {
  const coursesQuery = query(
    collection(db, 'courses'),
    orderBy('enrollmentCount', 'desc'),
    limit
  );
  
  const coursesSnapshot = await getDocs(coursesQuery);
  
  return coursesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  } as Course));
};
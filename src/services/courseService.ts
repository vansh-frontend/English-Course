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
  DocumentData,
  QueryConstraint,
  getCountFromServer
} from 'firebase/firestore';
import { db } from './firebase';
import { Course, Enrollment } from '../types/course';

// Helper function to handle Firestore errors
const handleFirestoreError = (error: any, operation: string): never => {
  console.error(`Error in ${operation}:`, error);
  throw new Error(`Failed to ${operation}. Please try again later.`);
};

// Get all courses with pagination
export const getAllCourses = async (pageSize: number = 10, lastDoc?: DocumentData): Promise<{ courses: Course[], lastDoc: DocumentData | null, total: number }> => {
  try {
    const coursesCollection = collection(db, 'courses');
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(pageSize)];
    
    if (lastDoc) {
      constraints.push(where('createdAt', '<', lastDoc.createdAt));
    }
    
    const coursesQuery = query(coursesCollection, ...constraints);
    const [coursesSnapshot, totalSnapshot] = await Promise.all([
      getDocs(coursesQuery),
      getCountFromServer(coursesCollection)
    ]);
    
    const courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as Course));
    
    return {
      courses,
      lastDoc: coursesSnapshot.docs[coursesSnapshot.docs.length - 1] || null,
      total: totalSnapshot.data().count
    };
  } catch (error) {
    return handleFirestoreError(error, 'fetch courses');
  }
};

// Get course by ID
export const getCourseById = async (id: string): Promise<Course | null> => {
  try {
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
  } catch (error) {
    return handleFirestoreError(error, 'fetch course');
  }
};

// Get courses by level with pagination
export const getCoursesByLevel = async (level: string, pageSize: number = 10, lastDoc?: DocumentData): Promise<{ courses: Course[], lastDoc: DocumentData | null, total: number }> => {
  try {
    const coursesCollection = collection(db, 'courses');
    const constraints: QueryConstraint[] = [
      where('level', '==', level),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    ];
    
    if (lastDoc) {
      constraints.push(where('createdAt', '<', lastDoc.createdAt));
    }
    
    const coursesQuery = query(coursesCollection, ...constraints);
    const [coursesSnapshot, totalSnapshot] = await Promise.all([
      getDocs(coursesQuery),
      getCountFromServer(query(coursesCollection, where('level', '==', level)))
    ]);
    
    const courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as Course));
    
    return {
      courses,
      lastDoc: coursesSnapshot.docs[coursesSnapshot.docs.length - 1] || null,
      total: totalSnapshot.data().count
    };
  } catch (error) {
    return handleFirestoreError(error, 'fetch courses by level');
  }
};

// Check if user is enrolled in a course
export const isUserEnrolled = async (userId: string, courseId: string): Promise<boolean> => {
  try {
    const enrollmentsQuery = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId),
      where('courseId', '==', courseId),
      where('paymentStatus', '==', 'completed'),
      limit(1)
    );
    
    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
    return !enrollmentsSnapshot.empty;
  } catch (error) {
    return handleFirestoreError(error, 'check enrollment status');
  }
};

// Get user enrollments with pagination
export const getUserEnrollments = async (userId: string, pageSize: number = 10, lastDoc?: DocumentData): Promise<{ enrollments: Enrollment[], lastDoc: DocumentData | null, total: number }> => {
  try {
    const enrollmentsCollection = collection(db, 'enrollments');
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('paymentStatus', '==', 'completed'),
      orderBy('enrolledAt', 'desc'),
      limit(pageSize)
    ];
    
    if (lastDoc) {
      constraints.push(where('enrolledAt', '<', lastDoc.enrolledAt));
    }
    
    const enrollmentsQuery = query(enrollmentsCollection, ...constraints);
    const [enrollmentsSnapshot, totalSnapshot] = await Promise.all([
      getDocs(enrollmentsQuery),
      getCountFromServer(query(enrollmentsCollection, where('userId', '==', userId), where('paymentStatus', '==', 'completed')))
    ]);
    
    const enrollments = enrollmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      enrolledAt: doc.data().enrolledAt?.toDate()
    } as Enrollment));
    
    return {
      enrollments,
      lastDoc: enrollmentsSnapshot.docs[enrollmentsSnapshot.docs.length - 1] || null,
      total: totalSnapshot.data().count
    };
  } catch (error) {
    return handleFirestoreError(error, 'fetch user enrollments');
  }
};

// Create enrollment record
export const createEnrollment = async (enrollmentData: Omit<Enrollment, 'id' | 'enrolledAt'>): Promise<string> => {
  try {
    const enrollmentRef = await addDoc(collection(db, 'enrollments'), {
      ...enrollmentData,
      enrolledAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return enrollmentRef.id;
  } catch (error) {
    return handleFirestoreError(error, 'create enrollment');
  }
};

// Update enrollment payment status
export const updateEnrollmentPayment = async (enrollmentId: string, paymentId: string, status: 'completed' | 'failed'): Promise<void> => {
  try {
    await updateDoc(doc(db, 'enrollments', enrollmentId), {
      paymentId,
      paymentStatus: status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    return handleFirestoreError(error, 'update enrollment payment');
  }
};

// Get popular courses
export const getPopularCourses = async (limitCount: number = 4): Promise<Course[]> => {
  try {
    const coursesQuery = query(
      collection(db, 'courses'),
      orderBy('enrollmentCount', 'desc'),
      limit(limitCount)
    );
    
    const coursesSnapshot = await getDocs(coursesQuery);
    
    return coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    } as Course));
  } catch (error) {
    console.error('Error fetching popular courses:', error);
    return []; // Return empty array instead of throwing error for better UX
  }
};

// Get all enrollments (admin only) with pagination
export const getAllEnrollments = async (pageSize: number = 10, lastDoc?: DocumentData): Promise<{ enrollments: Enrollment[], lastDoc: DocumentData | null, total: number }> => {
  try {
    const enrollmentsCollection = collection(db, 'enrollments');
    const constraints: QueryConstraint[] = [
      orderBy('enrolledAt', 'desc'),
      limit(pageSize)
    ];
    
    if (lastDoc) {
      constraints.push(where('enrolledAt', '<', lastDoc.enrolledAt));
    }
    
    const enrollmentsQuery = query(enrollmentsCollection, ...constraints);
    const [enrollmentsSnapshot, totalSnapshot] = await Promise.all([
      getDocs(enrollmentsQuery),
      getCountFromServer(enrollmentsCollection)
    ]);
    
    const enrollments = enrollmentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        courseId: data.courseId,
        courseName: data.courseName,
        coursePrice: data.coursePrice,
        userName: data.userName,
        userEmail: data.userEmail,
        userPhone: data.userPhone,
        paymentId: data.paymentId,
        paymentStatus: data.paymentStatus,
        enrolledAt: data.enrolledAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        invoiceUrl: data.invoiceUrl
      } as Enrollment;
    });
    
    return {
      enrollments,
      lastDoc: enrollmentsSnapshot.docs[enrollmentsSnapshot.docs.length - 1] || null,
      total: totalSnapshot.data().count
    };
  } catch (error) {
    return handleFirestoreError(error, 'fetch all enrollments');
  }
};
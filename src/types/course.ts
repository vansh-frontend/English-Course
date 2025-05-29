export interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  duration: string;
  level: string;
  meetLink?: string;
  instructorName: string;
  instructorAvatar: string;
  lessons: number;
  enrollmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  courseName: string;
  coursePrice: number;
  paymentId: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  enrolledAt: Date;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
  createdAt: Date;
}
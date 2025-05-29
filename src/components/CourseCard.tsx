import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, BookOpen } from 'lucide-react';
import { Course } from '../types/course';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link 
      to={`/courses/${course.id}`}
      className="group bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.imageUrl} 
          alt={course.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 bg-primary-600 text-white px-4 py-1 rounded-tr-md">
          ₹{course.price}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
          {course.name}
        </h3>
        <p className="mt-2 text-gray-700 line-clamp-2">
          {course.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1 text-primary-500" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1 text-primary-500" />
            <span>{course.enrollmentCount} students</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <BookOpen className="h-4 w-4 mr-1 text-primary-500" />
            <span>{course.lessons} lessons</span>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={course.instructorAvatar} 
              alt={course.instructorName}
              className="w-8 h-8 rounded-full object-cover mr-2"
            />
            <span className="text-sm text-gray-700">{course.instructorName}</span>
          </div>
          <div className="bg-primary-50 text-primary-700 px-2 py-1 rounded text-xs font-medium">
            {course.level}
          </div>
        </div>
      </div>
    </Link>
  );
}
import React, { useEffect, useState } from 'react';
import { getAllCourses, getCoursesByLevel } from '../services/courseService';
import { CourseCard } from '../components/CourseCard';
import { Course } from '../types/course';
import { Search, Filter } from 'lucide-react';

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let fetchedCourses;
        if (selectedLevel && selectedLevel !== 'All Levels') {
          fetchedCourses = await getCoursesByLevel(selectedLevel);
        } else {
          fetchedCourses = await getAllCourses();
        }
        setCourses(fetchedCourses);
        setFilteredCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedLevel]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = courses.filter(course => 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchTerm, courses]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleLevelFilter = (level: string) => {
    setSelectedLevel(level);
  };

  return (
    <div className="animate-fade-in py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Our English Courses
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Discover courses designed to improve your English language skills, taught by experienced instructors.
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for courses..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-700 mr-2" />
            <span className="text-gray-700 mr-2">Filter by level:</span>
            <div className="flex flex-wrap gap-2">
              {levels.map(level => (
                <button
                  key={level}
                  onClick={() => handleLevelFilter(level === 'All Levels' ? '' : level)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    (selectedLevel === level) || (level === 'All Levels' && selectedLevel === '')
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  } transition-colors`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
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
        ) : filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-700">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
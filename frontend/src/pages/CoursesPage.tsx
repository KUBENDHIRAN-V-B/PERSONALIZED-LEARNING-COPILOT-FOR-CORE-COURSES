import React, { useEffect, useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMessageSquare, FiAward, FiSearch } from 'react-icons/fi';
import { coursesAPI } from '../services/api';

interface Course {
  id: string;
  name: string;
  description: string;
  topics: string[];
  difficulty: string;
  icon?: string;
  color?: string;
  category?: string;
}

// Skeleton loader component
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-800 border-green-200',
  Intermediate: 'bg-blue-100 text-blue-800 border-blue-200',
  Advanced: 'bg-purple-100 text-purple-800 border-purple-200',
};

const defaultColors: Record<string, string> = {
  'programming': 'from-green-500 to-emerald-600',
  'dsa': 'from-blue-500 to-indigo-600',
  'discrete-math': 'from-purple-500 to-violet-600',
  'coa': 'from-slate-500 to-gray-700',
  'os': 'from-orange-500 to-red-600',
  'dbms': 'from-cyan-500 to-blue-600',
  'cn': 'from-teal-500 to-cyan-600',
  'se': 'from-amber-500 to-orange-600',
  'toc': 'from-pink-500 to-rose-600',
  'compiler': 'from-red-500 to-pink-600',
  'algorithms': 'from-indigo-500 to-purple-600',
  'oop': 'from-emerald-500 to-teal-600',
  'ml': 'from-fuchsia-500 to-pink-600',
  'web-tech': 'from-sky-500 to-blue-600',
  'cyber-security': 'from-red-600 to-rose-700',
  'optical-wireless': 'from-sky-500 to-cyan-600',
};

const CourseCard = memo(({ course, onStart, index }: { course: Course; onStart: (id: string) => void; index: number }) => {
  const gradientColor = course.color || defaultColors[course.id] || 'from-blue-500 to-purple-600';
  
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
      {/* Top color bar */}
      <div className={`h-2 bg-gradient-to-r ${gradientColor}`}></div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 bg-gradient-to-br ${gradientColor} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-2xl">{course.icon || '📚'}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{course.name}</h3>
              <span className={`inline-block mt-1 px-3 py-0.5 text-xs font-semibold rounded-full border ${difficultyColors[course.difficulty] || 'bg-gray-100 text-gray-800'}`}>
                {course.difficulty}
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-4 text-sm leading-relaxed">{course.description}</p>

        <div className="mb-5">
          <h4 className="font-semibold text-gray-900 mb-2 text-xs uppercase tracking-wide">Topics covered:</h4>
          <div className="flex flex-wrap gap-1.5">
            {course.topics.slice(0, 4).map((topic, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg font-medium border border-gray-100"
              >
                {topic}
              </span>
            ))}
            {course.topics.length > 4 && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg font-medium">
                +{course.topics.length - 4} more
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onStart(course.id)}
          className={`w-full bg-gradient-to-r ${gradientColor} text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg`}
        >
          <FiMessageSquare /> Start Learning
        </button>
      </div>
    </div>
  );
});

const CoursesPage: React.FC = memo(() => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    let mounted = true;

    const fetchCourses = async () => {
      try {
        const data = await coursesAPI.getAll();
        if (mounted) setCourses(data.courses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCourses();
    return () => { mounted = false; };
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty = filterDifficulty === 'all' || course.difficulty === filterDifficulty;
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const handleStartLearning = useCallback((courseId: string) => {
    navigate(`/chat/${courseId}`);
  }, [navigate]);

  const goBack = useCallback(() => navigate('/dashboard'), [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <FiArrowLeft /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Engineering Courses</h1>
          <span className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {courses.length} Courses
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <FiAward className="text-3xl" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">🎓 Engineering Courses</h2>
                <p className="text-white/80 text-sm">CS • ECE — Core Subjects for Engineering</p>
              </div>
            </div>
            <p className="text-white/90 text-lg max-w-2xl mb-6">
              Master essential subjects in Computer Science & Electronics. Each course has its own AI tutor that answers ONLY course-specific questions!
            </p>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer"
              >
                <option value="all" className="text-gray-900">All Levels</option>
                <option value="Beginner" className="text-gray-900">Beginner</option>
                <option value="Intermediate" className="text-gray-900">Intermediate</option>
                <option value="Advanced" className="text-gray-900">Advanced</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer"
              >
                <option value="all" className="text-gray-900">All Branches</option>
                <option value="CS" className="text-gray-900">🖥️ Computer Science</option>
                <option value="ECE" className="text-gray-900">📡 Electronics & Communication</option>
              </select>
            </div>
          </div>
        </div>

        {/* Course count */}
        {!loading && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredCourses.length}</span> of {courses.length} courses
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full mb-4" />
                <div className="flex gap-2 mb-5">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-14" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                onStart={handleStartLearning}
                index={index}
              />
            ))}
          </div>
        )}

        {!loading && filteredCourses.length === 0 && courses.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">No courses match your search.</p>
            <button 
              onClick={() => { setSearchQuery(''); setFilterDifficulty('all'); setFilterCategory('all'); }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && courses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No courses available at the moment.
          </div>
        )}
      </main>
    </div>
  );
});

export default CoursesPage;

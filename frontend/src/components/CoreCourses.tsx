import React from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  level: string;
  description: string;
  topics: string[];
  moreTopics: number;
}

export const CoreCourses: React.FC = () => {
  const navigate = useNavigate();

  const courses: Course[] = [
    {
      id: 'dsa',
      title: 'Data Structures & Algorithms',
      level: 'Intermediate',
      description: 'Master arrays, linked lists, trees, graphs, and more',
      topics: ['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees'],
      moreTopics: 3
    },
    {
      id: 'dbms',
      title: 'Database Management Systems',
      level: 'Intermediate',
      description: 'Learn SQL, normalization, indexing, and transactions',
      topics: ['SQL', 'Normalization', 'Indexing', 'Transactions', 'Query Optimization'],
      moreTopics: 0
    },
    {
      id: 'algorithms',
      title: 'Algorithms Design',
      level: 'Advanced',
      description: 'Explore sorting, searching, DP, and greedy algorithms',
      topics: ['Sorting', 'Searching', 'Dynamic Programming', 'Greedy Algorithms', 'NP-Completeness'],
      moreTopics: 0
    },
    {
      id: 'oop',
      title: 'Object-Oriented Programming',
      level: 'Intermediate',
      description: 'Master classes, inheritance, polymorphism, and design patterns',
      topics: ['Classes', 'Inheritance', 'Polymorphism', 'Design Patterns', 'SOLID Principles'],
      moreTopics: 0
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'Advanced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Core Courses</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all"
          >
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getLevelColor(course.level)}`}>
                {course.level}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4">{course.description}</p>

            {/* Topics */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-700 mb-2">Topics covered:</p>
              <div className="flex flex-wrap gap-2">
                {course.topics.map((topic, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg font-medium">
                    {topic}
                  </span>
                ))}
                {course.moreTopics > 0 && (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg">
                    +{course.moreTopics} more
                  </span>
                )}
              </div>
            </div>

            {/* Start Learning Button */}
            <button
              onClick={() => navigate(`/chat/${course.id}`)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              Start Learning <FiArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

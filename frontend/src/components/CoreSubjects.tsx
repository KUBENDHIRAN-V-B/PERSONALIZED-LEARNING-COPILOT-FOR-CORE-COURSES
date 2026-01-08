import React from 'react';

interface Subject {
  number: string;
  emoji: string;
  title: string;
  topics: string[];
}

export const CoreSubjects: React.FC = () => {
  const subjects: Subject[] = [
    {
      number: '1️⃣',
      emoji: '💻',
      title: 'Programming Fundamentals',
      topics: ['C / C++ / Java / Python', 'Basics of logic, loops, functions, arrays']
    },
    {
      number: '2️⃣',
      emoji: '📊',
      title: 'Data Structures & Algorithms (DSA)',
      topics: ['Arrays, Linked Lists, Stacks, Queues', 'Trees, Graphs', 'Sorting & Searching', 'Time & Space Complexity']
    },
    {
      number: '3️⃣',
      emoji: '🔢',
      title: 'Discrete Mathematics',
      topics: ['Logic', 'Sets, Relations, Functions', 'Graph Theory', 'Combinatorics']
    },
    {
      number: '4️⃣',
      emoji: '⚙️',
      title: 'Computer Organization & Architecture (COA)',
      topics: ['CPU structure', 'Memory hierarchy', 'Instruction sets', 'I/O organization']
    },
    {
      number: '5️⃣',
      emoji: '🖥️',
      title: 'Operating Systems (OS)',
      topics: ['Processes & Threads', 'CPU Scheduling', 'Memory Management', 'Deadlocks', 'File Systems']
    },
    {
      number: '6️⃣',
      emoji: '🗄️',
      title: 'Database Management Systems (DBMS)',
      topics: ['ER Model', 'SQL', 'Normalization', 'Transactions', 'Indexing']
    },
    {
      number: '7️⃣',
      emoji: '🌐',
      title: 'Computer Networks (CN)',
      topics: ['OSI & TCP/IP models', 'LAN, WAN', 'Routing & Switching', 'HTTP, FTP, DNS']
    },
    {
      number: '8️⃣',
      emoji: '🛠️',
      title: 'Software Engineering (SE)',
      topics: ['SDLC', 'Agile & Waterfall', 'Requirement Analysis', 'Testing & Maintenance']
    },
    {
      number: '9️⃣',
      emoji: '🤖',
      title: 'Theory of Computation (TOC)',
      topics: ['Automata', 'Regular Expressions', 'Turing Machines', 'Decidability']
    },
    {
      number: '🔟',
      emoji: '⚡',
      title: 'Compiler Design',
      topics: ['Lexical Analysis', 'Parsing', 'Syntax & Semantics', 'Code Generation']
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>🔹</span> Core CS Subjects (Must-Know)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((subject, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-blue-300 transition-all"
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{subject.number}</span>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-base">{subject.title}</h3>
              </div>
            </div>
            
            <ul className="space-y-2">
              {subject.topics.map((topic, topicIdx) => (
                <li key={topicIdx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-500 font-bold mt-0.5">•</span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// 🔹 Core CS Subjects (Must-Know)
const courses = [
  // 1️⃣ Programming Fundamentals
  {
    id: 'programming',
    name: 'Programming Fundamentals',
    description: 'Master the basics of programming with C, C++, Java, and Python',
    topics: ['Variables & Data Types', 'Control Flow', 'Loops', 'Functions', 'Arrays', 'Pointers', 'OOP Basics', 'File Handling'],
    difficulty: 'Beginner',
    icon: '💻',
    color: 'from-green-500 to-emerald-600',
    category: 'CS',
  },
  // 2️⃣ Data Structures & Algorithms (DSA)
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    description: 'Master arrays, linked lists, trees, graphs, sorting, searching, and complexity analysis',
    topics: ['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs', 'Sorting', 'Searching', 'Time Complexity', 'Space Complexity'],
    difficulty: 'Intermediate',
    icon: '🔢',
    color: 'from-blue-500 to-indigo-600',
    category: 'CS',
  },
  // 3️⃣ Discrete Mathematics
  {
    id: 'discrete-math',
    name: 'Discrete Mathematics',
    description: 'Learn logic, sets, relations, graph theory, and combinatorics',
    topics: ['Propositional Logic', 'Predicate Logic', 'Sets', 'Relations', 'Functions', 'Graph Theory', 'Combinatorics', 'Probability'],
    difficulty: 'Intermediate',
    icon: '🧮',
    color: 'from-purple-500 to-violet-600',
    category: 'CS',
  },
  // 4️⃣ Computer Organization & Architecture (COA)
  {
    id: 'coa',
    name: 'Computer Organization & Architecture',
    description: 'Understand CPU structure, memory hierarchy, instruction sets, and I/O',
    topics: ['CPU Structure', 'ALU', 'Registers', 'Memory Hierarchy', 'Cache Memory', 'Instruction Sets', 'Pipelining', 'I/O Organization'],
    difficulty: 'Intermediate',
    icon: '🖥️',
    color: 'from-slate-500 to-gray-700',
    category: 'CS',
  },
  // 5️⃣ Operating Systems (OS)
  {
    id: 'os',
    name: 'Operating Systems',
    description: 'Master processes, threads, scheduling, memory management, and file systems',
    topics: ['Processes', 'Threads', 'CPU Scheduling', 'Synchronization', 'Deadlocks', 'Memory Management', 'Virtual Memory', 'File Systems'],
    difficulty: 'Intermediate',
    icon: '⚙️',
    color: 'from-orange-500 to-red-600',
    category: 'CS',
  },
  // 6️⃣ Database Management Systems (DBMS)
  {
    id: 'dbms',
    name: 'Database Management Systems',
    description: 'Learn ER modeling, SQL, normalization, transactions, and indexing',
    topics: ['ER Model', 'Relational Model', 'SQL', 'Normalization', 'Transactions', 'ACID Properties', 'Indexing', 'Query Optimization'],
    difficulty: 'Intermediate',
    icon: '🗄️',
    color: 'from-cyan-500 to-blue-600',
    category: 'CS',
  },
  // 7️⃣ Computer Networks (CN)
  {
    id: 'cn',
    name: 'Computer Networks',
    description: 'Explore OSI & TCP/IP models, routing, switching, and protocols',
    topics: ['OSI Model', 'TCP/IP Model', 'LAN', 'WAN', 'Routing', 'Switching', 'HTTP', 'FTP', 'DNS', 'Network Security'],
    difficulty: 'Intermediate',
    icon: '🌐',
    color: 'from-teal-500 to-cyan-600',
    category: 'CS',
  },
  // 8️⃣ Software Engineering (SE)
  {
    id: 'se',
    name: 'Software Engineering',
    description: 'Learn SDLC, Agile, Waterfall, requirement analysis, testing, and maintenance',
    topics: ['SDLC', 'Agile', 'Scrum', 'Waterfall', 'Requirement Analysis', 'Design Patterns', 'Testing', 'Maintenance', 'Version Control'],
    difficulty: 'Intermediate',
    icon: '🛠️',
    color: 'from-amber-500 to-orange-600',
    category: 'CS',
  },
  // 9️⃣ Theory of Computation (TOC)
  {
    id: 'toc',
    name: 'Theory of Computation',
    description: 'Understand automata, regular expressions, Turing machines, and decidability',
    topics: ['Finite Automata', 'DFA', 'NFA', 'Regular Expressions', 'Context-Free Grammars', 'Pushdown Automata', 'Turing Machines', 'Decidability'],
    difficulty: 'Advanced',
    icon: '🔬',
    color: 'from-pink-500 to-rose-600',
    category: 'CS',
  },
  // 🔟 Compiler Design
  {
    id: 'compiler',
    name: 'Compiler Design',
    description: 'Learn lexical analysis, parsing, syntax & semantics, and code generation',
    topics: ['Lexical Analysis', 'Tokenization', 'Parsing', 'Syntax Analysis', 'Semantic Analysis', 'Intermediate Code', 'Code Optimization', 'Code Generation'],
    difficulty: 'Advanced',
    icon: '⚡',
    color: 'from-red-500 to-pink-600',
    category: 'CS',
  },
  // Additional courses
  {
    id: 'algorithms',
    name: 'Algorithm Design & Analysis',
    description: 'Explore advanced algorithms: DP, greedy, divide & conquer, and NP problems',
    topics: ['Divide & Conquer', 'Dynamic Programming', 'Greedy Algorithms', 'Backtracking', 'Branch & Bound', 'Graph Algorithms', 'NP-Completeness'],
    difficulty: 'Advanced',
    icon: '🧠',
    color: 'from-indigo-500 to-purple-600',
    category: 'CS',
  },
  {
    id: 'oop',
    name: 'Object-Oriented Programming',
    description: 'Master classes, inheritance, polymorphism, and design patterns',
    topics: ['Classes & Objects', 'Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction', 'Design Patterns', 'SOLID Principles'],
    difficulty: 'Intermediate',
    icon: '🏗️',
    color: 'from-emerald-500 to-teal-600',
    category: 'CS',
  },

  // 🔷 Additional CS Courses
  {
    id: 'ai',
    name: 'Artificial Intelligence',
    description: 'Learn AI fundamentals, search algorithms, knowledge representation, and intelligent agents',
    topics: ['Intelligent Agents', 'Search Algorithms', 'Game Theory', 'Knowledge Representation', 'Expert Systems', 'Natural Language Processing', 'Robotics'],
    difficulty: 'Advanced',
    icon: '🤖',
    color: 'from-violet-500 to-purple-600',
    category: 'CS',
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    description: 'Master supervised, unsupervised learning, neural networks, and deep learning',
    topics: ['Supervised Learning', 'Unsupervised Learning', 'Regression', 'Classification', 'Clustering', 'Neural Networks', 'Deep Learning', 'Model Evaluation'],
    difficulty: 'Advanced',
    icon: '🧬',
    color: 'from-fuchsia-500 to-pink-600',
    category: 'CS',
  },
  {
    id: 'web-tech',
    name: 'Web Technologies',
    description: 'Learn HTML, CSS, JavaScript, React, Node.js, and full-stack development',
    topics: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Node.js', 'REST APIs', 'Databases', 'Authentication', 'Deployment'],
    difficulty: 'Intermediate',
    icon: '🌍',
    color: 'from-sky-500 to-blue-600',
    category: 'CS',
  },
  {
    id: 'cloud',
    name: 'Cloud Computing',
    description: 'Explore AWS, Azure, GCP, virtualization, containers, and serverless',
    topics: ['Virtualization', 'AWS', 'Azure', 'GCP', 'Containers', 'Docker', 'Kubernetes', 'Serverless', 'Cloud Security'],
    difficulty: 'Intermediate',
    icon: '☁️',
    color: 'from-blue-400 to-cyan-500',
    category: 'CS',
  },
  {
    id: 'cyber-security',
    name: 'Cyber Security',
    description: 'Master cryptography, network security, ethical hacking, and security protocols',
    topics: ['Cryptography', 'Network Security', 'Firewalls', 'Ethical Hacking', 'Malware Analysis', 'Security Protocols', 'Penetration Testing', 'Risk Management'],
    difficulty: 'Advanced',
    icon: '🔒',
    color: 'from-red-600 to-rose-700',
    category: 'CS',
  },
  {
    id: 'distributed-systems',
    name: 'Distributed Systems',
    description: 'Learn distributed computing, consensus, replication, and fault tolerance',
    topics: ['Distributed Computing', 'CAP Theorem', 'Consensus Protocols', 'Replication', 'Fault Tolerance', 'MapReduce', 'Distributed Databases', 'Microservices'],
    difficulty: 'Advanced',
    icon: '🔀',
    color: 'from-indigo-600 to-blue-700',
    category: 'CS',
  },

  // 🔴 ECE – Electronics & Communication Engineering
  {
    id: 'ece-math',
    name: 'Engineering Mathematics (ECE)',
    description: 'Master calculus, linear algebra, differential equations, and transforms for ECE',
    topics: ['Calculus', 'Linear Algebra', 'Differential Equations', 'Laplace Transform', 'Fourier Transform', 'Z-Transform', 'Probability', 'Complex Analysis'],
    difficulty: 'Intermediate',
    icon: '📐',
    color: 'from-red-500 to-orange-600',
    category: 'ECE',
  },
  {
    id: 'network-analysis',
    name: 'Network Analysis',
    description: 'Learn circuit analysis, network theorems, and transient response',
    topics: ['KVL & KCL', 'Network Theorems', 'Transient Analysis', 'AC Circuits', 'Resonance', 'Two-Port Networks', 'Filters', 'Network Synthesis'],
    difficulty: 'Intermediate',
    icon: '🔌',
    color: 'from-orange-500 to-amber-600',
    category: 'ECE',
  },
  {
    id: 'edc',
    name: 'Electronic Devices & Circuits',
    description: 'Understand semiconductors, diodes, transistors, and amplifiers',
    topics: ['Semiconductors', 'PN Junction', 'Diodes', 'BJT', 'FET', 'MOSFET', 'Amplifiers', 'Oscillators', 'Power Supplies'],
    difficulty: 'Intermediate',
    icon: '💡',
    color: 'from-yellow-500 to-orange-500',
    category: 'ECE',
  },
  {
    id: 'analog-circuits',
    name: 'Analog Circuits',
    description: 'Master op-amps, filters, oscillators, and analog signal processing',
    topics: ['Op-Amps', 'Feedback Amplifiers', 'Active Filters', 'Oscillators', 'Voltage Regulators', 'ADC/DAC', 'PLL', 'Analog Design'],
    difficulty: 'Intermediate',
    icon: '📊',
    color: 'from-amber-500 to-yellow-600',
    category: 'ECE',
  },
  {
    id: 'digital-electronics',
    name: 'Digital Electronics',
    description: 'Learn logic gates, combinational & sequential circuits, and HDL',
    topics: ['Boolean Algebra', 'Logic Gates', 'Combinational Circuits', 'Sequential Circuits', 'Flip-Flops', 'Counters', 'Registers', 'Verilog/VHDL'],
    difficulty: 'Intermediate',
    icon: '🔢',
    color: 'from-green-500 to-emerald-600',
    category: 'ECE',
  },
  {
    id: 'signals-systems',
    name: 'Signals & Systems',
    description: 'Understand signal representation, LTI systems, and transforms',
    topics: ['Signal Classification', 'LTI Systems', 'Convolution', 'Fourier Series', 'Fourier Transform', 'Laplace Transform', 'Z-Transform', 'Sampling'],
    difficulty: 'Intermediate',
    icon: '📈',
    color: 'from-teal-500 to-green-600',
    category: 'ECE',
  },
  {
    id: 'communication-systems',
    name: 'Communication Systems',
    description: 'Master AM, FM, digital modulation, and communication theory',
    topics: ['AM Modulation', 'FM Modulation', 'Digital Modulation', 'Multiplexing', 'Noise Analysis', 'Information Theory', 'Channel Capacity', 'Error Correction'],
    difficulty: 'Intermediate',
    icon: '📡',
    color: 'from-cyan-500 to-teal-600',
    category: 'ECE',
  },
  {
    id: 'emt',
    name: 'Electromagnetic Theory',
    description: 'Learn Maxwell equations, wave propagation, and antenna fundamentals',
    topics: ['Electrostatics', 'Magnetostatics', 'Maxwell Equations', 'Wave Propagation', 'Transmission Lines', 'Waveguides', 'Antennas', 'Radiation'],
    difficulty: 'Advanced',
    icon: '⚡',
    color: 'from-blue-500 to-indigo-600',
    category: 'ECE',
  },
  {
    id: 'control-systems',
    name: 'Control Systems',
    description: 'Master transfer functions, stability analysis, and controller design',
    topics: ['Transfer Functions', 'Block Diagrams', 'Stability', 'Routh-Hurwitz', 'Root Locus', 'Bode Plot', 'Nyquist', 'PID Controllers', 'State Space'],
    difficulty: 'Intermediate',
    icon: '🎛️',
    color: 'from-purple-500 to-indigo-600',
    category: 'ECE',
  },
  {
    id: 'microprocessors',
    name: 'Microprocessors & Microcontrollers',
    description: 'Learn 8085, 8086, ARM, and embedded programming',
    topics: ['8085 Architecture', '8086 Architecture', 'Assembly Language', 'Interrupts', 'Memory Interfacing', '8051', 'ARM', 'Embedded C'],
    difficulty: 'Intermediate',
    icon: '🔧',
    color: 'from-slate-500 to-gray-600',
    category: 'ECE',
  },
  {
    id: 'vlsi',
    name: 'VLSI Design',
    description: 'Master CMOS design, ASIC/FPGA, and digital IC design',
    topics: ['CMOS Technology', 'Logic Design', 'ASIC Design', 'FPGA', 'Verilog', 'VHDL', 'Timing Analysis', 'Low Power Design', 'Physical Design'],
    difficulty: 'Advanced',
    icon: '🧩',
    color: 'from-pink-500 to-rose-600',
    category: 'ECE',
  },
  {
    id: 'embedded-systems',
    name: 'Embedded Systems',
    description: 'Learn RTOS, firmware development, and hardware-software integration',
    topics: ['RTOS', 'Firmware', 'Interrupt Handling', 'Timers', 'GPIO', 'UART/SPI/I2C', 'Sensors', 'IoT', 'Debugging'],
    difficulty: 'Intermediate',
    icon: '🤖',
    color: 'from-emerald-500 to-green-600',
    category: 'ECE',
  },
  {
    id: 'dsp',
    name: 'Digital Signal Processing',
    description: 'Master DFT, FFT, digital filters, and DSP applications',
    topics: ['Discrete Signals', 'DFT', 'FFT', 'FIR Filters', 'IIR Filters', 'Filter Design', 'Multirate DSP', 'DSP Processors', 'Applications'],
    difficulty: 'Advanced',
    icon: '🎵',
    color: 'from-violet-500 to-purple-600',
    category: 'ECE',
  },
  {
    id: 'optical-wireless',
    name: 'Optical & Wireless Communication',
    description: 'Learn fiber optics, wireless protocols, and mobile communication',
    topics: ['Fiber Optics', 'Optical Sources', 'Detectors', 'Wireless Channels', 'GSM', '4G/5G', 'OFDM', 'MIMO', 'Satellite Communication'],
    difficulty: 'Advanced',
    icon: '📶',
    color: 'from-sky-500 to-cyan-600',
    category: 'ECE',
  },
];

// Get all courses
router.get('/', (req: Request, res: Response) => {
  try {
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get course details
router.get('/:courseId', (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const course = courses.find(c => c.id === courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Get course topics
router.get('/:courseId/topics', (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const course = courses.find(c => c.id === courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({
      courseId,
      topics: course.topics,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// Enroll in course
router.post('/:courseId/enroll', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { courseId } = req.params;

    const course = courses.find(c => c.id === courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({
      message: 'Successfully enrolled',
      userId,
      courseId,
      enrolledAt: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

export default router;

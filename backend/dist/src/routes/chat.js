"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = chatRoutes;
const express_1 = require("express");
const generative_ai_1 = require("@google/generative-ai");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Model configurations
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const rateLimitStore = new Map();
const RATE_LIMIT_MAX_REQUESTS = 30; // Max requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
function checkRateLimit(userId) {
    const now = Date.now();
    const entry = rateLimitStore.get(userId);
    if (!entry || now > entry.resetTime) {
        // Reset or create new entry
        rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS };
    }
    if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
        return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
    }
    entry.count++;
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetIn: entry.resetTime - now };
}
const courseDatabase = {
    // CS Courses
    'programming': { name: 'Programming Fundamentals', topics: ['Variables', 'Data Types', 'Control Flow', 'Loops', 'Functions', 'Arrays', 'Pointers', 'OOP Basics', 'File Handling', 'C', 'C++', 'Java', 'Python'], category: 'CS' },
    'dsa': { name: 'Data Structures & Algorithms', topics: ['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Binary Tree', 'BST', 'Graphs', 'Hashing', 'Heaps', 'Sorting', 'Searching', 'Recursion', 'Dynamic Programming', 'Greedy', 'Time Complexity', 'Space Complexity', 'Big O'], category: 'CS' },
    'discrete-math': { name: 'Discrete Mathematics', topics: ['Propositional Logic', 'Predicate Logic', 'Sets', 'Relations', 'Functions', 'Graph Theory', 'Combinatorics', 'Probability', 'Boolean Algebra', 'Proofs'], category: 'CS' },
    'coa': { name: 'Computer Organization & Architecture', topics: ['CPU Structure', 'ALU', 'Registers', 'Memory Hierarchy', 'Cache Memory', 'Instruction Sets', 'Pipelining', 'I/O Organization', 'RISC', 'CISC', 'Addressing Modes'], category: 'CS' },
    'os': { name: 'Operating Systems', topics: ['Processes', 'Threads', 'CPU Scheduling', 'FCFS', 'SJF', 'Round Robin', 'Synchronization', 'Deadlocks', 'Memory Management', 'Paging', 'Segmentation', 'Virtual Memory', 'File Systems', 'Disk Scheduling'], category: 'CS' },
    'dbms': { name: 'Database Management Systems', topics: ['ER Model', 'Relational Model', 'SQL', 'SELECT', 'JOIN', 'Normalization', '1NF', '2NF', '3NF', 'BCNF', 'Transactions', 'ACID', 'Indexing', 'B-Tree', 'Query Optimization', 'Concurrency Control'], category: 'CS' },
    'cn': { name: 'Computer Networks', topics: ['OSI Model', 'TCP/IP Model', 'LAN', 'WAN', 'Routing', 'Switching', 'IP Addressing', 'Subnetting', 'HTTP', 'FTP', 'DNS', 'DHCP', 'TCP', 'UDP', 'Network Security', 'Firewalls'], category: 'CS' },
    'se': { name: 'Software Engineering', topics: ['SDLC', 'Agile', 'Scrum', 'Waterfall', 'Requirement Analysis', 'Design Patterns', 'UML', 'Testing', 'Unit Testing', 'Integration Testing', 'Maintenance', 'Version Control', 'Git'], category: 'CS' },
    'toc': { name: 'Theory of Computation', topics: ['Finite Automata', 'DFA', 'NFA', 'Regular Expressions', 'Regular Languages', 'Context-Free Grammar', 'CFG', 'Pushdown Automata', 'PDA', 'Turing Machine', 'Decidability', 'Halting Problem', 'Chomsky Hierarchy'], category: 'CS' },
    'compiler': { name: 'Compiler Design', topics: ['Lexical Analysis', 'Tokenization', 'Parsing', 'LL Parser', 'LR Parser', 'Syntax Tree', 'AST', 'Semantic Analysis', 'Intermediate Code', 'Code Optimization', 'Code Generation', 'Symbol Table'], category: 'CS' },
    'algorithms': { name: 'Algorithm Design & Analysis', topics: ['Divide and Conquer', 'Merge Sort', 'Quick Sort', 'Greedy Algorithms', 'Dynamic Programming', 'Backtracking', 'Branch and Bound', 'Graph Algorithms', 'BFS', 'DFS', 'Dijkstra', 'Bellman-Ford', 'Floyd-Warshall', 'Kruskal', 'Prim', 'NP-Completeness'], category: 'CS' },
    'oop': { name: 'Object Oriented Programming', topics: ['Classes', 'Objects', 'Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction', 'Constructors', 'Destructors', 'Overloading', 'Overriding', 'Interfaces', 'Abstract Classes', 'Design Patterns', 'SOLID Principles'], category: 'CS' },
    'ai': { name: 'Artificial Intelligence', topics: ['Search Algorithms', 'BFS', 'DFS', 'A* Search', 'Heuristics', 'Game Theory', 'Minimax', 'Alpha-Beta Pruning', 'Knowledge Representation', 'Expert Systems', 'Fuzzy Logic', 'Natural Language Processing', 'NLP'], category: 'CS' },
    'ml': { name: 'Machine Learning', topics: ['Supervised Learning', 'Unsupervised Learning', 'Regression', 'Linear Regression', 'Logistic Regression', 'Classification', 'Decision Trees', 'Random Forest', 'SVM', 'Neural Networks', 'Deep Learning', 'CNN', 'RNN', 'Clustering', 'K-Means', 'PCA'], category: 'CS' },
    'web-tech': { name: 'Web Technologies', topics: ['HTML', 'CSS', 'JavaScript', 'DOM', 'React', 'Angular', 'Vue', 'Node.js', 'Express', 'REST API', 'HTTP Methods', 'GET', 'POST', 'AJAX', 'JSON', 'Web Security', 'XSS', 'CSRF'], category: 'CS' },
    'cloud': { name: 'Cloud Computing', topics: ['IaaS', 'PaaS', 'SaaS', 'AWS', 'Azure', 'Google Cloud', 'Virtualization', 'Containers', 'Docker', 'Kubernetes', 'Microservices', 'Serverless', 'Load Balancing', 'Auto Scaling'], category: 'CS' },
    'cyber-security': { name: 'Cyber Security', topics: ['Cryptography', 'Encryption', 'AES', 'RSA', 'Hashing', 'SHA', 'MD5', 'Digital Signatures', 'SSL/TLS', 'Firewalls', 'IDS', 'IPS', 'Malware', 'Phishing', 'SQL Injection', 'Penetration Testing'], category: 'CS' },
    'distributed-systems': { name: 'Distributed Systems', topics: ['Client-Server', 'P2P', 'RPC', 'Message Passing', 'Consistency', 'CAP Theorem', 'Replication', 'Fault Tolerance', 'Consensus', 'Paxos', 'Raft', 'MapReduce', 'Hadoop', 'Spark'], category: 'CS' },
    // ECE Courses
    'ece-math': { name: 'Engineering Mathematics (ECE)', topics: ['Calculus', 'Differentiation', 'Integration', 'Linear Algebra', 'Matrices', 'Eigenvalues', 'Differential Equations', 'Laplace Transform', 'Fourier Transform', 'Z-Transform', 'Probability', 'Complex Analysis'], category: 'ECE' },
    'network-analysis': { name: 'Network Analysis', topics: ['KVL', 'KCL', 'Mesh Analysis', 'Nodal Analysis', 'Network Theorems', 'Thevenin', 'Norton', 'Superposition', 'Transient Analysis', 'AC Circuits', 'Impedance', 'Resonance', 'Two-Port Networks', 'Filters'], category: 'ECE' },
    'edc': { name: 'Electronic Devices & Circuits', topics: ['Semiconductors', 'P-type', 'N-type', 'PN Junction', 'Diodes', 'Zener Diode', 'BJT', 'FET', 'MOSFET', 'Amplifiers', 'Common Emitter', 'Common Base', 'Oscillators', 'Power Supplies', 'Rectifiers'], category: 'ECE' },
    'analog-circuits': { name: 'Analog Circuits', topics: ['Op-Amps', 'Operational Amplifier', 'Inverting', 'Non-Inverting', 'Feedback Amplifiers', 'Active Filters', 'Low Pass', 'High Pass', 'Band Pass', 'Oscillators', 'Wien Bridge', 'Voltage Regulators', 'ADC', 'DAC', 'PLL'], category: 'ECE' },
    'digital-electronics': { name: 'Digital Electronics', topics: ['Boolean Algebra', 'Logic Gates', 'AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'Combinational Circuits', 'Multiplexer', 'Demultiplexer', 'Encoder', 'Decoder', 'Sequential Circuits', 'Flip-Flops', 'JK', 'D', 'SR', 'Counters', 'Registers', 'Verilog', 'VHDL'], category: 'ECE' },
    'signals-systems': { name: 'Signals & Systems', topics: ['Signal Classification', 'Continuous', 'Discrete', 'Periodic', 'Aperiodic', 'LTI Systems', 'Convolution', 'Impulse Response', 'Fourier Series', 'Fourier Transform', 'Laplace Transform', 'Z-Transform', 'Sampling', 'Nyquist', 'Aliasing'], category: 'ECE' },
    'communication-systems': { name: 'Communication Systems', topics: ['AM', 'Amplitude Modulation', 'FM', 'Frequency Modulation', 'PM', 'Phase Modulation', 'ASK', 'FSK', 'PSK', 'QAM', 'Multiplexing', 'TDM', 'FDM', 'Noise', 'SNR', 'Information Theory', 'Shannon', 'Channel Capacity', 'Error Correction'], category: 'ECE' },
    'emt': { name: 'Electromagnetic Theory', topics: ['Electrostatics', 'Electric Field', 'Gauss Law', 'Magnetostatics', 'Magnetic Field', 'Ampere Law', 'Maxwell Equations', 'Wave Propagation', 'Electromagnetic Waves', 'Transmission Lines', 'Waveguides', 'Antennas', 'Radiation'], category: 'ECE' },
    'control-systems': { name: 'Control Systems', topics: ['Open Loop', 'Closed Loop', 'Transfer Function', 'Block Diagram', 'Signal Flow Graph', 'Stability', 'Routh-Hurwitz', 'Root Locus', 'Bode Plot', 'Nyquist Plot', 'Gain Margin', 'Phase Margin', 'PID Controller', 'State Space'], category: 'ECE' },
    'microprocessors': { name: 'Microprocessors & Microcontrollers', topics: ['8085', '8086', 'Architecture', 'Registers', 'Assembly Language', 'Instruction Set', 'Addressing Modes', 'Interrupts', 'Memory Interfacing', 'I/O Interfacing', '8051', 'ARM', 'Embedded C', 'Timers', 'Counters'], category: 'ECE' },
    'vlsi': { name: 'VLSI Design', topics: ['CMOS', 'NMOS', 'PMOS', 'Logic Design', 'Stick Diagram', 'Layout', 'ASIC', 'FPGA', 'Verilog', 'VHDL', 'Synthesis', 'Timing Analysis', 'Setup Time', 'Hold Time', 'Low Power Design', 'Physical Design'], category: 'ECE' },
    'embedded-systems': { name: 'Embedded Systems', topics: ['RTOS', 'Real-Time', 'Firmware', 'Interrupt Handling', 'ISR', 'Timers', 'GPIO', 'UART', 'SPI', 'I2C', 'Sensors', 'Actuators', 'IoT', 'Debugging', 'JTAG'], category: 'ECE' },
    'dsp': { name: 'Digital Signal Processing', topics: ['Discrete Signals', 'Sampling', 'Quantization', 'DFT', 'FFT', 'FIR Filters', 'IIR Filters', 'Filter Design', 'Window Method', 'Bilinear Transform', 'Multirate DSP', 'Decimation', 'Interpolation', 'DSP Processors'], category: 'ECE' },
    'optical-wireless': { name: 'Optical & Wireless Communication', topics: ['Fiber Optics', 'Total Internal Reflection', 'Single Mode', 'Multi Mode', 'Optical Sources', 'LED', 'LASER', 'Photodetectors', 'Wireless Channels', 'Fading', 'GSM', '3G', '4G', '5G', 'OFDM', 'MIMO', 'Satellite Communication'], category: 'ECE' },
};
// Expanded keyword mappings for better matching
const keywordMappings = {
    'dsa': ['dsa', 'data structures and algorithms', 'data structure and algorithm', 'what is dsa', 'explain dsa'],
    'binary_tree': ['binary tree', 'bst', 'binary search tree', 'tree structure', 'tree data'],
    'linked_list': ['linked list', 'linkedlist', 'singly linked', 'doubly linked', 'circular linked'],
    'array': ['array', 'arrays', 'list', 'dynamic array', 'static array'],
    'stack': ['stack', 'lifo', 'push pop', 'call stack'],
    'queue': ['queue', 'fifo', 'enqueue', 'dequeue', 'priority queue'],
    'graph': ['graph', 'vertex', 'vertices', 'edge', 'adjacency', 'bfs', 'dfs', 'dijkstra'],
    'hash': ['hash', 'hashmap', 'hash table', 'hashtable', 'hashing', 'dictionary'],
    'heap': ['heap', 'min heap', 'max heap', 'heapify', 'priority'],
    'sorting': ['sort', 'sorting', 'bubble sort', 'quick sort', 'merge sort', 'insertion sort', 'selection sort'],
    'searching': ['search', 'searching', 'binary search', 'linear search', 'find'],
    'recursion': ['recursion', 'recursive', 'base case', 'recursive call'],
    'dynamic_programming': ['dynamic programming', 'dp', 'memoization', 'tabulation', 'optimal substructure'],
    'sql': ['sql', 'query', 'select', 'insert', 'update', 'delete', 'join', 'where'],
    'normalization': ['normalization', 'normal form', '1nf', '2nf', '3nf', 'bcnf', 'denormalization'],
    'transaction': ['transaction', 'acid', 'commit', 'rollback', 'isolation'],
    'indexing': ['index', 'indexing', 'b-tree', 'b+ tree', 'clustered', 'non-clustered'],
    'er_diagram': ['er diagram', 'entity relationship', 'erd', 'cardinality', 'entity'],
    'process': ['process', 'thread', 'multithreading', 'multiprocessing', 'pcb', 'context switch'],
    'scheduling': ['scheduling', 'fcfs', 'sjf', 'round robin', 'priority scheduling', 'scheduler'],
    'memory': ['memory', 'ram', 'virtual memory', 'paging', 'segmentation', 'page fault'],
    'deadlock': ['deadlock', 'deadlocks', 'mutex', 'semaphore', 'race condition', 'synchronization'],
    'file_system': ['file system', 'filesystem', 'inode', 'directory', 'file allocation'],
    'osi': ['osi', 'osi model', 'layer', '7 layer', 'network layer', 'transport layer'],
    'tcp_ip': ['tcp', 'ip', 'tcp/ip', 'udp', 'protocol', 'http', 'https', 'ftp'],
    'routing': ['routing', 'router', 'gateway', 'subnet', 'ip address', 'mac address'],
    'oop': ['oop', 'object oriented', 'class', 'object', 'encapsulation', 'inheritance', 'polymorphism', 'abstraction'],
    'java': ['java', 'jvm', 'jdk', 'jre', 'javac'],
    'python': ['python', 'pip', 'python3', 'django', 'flask'],
    'cpp': ['c++', 'cpp', 'pointer', 'reference', 'template'],
    'algorithm': ['algorithm', 'complexity', 'big o', 'time complexity', 'space complexity', 'o(n)', 'o(1)', 'o(log n)'],
    'database': ['database', 'db', 'dbms', 'rdbms', 'nosql', 'mongodb', 'mysql', 'postgresql'],
    'tree_traversal': ['inorder', 'preorder', 'postorder', 'level order', 'traversal', 'traverse'],
    'hello': ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good evening'],
    'help': ['help', 'what can you', 'how to use', 'guide', 'tutorial'],
    'thanks': ['thank', 'thanks', 'thank you', 'thx', 'appreciate'],
};
// Comprehensive knowledge base
const knowledgeBase = {
    'dsa': `## Data Structures and Algorithms (DSA) 📚

**DSA** stands for **Data Structures and Algorithms** - the foundation of computer science and software development!

---

### 🗂️ What are Data Structures?

Data structures are ways to **organize and store data** efficiently. Think of them as containers with specific properties.

| Data Structure | Description | Use Case |
|---------------|-------------|----------|
| **Array** | Fixed-size sequential collection | Fast access by index |
| **Linked List** | Chain of connected nodes | Dynamic size, insertions |
| **Stack** | LIFO (Last In, First Out) | Undo operations, recursion |
| **Queue** | FIFO (First In, First Out) | Task scheduling, BFS |
| **Tree** | Hierarchical structure | File systems, databases |
| **Graph** | Nodes with connections | Networks, maps |
| **Hash Table** | Key-value storage | Fast lookups, caching |
| **Heap** | Priority-based tree | Priority queues |

---

### ⚙️ What are Algorithms?

Algorithms are **step-by-step procedures** to solve problems efficiently.

| Algorithm Type | Examples | Purpose |
|---------------|----------|---------|
| **Sorting** | Quick Sort, Merge Sort | Arrange data in order |
| **Searching** | Binary Search, BFS, DFS | Find elements |
| **Dynamic Programming** | Fibonacci, Knapsack | Optimize subproblems |
| **Greedy** | Dijkstra, Huffman | Local optimal choices |
| **Divide & Conquer** | Merge Sort, Quick Sort | Break into subproblems |

---

### 📊 Time Complexity (Big O)

| Notation | Name | Example |
|----------|------|---------|
| O(1) | Constant | Array access |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Simple loop |
| O(n log n) | Linearithmic | Merge sort |
| O(n²) | Quadratic | Nested loops |
| O(2ⁿ) | Exponential | Recursive Fibonacci |

---

### 🎯 Why Learn DSA?

1. ✅ **Crack coding interviews** (FAANG, top companies)
2. ✅ **Write efficient code** that scales
3. ✅ **Problem-solving skills** for any domain
4. ✅ **Foundation** for system design

---

### 🚀 Learning Path:

\`\`\`
1. Arrays & Strings
       ↓
2. Linked Lists
       ↓
3. Stacks & Queues
       ↓
4. Trees & Graphs
       ↓
5. Sorting & Searching
       ↓
6. Dynamic Programming
       ↓
7. Advanced Topics
\`\`\`

💡 **Ask me about any specific topic**: "Explain binary trees", "What is a linked list?", "How does quick sort work?"`,
    'binary_tree': `## Binary Tree 🌳

A **binary tree** is a hierarchical data structure where each node has at most **two children**.

### Structure:
\`\`\`
        1        ← Root
       / \\
      2   3      ← Children
     / \\
    4   5        ← Leaves
\`\`\`

### Types:
| Type | Description |
|------|-------------|
| Full | Every node has 0 or 2 children |
| Complete | All levels filled except last |
| Perfect | All leaves at same level |
| BST | Left < Root < Right |

### Python Implementation:
\`\`\`python
class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

# Create tree
root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
\`\`\`

### Time Complexity:
- **Search**: O(log n) balanced, O(n) worst
- **Insert**: O(log n) balanced
- **Delete**: O(log n) balanced

💡 **Ask me about**: tree traversals, BST operations, or balancing!`,
    'linked_list': `## Linked List 🔗

A **linked list** stores elements in nodes connected by pointers.

### Visual:
\`\`\`
[Data|Next] → [Data|Next] → [Data|Next] → NULL
    1    →      2      →      3      → NULL
\`\`\`

### Types:
1. **Singly Linked**: Forward traversal only
2. **Doubly Linked**: Forward + backward
3. **Circular**: Last → First

### Python Implementation:
\`\`\`python
class ListNode:
    def __init__(self, val=0):
        self.val = val
        self.next = None

# Create: 1 → 2 → 3
head = ListNode(1)
head.next = ListNode(2)
head.next.next = ListNode(3)
\`\`\`

### Complexity:
| Operation | Time |
|-----------|------|
| Access | O(n) |
| Insert at head | O(1) |
| Insert at tail | O(n) |
| Delete | O(n) |

💡 **Common problems**: Reverse list, detect cycle, merge sorted lists`,
    'array': `## Arrays 📊

An **array** is a contiguous block of memory storing elements of the same type.

### Visual:
\`\`\`
Index:   0    1    2    3    4
       ┌────┬────┬────┬────┬────┐
Value: │ 10 │ 20 │ 30 │ 40 │ 50 │
       └────┴────┴────┴────┴────┘
\`\`\`

### Operations:
\`\`\`python
arr = [10, 20, 30, 40, 50]

# Access - O(1)
print(arr[2])  # 30

# Insert - O(n)
arr.insert(1, 15)  # [10, 15, 20, 30, 40, 50]

# Delete - O(n)
arr.pop(2)  # [10, 15, 30, 40, 50]

# Search - O(n)
arr.index(30)  # 2
\`\`\`

### Complexity:
| Operation | Time |
|-----------|------|
| Access | O(1) |
| Search | O(n) |
| Insert | O(n) |
| Delete | O(n) |

💡 **Pro tip**: Use arrays when you need fast access by index!`,
    'stack': `## Stack 📚

A **stack** follows **LIFO** - Last In, First Out.

### Visual:
\`\`\`
    │   │  ← Top (push/pop here)
    │ 3 │
    │ 2 │
    │ 1 │
    └───┘
\`\`\`

### Operations:
\`\`\`python
stack = []

# Push - O(1)
stack.append(1)
stack.append(2)
stack.append(3)

# Pop - O(1)
top = stack.pop()  # 3

# Peek - O(1)
top = stack[-1]  # 2
\`\`\`

### Applications:
- ✅ Function call stack
- ✅ Undo/Redo operations
- ✅ Expression evaluation
- ✅ Parenthesis matching
- ✅ Browser back button

💡 **Common problems**: Valid parentheses, evaluate postfix expression`,
    'queue': `## Queue 🚶

A **queue** follows **FIFO** - First In, First Out.

### Visual:
\`\`\`
Front → [1] [2] [3] ← Rear
        ↓           ↑
      Dequeue    Enqueue
\`\`\`

### Python Implementation:
\`\`\`python
from collections import deque

queue = deque()

# Enqueue - O(1)
queue.append(1)
queue.append(2)
queue.append(3)

# Dequeue - O(1)
front = queue.popleft()  # 1

# Peek - O(1)
front = queue[0]  # 2
\`\`\`

### Types:
1. **Simple Queue**: Basic FIFO
2. **Circular Queue**: Connects end to front
3. **Priority Queue**: Dequeue by priority
4. **Deque**: Insert/delete at both ends

💡 **Applications**: BFS, CPU scheduling, print queue`,
    'graph': `## Graph 🕸️

A **graph** consists of **vertices** (nodes) and **edges** (connections).

### Visual:
\`\`\`
    A --- B
    |     |
    |     |
    C --- D
\`\`\`

### Types:
| Type | Description |
|------|-------------|
| Directed | Edges have direction (→) |
| Undirected | Edges go both ways (—) |
| Weighted | Edges have values |
| Cyclic | Contains cycles |

### Representations:
\`\`\`python
# Adjacency List
graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D'],
    'C': ['A', 'D'],
    'D': ['B', 'C']
}

# BFS Traversal
from collections import deque
def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    while queue:
        node = queue.popleft()
        print(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
\`\`\`

💡 **Common algorithms**: BFS, DFS, Dijkstra, Bellman-Ford`,
    'hash': `## Hash Table / HashMap 🗂️

A **hash table** stores key-value pairs using a hash function.

### How it works:
\`\`\`
Key "apple" → hash("apple") = 42 → Bucket[42] = "fruit"
\`\`\`

### Python Implementation:
\`\`\`python
# Using dictionary (built-in hash table)
hash_map = {}

# Insert - O(1) average
hash_map["name"] = "John"
hash_map["age"] = 25

# Access - O(1) average
print(hash_map["name"])  # John

# Delete - O(1) average
del hash_map["age"]

# Check existence - O(1) average
if "name" in hash_map:
    print("Found!")
\`\`\`

### Collision Handling:
1. **Chaining**: Linked list at each bucket
2. **Open Addressing**: Find next empty slot

### Complexity:
| Operation | Average | Worst |
|-----------|---------|-------|
| Insert | O(1) | O(n) |
| Search | O(1) | O(n) |
| Delete | O(1) | O(n) |

💡 **Use cases**: Caching, counting frequency, indexing`,
    'heap': `## Heap 🏔️

A **heap** is a complete binary tree satisfying the heap property.

### Types:
\`\`\`
Min Heap:      Max Heap:
    1              9
   / \\            / \\
  3   2          7   8
 / \\            / \\
5   4          5   6
\`\`\`

### Python Implementation:
\`\`\`python
import heapq

# Min Heap
min_heap = []
heapq.heappush(min_heap, 3)
heapq.heappush(min_heap, 1)
heapq.heappush(min_heap, 2)

smallest = heapq.heappop(min_heap)  # 1

# Max Heap (negate values)
max_heap = []
heapq.heappush(max_heap, -3)
largest = -heapq.heappop(max_heap)  # 3
\`\`\`

### Complexity:
| Operation | Time |
|-----------|------|
| Insert | O(log n) |
| Delete Min/Max | O(log n) |
| Get Min/Max | O(1) |
| Heapify | O(n) |

💡 **Applications**: Priority queues, Heap Sort, finding K largest/smallest`,
    'sorting': `## Sorting Algorithms 📈

### Comparison:
| Algorithm | Best | Average | Worst | Space |
|-----------|------|---------|-------|-------|
| Bubble | O(n) | O(n²) | O(n²) | O(1) |
| Selection | O(n²) | O(n²) | O(n²) | O(1) |
| Insertion | O(n) | O(n²) | O(n²) | O(1) |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) |

### Quick Sort Example:
\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([3, 6, 8, 1, 2]))  # [1, 2, 3, 6, 8]
\`\`\`

💡 **Tips**: 
- Use Quick Sort for general purpose
- Use Merge Sort for stable sorting
- Use Counting Sort for integers in known range`,
    'searching': `## Searching Algorithms 🔍

### Linear Search - O(n):
\`\`\`python
def linear_search(arr, target):
    for i, val in enumerate(arr):
        if val == target:
            return i
    return -1
\`\`\`

### Binary Search - O(log n):
\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Array must be sorted!
arr = [1, 3, 5, 7, 9, 11]
print(binary_search(arr, 7))  # 3
\`\`\`

### Comparison:
| Algorithm | Time | Requirement |
|-----------|------|-------------|
| Linear | O(n) | None |
| Binary | O(log n) | Sorted array |
| Jump | O(√n) | Sorted array |

💡 **Remember**: Binary search only works on sorted arrays!`,
    'recursion': `## Recursion 🔄

**Recursion** is when a function calls itself.

### Components:
1. **Base Case**: When to stop
2. **Recursive Case**: Function calls itself

### Examples:

#### Factorial:
\`\`\`python
def factorial(n):
    if n <= 1:        # Base case
        return 1
    return n * factorial(n - 1)  # Recursive case

print(factorial(5))  # 120
\`\`\`

#### Fibonacci:
\`\`\`python
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

# With memoization (much faster!)
from functools import lru_cache

@lru_cache(maxsize=None)
def fib_memo(n):
    if n <= 1:
        return n
    return fib_memo(n-1) + fib_memo(n-2)
\`\`\`

### Call Stack Example:
\`\`\`
factorial(3)
 └─ 3 * factorial(2)
         └─ 2 * factorial(1)
                 └─ returns 1
            returns 2
    returns 6
\`\`\`

💡 **Tip**: Always define base case first to avoid infinite recursion!`,
    'dynamic_programming': `## Dynamic Programming 🧩

**DP** solves problems by breaking them into overlapping subproblems.

### Key Concepts:
1. **Optimal Substructure**: Solution uses solutions to subproblems
2. **Overlapping Subproblems**: Same subproblems solved repeatedly

### Approaches:
1. **Top-Down (Memoization)**: Recursion + Cache
2. **Bottom-Up (Tabulation)**: Iterative with table

### Example: Fibonacci
\`\`\`python
# Top-Down (Memoization)
def fib_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)
    return memo[n]

# Bottom-Up (Tabulation)
def fib_tab(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]
\`\`\`

### Classic DP Problems:
- Longest Common Subsequence
- 0/1 Knapsack
- Coin Change
- Edit Distance

💡 **Steps**: Define state → Find recurrence → Handle base cases`,
    'sql': `## SQL (Structured Query Language) 🗃️

### Basic Queries:
\`\`\`sql
-- SELECT: Retrieve data
SELECT name, age FROM students WHERE age > 18;

-- INSERT: Add data
INSERT INTO students (name, age) VALUES ('John', 20);

-- UPDATE: Modify data
UPDATE students SET age = 21 WHERE name = 'John';

-- DELETE: Remove data
DELETE FROM students WHERE age < 18;
\`\`\`

### JOINs:
\`\`\`sql
-- INNER JOIN: Only matching rows
SELECT s.name, c.course_name
FROM students s
INNER JOIN enrollments e ON s.id = e.student_id
INNER JOIN courses c ON e.course_id = c.id;

-- LEFT JOIN: All from left + matching from right
SELECT s.name, e.grade
FROM students s
LEFT JOIN enrollments e ON s.id = e.student_id;
\`\`\`

### Aggregate Functions:
\`\`\`sql
SELECT 
    COUNT(*) as total,
    AVG(grade) as average,
    MAX(grade) as highest,
    MIN(grade) as lowest
FROM enrollments
GROUP BY course_id
HAVING AVG(grade) > 80;
\`\`\`

💡 **Order of execution**: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY`,
    'normalization': `## Database Normalization 📐

**Normalization** reduces redundancy and improves data integrity.

### Normal Forms:

#### 1NF (First Normal Form):
- ✅ Atomic values only (no arrays/lists)
- ✅ Each column has unique name
- ✅ Order doesn't matter

#### 2NF (Second Normal Form):
- ✅ In 1NF
- ✅ No partial dependencies (all non-key attributes depend on entire primary key)

#### 3NF (Third Normal Form):
- ✅ In 2NF
- ✅ No transitive dependencies (non-key depends only on primary key)

#### BCNF (Boyce-Codd):
- ✅ In 3NF
- ✅ Every determinant is a candidate key

### Example:
\`\`\`
Before (Not normalized):
┌─────────┬────────┬─────────────┐
│ Student │ Course │ Instructor  │
├─────────┼────────┼─────────────┤
│ John    │ Math   │ Dr. Smith   │
│ John    │ CS     │ Dr. Brown   │
└─────────┴────────┴─────────────┘

After (3NF):
Students: (student_id, name)
Courses: (course_id, course_name, instructor_id)
Instructors: (instructor_id, instructor_name)
Enrollments: (student_id, course_id)
\`\`\`

💡 **Rule**: "The key, the whole key, and nothing but the key"`,
    'transaction': `## Database Transactions 🔄

A **transaction** is a sequence of operations that must complete entirely or not at all.

### ACID Properties:

| Property | Description |
|----------|-------------|
| **A**tomicity | All or nothing |
| **C**onsistency | Valid state to valid state |
| **I**solation | Transactions don't interfere |
| **D**urability | Changes are permanent |

### SQL Transaction:
\`\`\`sql
BEGIN TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- If all good
COMMIT;

-- If error
ROLLBACK;
\`\`\`

### Isolation Levels:
1. **Read Uncommitted**: Dirty reads allowed
2. **Read Committed**: No dirty reads
3. **Repeatable Read**: Same data on re-read
4. **Serializable**: Full isolation (slowest)

💡 **Use case**: Bank transfers, order processing, inventory updates`,
    'indexing': `## Database Indexing 📑

An **index** is a data structure that speeds up data retrieval.

### How it works:
\`\`\`
Without index: Full table scan O(n)
With index: B-tree lookup O(log n)
\`\`\`

### Creating Indexes:
\`\`\`sql
-- Single column index
CREATE INDEX idx_name ON students(name);

-- Composite index
CREATE INDEX idx_name_age ON students(name, age);

-- Unique index
CREATE UNIQUE INDEX idx_email ON students(email);
\`\`\`

### Types:
| Type | Description |
|------|-------------|
| Clustered | Reorders table data (1 per table) |
| Non-clustered | Separate structure with pointers |
| Unique | Enforces uniqueness |
| Composite | Multiple columns |

### When to use:
- ✅ Frequently queried columns
- ✅ JOIN columns
- ✅ WHERE/ORDER BY columns
- ❌ Rarely queried columns
- ❌ Columns with few unique values

💡 **Trade-off**: Faster reads, slower writes`,
    'er_diagram': `## ER Diagram (Entity-Relationship) 📊

An **ER diagram** visually represents database structure.

### Components:

\`\`\`
┌─────────────┐         ┌─────────────┐
│   STUDENT   │         │   COURSE    │
├─────────────┤         ├─────────────┤
│ student_id  │─────────│ course_id   │
│ name        │   M:N   │ course_name │
│ email       │         │ credits     │
└─────────────┘         └─────────────┘
      │                       │
      │ 1:N                   │ 1:N
      ▼                       ▼
┌─────────────┐         ┌─────────────┐
│  ENROLLMENT │         │ INSTRUCTOR  │
└─────────────┘         └─────────────┘
\`\`\`

### Cardinality:
| Symbol | Meaning |
|--------|---------|
| 1:1 | One to One |
| 1:N | One to Many |
| M:N | Many to Many |

### Symbols:
- **Rectangle**: Entity
- **Ellipse**: Attribute
- **Diamond**: Relationship
- **Line**: Connection

💡 **Steps**: Identify entities → Define attributes → Establish relationships`,
    'process': `## Process Management 💻

A **process** is a program in execution.

### Process States:
\`\`\`
    ┌─────────┐
    │   New   │
    └────┬────┘
         ↓
    ┌─────────┐     ┌───────────┐
    │  Ready  │ ←── │  Waiting  │
    └────┬────┘     └─────┬─────┘
         ↓                ↑
    ┌─────────┐           │
    │ Running │───────────┘
    └────┬────┘
         ↓
    ┌─────────────┐
    │ Terminated  │
    └─────────────┘
\`\`\`

### Process vs Thread:
| Aspect | Process | Thread |
|--------|---------|--------|
| Memory | Separate | Shared |
| Creation | Expensive | Cheap |
| Communication | IPC | Direct |

### PCB (Process Control Block):
- Process ID
- Program Counter
- CPU Registers
- Memory Info
- I/O Status

💡 **Key concept**: Context switching saves/restores process state`,
    'scheduling': `## CPU Scheduling ⏱️

### Algorithms:

| Algorithm | Description | Pros | Cons |
|-----------|-------------|------|------|
| FCFS | First Come First Serve | Simple | Convoy effect |
| SJF | Shortest Job First | Optimal avg wait | Starvation |
| Round Robin | Time slices | Fair | High context switches |
| Priority | By priority value | Important first | Starvation |

### Round Robin Example:
\`\`\`
Time Quantum = 2

Process  Burst Time
P1       5
P2       3
P3       1

Execution: P1(2) → P2(2) → P3(1) → P1(2) → P2(1) → P1(1)

Gantt Chart:
|--P1--|--P2--|--P3--|--P1--|--P2--|--P1--|
0     2      4      5      7      8      9
\`\`\`

### Metrics:
- **Turnaround Time** = Completion - Arrival
- **Waiting Time** = Turnaround - Burst
- **Response Time** = First CPU - Arrival

💡 **Tip**: SJF gives minimum average waiting time`,
    'memory': `## Memory Management 🧠

### Memory Hierarchy:
\`\`\`
  Registers (fastest, smallest)
       ↓
    L1 Cache
       ↓
    L2 Cache
       ↓
    L3 Cache
       ↓
    Main Memory (RAM)
       ↓
   Disk (slowest, largest)
\`\`\`

### Virtual Memory:
- Maps virtual addresses to physical addresses
- Allows programs larger than physical RAM
- Uses page table for translation

### Paging:
\`\`\`
Virtual Address → Page Number + Offset
                      ↓
               Page Table
                      ↓
               Frame Number + Offset
                      ↓
               Physical Address
\`\`\`

### Page Replacement Algorithms:
| Algorithm | Description |
|-----------|-------------|
| FIFO | Replace oldest page |
| LRU | Replace least recently used |
| Optimal | Replace page used furthest in future |

💡 **Page Fault**: Requested page not in memory → Load from disk`,
    'deadlock': `## Deadlock 🔒

A **deadlock** occurs when processes wait indefinitely for resources.

### Conditions (All 4 required):
1. **Mutual Exclusion**: Only one process can use resource
2. **Hold and Wait**: Holding one, waiting for another
3. **No Preemption**: Can't forcibly take resources
4. **Circular Wait**: Circular chain of waiting

### Visual:
\`\`\`
Process A → Resource 1 → Process B
    ↑                        │
    └──── Resource 2 ←───────┘
\`\`\`

### Solutions:
| Strategy | Method |
|----------|--------|
| Prevention | Break one of 4 conditions |
| Avoidance | Banker's algorithm |
| Detection | Resource allocation graph |
| Recovery | Kill process or preempt resource |

### Banker's Algorithm:
- Check if allocation is safe
- Safe state: Sequence exists to complete all processes

💡 **Prevention tip**: Order resources, request all at once`,
    'file_system': `## File System 📁

### File Allocation Methods:

| Method | Description | Pros | Cons |
|--------|-------------|------|------|
| Contiguous | Sequential blocks | Fast access | Fragmentation |
| Linked | Blocks with pointers | No fragmentation | Slow random access |
| Indexed | Index block with pointers | Fast random access | Index overhead |

### Directory Structure:
\`\`\`
/
├── home/
│   └── user/
│       ├── documents/
│       └── downloads/
├── etc/
└── var/
\`\`\`

### Inode:
Contains file metadata:
- File type & permissions
- Owner & group
- Size & timestamps
- Pointers to data blocks

💡 **Free Space Management**: Bit map, linked list, grouping`,
    'osi': `## OSI Model 🌐

The **OSI Model** has 7 layers:

\`\`\`
┌─────────────────────────────────────┐
│ Layer 7: Application    (HTTP, FTP) │
├─────────────────────────────────────┤
│ Layer 6: Presentation   (SSL, JPEG) │
├─────────────────────────────────────┤
│ Layer 5: Session        (NetBIOS)   │
├─────────────────────────────────────┤
│ Layer 4: Transport      (TCP, UDP)  │
├─────────────────────────────────────┤
│ Layer 3: Network        (IP, ICMP)  │
├─────────────────────────────────────┤
│ Layer 2: Data Link      (Ethernet)  │
├─────────────────────────────────────┤
│ Layer 1: Physical       (Cables)    │
└─────────────────────────────────────┘
\`\`\`

### Easy to Remember:
**A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing

### Data Units:
| Layer | Data Unit |
|-------|-----------|
| 7,6,5 | Data |
| 4 | Segment |
| 3 | Packet |
| 2 | Frame |
| 1 | Bits |

💡 **TCP/IP Model**: Application, Transport, Internet, Network Access`,
    'tcp_ip': `## TCP/IP Protocols 📡

### TCP vs UDP:
| Feature | TCP | UDP |
|---------|-----|-----|
| Connection | Connection-oriented | Connectionless |
| Reliability | Guaranteed delivery | Best effort |
| Order | In-order delivery | No guarantee |
| Speed | Slower | Faster |
| Use case | HTTP, Email | Streaming, Gaming |

### TCP 3-Way Handshake:
\`\`\`
Client          Server
   │               │
   │──── SYN ─────→│
   │               │
   │←── SYN+ACK ───│
   │               │
   │──── ACK ─────→│
   │               │
   Connection Established!
\`\`\`

### Common Ports:
| Port | Protocol |
|------|----------|
| 80 | HTTP |
| 443 | HTTPS |
| 22 | SSH |
| 21 | FTP |
| 25 | SMTP |
| 53 | DNS |

💡 **IP Address**: IPv4 (32-bit), IPv6 (128-bit)`,
    'routing': `## Routing & Addressing 🛤️

### IP Addressing:
\`\`\`
IPv4: 192.168.1.1 (32 bits)
      └─Class C Network─┘

Subnet Mask: 255.255.255.0
             Network | Host
\`\`\`

### Subnetting:
\`\`\`
Network: 192.168.1.0/24
         ├─ Subnet 1: 192.168.1.0/26  (64 hosts)
         ├─ Subnet 2: 192.168.1.64/26 (64 hosts)
         ├─ Subnet 3: 192.168.1.128/26 (64 hosts)
         └─ Subnet 4: 192.168.1.192/26 (64 hosts)
\`\`\`

### Routing Protocols:
| Protocol | Type | Description |
|----------|------|-------------|
| RIP | Distance Vector | Hop count metric |
| OSPF | Link State | Fastest path |
| BGP | Path Vector | Internet routing |

### MAC vs IP:
| Feature | MAC | IP |
|---------|-----|-----|
| Layer | Data Link | Network |
| Scope | Local | Global |
| Format | 48-bit hex | 32/128 bit |

💡 **Remember**: Routers use IP, Switches use MAC`,
    'oop': `## Object-Oriented Programming 🎯

### Four Pillars:

#### 1. Encapsulation 📦
\`\`\`python
class BankAccount:
    def __init__(self):
        self.__balance = 0  # Private
    
    def deposit(self, amount):
        self.__balance += amount
\`\`\`

#### 2. Abstraction 🎭
\`\`\`python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass
\`\`\`

#### 3. Inheritance 👨‍👩‍👦
\`\`\`python
class Animal:
    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return "Woof!"
\`\`\`

#### 4. Polymorphism 🔄
\`\`\`python
def make_sound(animal):
    print(animal.speak())

make_sound(Dog())  # "Woof!"
make_sound(Cat())  # "Meow!"
\`\`\`

💡 **Key concepts**: Classes, Objects, Methods, Constructors`,
    'java': `## Java Essentials ☕

### Basic Structure:
\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

### Key Features:
- **Platform Independent**: Write once, run anywhere
- **Object-Oriented**: Everything is an object
- **Strongly Typed**: Variable types declared
- **Garbage Collection**: Automatic memory management

### Common Collections:
\`\`\`java
// ArrayList
ArrayList<String> list = new ArrayList<>();
list.add("item");

// HashMap
HashMap<String, Integer> map = new HashMap<>();
map.put("key", 1);

// HashSet
HashSet<Integer> set = new HashSet<>();
set.add(5);
\`\`\`

### JVM Architecture:
\`\`\`
.java → javac → .class → JVM → Machine Code
\`\`\`

💡 **Remember**: Java is compiled to bytecode, then interpreted by JVM`,
    'python': `## Python Essentials 🐍

### Basic Syntax:
\`\`\`python
# Variables (dynamic typing)
name = "Python"
age = 30
price = 19.99

# Lists
fruits = ["apple", "banana", "cherry"]

# Dictionaries
person = {"name": "John", "age": 30}

# Functions
def greet(name):
    return f"Hello, {name}!"

# Classes
class Dog:
    def __init__(self, name):
        self.name = name
    
    def bark(self):
        return "Woof!"
\`\`\`

### List Comprehension:
\`\`\`python
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
\`\`\`

### Common Libraries:
- **NumPy**: Numerical computing
- **Pandas**: Data analysis
- **Flask/Django**: Web frameworks
- **TensorFlow**: Machine learning

💡 **Python is**: Readable, versatile, great for beginners!`,
    'cpp': `## C++ Essentials ⚡

### Basic Structure:
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
\`\`\`

### Pointers:
\`\`\`cpp
int x = 10;
int* ptr = &x;    // Pointer to x
cout << *ptr;     // Dereference: 10
cout << ptr;      // Address
\`\`\`

### References:
\`\`\`cpp
int x = 10;
int& ref = x;     // Reference to x
ref = 20;         // x is now 20
\`\`\`

### Classes:
\`\`\`cpp
class Rectangle {
private:
    int width, height;
public:
    Rectangle(int w, int h) : width(w), height(h) {}
    int area() { return width * height; }
};
\`\`\`

### STL Containers:
- vector, list, deque
- map, set, unordered_map
- stack, queue, priority_queue

💡 **C++ is**: Fast, powerful, used in systems/games!`,
    'algorithm': `## Algorithm Complexity 📊

### Big O Notation:

| Notation | Name | Example |
|----------|------|---------|
| O(1) | Constant | Array access |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Linear search |
| O(n log n) | Linearithmic | Merge sort |
| O(n²) | Quadratic | Bubble sort |
| O(2ⁿ) | Exponential | Fibonacci recursive |
| O(n!) | Factorial | Permutations |

### Visual Comparison:
\`\`\`
Time ↑
     │    O(n!)
     │   O(2ⁿ)
     │  O(n²)
     │ O(n log n)
     │O(n)
     │O(log n)
     │O(1)
     └──────────────→ Input Size
\`\`\`

### Rules:
1. Drop constants: O(2n) → O(n)
2. Drop lower terms: O(n² + n) → O(n²)
3. Different inputs: O(a + b), not O(n)

💡 **Space Complexity**: Memory used by algorithm`,
    'database': `## Database Fundamentals 🗄️

### DBMS Types:
| Type | Examples | Use Case |
|------|----------|----------|
| Relational | MySQL, PostgreSQL | Structured data |
| Document | MongoDB | JSON-like data |
| Key-Value | Redis | Caching |
| Graph | Neo4j | Relationships |
| Columnar | Cassandra | Analytics |

### SQL vs NoSQL:
| SQL | NoSQL |
|-----|-------|
| Fixed schema | Flexible schema |
| ACID compliant | Eventually consistent |
| Vertical scaling | Horizontal scaling |
| Complex queries | Simple queries |

### Basic Operations (CRUD):
- **C**reate: INSERT
- **R**ead: SELECT
- **U**pdate: UPDATE
- **D**elete: DELETE

💡 **Choose SQL** for complex queries, transactions
💡 **Choose NoSQL** for scale, flexibility, speed`,
    'tree_traversal': `## Tree Traversals 🌲

### Visual Tree:
\`\`\`
        1
       / \\
      2   3
     / \\
    4   5
\`\`\`

### Traversal Orders:

| Type | Order | Result |
|------|-------|--------|
| Inorder | Left-Root-Right | 4, 2, 5, 1, 3 |
| Preorder | Root-Left-Right | 1, 2, 4, 5, 3 |
| Postorder | Left-Right-Root | 4, 5, 2, 3, 1 |
| Level Order | Level by level | 1, 2, 3, 4, 5 |

### Python Implementation:
\`\`\`python
def inorder(root):
    if root:
        inorder(root.left)
        print(root.val)
        inorder(root.right)

def preorder(root):
    if root:
        print(root.val)
        preorder(root.left)
        preorder(root.right)

def postorder(root):
    if root:
        postorder(root.left)
        postorder(root.right)
        print(root.val)
\`\`\`

💡 **Tip**: Inorder on BST gives sorted output!`,
    'hello': `## Hello! 👋 Welcome!

I'm your **AI Learning Tutor** for Computer Science! 🎓

### I can help you with:

📚 **Data Structures**
- Arrays, Linked Lists, Stacks, Queues
- Trees, Graphs, Hash Tables, Heaps

🔢 **Algorithms**  
- Sorting & Searching
- Recursion & Dynamic Programming
- Time & Space Complexity

🗃️ **Databases**
- SQL Queries & Joins
- Normalization & Transactions
- Indexing & ER Diagrams

💻 **Operating Systems**
- Process & Memory Management
- CPU Scheduling
- Deadlocks & File Systems

🌐 **Computer Networks**
- OSI Model & TCP/IP
- Routing & Addressing

🎯 **Programming**
- OOP Concepts
- Java, Python, C++

**Try asking**: "What is a binary tree?" or "Explain SQL joins"`,
    'help': `## How Can I Help? 🤝

### Quick Guide:

Just ask me about any CS topic! Here are some examples:

**Data Structures:**
- "What is a linked list?"
- "Explain hash tables"
- "How does a heap work?"

**Algorithms:**
- "Explain binary search"
- "What is dynamic programming?"
- "Compare sorting algorithms"

**Databases:**
- "What is normalization?"
- "Explain SQL joins"
- "What is ACID?"

**Operating Systems:**
- "Explain process scheduling"
- "What is deadlock?"
- "How does virtual memory work?"

**Networks:**
- "Explain OSI model"
- "What is TCP vs UDP?"

**Programming:**
- "What is OOP?"
- "Explain polymorphism"

💡 **Tip**: Be specific for better answers!`,
    'thanks': `## You're Welcome! 😊

Happy to help with your learning journey! 🎓

### Keep Learning:
- Practice coding problems on LeetCode, HackerRank
- Build projects to apply concepts
- Review fundamentals regularly

**Feel free to ask more questions!** 📚

What topic would you like to explore next?`,
};
// Find best matching topic
function findBestMatch(message) {
    const lowerMessage = message.toLowerCase();
    // Check each topic's keywords
    for (const [topic, keywords] of Object.entries(keywordMappings)) {
        for (const keyword of keywords) {
            if (lowerMessage.includes(keyword)) {
                return topic;
            }
        }
    }
    return null;
}
// Generate response
function generateResponse(message, context) {
    const topic = findBestMatch(message);
    if (topic && knowledgeBase[topic]) {
        return knowledgeBase[topic];
    }
    return ''; // Return empty to trigger AI fallback
}
// Preserve markdown formatting, only clean up HTML entities and extra whitespace
function cleanMarkdown(text) {
    return text
        // Clean HTML entities
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Clean up extra whitespace
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
// Build system prompt for course
function buildSystemPrompt(courseName, courseTopics, courseCategory) {
    return `You are an expert AI tutor STRICTLY for "${courseName}" (${courseCategory === 'CS' ? 'Computer Science' : 'Electronics & Communication Engineering'}).

🎯 YOUR SUBJECT: ${courseName}
📚 ALLOWED TOPICS: ${courseTopics.join(', ')}

STRICT RULES:
1. ONLY answer questions related to "${courseName}" and its topics listed above
2. If the question is NOT related to ${courseName}, politely redirect: "This question is outside the scope of ${courseName}. I can help you with topics like: ${courseTopics.slice(0, 5).join(', ')}, etc. What would you like to learn about?"
3. For high-level/advanced questions, provide comprehensive expert-level answers
4. You CAN answer complex, advanced, and research-level questions within this subject

FORMATTING RULES:
- Use plain text primarily
- For code examples, indent with spaces (no markdown code blocks)
- Use simple dashes (-) for bullet points
- Use numbers (1. 2. 3.) for ordered lists
- Use line breaks for separation
- Add relevant emojis sparingly (🔹, ✅, 📌, 💡, ⚡)

TEACHING STYLE:
- Start with a brief definition/overview
- Explain concepts step by step
- Use real-world examples and analogies
- Include formulas/equations when relevant (use plain text: E = mc^2)
- Provide code examples for CS topics
- End with a summary or key takeaway

For ${courseCategory === 'CS' ? 'programming questions, provide working code examples' : 'circuit/signal questions, explain with equations and diagrams in text'}.`;
}
// Generate response using Groq (fallback provider)
async function generateWithGroq(message, systemPrompt, history, apiKey) {
    try {
        if (!apiKey)
            return null;
        const groqClient = new groq_sdk_1.default({ apiKey });
        const messages = [
            { role: 'system', content: systemPrompt }
        ];
        // Add recent history
        const recentHistory = history.slice(-6);
        for (const msg of recentHistory) {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        }
        // Add current message
        messages.push({ role: 'user', content: message });
        const completion = await groqClient.chat.completions.create({
            messages,
            model: GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 2048,
        });
        return completion.choices[0]?.message?.content || null;
    }
    catch (error) {
        console.error('Groq API error:', error);
        return null;
    }
}
async function generateWithCerebras(message, systemPrompt, history, apiKey) {
    try {
        if (!apiKey)
            return null;
        const messages = [
            { role: 'system', content: systemPrompt }
        ];
        // Add recent history
        const recentHistory = history.slice(-6);
        for (const msg of recentHistory) {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        }
        // Add current message
        messages.push({ role: 'user', content: message });
        const response = await axios_1.default.post('https://api.cerebras.ai/v1/chat/completions', {
            messages,
            model: 'llama3.1-8b',
            temperature: 0.7,
            max_tokens: 2048,
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.choices[0]?.message?.content || null;
    }
    catch (error) {
        console.error('Cerebras API error:', error);
        return null;
    }
}
async function generateWithOpenRouter(message, systemPrompt, history, apiKey) {
    try {
        if (!apiKey)
            return null;
        const messages = [
            { role: 'system', content: systemPrompt }
        ];
        // Add recent history
        const recentHistory = history.slice(-6);
        for (const msg of recentHistory) {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        }
        // Add current message
        messages.push({ role: 'user', content: message });
        const response = await axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
            messages,
            model: 'anthropic/claude-3-haiku',
            temperature: 0.7,
            max_tokens: 2048,
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.choices[0]?.message?.content || null;
    }
    catch (error) {
        console.error('OpenRouter API error:', error);
        return null;
    }
}
// Generate response using Gemini (primary provider)
async function generateWithGemini(message, systemPrompt, courseName, courseTopics, history, apiKey) {
    try {
        if (!apiKey)
            return null;
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        const conversationHistory = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: `I understand. I am now an expert tutor for ${courseName}. I will only answer questions related to: ${courseTopics.slice(0, 8).join(', ')}, and related subtopics. I will politely redirect off-topic questions.` }] }
        ];
        const recentHistory = history.slice(-6);
        for (const msg of recentHistory) {
            conversationHistory.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        }
        const chat = model.startChat({ history: conversationHistory });
        const result = await chat.sendMessage(message);
        return result.response.text();
    }
    catch (error) {
        console.error('Gemini API error:', error?.message || error);
        return null;
    }
}
// Generate AI response with multi-provider support
async function generateAIResponse(message, context, history, courseId, apiKeys) {
    // First try knowledge base
    const kbResponse = generateResponse(message, context);
    if (kbResponse) {
        return cleanMarkdown(kbResponse);
    }
    // Get course-specific information
    const courseInfo = courseId ? courseDatabase[courseId.toLowerCase()] : null;
    const courseName = courseInfo?.name || context;
    const courseTopics = courseInfo?.topics || [];
    const courseCategory = courseInfo?.category || 'CS';
    const systemPrompt = buildSystemPrompt(courseName, courseTopics, courseCategory);
    let aiResponse = null;
    // Validate that at least one API key is provided
    if (!apiKeys || Object.keys(apiKeys).length === 0) {
        return `❌ No API keys provided. Please provide at least one API key (Gemini, Groq, Cerebras, or OpenRouter) to use the AI tutor.`;
    }
    // Try available API keys in order of preference
    const keyOrder = ['gemini', 'groq', 'cerebras', 'openrouter'];
    for (const provider of keyOrder) {
        const key = apiKeys[provider];
        if (!key)
            continue;
        try {
            // Try Gemini
            if (provider === 'gemini') {
                aiResponse = await generateWithGemini(message, systemPrompt, courseName, courseTopics, history, key);
                if (aiResponse)
                    break;
            }
            // Try Groq
            if (provider === 'groq') {
                aiResponse = await generateWithGroq(message, systemPrompt, history, key);
                if (aiResponse)
                    break;
            }
            // Try Cerebras
            if (provider === 'cerebras') {
                aiResponse = await generateWithCerebras(message, systemPrompt, history, key);
                if (aiResponse)
                    break;
            }
            // Try OpenRouter
            if (provider === 'openrouter') {
                aiResponse = await generateWithOpenRouter(message, systemPrompt, history, key);
                if (aiResponse)
                    break;
            }
        }
        catch (error) {
            console.error(`${provider} API error:`, error);
            continue;
        }
    }
    if (aiResponse) {
        return cleanMarkdown(aiResponse);
    }
    // Fallback message
    return `⚠️ All AI providers failed. Please verify your API keys are valid and have available quota.`;
}
function chatRoutes(io) {
    const router = (0, express_1.Router)();
    const conversationHistories = new Map();
    router.post('/message', async (req, res) => {
        try {
            const { courseId, message, conversationId, apiKeys } = req.body;
            const userId = req.userId || 'anonymous';
            if (!message || !courseId) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            if (!apiKeys || Object.keys(apiKeys).length === 0) {
                return res.status(400).json({ error: 'At least one API key is required' });
            }
            // Check rate limit
            const rateLimit = checkRateLimit(userId);
            if (!rateLimit.allowed) {
                return res.status(429).json({
                    error: 'Rate limit exceeded. Please wait before sending more messages.',
                    retryAfter: Math.ceil(rateLimit.resetIn / 1000),
                    remaining: 0
                });
            }
            // Check if course exists
            const courseInfo = courseDatabase[courseId.toLowerCase()];
            if (!courseInfo) {
                return res.status(400).json({
                    error: 'Invalid course ID',
                    validCourses: Object.keys(courseDatabase)
                });
            }
            const convId = conversationId || `conv_${userId}_${Date.now()}`;
            if (!conversationHistories.has(convId)) {
                conversationHistories.set(convId, []);
            }
            const history = conversationHistories.get(convId);
            history.push({ role: 'user', content: message });
            // Use course info directly from database
            const courseContext = courseInfo.name;
            // Use async AI response generation with user's API keys
            const aiResponse = await generateAIResponse(message, courseContext, history, courseId, apiKeys);
            history.push({ role: 'assistant', content: aiResponse });
            if (history.length > 20) {
                history.splice(0, history.length - 20);
            }
            io.to(`course_${courseId}`).emit('new_message', {
                conversationId: convId,
                userId,
                message: aiResponse,
                timestamp: new Date(),
            });
            res.json({
                conversationId: convId,
                userMessage: message,
                aiResponse,
                rateLimit: {
                    remaining: rateLimit.remaining,
                    resetIn: Math.ceil(rateLimit.resetIn / 1000)
                },
                timestamp: new Date(),
            });
        }
        catch (error) {
            console.error('Chat error:', error);
            res.status(500).json({ error: 'Failed to process message' });
        }
    });
    router.get('/history/:conversationId', async (req, res) => {
        try {
            const { conversationId } = req.params;
            if (!conversationId) {
                return res.status(400).json({ error: 'Conversation ID is required' });
            }
            const history = conversationHistories.get(conversationId) || [];
            res.json({
                conversationId,
                messages: history,
                messageCount: history.length,
            });
        }
        catch (error) {
            console.error('Failed to fetch history:', error);
            res.status(500).json({ error: 'Failed to fetch history' });
        }
    });
    router.get('/conversations', async (req, res) => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const conversations = Array.from(conversationHistories.keys())
                .filter(key => key.includes(userId))
                .map(key => ({
                conversationId: key,
                messageCount: conversationHistories.get(key)?.length || 0,
            }));
            res.json({ conversations });
        }
        catch (error) {
            console.error('Failed to fetch conversations:', error);
            res.status(500).json({ error: 'Failed to fetch conversations' });
        }
    });
    return router;
}
//# sourceMappingURL=chat.js.map
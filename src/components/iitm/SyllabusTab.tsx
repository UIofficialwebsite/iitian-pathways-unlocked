import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2, BookOpen, GraduationCap, CheckCircle2 } from "lucide-react";

// --- Data Definitions ---

export type WeekContent = {
  week: string;
  topics: string;
};

export type CourseLevel = "Qualifier" | "Foundation" | "Diploma" | "Degree";
export type CourseCategory = "Common" | "Programming" | "Data Science" | "Core" | "Elective" | "Electronic Systems";

export type CourseSyllabus = {
  id: string;
  name: string;
  credits: number;
  level: CourseLevel;
  category: CourseCategory; 
  syllabus: WeekContent[];
};

export const SYLLABUS_DATA: CourseSyllabus[] = [
  // --- QUALIFIER LEVEL (Weeks 1-4 Only) ---
  // Data Science Qualifier
  {
    id: "BSMA1001-Q",
    name: "Mathematics for Data Science I",
    credits: 4,
    level: "Qualifier",
    category: "Common",
    syllabus: [
      { week: "Week 1", topics: "Set Theory - Number system, Sets and their operations, Relations and functions" },
      { week: "Week 2", topics: "Rectangular coordinate system, Straight Lines - Slope, Parallel/perpendicular lines, General equations" },
      { week: "Week 3", topics: "Quadratic Functions - Minima, maxima, vertex, slope, Quadratic Equations" },
      { week: "Week 4", topics: "Algebra of Polynomials, Graphs of Polynomials - X-intercepts, end behavior, turning points" },
    ],
  },
  {
    id: "BSMA1002-Q",
    name: "Statistics for Data Science I",
    credits: 4,
    level: "Qualifier",
    category: "Common",
    syllabus: [
      { week: "Week 1", topics: "Introduction, Types of data, Descriptive vs Inferential statistics, Scales of measurement" },
      { week: "Week 2", topics: "Describing categorical data - Frequency distribution, Graphing, Mode and median" },
      { week: "Week 3", topics: "Describing numerical data - Central tendency (Mean, median, mode), Dispersion (Variance, SD, IQR)" },
      { week: "Week 4", topics: "Association between variables - Contingency tables, Scatterplot, Covariance, Pearson correlation" },
    ],
  },
  {
    id: "BSCS1001-Q",
    name: "Computational Thinking",
    credits: 4,
    level: "Qualifier",
    category: "Common",
    syllabus: [
      { week: "Week 1", topics: "Variables, Initialization, Iterators, Filtering, Datatypes, Flowcharts" },
      { week: "Week 2", topics: "Iteration, Filtering, Selection, Pseudocode, Min/Max" },
      { week: "Week 3", topics: "Multiple iterations, Procedures, Parameters, Side effects" },
      { week: "Week 4", topics: "Nested iterations, Binning" },
    ],
  },
  {
    id: "BSHS1001-Q",
    name: "English I",
    credits: 4,
    level: "Qualifier",
    category: "Common",
    syllabus: [
      { week: "Week 1", topics: "Sounds and Words (Vowel and Consonant sounds)" },
      { week: "Week 2", topics: "Parts of Speech" },
      { week: "Week 3", topics: "Sentences (Phrases and Idioms)" },
      { week: "Week 4", topics: "Speaking Skills (Spoken English Preliminaries)" },
    ],
  },
  // Electronic Systems Qualifier
  {
    id: "MA1101-Q",
    name: "Math for Electronics I",
    credits: 4,
    level: "Qualifier",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Introduction, Linear equations, Numbers, relations/functions, Cartesian coordinates, Equation of a line in 2D" },
      { week: "Week 2", topics: "Functions of one variable, Limits and continuity, Functions and graphs, Scaling/shifting, Trigonometric functions" },
      { week: "Week 3", topics: "Differential calculus, Tangent line, Derivatives as slope/rate of change, Rules for derivatives" },
      { week: "Week 4", topics: "Integral calculus, Area under step functions, Finite sums, The definite integral, Fundamental theorem of calculus" },
    ],
  },
  {
    id: "CS1101-Q",
    name: "Introduction To C Programming",
    credits: 4,
    level: "Qualifier",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Write, compile, run programs in C, in a Linux environment; debugging tools" },
      { week: "Week 2", topics: "Variables, built-in datatypes, operators; Control flow - conditionals, loops" },
      { week: "Week 3", topics: "Modularity and functions; variable scope" },
      { week: "Week 4", topics: "Input/Output; Files" },
    ],
  },
  {
    id: "EE1101-Q",
    name: "Electronic Systems Thinking and Circuits",
    credits: 4,
    level: "Qualifier",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Introduction, Miniaturization, Mobile teardown, The battery, The charger, The resistor" },
      { week: "Week 2", topics: "Voltage, Current, Ohm's Law, Series/Parallel connections, Nodal/Mesh Analysis, KCL/KVL, Capacitors, Inductors" },
      { week: "Week 3", topics: "The Microphone, Motor and Generator, The Sinusoid, Energy of time varying signals, Harmonics" },
      { week: "Week 4", topics: "Problem Solving: Lower/upper bounds, Resistive Ladder, Wheatstone's bridge, Resistive Cube" },
    ],
  },
  {
    id: "HS1001-ES-Q",
    name: "English I (ES)",
    credits: 4,
    level: "Qualifier",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Sounds and Words (Vowel and Consonant sounds)" },
      { week: "Week 2", topics: "Parts of Speech" },
      { week: "Week 3", topics: "Sentences (Phrases and Idioms)" },
      { week: "Week 4", topics: "Speaking Skills (Spoken English Preliminaries)" },
    ],
  },

  // --- FOUNDATION LEVEL ---
  {
    id: "BSMA1001",
    name: "Mathematics for Data Science I",
    credits: 4,
    level: "Foundation",
    category: "Common",
    syllabus: [
      { week: "Week 1", topics: "Set Theory - Number system, Sets and their operations, Relations and functions" },
      { week: "Week 2", topics: "Rectangular coordinate system, Straight Lines - Slope, Parallel/perpendicular lines, General equations" },
      { week: "Week 3", topics: "Quadratic Functions - Minima, maxima, vertex, slope, Quadratic Equations" },
      { week: "Week 4", topics: "Algebra of Polynomials, Graphs of Polynomials - X-intercepts, end behavior, turning points" },
      { week: "Week 5", topics: "Functions - Horizontal/vertical line tests, Exponential, Composite, Inverse functions" },
      { week: "Week 6", topics: "Logarithmic Functions - Properties, Graphs, Exponential/Logarithmic equations" },
      { week: "Week 7", topics: "Sequence and Limits - Limits for sequences, Limits for functions, Continuity" },
      { week: "Week 8", topics: "Derivatives, Tangents, Critical points, L'Hôpital's rule, Linear approximation" },
      { week: "Week 9", topics: "Integral of a function of one variable - Computing areas under a curve" },
      { week: "Week 10", topics: "Graph Theory - BFS, DFS, DAGs, Topological sorting" },
      { week: "Week 11", topics: "Graph Algorithms - Dijkstra's, Bellman-Ford, Floyd–Warshall, Prim's, Kruskal's" },
      { week: "Week 12", topics: "Revision" },
    ],
  },
  {
    id: "BSMA1002",
    name: "Statistics for Data Science I",
    credits: 4,
    level: "Foundation",
    category: "Common",
    syllabus: [
      { week: "Week 1", topics: "Introduction, Types of data, Descriptive vs Inferential statistics, Scales of measurement" },
      { week: "Week 2", topics: "Describing categorical data - Frequency distribution, Graphing, Mode and median" },
      { week: "Week 3", topics: "Describing numerical data - Central tendency (Mean, median, mode), Dispersion (Variance, SD, IQR)" },
      { week: "Week 4", topics: "Association between variables - Contingency tables, Scatterplot, Covariance, Pearson correlation" },
      { week: "Week 5", topics: "Counting principles - Addition rule, Multiplication rule, Factorials" },
      { week: "Week 6", topics: "Permutations and combinations" },
      { week: "Week 7", topics: "Probability - Basic definitions, Events, Properties" },
      { week: "Week 8", topics: "Conditional probability - Independence, Law of total probability, Bayes' theorem" },
      { week: "Week 9", topics: "Random Variables - Discrete/Continuous, PMF, CDF" },
      { week: "Week 10", topics: "Expectation and Variance of discrete random variables" },
      { week: "Week 11", topics: "Binomial and Poisson distributions" },
      { week: "Week 12", topics: "Continuous random variables - PDF, Uniform distribution, Exponential distribution" },
    ],
  },
  {
    id: "BSMA1003",
    name: "Mathematics for Data Science II",
    credits: 4,
    level: "Foundation",
    category: "Common",
    syllabus: [
      { week: "Week 1", topics: "Vectors, Matrices, Systems of Linear Equations, Determinants" },
      { week: "Week 2", topics: "Solving linear equations, Cramer's Rule, Gaussian elimination, Row reduction" },
      { week: "Week 3", topics: "Vector spaces, Linear dependence, Linear independence" },
      { week: "Week 4", topics: "Basis and dimension, Rank/dimension using Gaussian elimination" },
      { week: "Week 5", topics: "Rank and Nullity, Linear transformations, Kernel and Images" },
      { week: "Week 6", topics: "Linear transformations continued, Basis for kernel and image" },
      { week: "Week 7", topics: "Equivalent/Similar matrices, Inner products, Norms, Lengths and angles" },
      { week: "Week 8", topics: "Orthogonality, Orthonormality, Gram-Schmidt process, Orthogonal transformations" },
      { week: "Week 9", topics: "Multivariable functions, Partial derivatives, Limits, Continuity, Gradient" },
      { week: "Week 10", topics: "Directional derivatives, Tangent planes, Critical points (Steepest ascent/descent)" },
      { week: "Week 11", topics: "Hessian Matrix, Local extrema, Differentiability" },
    ],
  },
  {
    id: "BSMA1004",
    name: "Statistics for Data Science II",
    credits: 4,
    level: "Foundation",
    category: "Common",
    syllabus: [
      { week: "Week 1", topics: "Multiple random variables - Distributions" },
      { week: "Week 2", topics: "Independence, Functions of multiple random variables" },
      { week: "Week 3", topics: "Expectations, Covariance, Correlation, Inequalities" },
      { week: "Week 4", topics: "Continuous random variables, Density functions, Expectations" },
      { week: "Week 5", topics: "Multiple continuous random variables, Jointly Gaussian, Limit theorems" },
      { week: "Week 6", topics: "Refresher week" },
      { week: "Week 7", topics: "Estimation and Inference I" },
      { week: "Week 8", topics: "Estimation and Inference II" },
      { week: "Week 9", topics: "Bayesian estimation" },
      { week: "Week 10", topics: "Hypothesis testing I" },
      { week: "Week 11", topics: "Hypothesis Testing II" },
      { week: "Week 12", topics: "Revision week" },
    ],
  },
  {
    id: "BSCS1001",
    name: "Computational Thinking",
    credits: 4,
    level: "Foundation",
    category: "Common",
    syllabus: [
      { week: "Week 1", topics: "Variables, Initialization, Iterators, Filtering, Datatypes, Flowcharts" },
      { week: "Week 2", topics: "Iteration, Filtering, Selection, Pseudocode, Min/Max" },
      { week: "Week 3", topics: "Multiple iterations, Procedures, Parameters, Side effects" },
      { week: "Week 4", topics: "Nested iterations, Binning" },
      { week: "Week 5", topics: "List, Insertion sort" },
      { week: "Week 6", topics: "Table, Dictionary" },
      { week: "Week 7", topics: "Graph, Matrix" },
      { week: "Week 8", topics: "Adjacency matrix, Edge labelled graph" },
      { week: "Week 9", topics: "Backtracking, Tree, Depth First Search (DFS), Recursion" },
      { week: "Week 10", topics: "OOP: Class, Object, Encapsulation, Abstraction, Access specifiers" },
      { week: "Week 11", topics: "Concurrency, Parallelism, Deadlock, Race condition, RPC" },
      { week: "Week 12", topics: "Top-down/Bottom-up approach, Decision trees, Classification" },
    ],
  },
  {
    id: "BSCS1002",
    name: "Programming in Python",
    credits: 4,
    level: "Foundation",
    category: "Common",
    syllabus: [
      { week: "Week 1", topics: "Introduction to algorithms" },
      { week: "Week 2", topics: "Conditionals" },
      { week: "Week 3", topics: "Conditionals (Continued)" },
      { week: "Week 4", topics: "Iterations and Ranges" },
      { week: "Week 5", topics: "Iterations and Ranges (Continued)" },
      { week: "Week 6", topics: "Basic Collections in Python" },
      { week: "Week 7", topics: "Basic Collections (Continued)" },
      { week: "Week 8", topics: "Basic Collections (Continued)" },
      { week: "Week 9", topics: "File Operations" },
      { week: "Week 10", topics: "File Operations (Continued)" },
      { week: "Week 11", topics: "Module system in python" },
      { week: "Week 12", topics: "Basic Pandas and Numpy processing" },
    ],
  },
  {
    id: "BSHS1001",
    name: "English I",
    credits: 4,
    level: "Foundation",
    category: "Common",
    syllabus: [
      { week: "Week 1", topics: "Sounds and Words (Vowel and Consonant sounds)" },
      { week: "Week 2", topics: "Parts of Speech" },
      { week: "Week 3", topics: "Sentences (Phrases and Idioms)" },
      { week: "Week 4", topics: "Speaking Skills (Spoken English Preliminaries)" },
      { week: "Week 5", topics: "Tenses and Agreement" },
      { week: "Week 6", topics: "Reading Skills (Skimming, Scanning)" },
      { week: "Week 7", topics: "Listening Skills" },
      { week: "Week 8", topics: "Aspiration, Word Stress and Syllabification" },
      { week: "Week 9", topics: "Speaking Skills (Presentation and GD)" },
      { week: "Week 10", topics: "Grammar (Common Errors) and Writing Skills" },
      { week: "Week 11", topics: "Basics of Writing" },
      { week: "Week 12", topics: "Professional Writing" },
    ],
  },
  {
    id: "BSHS1002",
    name: "English II",
    credits: 4,
    level: "Foundation",
    category: "Common",
    syllabus: [
      { week: "Week 1", topics: "Patterns in Sentences" },
      { week: "Week 2", topics: "Patterns in Sentences (Continued)" },
      { week: "Week 3", topics: "Patterns in Sentences (Continued)" },
      { week: "Week 4", topics: "Listening Skills" },
      { week: "Week 5", topics: "Listening Skills (Continued)" },
      { week: "Week 6", topics: "Speaking Skills" },
      { week: "Week 7", topics: "Speaking Skills (Continued)" },
      { week: "Week 8", topics: "Reading Skills" },
      { week: "Week 9", topics: "Writing Skills" },
      { week: "Week 10", topics: "Writing Skills (Continued)" },
      { week: "Week 11", topics: "Social Skills" },
      { week: "Week 12", topics: "Social Skills (Continued)" },
    ],
  },
  // Electronic Systems Foundation
  {
    id: "MA1101",
    name: "Math for Electronics I",
    credits: 4,
    level: "Foundation",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Introduction, Linear equations, Cartesian coordinates" },
      { week: "Week 2", topics: "Functions of one variable, Limits and continuity" },
      { week: "Week 3", topics: "Differential calculus, Derivatives" },
      { week: "Week 4", topics: "Integral calculus, Definite integral" },
      { week: "Week 5", topics: "Ordinary Differential Equations (ODEs)" },
      { week: "Week 6", topics: "Complex numbers" },
    ],
  },
  {
    id: "CS1101",
    name: "Introduction To C Programming",
    credits: 4,
    level: "Foundation",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Write, compile, run programs in C" },
      { week: "Week 2", topics: "Variables, datatypes, operators, Control flow" },
      { week: "Week 3", topics: "Modularity and functions; variable scope" },
      { week: "Week 4", topics: "Input/Output; Files" },
      { week: "Week 5", topics: "Pointers, memory, arrays, strings" },
      { week: "Week 6", topics: "Multi-dimensional arrays, dynamic memory allocation" },
      { week: "Week 7", topics: "Standard library and common extensions" },
      { week: "Week 8", topics: "Implementation concepts: compilation, heap/stack" },
    ],
  },
  {
    id: "EE1101",
    name: "Electronic Systems Thinking and Circuits",
    credits: 4,
    level: "Foundation",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Miniaturization, Mobile teardown, The battery" },
      { week: "Week 2", topics: "Voltage, Current, Ohm's Law, KCL/KVL" },
      { week: "Week 3", topics: "The Microphone, Motor and Generator, The Sinusoid" },
      { week: "Week 4", topics: "Problem Solving: Resistive Ladder, Wheatstone's bridge" },
      { week: "Week 5", topics: "Analog Mixer, Superposition principle" },
      { week: "Week 6", topics: "Non-Inverting/Inverting Amplifier, RC Step Response" },
      { week: "Week 7", topics: "Low Pass Filter, High Pass Filter, Band Pass Filter" },
      { week: "Week 8", topics: "Problem Solving: Resistive Analog Mixer, Superposition" },
      { week: "Week 9", topics: "Analog vs Digital Audio, Sampling, ADC" },
      { week: "Week 10", topics: "Binary Number System, Digital Compute Blocks" },
      { week: "Week 11", topics: "Wired/Wireless Communication, Modulation" },
      { week: "Week 12", topics: "Problem Solving: LPF Energy, Switched Capacitors" },
    ],
  },
  {
    id: "CS1102",
    name: "Introduction to the Linux Shell",
    credits: 5,
    level: "Foundation",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Linux OS; kernel vs distribution; command line" },
      { week: "Week 2", topics: "Software management; package installation; users" },
      { week: "Week 3", topics: "Shell scripting; variables, IO redirection, pipes" },
      { week: "Week 4", topics: "Text processing; file handling" },
      { week: "Week 5", topics: "Software projects and compilation; make" },
      { week: "Week 6", topics: "Version control; git; web interfaces" },
      { week: "Week 7", topics: "Basic networking; DNS; servers; remote access" },
    ],
  },
  {
    id: "EE1102",
    name: "Digital Systems",
    credits: 4,
    level: "Foundation",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Digital systems, Boolean algebra, logic gates" },
      { week: "Week 2", topics: "Number systems; binary, hexadecimal" },
      { week: "Week 3", topics: "Hardware description languages; structural design" },
      { week: "Week 4", topics: "Combinational design; HDL based modular design" },
      { week: "Week 5", topics: "Sequential elements; state and timing" },
      { week: "Week 6", topics: "Finite state machines; sequence detectors" },
      { week: "Week 7", topics: "Datapath and Control; simple microprocessor" },
      { week: "Week 8", topics: "Basic instruction sets; assembly programming" },
      { week: "Week 9", topics: "HDL synthesis; implementing on FPGA" },
    ],
  },
  {
    id: "EE1103",
    name: "Electrical and Electronic Circuits",
    credits: 4,
    level: "Foundation",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Review of R, C, L, Nodal/Mesh Analysis, Thevenin/Norton" },
      { week: "Week 2", topics: "DC and AC, phasors, complex impedance" },
      { week: "Week 3", topics: "Laplace/frequency domain" },
      { week: "Week 4", topics: "Frequency response, Bode plots, poles and zeros" },
      { week: "Week 5", topics: "RLC circuits, Quality factor" },
      { week: "Week 6", topics: "Complex power, 3-phase systems" },
      { week: "Week 7", topics: "Linear two port networks and network theorems" },
      { week: "Week 8", topics: "Non-linear elements - diodes and transistors" },
    ],
  },
  {
    id: "EE1105",
    name: "Electronics Laboratory",
    credits: 3,
    level: "Foundation",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Two-port networks" },
      { week: "Week 2", topics: "Resonant networks, frequency response" },
      { week: "Week 3", topics: "Time-domain response of first order systems" },
      { week: "Week 4", topics: "Nonlinear device characterization" },
      { week: "Week 5", topics: "Logic gates" },
      { week: "Week 6", topics: "Functional circuits" },
      { week: "Week 7", topics: "Datapath and control circuits" },
      { week: "Week 8", topics: "Sequential circuits" },
    ],
  },
  {
    id: "CS2101",
    name: "Embedded C Programming",
    credits: 6,
    level: "Foundation",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Types of microcontrollers; memory, interfacing" },
      { week: "Week 2", topics: "Memory maps; peripheral interfacing; register mapping" },
      { week: "Week 3", topics: "Typical data structures for embedded systems" },
      { week: "Week 4", topics: "General purpose IO, low speed interfaces" },
      { week: "Week 5", topics: "Bus interfaces: UART, SPI, I2C" },
      { week: "Week 6", topics: "Human-Computer Interaction; keyboard, touchscreen" },
      { week: "Week 7", topics: "High performance IO; buffering, DMA; USB" },
      { week: "Week 8", topics: "Real-time operating systems; scheduling; FreeRTOS" },
      { week: "Week 9", topics: "Video interfaces" },
      { week: "Week 10", topics: "System-level design, integration; SoC concepts" },
    ],
  },

  // --- DIPLOMA: PROGRAMMING ---
  {
    id: "BSCS2001",
    name: "Database Management Systems",
    credits: 4,
    level: "Diploma",
    category: "Programming",
    syllabus: [
      { week: "Week 1", topics: "Course Overview" },
      { week: "Week 2", topics: "Relational Model and Basic SQL" },
      { week: "Week 3", topics: "Intermediate and Advanced SQL" },
      { week: "Week 4", topics: "Relational Query Languages and Database Design" },
      { week: "Week 5", topics: "Data Warehousing and Data Mining" },
      { week: "Week 6", topics: "Transactions and Concurrency Control" },
      { week: "Week 7", topics: "Database Recovery Techniques" },
      { week: "Week 8", topics: "Database Security and Integrity" },
      { week: "Week 9", topics: "Distributed Databases" },
      { week: "Week 10", topics: "Object-Oriented and Object-Relational Databases" },
      { week: "Week 11", topics: "XML and Web Databases" },
      { week: "Week 12", topics: "Summary and Advanced Topics" },
    ],
  },
  {
    id: "BSCS2002",
    name: "Programming, Data Structures and Algorithms using Python",
    credits: 4,
    level: "Diploma",
    category: "Programming",
    syllabus: [
      { week: "Week 1", topics: "Python Refresher" },
      { week: "Week 2", topics: "Complexity, Notations, Sorting and Searching Algorithms" },
      { week: "Week 3", topics: "Arrays, Lists, Stacks, Queues, Hashing" },
      { week: "Week 4", topics: "Graph Algorithms" },
      { week: "Week 5", topics: "Graph Algorithms (Continued)" },
      { week: "Week 6", topics: "Union-Find, Priority Queue, Heap, BST" },
      { week: "Week 7", topics: "Balanced Search Tree, Greedy Algorithms" },
      { week: "Week 8", topics: "Divide and Conquer" },
      { week: "Week 9", topics: "Dynamic Programming" },
      { week: "Week 10", topics: "String or Pattern Matching Algorithms" },
      { week: "Week 11", topics: "Network Flows, Linear Programming" },
      { week: "Week 12", topics: "Summary" },
    ],
  },
  {
    id: "BSCS2003",
    name: "Modern Application Development I",
    credits: 4,
    level: "Diploma",
    category: "Programming",
    syllabus: [
      { week: "Week 1", topics: "Basic terminologies of Web" },
      { week: "Week 2", topics: "Webpages written in HTML and CSS" },
      { week: "Week 3", topics: "Presentation layer - View" },
      { week: "Week 4", topics: "Models - Introduction to databases" },
      { week: "Week 5", topics: "Controllers - Business logic" },
      { week: "Week 6", topics: "APIs and REST APIs" },
      { week: "Week 7", topics: "Backend Systems" },
      { week: "Week 8", topics: "Application Frontend" },
      { week: "Week 9", topics: "Application Security" },
      { week: "Week 10", topics: "Testing of Web Applications" },
      { week: "Week 11", topics: "HTML Evolution and Beyond HTML" },
      { week: "Week 12", topics: "Application Deployment" },
    ],
  },
  {
    id: "BSCS2005",
    name: "Programming Concepts using Java",
    credits: 4,
    level: "Diploma",
    category: "Programming",
    syllabus: [
      { week: "Week 1", topics: "OOP: Class Hierarchy" },
      { week: "Week 2", topics: "OOP: Inheritance, Overriding" },
      { week: "Week 3", topics: "OOP: Polymorphism" },
      { week: "Week 4", topics: "OOP: Abstract Classes" },
      { week: "Week 5", topics: "Collections, Iterators" },
      { week: "Week 6", topics: "Generics, Callbacks" },
      { week: "Week 7", topics: "Cloning, I/O serializations, Packages" },
      { week: "Week 8", topics: "Cloning, I/O serializations, Packages (Continued)" },
      { week: "Week 9", topics: "Exception handling" },
      { week: "Week 10", topics: "Concurrent programming" },
      { week: "Week 11", topics: "Concurrent programming (Continued)" },
      { week: "Week 12", topics: "Concurrent programming (Continued)" },
    ],
  },
  {
    id: "BSCS2006",
    name: "Modern Application Development II",
    credits: 4,
    level: "Diploma",
    category: "Programming",
    syllabus: [
      { week: "Week 1", topics: "Basics of JavaScript" },
      { week: "Week 2", topics: "Advanced JavaScript" },
      { week: "Week 3", topics: "Introduction to Web Frontend" },
      { week: "Week 4", topics: "Introduction to VueJS" },
      { week: "Week 5", topics: "Vue with APIs" },
      { week: "Week 6", topics: "Advanced Vuejs" },
      { week: "Week 7", topics: "Advanced State Management" },
      { week: "Week 8", topics: "Authentication and Designing APIs" },
      { week: "Week 9", topics: "Asynchronous Jobs" },
      { week: "Week 10", topics: "Inter-Service Messaging and Webhooks" },
      { week: "Week 11", topics: "Performance" },
      { week: "Week 12", topics: "Project" },
    ],
  },
  {
    id: "BSSE2001",
    name: "System Commands",
    credits: 3,
    level: "Diploma",
    category: "Programming",
    syllabus: [
      { week: "Week 1", topics: "Intro to GNU/Linux, Command line, Hardware info" },
      { week: "Week 2", topics: "Package management (apt), File permissions, Environment variables" },
      { week: "Week 3", topics: "Shell variables, Links (Symbolic/Hard), Root file system" },
      { week: "Week 4", topics: "Redirection, Regex (grep), Find, Editors (nano/vi), Bash scripts" },
      { week: "Week 5", topics: "Filters: head, tail, cut, paste, sort, uniq" },
      { week: "Week 6", topics: "Advanced Regex with sed and awk" },
      { week: "Week 7", topics: "Process Management and Networking Commands" },
      { week: "Week 8", topics: "Bash Scripting - Logic, Loops, Functions" },
    ],
  },
  // --- DIPLOMA: DATA SCIENCE ---
  {
    id: "BSCS2004",
    name: "Machine Learning Foundations",
    credits: 4,
    level: "Diploma",
    category: "Data Science",
    syllabus: [
      { week: "Week 1", topics: "Introduction to machine learning" },
      { week: "Week 2", topics: "Calculus for ML" },
      { week: "Week 3", topics: "Linear Algebra - Least Squares Regression" },
      { week: "Week 4", topics: "Linear Algebra - Eigenvalues and eigenvectors" },
      { week: "Week 5", topics: "Linear Algebra - Symmetric matrices" },
      { week: "Week 6", topics: "SVD, Principal Component Analysis (PCA)" },
      { week: "Week 7", topics: "Unconstrained Optimisation" },
      { week: "Week 8", topics: "Convex sets, functions, and optimisation problems" },
      { week: "Week 9", topics: "Constrained Optimisation, Lagrange Multipliers" },
      { week: "Week 10", topics: "Probabilistic models in ML" },
      { week: "Week 11", topics: "Exponential Family of distributions" },
      { week: "Week 12", topics: "Parameter estimation, Expectation Maximization" },
    ],
  },
  {
    id: "BSMS2001",
    name: "Business Data Management",
    credits: 4,
    level: "Diploma",
    category: "Data Science",
    syllabus: [
      { week: "Week 1", topics: "Micro & Macro economics: production, consumption, data sources" },
      { week: "Week 2", topics: "Utility, Demand/Supply curves, Cost curves, Make vs buy" },
      { week: "Week 3", topics: "Firm level strategies, Key ratios (Case studies: TCS, Nestle)" },
      { week: "Week 4", topics: "Industry level data: IIP, PMI, Porter's five forces" },
      { week: "Week 5", topics: "Case study 1 (Fabmart): E-Commerce metrics, Pareto analysis" },
      { week: "Week 6", topics: "Fabmart continued: Supply chain, inventory, stockouts" },
      { week: "Week 7", topics: "Case study 2 (Ace Gears): Manufacturing, Revenue trend, Portfolio" },
      { week: "Week 8", topics: "Ace Gears continued: Production scheduling, Profitability" },
      { week: "Week 9", topics: "Case study 3 (Tech Enterprises): HR data, Sourcing, Recruitment" },
      { week: "Week 10", topics: "Case study 4 (PayBuddy): FinTech, Payment processing, Targeting" },
      { week: "Week 11", topics: "PayBuddy continued: A/B testing, Credit risk, Risk-return" },
      { week: "Week 12", topics: "Student acquired data sets, Course project wrap up" },
    ],
  },
  {
    id: "BSCS2007",
    name: "Machine Learning Techniques",
    credits: 4,
    level: "Diploma",
    category: "Data Science",
    syllabus: [
      { week: "Week 1", topics: "Unsupervised Learning - Representation learning - PCA" },
      { week: "Week 2", topics: "Unsupervised Learning - Kernel PCA" },
      { week: "Week 3", topics: "Clustering - K-means/Kernel K-means" },
      { week: "Week 4", topics: "Estimation (MLE + Bayesian), Gaussian Mixture Model - EM" },
      { week: "Week 5", topics: "Supervised Learning - Regression - Least Squares; Bayesian view" },
      { week: "Week 6", topics: "Regression - Ridge/LASSO" },
      { week: "Week 7", topics: "Classification - K-NN, Decision tree" },
      { week: "Week 8", topics: "Generative Models - Naive Bayes" },
      { week: "Week 9", topics: "Discriminative Models - Perceptron; Logistic Regression" },
      { week: "Week 10", topics: "Support Vector Machines" },
      { week: "Week 11", topics: "Ensemble methods - Bagging and Boosting (Adaboost)" },
      { week: "Week 12", topics: "Artificial Neural networks: Multiclass classification" },
    ],
  },
  {
    id: "BSCS2008",
    name: "Machine Learning Practice",
    credits: 4,
    level: "Diploma",
    category: "Data Science",
    syllabus: [
      { week: "Week 1", topics: "End-to-end machine learning project on scikit-learn" },
      { week: "Week 2", topics: "Graph Theory (VOL 3)" },
      { week: "Week 3", topics: "Regression on scikit-learn - Linear, Gradient descent" },
      { week: "Week 4", topics: "Polynomial regression, Regularized models" },
      { week: "Week 5", topics: "Logistic regression" },
      { week: "Week 6", topics: "Classification on scikit-learn - Binary classifier" },
      { week: "Week 7", topics: "Classification on scikit-learn - Multiclass classifier" },
      { week: "Week 8", topics: "Support Vector Machines using scikit-learn" },
      { week: "Week 9", topics: "Decision Trees, Ensemble Learning and Random Forests" },
      { week: "Week 10", topics: "Decision Trees (Continued)" },
      { week: "Week 11", topics: "Neural networks models in scikit-learn" },
      { week: "Week 12", topics: "Unsupervised learning" },
    ],
  },
  {
    id: "BSSE2002",
    name: "Tools in Data Science",
    credits: 3,
    level: "Diploma",
    category: "Data Science",
    syllabus: [
      { week: "Week 1", topics: "Development Tools: IDEs, Version Control (Git/GitHub)" },
      { week: "Week 2", topics: "Model Building Tools: Jupyter, Colab, Virtual Environments" },
      { week: "Week 3", topics: "Deployment Tools: Streamlit, Flask, Docker Basics" },
      { week: "Week 4", topics: "Large Language Models (LLMs) & APIs" },
      { week: "Week 5", topics: "Data Sourcing: Web Scraping, APIs, Databases" },
      { week: "Week 6", topics: "Data Preparation: Cleaning, Transformation, Pandas" },
      { week: "Week 7", topics: "Data Analysis: Exploratory Data Analysis (EDA)" },
      { week: "Week 8", topics: "Data Visualization: Matplotlib, Seaborn, Storytelling" },
      { week: "Week 9", topics: "Advanced Visualization: Plotly, Interactive Dashboards" },
      { week: "Week 10", topics: "Project Structure and Best Practices" },
      { week: "Week 11", topics: "Case Study: End-to-End Data Science Pipeline" },
      { week: "Week 12", topics: "Final Project Review and Presentation" },
    ],
  },
  {
    id: "BSMS2002",
    name: "Business Analytics",
    credits: 4,
    level: "Diploma",
    category: "Data Science",
    syllabus: [
      { week: "Week 1", topics: "Data dashboarding, Insights from data summary" },
      { week: "Week 2", topics: "Summarizing data for insights" },
      { week: "Week 3", topics: "Preference analysis (Cities vs Brands)" },
      { week: "Week 4", topics: "Predicting stock returns – Regression basics" },
      { week: "Week 5", topics: "Regression diagnostics - Path variables" },
      { week: "Week 6", topics: "Logistic Regression - Classification problems" },
      { week: "Week 7", topics: "Repeated measures ANOVA (Ad impact)" },
      { week: "Week 8", topics: "Time series modeling" },
      { week: "Week 9", topics: "Advanced Time Series Analysis" },
      { week: "Week 10", topics: "Decision Trees for Business" },
      { week: "Week 11", topics: "Clustering for Market Segmentation" },
      { week: "Week 12", topics: "Business Analytics Capstone" },
    ],
  },
  {
    id: "BSDA2001",
    name: "Deep Learning and Generative AI",
    credits: 4,
    level: "Diploma",
    category: "Data Science",
    syllabus: [
      { week: "Week 1", topics: "ANN Theory: Neurons, Layers, Activation functions" },
      { week: "Week 2", topics: "ANN Practice: TensorFlow/Keras basics" },
      { week: "Week 3", topics: "CNN Theory: Architecture, Convolution, Pooling" },
      { week: "Week 4", topics: "CNN Practice: Image classification (MNIST, CIFAR-10)" },
      { week: "Week 5", topics: "Sequential Data Theory: RNNs, LSTMs" },
      { week: "Week 6", topics: "Sequential Data Practice: Sentiment analysis, Text generation" },
      { week: "Week 7", topics: "GenAI Theory: Autoencoders, VAEs, GANs" },
      { week: "Week 8", topics: "GenAI Theory: Diffusion Models" },
      { week: "Week 9", topics: "GenAI Practice: Image generation" },
      { week: "Week 10", topics: "LLMs: Transformer Architecture, Attention, Tokenization" },
      { week: "Week 11", topics: "LLMs: BERT, Decoders, Machine Translation, Fine-Tuning" },
      { week: "Week 12", topics: "LLMs Practice: Prompting, Prompt Fine-tuning" },
    ],
  },
  // --- DIPLOMA: ELECTRONIC SYSTEMS ---
  {
    id: "CS2102",
    name: "Introduction to Python",
    credits: 4,
    level: "Diploma",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Introduction to algorithms" },
      { week: "Week 2", topics: "Conditionals" },
      { week: "Week 3", topics: "Conditionals (Continued)" },
      { week: "Week 4", topics: "Iterations and Ranges" },
      { week: "Week 5", topics: "Iterations and Ranges (Continued)" },
      { week: "Week 6", topics: "Basic Collections in Python" },
      { week: "Week 7", topics: "Basic Collections Python(Continued)" },
      { week: "Week 8", topics: "Basic Collections Python(Continued)" },
      { week: "Week 9", topics: "File Operations" },
      { week: "Week 10", topics: "File Operations (Continued)" },
      { week: "Week 11", topics: "Module system in python" },
      { week: "Week 12", topics: "Basic Pandas and Numpy processing of data" },
    ],
  },
  {
    id: "MA2101",
    name: "Math for Electronics II",
    credits: 4,
    level: "Diploma",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Introduction, Real and complex numbers, Vectors, Linear equations" },
      { week: "Week 2", topics: "Linear Transformations, Matrix representation, Range, Null, Rank" },
      { week: "Week 3", topics: "Range/Null space, Eigenvalues, Eigenvectors, Diagonalization" },
      { week: "Week 4", topics: "Inner product, Orthogonality, Adjoint of an operator, Least square fit" },
      { week: "Week 5", topics: "Vector spaces in R^n and C^n, Linear Transformations (Higher dimensions)" },
      { week: "Week 6", topics: "Matrix Algebra, Determinants, Diagonalizability, Upper Triangularization" },
      { week: "Week 7", topics: "Inner Product Spaces, Orthonormal basis, Gram-schmidt, Projections" },
      { week: "Week 8", topics: "Operators in Inner product spaces, Self adjoint operators" },
      { week: "Week 9", topics: "Conics in 2D, Quadratic forms, Positive semi-definite matrices" },
      { week: "Week 10", topics: "Circulant Matrices, Discrete Fourier Transform (DFT)" },
      { week: "Week 11", topics: "Sequence and Function spaces, Fourier Series" },
      { week: "Week 12", topics: "Course Summary" },
    ],
  },
  {
    id: "EE2101",
    name: "Signals and Systems",
    credits: 5,
    level: "Diploma",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Introduction to signals, Signal representation and analysis" },
      { week: "Week 2", topics: "Adding and subtracting signals, complex-valued signals, phasors" },
      { week: "Week 3", topics: "Symmetry, Orthogonal signals, periodicity, Energy and Power" },
      { week: "Week 4", topics: "Dirac delta signal, energy signal, power signal" },
      { week: "Week 5", topics: "Introduction to systems, LTI systems, Convolution" },
      { week: "Week 6", topics: "Properties of convolution, Unit step response" },
      { week: "Week 7", topics: "Fourier Analysis, Fourier series and properties" },
      { week: "Week 8", topics: "Parseval's theorem, Dirchilet's conditions" },
      { week: "Week 9", topics: "Fourier Transform, Uncertainty principle, Duality" },
      { week: "Week 10", topics: "Fourier transform in LTI systems, Ideal Low pass filter" },
      { week: "Week 11", topics: "Laplace Transform, ROC, Pole-Zero plots, Bode Plot" },
      { week: "Week 12", topics: "Properties of Laplace Transform, Circuit Analysis" },
    ],
  },
  {
    id: "EE2102",
    name: "Analog Electronic Systems",
    credits: 4,
    level: "Diploma",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Feedback Circuit, Negative Feedback, Op-Amp, Non Inverting Amplifier" },
      { week: "Week 2", topics: "Op-Amp as VCVS/CCVS, Differential Circuit, Current Source" },
      { week: "Week 3", topics: "Single/Dual Supply Operation, Coupling Capacitor, Offset Voltage" },
      { week: "Week 4", topics: "ADC, Bandgap Voltage Reference, Schmitt Trigger, Integrator" },
      { week: "Week 5", topics: "Filters: First Order LPF/HPF, Second Order Filter" },
      { week: "Week 6", topics: "Second Order BPF/LPF, Input Offset Current Compensation" },
      { week: "Week 7", topics: "Two/Third Stage Forward Amplifier, Bode Plots" },
      { week: "Week 8", topics: "Bluetooth Headset: Block Diagram, Subsystems" },
      { week: "Week 9", topics: "Charging Subsystem, Battery Charging Profile, LiPo Charger" },
      { week: "Week 10", topics: "Voltage Regulators - Linear Regulators" },
      { week: "Week 11", topics: "Voltage Regulators - Switching Regulators" },
      { week: "Week 12", topics: "Audio Amplifiers - Basic Principles and Efficiency" },
    ],
  },
  {
    id: "EE2104",
    name: "Analog Electronics Laboratory",
    credits: 3,
    level: "Diploma",
    category: "Electronic Systems",
    syllabus: [
      { week: "Module 1", topics: "Ramp Generator" },
      { week: "Module 2", topics: "Single Ended- to differential input converter and PWM Modulator" },
      { week: "Module 3", topics: "H-Bridge Driver and Integration" },
      { week: "Module 4", topics: "Bandpass Filter" },
      { week: "Module 5", topics: "Adder" },
      { week: "Module 6", topics: "Top Level Integration" },
    ],
  },
  {
    id: "EE3101",
    name: "Digital Signal Processing",
    credits: 5,
    level: "Diploma",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Review of Signals and Systems: Discrete time signals, LTI systems" },
      { week: "Week 2", topics: "Review Continued: LCCDE, Impulse response, Convolution" },
      { week: "Week 3", topics: "Sampling: Impulse train, Reconstruction, Aliasing" },
      { week: "Week 4", topics: "Sampling Continued: Discrete-time processing of continuous-time signals" },
      { week: "Week 5", topics: "DTFT: Definition, Properties, Relationship to CTFS" },
      { week: "Week 6", topics: "DTFT Continued" },
      { week: "Week 7", topics: "Z-Transform: ROC, Properties, Inverse Z-Transform, Pole-zero plots" },
      { week: "Week 8", topics: "Z-Transform Continued" },
      { week: "Week 9", topics: "Frequency Domain Analysis: Rational transfer function, Magnitude/Phase response" },
      { week: "Week 10", topics: "Frequency Domain Analysis Continued: Linear phase FIR filters" },
      { week: "Week 11", topics: "DFT: Definition, Properties, Circular convolution, FFT algorithm" },
      { week: "Week 12", topics: "DFT Continued: Decimation-in-time/frequency algorithms" },
    ],
  },
  {
    id: "EE2103",
    name: "Digital System Design",
    credits: 4,
    level: "Diploma",
    category: "Electronic Systems",
    syllabus: [
      { week: "Module 1", topics: "Foundations of HDL and FPGA Design: Verilog, FPGA concepts" },
      { week: "Module 2", topics: "Advanced Verilog and Design Techniques: FSM, Timing analysis" },
      { week: "Module 3", topics: "CPU Design: Datapath and control unit" },
      { week: "Module 4", topics: "System Integration: Memory systems, peripheral interfaces" },
      { week: "Module 5", topics: "Advanced Topics: Design for testability, debugging" },
      { week: "Module 6", topics: "System-on-Chip Concepts: SoC architectures, IP cores" },
    ],
  },
  {
    id: "EE3103",
    name: "Sensors and Applications",
    credits: 4,
    level: "Diploma",
    category: "Electronic Systems",
    syllabus: [
      { week: "Module 1", topics: "Sensors: Types and characteristics" },
      { week: "Module 2", topics: "Mechanical and acoustic sensors: Strain gauges, pressure sensors" },
      { week: "Module 3", topics: "Magnetic and Electric field sensors: Hall-effect, Fluxgate" },
      { week: "Module 4", topics: "Light-sensitive sensors: Photodiodes, CCDs, Fiber-optic" },
      { week: "Module 5", topics: "Thermal sensors: Thermistors, Thermocouples" },
      { week: "Module 6", topics: "Interface electronics: Noise analysis, A/D conversion" },
      { week: "Module 7", topics: "Sensor systems: Sensor networks, Automotive/Medical applications" },
    ],
  },
  {
    id: "EE3104",
    name: "Sensors and Applications Lab",
    credits: 3,
    level: "Diploma",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Temperature sensor based on RTD and Thermistor" },
      { week: "Week 2", topics: "Linearization of Thermistor output" },
      { week: "Week 3", topics: "Photoplethysmograph (PPG): Signal acquisition" },
      { week: "Week 4", topics: "PPG: Signal processing and Heart Rate estimation" },
      { week: "Week 5", topics: "Accelerometer: Activity detection from cell phone data" },
      { week: "Week 6", topics: "Capacitance measurement and Touch switch" },
    ],
  },
  {
    id: "EE3102",
    name: "Control Engineering",
    credits: 4,
    level: "Diploma",
    category: "Electronic Systems",
    syllabus: [
      { week: "Module 1", topics: "Temperature sensor based on RTD and Thermistor" },
      { week: "Module 2", topics: "Linearization of Thermistor output" },
      { week: "Module 3", topics: "Photoplethysmography (PPG)" },
      { week: "Module 4", topics: "PPG Signal Processing" },
      { week: "Module 5", topics: "Accelerometer Data Processing" },
      { week: "Module 6", topics: "Capacitance Measurement" },
    ],
  },

  // --- DEGREE LEVEL: CORE ---
  {
    id: "BSCS3001",
    name: "Software Engineering",
    credits: 4,
    level: "Degree",
    category: "Core",
    syllabus: [
      { week: "Week 1", topics: "Software Development Life Cycle, Waterfall, Iterative, Agile Methodologies" },
      { week: "Week 2", topics: "Requirements Engineering: Elicitation, Analysis, Use Cases, Validation" },
      { week: "Week 3", topics: "Software Design Principles, Architectural Styles, UML Diagrams" },
      { week: "Week 4", topics: "Object-Oriented Design, SOLID Principles, Design Patterns" },
      { week: "Week 5", topics: "Testing Strategies: Unit, Integration, System, User Acceptance Testing" },
      { week: "Week 6", topics: "Test Automation, CI/CD, Quality Metrics, Code Quality Tools" },
      { week: "Week 7", topics: "Code Review Practices, Refactoring Techniques, Technical Debt" },
      { week: "Week 8", topics: "Performance Analysis, Profiling, Scalability, Load Testing" },
      { week: "Week 9", topics: "Cloud Computing Models, Microservices Architecture, Containerization (Docker)" },
      { week: "Week 10", topics: "DevOps Practices, Infrastructure as Code, Monitoring and Logging" },
      { week: "Week 11", topics: "Security: Secure Coding, Authentication, Authorization, Vulnerability Assessment" },
      { week: "Week 12", topics: "Capstone Project, Best Practices, Risk Management, Future Trends" },
    ],
  },
  {
    id: "BSCS3002",
    name: "Software Testing",
    credits: 4,
    level: "Degree",
    category: "Core",
    syllabus: [
      { week: "Week 1", topics: "Testing Principles, Objectives, Test Levels (Unit, Integration, System, UAT)" },
      { week: "Week 2", topics: "Test Design: Boundary Value Analysis, Equivalence Partitioning, Decision Tables" },
      { week: "Week 3", topics: "Statement Coverage, Branch Coverage, Path Coverage, Coverage Metrics" },
      { week: "Week 4", topics: "Graph Representation of Code, Node/Edge Coverage, Finite State Machines" },
      { week: "Week 5", topics: "Design Integration Testing, Graph Coverage Criteria, Data/Control Flow Analysis" },
      { week: "Week 6", topics: "Logic Coverage, Specification Testing, Predicate and Clause Coverage" },
      { week: "Week 7", topics: "Active Clause Coverage (CACC, GACC, RACC), Making Clauses Determine Predicate" },
      { week: "Week 8", topics: "Mutation Testing: Operators, Source Code Mutation, Mutant Killing" },
      { week: "Week 9", topics: "Mutation Operators, Integration Testing with Mutations, Mutation Score" },
      { week: "Week 10", topics: "Symbolic Testing, Path Exploration, Constraint Solving, Tools" },
      { week: "Week 11", topics: "Concolic Execution: Combining Concrete and Symbolic Execution" },
      { week: "Week 12", topics: "SMT Solvers (Z3), Advanced Testing Methodologies, Future Trends" },
    ],
  },
  {
    id: "BSCS3003",
    name: "AI - Search Methods for Problem Solving",
    credits: 4,
    level: "Degree",
    category: "Core",
    syllabus: [
      { week: "Week 1", topics: "History of AI, Turing Test, Winograd Schema, Problem Definition" },
      { week: "Week 2", topics: "Search Spaces, DFS, BFS, Iterative Deepening, Uninformed Search Analysis" },
      { week: "Week 3", topics: "Heuristic Search, Hill Climbing, Local Optima, Simulated Annealing" },
      { week: "Week 4", topics: "Genetic Algorithms, Evolution and Selection, Ant Colony Optimization" },
      { week: "Week 5", topics: "Algorithm A*, Admissibility, Implementation, Comparison" },
      { week: "Week 6", topics: "Monotone Condition, Bidirectional Search, Sequence Alignment" },
      { week: "Week 7", topics: "Game Playing: Minimax, Alpha-beta Pruning, SSS*, Chess/Go" },
      { week: "Week 8", topics: "Automated Planning: Goal Stack, Partial Order Planning, Constraints" },
      { week: "Week 9", topics: "Problem Decomposition, Goal Trees, Algorithm AO*, Cost Estimation" },
      { week: "Week 10", topics: "Pattern-Directed Inference, Forward Chaining, RETE Algorithm" },
      { week: "Week 11", topics: "Constraint Processing (CSP), Backtracking, Arc Consistency, Waltz Algorithm" },
      { week: "Week 12", topics: "Integration of Search and Reasoning, Future Directions in AI" },
    ],
  },
  {
    id: "BSCS3004",
    name: "Deep Learning",
    credits: 4,
    level: "Degree",
    category: "Core",
    syllabus: [
      { week: "Week 1", topics: "History of Deep Learning, Perceptron Learning Algorithm, Neural Basics" },
      { week: "Week 2", topics: "Multilayer Perceptrons (MLPs), Representation Power, Gradient Descent" },
      { week: "Week 3", topics: "Feedforward Networks, Backpropagation Algorithm, Computational Graphs" },
      { week: "Week 4", topics: "Gradient Descent Variants: Momentum, Nesterov, Adam, RMSprop" },
      { week: "Week 5", topics: "Autoencoders, PCA Relationship, Denoising/Sparse/Contractive Autoencoders" },
      { week: "Week 6", topics: "Bias-Variance Tradeoff, Regularization (L1/L2, Dropout, Early Stopping)" },
      { week: "Week 7", topics: "Training Techniques: Batch Normalization, Initialization (Xavier, He)" },
      { week: "Week 8", topics: "CNNs: LeNet, AlexNet, VGGNet, GoogLeNet, ResNet Architectures" },
      { week: "Week 9", topics: "CNN Visualization, Deep Dream, Neural Style Transfer, Adversarial Examples" },
      { week: "Week 10", topics: "Recurrent Neural Networks (RNNs), Backpropagation Through Time" },
      { week: "Week 11", topics: "Gated Recurrent Units (GRUs), LSTMs, Bidirectional RNNs" },
      { week: "Week 12", topics: "Seq2Seq Models, Attention Mechanism, Transformers, Self-Attention" },
    ],
  },
  // --- DEGREE: ELECTRONIC SYSTEMS ---
  {
    id: "EE3105",
    name: "Electromagnetic Fields and Transmission Lines",
    credits: 4,
    level: "Degree",
    category: "Electronic Systems",
    syllabus: [
      { week: "Module 1", topics: "Introduction: Electromagnetic fields applications" },
      { week: "Module 2", topics: "Lossless Transmission Lines: Telegrapher’s equations, Reflection" },
      { week: "Module 3", topics: "Lossy transmission lines: Attenuation, Impedance matching, Smith’s charts" },
      { week: "Module 4", topics: "Maxwell’s equations and transmission line model equivalence" },
      { week: "Module 5", topics: "Maxwell’s equations deviations, Polarization, Interfaces" },
      { week: "Module 6", topics: "Signals in bounded media: Waveguides, Resonators" },
    ],
  },
  {
    id: "EE3102-D",
    name: "Embedded Linux and FPGAs",
    credits: 4,
    level: "Degree",
    category: "Electronic Systems",
    syllabus: [
      { week: "Module 1", topics: "Introduction to FPGA-SoC Hybrid Systems: Zynq architecture" },
      { week: "Module 2", topics: "Advanced FPGA Design Techniques: HLS, AXI interface" },
      { week: "Module 3", topics: "Linux on FPGA-SoC systems: Boot process, Device Tree" },
      { week: "Module 4", topics: "FPGA-Accelerated Computing: Hardware acceleration, DMA" },
      { week: "Module 5", topics: "Performance Analysis and Optimization" },
      { week: "Module 6", topics: "Real-time Systems and Hardware-Software Co-design" },
      { week: "Module 7", topics: "Advanced Linux and System Integration" },
    ],
  },
  {
    id: "EE4102",
    name: "Electronic Product Design",
    credits: 4,
    level: "Degree",
    category: "Electronic Systems",
    syllabus: [
      { week: "Module 1", topics: "Product design stages, Hardware/Software balance" },
      { week: "Module 2", topics: "BJT/MOSFET drives, Power supply design, Protection" },
      { week: "Module 3", topics: "Opamp circuits error budgeting, Analog signal processing" },
      { week: "Module 4", topics: "Inductor design, PWM, Bridge circuits, DSP basics" },
      { week: "Module 5", topics: "PI/PID controller design" },
      { week: "Module 6", topics: "Power loss, Thermal management, PCB layout, EMI/EMC" },
      { week: "Module 7", topics: "Testing, Validation, Reliability, Power consumption" },
      { week: "Module 8", topics: "Safety standards, Regulatory requirements" },
    ],
  },
  {
    id: "BSGN3001",
    name: "Strategies for Professional Growth",
    credits: 4,
    level: "Degree",
    category: "Electronic Systems",
    syllabus: [
      { week: "Week 1", topics: "Teamwork and Getting Along" },
      { week: "Week 2", topics: "Communication and Listening Skills" },
      { week: "Week 3", topics: "Cultivating a Growth Mindset" },
      { week: "Week 4", topics: "Leadership Lessons" },
      { week: "Week 5", topics: "Emotional Intelligence and Conflict Management" },
      { week: "Week 6", topics: "Systems Thinking" },
      { week: "Week 7", topics: "Engineering Sense" },
      { week: "Week 8", topics: "Fiscal and Economic Sense" },
      { week: "Week 9", topics: "Cross-cultural Understanding and Personal Grooming" },
      { week: "Week 10", topics: "Creativity and Thinking Skills" },
      { week: "Week 11", topics: "Presentation Skills" },
      { week: "Week 12", topics: "Summary" },
    ],
  },
  {
    id: "EE3107",
    name: "Analog Circuits",
    credits: 4,
    level: "Degree",
    category: "Electronic Systems",
    syllabus: [
      { week: "Module 1", topics: "Small-signal analysis, MOSFET I-V characteristics" },
      { week: "Module 2", topics: "Common source amplifier analysis" },
      { week: "Module 3", topics: "Large-signal characteristics" },
      { week: "Module 4", topics: "Negative feedback biasing" },
      { week: "Module 5", topics: "PMOS transistor amplifiers" },
      { week: "Module 6", topics: "Common Drain, Common Gate, Transimpedance amplifiers" },
      { week: "Module 7", topics: "Active loads, CMOS inverter" },
      { week: "Module 8", topics: "Differential Amplifiers" },
      { week: "Module 9", topics: "Frequency response, Compensation" },
      { week: "Module 10", topics: "Two-stage opamp, Dominant pole compensation" },
      { week: "Module 11", topics: "BJT Amplifiers" },
      { week: "Module 12", topics: "Noise in analog circuits" },
    ],
  },
  {
    id: "EE5102",
    name: "Digital IC Design",
    credits: 4,
    level: "Degree",
    category: "Electronic Systems",
    syllabus: [
      { week: "Module 1", topics: "CMOS Inverter, VTC" },
      { week: "Module 2", topics: "Resistance, Capacitance, Transient response" },
      { week: "Module 3", topics: "Power dissipation: Dynamic, Leakage" },
      { week: "Module 4", topics: "Combinational Circuit Design" },
      { week: "Module 5", topics: "Parasitic Delay, Logical Effort" },
      { week: "Module 6", topics: "Gate sizing and Buffering" },
      { week: "Module 7", topics: "Asymmetric/Skewed gates, Ratioed logic" },
      { week: "Module 8", topics: "Dynamic Gates, Domino logic, STA" },
      { week: "Module 9", topics: "Sequential circuits, Flip flops" },
      { week: "Module 10", topics: "Timing analysis, Setup/Hold time" },
      { week: "Module 11", topics: "Adders" },
      { week: "Module 12", topics: "Multipliers" },
    ],
  },
  {
    id: "EE5104",
    name: "Biomedical Electronic Systems",
    credits: 4,
    level: "Degree",
    category: "Electronic Systems",
    syllabus: [
      { week: "Module 1", topics: "Biopotential recording: ECG, EMG, EEG, Amplifiers, Noise" },
      { week: "Module 2", topics: "Electrical stimulation of cells: Nerve/Muscle, Safety" },
      { week: "Module 3", topics: "Implantable electronic devices: Wireless power/data, Safety" },
      { week: "Module 4", topics: "Cardiac electronic devices: Pacemakers, Defibrillators" },
      { week: "Module 5", topics: "Neural electronic implants: Cochlear, Brain, Retinal" },
    ],
  },
  {
    id: "EE5103",
    name: "Power Management for Electronic Systems",
    credits: 4,
    level: "Degree",
    category: "Electronic Systems",
    syllabus: [
      { week: "Module 1", topics: "Introduction to power management" },
      { week: "Module 2", topics: "Voltage Regulator: Linear and Switching" },
      { week: "Module 3", topics: "Linear Regulators and LDOs" },
      { week: "Module 4", topics: "Switching Regulators: Topologies, Control" },
      { week: "Module 5", topics: "Designing a buck converter" },
      { week: "Module 6", topics: "Power Management for Mobile System" },
      { week: "Module 7", topics: "Battery Chargers and Battery Management" },
      { week: "Module 8", topics: "Power Management for IoT Application" },
    ],
  },
  {
    id: "EE3106",
    name: "Semiconductor Devices and VLSI Technology",
    credits: 4,
    level: "Degree",
    category: "Electronic Systems",
    syllabus: [
      { week: "Module 1", topics: "Semiconductor physics, Energy bands, Carrier transport" },
      { week: "Module 2", topics: "PN junction diode, LEDs, Solar cells" },
      { week: "Module 3", topics: "MOS capacitor, MOSFET, CMOS inverter, BJTs" },
      { week: "Module 4", topics: "Semiconductor manufacturing, Unit processes, Fabrication flow" },
    ],
  },
  {
    id: "MA3101",
    name: "Probability and Statistics",
    credits: 4,
    level: "Degree",
    category: "Electronic Systems",
    syllabus: [
      { week: "Module 1", topics: "Probability space, Axioms, Bayes’ theorem" },
      { week: "Module 2", topics: "Discrete/Continuous Random Variables, Distributions, Expectations" },
      { week: "Module 3", topics: "Limit theorems: Law of large numbers, CLT" },
      { week: "Module 4", topics: "Estimation: MMSE, Bayesian, MLE" },
    ],
  },
  {
    id: "EE4108",
    name: "Electronic Testing and Measurement",
    credits: 4,
    level: "Degree",
    category: "Electronic Systems",
    syllabus: [
      { week: "Module 1", topics: "Introduction to Electronic Testing" },
      { week: "Module 2", topics: "Digital Circuit Testing" },
      { week: "Module 3", topics: "Test Equipment and Measurement Techniques" },
      { week: "Module 4", topics: "Analog & Mixed-Signal Testing" },
      { week: "Module 5", topics: "Memory Testing" },
      { week: "Module 6", topics: "System Testing & Debugging" },
      { week: "Module 7", topics: "Semiconductor & IC Testing" },
      { week: "Module 8", topics: "Automated Test & Data Analysis" },
    ],
  },

  // --- DEGREE LEVEL: ELECTIVES ---
  {
    id: "BSDA5004",
    name: "Large Language Models",
    credits: 4,
    level: "Degree",
    category: "Elective",
    syllabus: [
      { week: "Week 1", topics: "Transformers Architecture, Self/Cross Attention, Encoder-Decoder" },
      { week: "Week 2", topics: "Parameters, FLOPs, Language Modeling Objectives, Perplexity" },
      { week: "Week 3", topics: "Causal Language Modeling, GPT Family, Generation Strategies" },
      { week: "Week 4", topics: "Masked Language Modeling, BERT, Fine-tuning, Tokenization (BPE)" },
      { week: "Week 5", topics: "T5, Text-to-Text, Prompting Genesis, Model Taxonomy" },
      { week: "Week 6", topics: "Datasets (C4, Pile), Data Pipelines, Positional Encoding, Scaling" },
      { week: "Week 7", topics: "Training: Optimizers (LION), Loss Functions, Gradient Clipping" },
      { week: "Week 8", topics: "Fine Tuning: Prompt Tuning, PEFT, LoRA, Instruction Tuning" },
      { week: "Week 9", topics: "Benchmarks (MMLU, HELM, BigBench) & Evaluation Metrics" },
      { week: "Week 10", topics: "Training at Scale: Mixed Precision, 3D Parallelism, ZeRO" },
      { week: "Week 11", topics: "Scaling Laws (Chinchilla, Gopher, PaLM), Compute-Optimality" },
      { week: "Week 12", topics: "Recent Advances: Multimodal LLMs, Chain-of-Thought, Future Directions" },
    ],
  },
  {
    id: "BSDA5005",
    name: "Introduction to Natural Language Processing",
    credits: 4,
    level: "Degree",
    category: "Elective",
    syllabus: [
      { week: "Week 1", topics: "Linguistic Fundamentals, Levels of Language Processing, NLP Applications" },
      { week: "Week 2", topics: "Text Preprocessing: Tokenization, Stemming, Lemmatization, Stop Words" },
      { week: "Week 3", topics: "POS Tagging, Named Entity Recognition (NER), HMM, CRF" },
      { week: "Week 4", topics: "Syntax & Parsing (Constituency/Dependency), Semantic Role Labelling" },
      { week: "Week 5", topics: "Distributional Semantics: Word2Vec, GloVe, Discourse Processing" },
      { week: "Week 6", topics: "RNNs for NLP, LSTMs, Contextual Embeddings (ELMo)" },
      { week: "Week 7", topics: "Transformers, Self-Attention, Pre-trained Models (BERT, GPT)" },
      { week: "Week 8", topics: "Large Language Models, PEFT (LoRA), RLHF, In-context Learning" },
      { week: "Week 9", topics: "Natural Language Generation, Decoding Schemes (Greedy, Beam, Sampling)" },
      { week: "Week 10", topics: "Applications: QA, Summarization, NLI, Retrieval Augmented Generation (RAG)" },
      { week: "Week 11", topics: "Model Explainability, Attention Visualization, Interpretability Methods" },
      { week: "Week 12", topics: "Ethical Considerations, Bias, Fairness, Toxicity, Responsible AI" },
    ],
  },
  {
    id: "BSDA5006",
    name: "Deep Learning for Computer Vision",
    credits: 4,
    level: "Degree",
    category: "Elective",
    syllabus: [
      { week: "Week 1", topics: "Image Formation, Linear Filtering: Correlation and Convolution" },
      { week: "Week 2", topics: "Visual Features: Edge/Corner Detection, SIFT, HoG, Scale Space" },
      { week: "Week 3", topics: "Visual Matching, Bag-of-Words, Optical Flow, RANSAC" },
      { week: "Week 4", topics: "Deep Learning Review: MLPs, Backpropagation, Activation Functions" },
      { week: "Week 5", topics: "CNN Architectures: AlexNet, VGG, Inception, ResNet, DenseNet" },
      { week: "Week 6", topics: "Visualization: Class Activation Maps (CAM), Style Transfer, Deep Dream" },
      { week: "Week 7", topics: "Detection (YOLO, R-CNN, SSD) & Segmentation (U-Net, Mask-RCNN)" },
      { week: "Week 8", topics: "RNNs for Video, Spatio-temporal Models, Action Recognition" },
      { week: "Week 9", topics: "Attention Models, Visual Question Answering, Vision Transformers (ViT)" },
      { week: "Week 10", topics: "Generative Models: GANs, VAEs, Normalizing Flows" },
      { week: "Week 11", topics: "GAN Variants (CycleGAN, Pix2Pix), Image Editing, Superresolution" },
      { week: "Week 12", topics: "Few-shot Learning, Self-supervised Learning, Multimodal Learning" },
    ],
  },
  {
    id: "BSDA5007",
    name: "Reinforcement Learning",
    credits: 4,
    level: "Degree",
    category: "Elective",
    syllabus: [
      { week: "Week 1", topics: "Fundamentals of Reinforcement Learning" },
      { week: "Week 2", topics: "Markov Decision Processes (MDPs)" },
      { week: "Week 3", topics: "Value Iteration and Bellman Equations" },
      { week: "Week 4", topics: "Policy Iteration Algorithms" },
      { week: "Week 5", topics: "Q-Learning and SARSA" },
      { week: "Week 6", topics: "Exploration vs Exploitation Strategies" },
      { week: "Week 7", topics: "Deep Q-Networks (DQN)" },
      { week: "Week 8", topics: "Policy Gradient Methods" },
      { week: "Week 9", topics: "Actor-Critic Architectures" },
      { week: "Week 10", topics: "Advanced RL Topics: Model-based RL" },
      { week: "Week 11", topics: "RL Applications: Robotics, Games" },
      { week: "Week 12", topics: "Multi-agent Reinforcement Learning" },
    ],
  },
  {
    id: "BSDA5001",
    name: "Introduction to Big Data",
    credits: 4,
    level: "Degree",
    category: "Elective",
    syllabus: [
      { week: "Week 1", topics: "Big Data Concepts and Characteristics (Vs)" },
      { week: "Week 2", topics: "Introduction to Hadoop Ecosystem" },
      { week: "Week 3", topics: "HDFS (Hadoop Distributed File System) Architecture" },
      { week: "Week 4", topics: "MapReduce Programming Model" },
      { week: "Week 5", topics: "Apache Spark Fundamentals" },
      { week: "Week 6", topics: "Distributed Processing Frameworks" },
      { week: "Week 7", topics: "NoSQL Databases (Key-Value, Document, Columnar)" },
      { week: "Week 8", topics: "Data Warehousing Principles" },
      { week: "Week 9", topics: "Data Lakes and Modern Data Architecture" },
      { week: "Week 10", topics: "Streaming Data Concepts" },
      { week: "Week 11", topics: "Real-time Analytics and Processing" },
      { week: "Week 12", topics: "Big Data Applications and Case Studies" },
    ],
  },
  {
    id: "BSDA5002",
    name: "Mathematical Foundations of Generative AI",
    credits: 4,
    level: "Degree",
    category: "Elective",
    syllabus: [
      { week: "Week 1", topics: "Probability Theory Review" },
      { week: "Week 2", topics: "Information Theory Fundamentals" },
      { week: "Week 3", topics: "Divergence Measures (KL Divergence, JS Divergence)" },
      { week: "Week 4", topics: "Optimization Methods for GenAI" },
      { week: "Week 5", topics: "Variational Inference Principles" },
      { week: "Week 6", topics: "Advanced Variational Inference" },
      { week: "Week 7", topics: "Expectation-Maximization (EM) Algorithm" },
      { week: "Week 8", topics: "Graphical Models: Directed and Undirected" },
      { week: "Week 9", topics: "Learning in Graphical Models" },
      { week: "Week 10", topics: "Advanced Mathematical Concepts for Diffusion" },
      { week: "Week 11", topics: "Mathematics of Flow-based Models" },
      { week: "Week 12", topics: "Applied Examples and Case Studies" },
    ],
  },
  {
    id: "BSDA5003",
    name: "Algorithms for Data Science",
    credits: 4,
    level: "Degree",
    category: "Elective",
    syllabus: [
      { week: "Week 1", topics: "Fundamentals of Algorithmic Analysis" },
      { week: "Week 2", topics: "Advanced Sorting and Searching" },
      { week: "Week 3", topics: "Graph Algorithms for Data Science" },
      { week: "Week 4", topics: "Dynamic Programming Principles" },
      { week: "Week 5", topics: "Advanced Dynamic Programming Applications" },
      { week: "Week 6", topics: "Greedy Algorithms and Heuristics" },
      { week: "Week 7", topics: "Optimization Algorithms" },
      { week: "Week 8", topics: "Clustering Algorithms (K-means, Hierarchical)" },
      { week: "Week 9", topics: "Advanced Clustering and Dimensionality Reduction" },
      { week: "Week 10", topics: "Distributed Algorithms" },
      { week: "Week 11", topics: "Scalability and Efficiency in Big Data" },
      { week: "Week 12", topics: "Advanced Topics in Algorithmic Data Science" },
    ],
  },
  {
    id: "BSDA5014",
    name: "Machine Learning Operations (MLOps)",
    credits: 4,
    level: "Degree",
    category: "Elective",
    syllabus: [
      { week: "Week 1", topics: "Machine Learning Lifecycle Overview" },
      { week: "Week 2", topics: "Model Development Best Practices" },
      { week: "Week 3", topics: "Experimentation Tracking and Management" },
      { week: "Week 4", topics: "Automated Model Training Pipelines" },
      { week: "Week 5", topics: "Hyperparameter Tuning and AutoML" },
      { week: "Week 6", topics: "Model Selection and Evaluation Strategies" },
      { week: "Week 7", topics: "Model Serving Architectures" },
      { week: "Week 8", topics: "Deployment Strategies (Canary, Blue-Green)" },
      { week: "Week 9", topics: "Containerization with Docker and Kubernetes" },
      { week: "Week 10", topics: "Model Monitoring and Observability" },
      { week: "Week 11", topics: "CI/CD Pipelines for Machine Learning" },
      { week: "Week 12", topics: "Production Challenges and Governance" },
    ],
  },
  {
    id: "BSDA4001",
    name: "Data Science and AI Lab",
    credits: 4,
    level: "Degree",
    category: "Elective",
    syllabus: [
      { week: "Week 1", topics: "Data Collection and Acquisition" },
      { week: "Week 2", topics: "Data Cleaning and Preprocessing" },
      { week: "Week 3", topics: "Exploratory Data Analysis (EDA)" },
      { week: "Week 4", topics: "Advanced Data Visualization" },
      { week: "Week 5", topics: "Feature Engineering Techniques" },
      { week: "Week 6", topics: "Feature Selection and Dimensionality Reduction" },
      { week: "Week 7", topics: "Model Development and Baseline Creation" },
      { week: "Week 8", topics: "Model Training and Optimization" },
      { week: "Week 9", topics: "Model Evaluation Metrics and Validation" },
      { week: "Week 10", topics: "Hyperparameter Tuning and Refinement" },
      { week: "Week 11", topics: "Model Deployment and API Creation" },
      { week: "Week 12", topics: "Capstone Project and Real-world Application" },
    ],
  },
  {
    id: "BSMA3014",
    name: "Statistical Computing",
    credits: 4,
    level: "Degree",
    category: "Elective",
    syllabus: [
      { week: "Week 1", topics: "Fundamentals of Computational Statistics" },
      { week: "Week 2", topics: "Numerical Methods for Statistics - Part 1" },
      { week: "Week 3", topics: "Numerical Methods for Statistics - Part 2" },
      { week: "Week 4", topics: "Simulation Methods: Principles" },
      { week: "Week 5", topics: "Monte Carlo Methods: Basics" },
      { week: "Week 6", topics: "Advanced Monte Carlo Techniques" },
      { week: "Week 7", topics: "Resampling Methods Overview" },
      { week: "Week 8", topics: "Bootstrap Methods - Theory" },
      { week: "Week 9", topics: "Bootstrap Methods - Application" },
      { week: "Week 10", topics: "Optimization in Statistics" },
      { week: "Week 11", topics: "Statistical Software and Programming" },
      { week: "Week 12", topics: "Advanced Statistical Computing Techniques" },
    ],
  },
];

interface SyllabusTabProps {
  level: CourseLevel;
  branch: string;
  selectedCourseIds: string[];
}

const SyllabusTab: React.FC<SyllabusTabProps> = ({ level, branch, selectedCourseIds }) => {
  // Filter by Level and Branch
  const filteredCourses = useMemo(() => {
    return SYLLABUS_DATA.filter((course) => {
        if (course.level !== level) return false;
        
        // Branch filtering
        if (branch === "Electronic Systems") {
            return course.category === "Electronic Systems";
        } else {
            // Data Science Branch (includes Common, Programming, Data Science, Core, Elective)
            return course.category !== "Electronic Systems";
        }
    });
  }, [level, branch]);

  // If specific subjects are selected, filter by them. Otherwise show all matching level/branch.
  const coursesToDisplay = useMemo(() => {
    if (selectedCourseIds.length > 0) {
      return filteredCourses.filter(c => selectedCourseIds.includes(c.id));
    }
    return filteredCourses;
  }, [filteredCourses, selectedCourseIds]);

  const handlePrint = () => {
    window.print();
  };

  if (coursesToDisplay.length === 0) {
      return (
        <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/5">
          No courses found for the selected criteria.
        </div>
      );
  }

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #syllabus-print-container, #syllabus-print-container * {
              visibility: visible;
            }
            #syllabus-print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
              background: white;
            }
            .no-print {
              display: none !important;
            }
            .page-break {
              page-break-before: always;
            }
          }
        `}
      </style>

      {/* Header Actions - Viewable on Screen */}
      <div className="flex justify-end mb-4 no-print">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrint}
          className="flex items-center gap-2 text-primary border-primary/20 hover:bg-primary/5"
        >
          <Share2 className="w-4 h-4" />
          Share PDF
        </Button>
      </div>

      <div id="syllabus-print-container" className="space-y-8 font-sans">
        
        {/* Print Header */}
        <div className="hidden print:flex flex-col items-center justify-center mb-8 border-b pb-6">
          <img src="/lovable-uploads/logo_ui_new.png" alt="Logo" className="h-16 mb-2" />
          <h1 className="text-2xl font-bold text-gray-900">IITM BS Degree Preparation</h1>
          <p className="text-gray-500">Comprehensive Syllabus & Study Resources</p>
          <div className="mt-4 flex gap-3 text-sm text-gray-600">
            <span className="px-3 py-1 bg-gray-100 rounded-full">{level} Level</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">{branch}</span>
          </div>
        </div>

        {coursesToDisplay.map((currentCourse, index) => (
          <div key={currentCourse.id} className={index > 0 ? "print:mt-8" : ""}>
            <Card className="border-secondary/20 shadow-sm animate-in fade-in duration-300 break-inside-avoid">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-primary">{currentCourse.name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {currentCourse.id}
                      </span>
                      <span>• {currentCourse.credits} Credits</span>
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {currentCourse.level} {currentCourse.category !== "Common" ? `• ${currentCourse.category}` : ""}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-hidden rounded-b-lg border-t">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-[120px] font-semibold text-primary">Week/Module</TableHead>
                        <TableHead className="font-semibold text-primary">Topics Covered</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentCourse.syllabus.map((row, idx) => (
                        <TableRow
                          key={idx}
                          className="transition-colors hover:bg-muted/30 even:bg-muted/10"
                        >
                          <TableCell className="font-medium text-muted-foreground align-top">
                            {row.week}
                          </TableCell>
                          <TableCell className="text-foreground align-top leading-relaxed">
                            {row.topics}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Print Footer - Promotional Content */}
        <div className="hidden print:block mt-12 pt-8 border-t border-gray-200">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Accelerate Your Learning
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Access comprehensive study materials, exclusive batches, and expert guidance for your {level} level courses.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <BookOpen className="w-4 h-4 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-sm">Premium Batches</h4>
                  <p className="text-xs text-gray-500">Live classes & doubt clearing sessions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-sm">Mock Tests</h4>
                  <p className="text-xs text-gray-500">Weekly quizzes & exam simulations</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs font-medium text-gray-400">Visit our platform for more resources</p>
              <p className="text-sm font-bold text-primary">ui.dev/iitm-bs</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SyllabusTab;

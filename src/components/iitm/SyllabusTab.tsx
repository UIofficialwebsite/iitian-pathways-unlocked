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

// --- Data Definitions ---

export type WeekContent = {
  week: string;
  topics: string;
};

export type CourseLevel = "Qualifier" | "Foundation" | "Diploma" | "Degree";
export type CourseCategory = "Common" | "Programming" | "Data Science" | "Core" | "Elective";

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
  category: string;
  selectedCourseIds: string[];
}

const SyllabusTab: React.FC<SyllabusTabProps> = ({ level, category, selectedCourseIds }) => {
  // Filter by Level and Category first
  const filteredCourses = useMemo(() => {
    return SYLLABUS_DATA.filter((course) => {
        if (course.level !== level) return false;
        // For Diploma/Degree, check category. For Foundation/Qualifier, category is usually "Common"
        if (level === 'Diploma' || level === 'Degree') {
             if (course.category !== category) return false;
        }
        return true;
    });
  }, [level, category]);

  // If specific subjects are selected, filter by them. Otherwise show all matching level/category.
  const coursesToDisplay = useMemo(() => {
    if (selectedCourseIds.length > 0) {
      return filteredCourses.filter(c => selectedCourseIds.includes(c.id));
    }
    return filteredCourses;
  }, [filteredCourses, selectedCourseIds]);

  if (coursesToDisplay.length === 0) {
      return (
        <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/5">
          No courses found for the selected criteria.
        </div>
      );
  }

  return (
    <div className="space-y-8 font-sans">
      {coursesToDisplay.map(currentCourse => (
        <Card key={currentCourse.id} className="border-secondary/20 shadow-sm animate-in fade-in duration-300">
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
                  {currentCourse.syllabus.map((row, index) => (
                    <TableRow
                      key={index}
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
      ))}
    </div>
  );
};

export default SyllabusTab;

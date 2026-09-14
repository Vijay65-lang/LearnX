export interface W3Lesson {
  id: string;
  moduleId: string;
  title: string;
  readingTimeMin: number;
  content: string;
  codeSnippet?: {
    language: "python" | "javascript" | "sql" | "html";
    initialCode: string;
    description: string;
    expectedOutput?: string;
  };
  assessment: {
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: "A" | "B" | "C" | "D";
    explanation: string;
  };
}

export interface W3Module {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  lessons: W3Lesson[];
}

export interface W3Course {
  id: string;
  title: string;
  code: string;
  category: "Programming" | "Web Development" | "Computer Science" | "Database" | "Systems";
  educationLevel: "B.Tech" | "Degree" | "Intermediate" | "School" | "All";
  branchStream?: string;
  description: string;
  iconName: string;
  badgeColor: string;
  estimatedHours: number;
  modules: W3Module[];
}

export const ACADEMIC_COURSES: W3Course[] = [
  {
    id: "crs_py_01",
    title: "Python Programming (W3Schools Style)",
    code: "CS-PY101",
    category: "Programming",
    educationLevel: "All",
    branchStream: "Computer Science & All Engineering",
    description: "Learn Python from the ground up with interactive 'Try It Yourself' code sandboxes, clear syntax explanations, and real-world scripts.",
    iconName: "FileCode",
    badgeColor: "emerald",
    estimatedHours: 14,
    modules: [
      {
        id: "mod_py_01",
        title: "Python Basics & Syntax",
        description: "Variables, print formatting, data types, and user interaction.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_py_101",
            moduleId: "mod_py_01",
            title: "Python Syntax & Variables",
            readingTimeMin: 8,
            content: `### Welcome to Python!

Python is a high-level, interpreted programming language known for its clean syntax and readability. Unlike languages that use curly braces \`{}\`, Python relies on **indentation** to define blocks of code.

#### 1. Creating Variables
In Python, variables are created the moment you assign a value to them. There is no need for explicit type declaration:

\`\`\`python
# Creating variables
x = 5             # integer
student_name = "Vijay"  # string
gpa = 8.9         # float
is_enrolled = True # boolean
\`\`\`

#### 2. The \`print()\` Function
To display outputs in the console:
\`\`\`python
print("Hello, LearnX Student!")
print(f"Welcome {student_name}, your current GPA is {gpa}")
\`\`\`

#### Key Rules of Python:
* **Indentation Matters**: Use 4 spaces (or 1 tab) for code blocks.
* **Case Sensitive**: \`Name\` and \`name\` are two completely different variables.
* **Dynamic Typing**: You can reassign a variable to a different type at any time.`,
            codeSnippet: {
              language: "python",
              initialCode: `# Try it yourself!
name = "Vijay"
course = "Python Mastery"
score = 98

print("--- LearnX Student Card ---")
print(f"Student: {name}")
print(f"Enrolled in: {course}")
print(f"Progress Score: {score}%")

if score >= 90:
    print("Status: Eligible for Distinction Certificate! 🏆")
`,
              description: "Modify the variables and click 'Run Code' to execute Python in your browser.",
              expectedOutput: `--- LearnX Student Card ---
Student: Vijay
Enrolled in: Python Mastery
Progress Score: 98%
Status: Eligible for Distinction Certificate! 🏆`
            },
            assessment: {
              question: "How does Python determine scope or code blocks instead of using curly braces {}?",
              option_a: "Through strict semicolon endings (;) at every line",
              option_b: "Through consistent whitespace indentation",
              option_c: "Through explicit 'begin' and 'end' keywords",
              option_d: "Through variable name capitalization",
              correct_option: "B",
              explanation: "Python uses indentation (typically 4 spaces) to delimit code blocks, control statements, functions, and loops."
            }
          },
          {
            id: "les_py_102",
            moduleId: "mod_py_01",
            title: "Control Flow: If, Elif & Else",
            readingTimeMin: 10,
            content: `### Conditional Logic in Python

Conditions allow programs to make smart decisions based on variable values and boolean expressions.

#### Syntax:
\`\`\`python
if condition_1:
    # executed if condition_1 is True
elif condition_2:
    # executed if condition_2 is True
else:
    # executed if none of the above are True
\`\`\`

#### Logical Operators:
* \`and\` : Returns True if both statements are true.
* \`or\` : Returns True if at least one statement is true.
* \`not\` : Reverses the boolean result.`,
            codeSnippet: {
              language: "python",
              initialCode: `# W3Schools Style: Decision Making
marks = 85

if marks >= 90:
    grade = "A+"
elif marks >= 75:
    grade = "A"
elif marks >= 60:
    grade = "B"
else:
    grade = "Pass"

print(f"Marks scored: {marks}")
print(f"Assigned Grade: {grade}")
`,
              description: "Test different mark values to see how the conditional branches trigger.",
              expectedOutput: `Marks scored: 85
Assigned Grade: A`
            },
            assessment: {
              question: "What keyword is used in Python for 'else if' statements?",
              option_a: "else if",
              option_b: "elseif",
              option_c: "elif",
              option_d: "elsif",
              correct_option: "C",
              explanation: "Python combines 'else' and 'if' into the single keyword 'elif'."
            }
          }
        ]
      },
      {
        id: "mod_py_02",
        title: "Loops & Data Collections",
        description: "Master For loops, While loops, Lists, Tuples, and Dictionaries.",
        orderIndex: 2,
        lessons: [
          {
            id: "les_py_201",
            moduleId: "mod_py_02",
            title: "Python Lists & For Loops",
            readingTimeMin: 12,
            content: `### Lists & Iteration

Lists are ordered, mutable, and allow duplicate elements. They are one of the most versatile data structures in Python.

#### List Operations:
\`\`\`python
fruits = ["Apple", "Banana", "Cherry"]
fruits.append("Mango")       # Add to end
fruits.insert(0, "Orange")   # Insert at index 0
print(len(fruits))          # Length of list
\`\`\`

#### Iterating with \`for\` loops:
\`\`\`python
for fruit in fruits:
    print("I like", fruit)
\`\`\`

#### Using \`range()\`:
\`range(start, stop, step)\` generates a sequence of numbers:
\`\`\`python
for i in range(1, 6):
    print("Count:", i)
\`\`\``,
            codeSnippet: {
              language: "python",
              initialCode: `# Processing a student gradebook
subjects = ["Data Structures", "Web Dev", "DBMS", "Operating Systems"]
scores = [92, 88, 95, 90]

print("--- Semester Grade Summary ---")
for i in range(len(subjects)):
    print(f"• {subjects[i]}: {scores[i]}% / 100%")

avg = sum(scores) / len(scores)
print(f"\nOverall Average: {avg:.1f}%")
`,
              description: "Run the loop to calculate student semester performance.",
              expectedOutput: `--- Semester Grade Summary ---
• Data Structures: 92% / 100%
• Web Dev: 88% / 100%
• DBMS: 95% / 100%
• Operating Systems: 90% / 100%

Overall Average: 91.2%`
            },
            assessment: {
              question: "Which method is used to add a new element to the very end of an existing Python list?",
              option_a: "list.add()",
              option_b: "list.append()",
              option_c: "list.push()",
              option_d: "list.insert_last()",
              correct_option: "B",
              explanation: "In Python, the append() method adds an item to the end of the list, whereas push() is used in languages like JavaScript."
            }
          },
          {
            id: "les_py_202",
            moduleId: "mod_py_02",
            title: "Dictionaries & Key-Value Lookups",
            readingTimeMin: 10,
            content: `### Python Dictionaries

Dictionaries store data in **key:value** pairs. They are ordered, changeable, and do not allow duplicate keys.

\`\`\`python
student = {
    "name": "Vijay",
    "branch": "CSE",
    "year": "3rd Year",
    "gpa": 9.1
}

# Accessing values
print(student["name"])
print(student.get("branch"))

# Modifying and adding
student["semester"] = "1st Semester"
\`\`\`

#### Iterating Over Dictionaries:
\`\`\`python
for key, value in student.items():
    print(f"{key}: {value}")
\`\`\``,
            codeSnippet: {
              language: "python",
              initialCode: `# Working with key-value pairs
student_profile = {
    "Name": "Vijay",
    "College": "Raghu Engineering College",
    "Degree": "B.Tech CSE",
    "Status": "Active Learner"
}

for field, val in student_profile.items():
    print(f"{field} -> {val}")
`,
              description: "Inspect dictionary key-value iteration in Python.",
              expectedOutput: `Name -> Vijay
College -> Raghu Engineering College
Degree -> B.Tech CSE
Status -> Active Learner`
            },
            assessment: {
              question: "What will happen if you access a nonexistent key using dict['missing_key'] in Python?",
              option_a: "It returns None automatically",
              option_b: "It raises a KeyError exception",
              option_c: "It creates the key with an empty string",
              option_d: "It returns False",
              correct_option: "B",
              explanation: "Direct square bracket access raises a KeyError if the key is absent. To safely access without throwing an exception, use dict.get('missing_key')."
            }
          }
        ]
      },
      {
        id: "mod_py_03",
        title: "Functions & Modular Architecture",
        description: "Define reusable functions, parameters, return values, and lambda expressions.",
        orderIndex: 3,
        lessons: [
          {
            id: "les_py_301",
            moduleId: "mod_py_03",
            title: "Defining Functions & Scope",
            readingTimeMin: 12,
            content: `### Functions in Python

A function is a block of organized, reusable code used to perform a single, related action.

#### Defining with \`def\`:
\`\`\`python
def calculate_area(width, height):
    """Calculates the rectangle area."""
    return width * height

result = calculate_area(10, 5)
print("Area:", result)
\`\`\`

#### Default Parameter Values:
\`\`\`python
def greet_student(name, greeting="Welcome to LearnX"):
    return f"{greeting}, {name}!"
\`\`\`

#### Multiple Return Values:
Python functions can return multiple values bundled as a tuple:
\`\`\`python
def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([4, 1, 9, 7])
\`\`\``,
            codeSnippet: {
              language: "python",
              initialCode: `def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

test_nums = [2, 7, 10, 19, 21, 29]
print("--- Prime Number Tester ---")
for num in test_nums:
    status = "PRIME" if is_prime(num) else "COMPOSITE"
    print(f"Number {num}: {status}")
`,
              description: "Execute the prime checker function and examine the output.",
              expectedOutput: `--- Prime Number Tester ---
Number 2: PRIME
Number 7: PRIME
Number 10: COMPOSITE
Number 19: PRIME
Number 21: COMPOSITE
Number 29: PRIME`
            },
            assessment: {
              question: "What keyword is used to declare a function in Python?",
              option_a: "function",
              option_b: "def",
              option_c: "fun",
              option_d: "define",
              correct_option: "B",
              explanation: "In Python, the 'def' keyword introduces a function definition."
            }
          }
        ]
      }
    ]
  },
  {
    id: "crs_js_01",
    title: "JavaScript & Modern Web (W3Schools Style)",
    code: "WEB-JS201",
    category: "Web Development",
    educationLevel: "All",
    branchStream: "Computer Science & Engineering",
    description: "Learn JavaScript fundamentals, DOM manipulation, asynchronous programming with Async/Await, and modern ES6+ features.",
    iconName: "Globe",
    badgeColor: "amber",
    estimatedHours: 16,
    modules: [
      {
        id: "mod_js_01",
        title: "JavaScript Fundamentals & ES6",
        description: "Variables (let, const), Arrow Functions, Template Literals, and Destructuring.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_js_101",
            moduleId: "mod_js_01",
            title: "Variables, Scopes & Arrow Functions",
            readingTimeMin: 10,
            content: `### Modern JavaScript (ES6+)

JavaScript is the programming language of the Web. Modern JavaScript uses \`const\` and \`let\` for block-scoped variable declarations.

#### \`const\` vs \`let\`:
* \`const\`: Block-scoped. Cannot be reassigned. Use by default!
* \`let\`: Block-scoped. Can be reassigned.
* \`var\`: Function-scoped, hoisted. Deprecated in modern code.

#### Arrow Functions:
Arrow functions provide a clean, concise syntax:
\`\`\`javascript
// Traditional Function
function add(a, b) {
  return a + b;
}

// Arrow Function
const add = (a, b) => a + b;
\`\`\`

#### Template Literals:
Backticks (\` \`) allow embedded expressions and multi-line strings:
\`\`\`javascript
const name = "Vijay";
console.log(\`Hello \${name}, welcome to LearnX!\`);
\`\`\``,
            codeSnippet: {
              language: "javascript",
              initialCode: `// Modern JavaScript Playground
const student = {
  name: "Vijay",
  role: "Software Developer",
  skills: ["JavaScript", "Python", "React"]
};

const formatProfile = (s) => {
  return \`Student: \${s.name} | Role: \${s.role} | Tech: \${s.skills.join(", ")}\`;
};

console.log(formatProfile(student));
`,
              description: "Run live JavaScript directly in your browser sandbox.",
              expectedOutput: `Student: Vijay | Role: Software Developer | Tech: JavaScript, Python, React`
            },
            assessment: {
              question: "What is the primary difference between 'let' and 'const' in JavaScript?",
              option_a: "let is block-scoped while const is global",
              option_b: "const cannot be reassigned while let can be reassigned",
              option_c: "let cannot store objects or arrays",
              option_d: "const is hoisted to the top while let is not",
              correct_option: "B",
              explanation: "Both let and const are block-scoped, but variables declared with const cannot be reassigned after declaration."
            }
          },
          {
            id: "les_js_102",
            moduleId: "mod_js_01",
            title: "Async/Await & Promises",
            readingTimeMin: 12,
            content: `### Asynchronous JavaScript

JavaScript is single-threaded and non-blocking. It uses the Event Loop, Promises, and \`async/await\` to handle tasks like network requests, database lookups, and timers without freezing the UI.

#### The Promise:
A Promise is an object representing the eventual completion or failure of an asynchronous operation:
* **Pending**: Initial state.
* **Fulfilled**: Operation succeeded.
* **Rejected**: Operation failed.

#### \`async\` & \`await\` Syntax:
\`\`\`javascript
async function fetchStudentData() {
  try {
    const res = await fetch("/api/students");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Network error:", error);
  }
}
\`\`\``,
            codeSnippet: {
              language: "javascript",
              initialCode: `// Demonstrating Promise Resolution
const simulateApiCall = (endpoint) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: "success", route: endpoint, timestamp: new Date().toLocaleTimeString() });
    }, 100);
  });
};

async function run() {
  console.log("Fetching student records...");
  const data = await simulateApiCall("/api/students/active");
  console.log("API Result:", JSON.stringify(data));
}

run();
`,
              description: "Execute the asynchronous Promise simulation.",
              expectedOutput: `Fetching student records...
API Result: {"status":"success","route":"/api/students/active","timestamp":"..."}`
            },
            assessment: {
              question: "What does an async function always return in JavaScript?",
              option_a: "A boolean indicator",
              option_b: "A Promise",
              option_c: "Undefined",
              option_d: "A synchronous callback",
              correct_option: "B",
              explanation: "Any function declared with the 'async' keyword automatically wraps its return value in a Promise."
            }
          }
        ]
      }
    ]
  },
  {
    id: "crs_dsa_01",
    title: "Data Structures & Algorithms (B.Tech Core)",
    code: "CS-DSA301",
    category: "Computer Science",
    educationLevel: "B.Tech",
    branchStream: "Computer Science & Engineering",
    description: "Master foundational to advanced data structures: Arrays, Linked Lists, Stacks, Queues, Binary Trees, and Asymptotic Complexity.",
    iconName: "Binary",
    badgeColor: "indigo",
    estimatedHours: 24,
    modules: [
      {
        id: "mod_dsa_01",
        title: "Asymptotic Analysis & Arrays",
        description: "Big-O Notation, Array Operations, Two Pointers, and Binary Search.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_dsa_101",
            moduleId: "mod_dsa_01",
            title: "Big-O Complexity & Binary Search",
            readingTimeMin: 14,
            content: `### Big-O Asymptotic Complexity

Big-O notation describes how the runtime or memory space of an algorithm grows as the input size $n$ increases toward infinity.

#### Common Complexities (Fastest to Slowest):
1. **$O(1)$**: Constant time (Array index lookup)
2. **$O(\\log n)$**: Logarithmic time (Binary Search)
3. **$O(n)$**: Linear time (Single loop through array)
4. **$O(n \\log n)$**: Linearithmic time (Merge Sort, Quick Sort avg)
5. **$O(n^2)$**: Quadratic time (Nested loops, Bubble Sort)
6. **$O(2^n)$**: Exponential time (Recursive Fibonacci)

#### Binary Search Algorithm:
Binary Search finds the position of a target element in a **sorted array** by repeatedly dividing the search interval in half:
* Time Complexity: **$O(\\log n)$**
* Space Complexity: **$O(1)$** iterative`,
            codeSnippet: {
              language: "python",
              initialCode: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    steps = 0

    while left <= right:
        steps += 1
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid, steps
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1, steps

# Sorted array of 16 elements
data = [3, 7, 12, 19, 24, 29, 35, 41, 48, 55, 62, 70, 78, 85, 91, 99]
target = 70

index, steps = binary_search(data, target)
print(f"Target {target} found at index: {index}")
print(f"Total steps taken: {steps} (Log2 of 16 is 4!)")
`,
              description: "Run Binary Search and observe logarithmic step reduction.",
              expectedOutput: `Target 70 found at index: 11
Total steps taken: 3 (Log2 of 16 is 4!)`
            },
            assessment: {
              question: "What is the prerequisite condition for applying Binary Search on an array?",
              option_a: "The array must contain only positive integers",
              option_b: "The array elements must be sorted",
              option_c: "The array size must be an exact power of 2",
              option_d: "The array must have no duplicate elements",
              correct_option: "B",
              explanation: "Binary search requires the input collection to be sorted so that comparing with the middle element lets you eliminate half the elements."
            }
          },
          {
            id: "les_dsa_102",
            moduleId: "mod_dsa_01",
            title: "Stacks, Queues & Monotonic Patterns",
            readingTimeMin: 12,
            content: `### Stacks & Queues

Linear data structures defined by their insertion and removal policies.

#### 1. Stack (LIFO - Last In, First Out)
* Elements are inserted and removed from the **top**.
* Operations: \`push()\` ($O(1)$), \`pop()\` ($O(1)$), \`peek()\` ($O(1)$).
* Applications: Function call stack, Undo button, Balanced Parentheses checking.

#### 2. Queue (FIFO - First In, First Out)
* Elements are added at the **rear** and removed from the **front**.
* Operations: \`enqueue()\` ($O(1)$), \`dequeue()\` ($O(1)$).
* Applications: Printer spooling, Breadth-First Search (BFS), Task Scheduling.`,
            codeSnippet: {
              language: "python",
              initialCode: `class Stack:
    def __init__(self):
        self.items = []
        
    def push(self, val):
        self.items.append(val)
        
    def pop(self):
        return self.items.pop() if self.items else None
        
    def is_empty(self):
        return len(self.items) == 0

def check_balanced_parentheses(expr):
    stack = Stack()
    mapping = {")": "(", "}": "{", "]": "["}
    
    for ch in expr:
        if ch in mapping.values():
            stack.push(ch)
        elif ch in mapping.keys():
            if stack.is_empty() or stack.pop() != mapping[ch]:
                return False
    return stack.is_empty()

tests = ["{[()]}", "{[(])}", "((()))"]
for t in tests:
    print(f"'{t}' -> Balanced: {check_balanced_parentheses(t)}")
`,
              description: "Test the stack-based balanced parentheses validator.",
              expectedOutput: `'{[()]}' -> Balanced: True
'{[(])}' -> Balanced: False
'((()))' -> Balanced: True`
            },
            assessment: {
              question: "Which data structure follows the Last-In First-Out (LIFO) access pattern?",
              option_a: "Queue",
              option_b: "Stack",
              option_c: "Hash Map",
              option_d: "Binary Heap",
              correct_option: "B",
              explanation: "A Stack adheres strictly to LIFO, meaning the element pushed most recently is the first to be popped."
            }
          }
        ]
      }
    ]
  },
  {
    id: "crs_sql_01",
    title: "SQL & Relational Databases (W3Schools Style)",
    code: "DB-SQL201",
    category: "Database",
    educationLevel: "All",
    branchStream: "Computer Science & Engineering",
    description: "Write professional SQL queries: SELECT, WHERE, ORDER BY, GROUP BY, Aggregate Functions, and multi-table JOINs.",
    iconName: "Database",
    badgeColor: "sky",
    estimatedHours: 12,
    modules: [
      {
        id: "mod_sql_01",
        title: "SQL Fundamentals & Querying",
        description: "Table structure, SELECT statements, WHERE clauses, and sorting.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_sql_101",
            moduleId: "mod_sql_01",
            title: "The SELECT Statement & Filtering",
            readingTimeMin: 10,
            content: `### SQL: Structured Query Language

SQL is the standard language for storing, manipulating, and retrieving data in relational databases (like SQLite, PostgreSQL, MySQL, and Oracle).

#### The Basic Query:
\`\`\`sql
SELECT column1, column2 FROM table_name;
\`\`\`
To select all columns:
\`\`\`sql
SELECT * FROM students;
\`\`\`

#### Filtering with \`WHERE\`:
\`\`\`sql
SELECT * FROM students 
WHERE branch = 'CSE' AND semester = '1st';
\`\`\`

#### Sorting with \`ORDER BY\`:
\`\`\`sql
SELECT name, gpa FROM students 
ORDER BY gpa DESC;
\`\`\``,
            codeSnippet: {
              language: "sql",
              initialCode: `-- Interactive SQL Query Simulator
-- Table: Students (id, name, branch, year, gpa)
SELECT name, branch, gpa 
FROM Students 
WHERE gpa >= 8.5 
ORDER BY gpa DESC;
`,
              description: "Execute the query against the demo database.",
              expectedOutput: `| name   | branch | gpa |
|--------|--------|-----|
| Vijay  | CSE    | 9.4 |
| Ananya | CSE    | 9.2 |
| Rahul  | ECE    | 8.8 |`
            },
            assessment: {
              question: "Which SQL clause is used to filter records that meet a specified condition?",
              option_a: "HAVING",
              option_b: "WHERE",
              option_c: "FILTER",
              option_d: "SORT",
              correct_option: "B",
              explanation: "The WHERE clause filters rows in a table before grouping or aggregations take place."
            }
          },
          {
            id: "les_sql_102",
            moduleId: "mod_sql_01",
            title: "Table Relationships & INNER JOIN",
            readingTimeMin: 12,
            content: `### SQL JOINs

In relational databases, data is split across multiple tables to avoid redundancy (normalization). A **JOIN** combines rows from two or more tables based on a related column between them.

#### Types of JOINs:
1. **INNER JOIN**: Returns rows with matching values in both tables.
2. **LEFT JOIN**: Returns all rows from the left table, and matching rows from the right table.
3. **RIGHT JOIN**: Returns all rows from the right table, and matching rows from the left table.
4. **FULL OUTER JOIN**: Returns all rows when there is a match in either left or right table.

#### INNER JOIN Syntax:
\`\`\`sql
SELECT students.name, courses.title, enrollments.grade
FROM enrollments
INNER JOIN students ON enrollments.student_id = students.id
INNER JOIN courses ON enrollments.course_id = courses.id;
\`\`\``,
            codeSnippet: {
              language: "sql",
              initialCode: `-- Multi-Table Relationship Query
SELECT s.name AS Student, c.title AS Course, e.progress AS Progress_Pct
FROM Enrollments e
INNER JOIN Students s ON e.student_id = s.id
INNER JOIN Courses c ON e.course_id = c.id
WHERE e.progress = 100;
`,
              description: "Run this join query to identify students who completed their courses.",
              expectedOutput: `| Student | Course               | Progress_Pct |
|---------|----------------------|--------------|
| Vijay   | Python Mastery       | 100          |
| Vijay   | Web Development Core | 100          |`
            },
            assessment: {
              question: "What does an INNER JOIN return?",
              option_a: "All records from both tables regardless of match",
              option_b: "Only rows that have matching values in both tables",
              option_c: "All records from the left table and none from the right",
              option_d: "Only records with NULL foreign keys",
              correct_option: "B",
              explanation: "An INNER JOIN selects records that have matching keys in both participating tables."
            }
          }
        ]
      }
    ]
  },
  {
    id: "crs_html_01",
    title: "HTML5 & Modern CSS (W3Schools Style)",
    code: "WEB-HTML101",
    category: "Web Development",
    educationLevel: "All",
    branchStream: "Computer Science & Web Tech",
    description: "Master modern semantic HTML5, CSS Flexbox, Grid, micro-animations, and responsive website building.",
    iconName: "Layout",
    badgeColor: "rose",
    estimatedHours: 10,
    modules: [
      {
        id: "mod_html_01",
        title: "Semantic HTML & CSS Flexbox",
        description: "Document structure, semantic tags, and flexible box layout modeling.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_html_101",
            moduleId: "mod_html_01",
            title: "HTML5 Semantic Tags & CSS Flexbox",
            readingTimeMin: 10,
            content: `### Semantic HTML5 & Modern Layouts

Semantic HTML tags give meaning to the web page rather than just presentation.

#### Key Semantic Elements:
* \`<header>\`: Introductory content or navigation.
* \`<nav>\`: Set of navigation links.
* \`<main>\`: The dominant content of the document.
* \`<article>\`: Independent, self-contained composition.
* \`<section>\`: Standalone section of content.
* \`<footer>\`: Footer for its nearest sectioning root.

#### CSS Flexbox:
Flexbox is a 1-dimensional layout model for distributing space and aligning items:
\`\`\`css
.container {
  display: flex;
  justify-content: space-between; /* Horizontal alignment */
  align-items: center;            /* Vertical alignment */
  gap: 16px;
}
\`\`\``,
            codeSnippet: {
              language: "html",
              initialCode: `<!DOCTYPE html>
<html>
<head>
  <style>
    .card {
      font-family: sans-serif;
      background: #1e1b4b;
      color: #e0e7ff;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #6366f1;
    }
    .badge {
      background: #4f46e5;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Verified Certificate</span>
    <h2>Welcome to LearnX Web Development</h2>
    <p>Build responsive, modern web applications with ease.</p>
  </div>
</body>
</html>`,
              description: "Preview the rendered HTML & CSS card.",
              expectedOutput: `[Rendered HTML Card with violet gradient border and badge]`
            },
            assessment: {
              question: "Which CSS property is used to align flex items along the main axis?",
              option_a: "align-items",
              option_b: "justify-content",
              option_c: "flex-direction",
              option_d: "content-align",
              correct_option: "B",
              explanation: "In CSS Flexbox, justify-content controls spacing and alignment along the main axis, while align-items aligns items along the cross axis."
            }
          }
        ]
      }
    ]
  }
];

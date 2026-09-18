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
  category: "Programming" | "Web Development" | "Computer Science" | "Database" | "Systems" | "Mathematics" | "Science" | "Commerce" | "Business" | "Core Engineering" | "General";
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
  },
  // ==========================================
  // 1. SCHOOL CURRICULUM (Secondary & High School)
  // ==========================================
  {
    id: "crs_sch_math_01",
    title: "High School Mathematics: Algebra & Geometry",
    code: "SCH-MTH10",
    category: "Mathematics",
    educationLevel: "School",
    branchStream: "Grade 9 & 10 (CBSE / ICSE / State Board)",
    description: "Master foundational school algebra, linear and quadratic equations, coordinate geometry, and trigonometry with clear, visual explanations.",
    iconName: "Compass",
    badgeColor: "sky",
    estimatedHours: 12,
    modules: [
      {
        id: "mod_sch_m01",
        title: "Algebra & Polynomials",
        description: "Quadratic equations, polynomials, and factor theorem.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_sch_m101",
            moduleId: "mod_sch_m01",
            title: "Quadratic Equations & Roots Formula",
            readingTimeMin: 8,
            content: `### Quadratic Equations in School Mathematics

A quadratic equation is a second-degree polynomial equation written in standard form:
$$ax^2 + bx + c = 0$$
where $a \\neq 0$.

#### 1. Finding Roots with the Quadratic Formula:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

#### 2. The Discriminant ($\\Delta = b^2 - 4ac$):
* If $\\Delta > 0$: Two distinct real roots.
* If $\\Delta = 0$: Two equal real roots (one repeated root).
* If $\\Delta < 0$: No real roots (complex roots).

#### Worked Example:
Solve $x^2 - 5x + 6 = 0$:
Here $a=1$, $b=-5$, $c=6$.
$$\\Delta = (-5)^2 - 4(1)(6) = 25 - 24 = 1$$
$$x = \\frac{5 \\pm \\sqrt{1}}{2} \\implies x = 3 \\text{ or } x = 2$$`,
            codeSnippet: {
              language: "python",
              initialCode: `# Solve Quadratic Equation: ax^2 + bx + c = 0
import math

a, b, c = 1, -5, 6
discriminant = b**2 - 4*a*c

if discriminant >= 0:
    root1 = (-b + math.sqrt(discriminant)) / (2*a)
    root2 = (-b - math.sqrt(discriminant)) / (2*a)
    print(f"Roots are: x1 = {root1}, x2 = {root2}")
else:
    print("No real roots exist.")`,
              description: "Calculate roots of quadratic equations interactively.",
              expectedOutput: "Roots are: x1 = 3.0, x2 = 2.0"
            },
            assessment: {
              question: "If the discriminant (b^2 - 4ac) of a quadratic equation is exactly 0, what can be said about its roots?",
              option_a: "Roots are imaginary and distinct",
              option_b: "Roots are real and equal",
              option_c: "Roots are rational and unequal",
              option_d: "No roots exist at all",
              correct_option: "B",
              explanation: "When discriminant = 0, the sqrt part vanishes, yielding two identical real roots: x = -b / (2a)."
            }
          }
        ]
      }
    ]
  },
  {
    id: "crs_sch_sci_01",
    title: "General Science: Physics, Chemistry & Biology",
    code: "SCH-SCI10",
    category: "Science",
    educationLevel: "School",
    branchStream: "Grade 9 & 10 (Secondary Science)",
    description: "Fundamental laws of motion, chemical reactions, periodic elements, cell biology, and life processes explained simply.",
    iconName: "Atom",
    badgeColor: "emerald",
    estimatedHours: 15,
    modules: [
      {
        id: "mod_sch_s01",
        title: "Forces, Motion & Life Processes",
        description: "Newton's laws of motion and cell structure.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_sch_s101",
            moduleId: "mod_sch_s01",
            title: "Newton's 3 Laws of Motion",
            readingTimeMin: 7,
            content: `### Newton's Three Laws of Motion

Isaac Newton formulated three fundamental laws describing how objects move in our universe:

#### 1. First Law (Law of Inertia)
An object at rest stays at rest, and an object in uniform motion continues in straight-line motion unless acted upon by an external net force.
*Example*: When a bus suddenly brakes, passengers lurch forward due to their inertia.

#### 2. Second Law (Law of Acceleration)
The rate of change of momentum is proportional to the applied force:
$$F = m \\times a$$
*(Force = Mass \\times Acceleration)*

#### 3. Third Law (Action & Reaction)
For every action, there is an equal and opposite reaction.
*Example*: When a rocket shoots exhaust gas backward with force, the gas pushes the rocket forward with equal force!`,
            assessment: {
              question: "Which of Newton's laws explains why a passenger lurches forward when a moving bus suddenly stops?",
              option_a: "First Law of Motion (Inertia)",
              option_b: "Second Law of Motion (F = ma)",
              option_c: "Third Law of Motion (Action-Reaction)",
              option_d: "Law of Universal Gravitation",
              correct_option: "A",
              explanation: "Newton's First Law (Law of Inertia) states that a moving body continues moving unless an external force acts on it. The passenger's body continues forward when the bus decelerates."
            }
          }
        ]
      }
    ]
  },
  {
    id: "crs_sch_comp_01",
    title: "Computer Basics & Algorithmic Thinking",
    code: "SCH-CS10",
    category: "Computer Science",
    educationLevel: "School",
    branchStream: "All School Grades",
    description: "Introduction to computers, binary numbers, flowcharting, algorithms, and beginner visual coding concepts.",
    iconName: "Laptop",
    badgeColor: "indigo",
    estimatedHours: 10,
    modules: [
      {
        id: "mod_sch_c01",
        title: "Computer Fundamentals & Logic",
        description: "Hardware, software, binary system, and simple flowcharts.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_sch_c101",
            moduleId: "mod_sch_c01",
            title: "How Computers Think: Binary & Logic",
            readingTimeMin: 6,
            content: `### How Computers Think: Bits and Binary

Every digital computer—from pocket calculators to smartphones—processes all data as combinations of **0s and 1s**, called **Bits** (Binary Digits).

#### Why Binary?
Inside a computer chip, millions of microscopic transistors act like light switches:
* **Switch OFF (0)**: No electrical current flowing.
* **Switch ON (1)**: Electrical current flowing.

#### Counting in Binary:
* 0000 = 0
* 0001 = 1
* 0010 = 2
* 0011 = 3
* 0100 = 4
* 0101 = 5
* 1000 = 8

#### Memory Units:
* **8 Bits = 1 Byte** (Can store a single character like 'A').
* **1024 Bytes = 1 Kilobyte (KB)**.
* **1024 KB = 1 Megabyte (MB)**.
* **1024 MB = 1 Gigabyte (GB)**.`,
            assessment: {
              question: "How many bits make up one standard byte in computer memory?",
              option_a: "4 bits",
              option_b: "8 bits",
              option_c: "16 bits",
              option_d: "32 bits",
              correct_option: "B",
              explanation: "A standard byte consists of 8 bits, which can represent 256 unique values (0 to 255)."
            }
          }
        ]
      }
    ]
  },

  // ==========================================
  // 2. INTERMEDIATE (+2 / JUNIOR COLLEGE)
  // ==========================================
  {
    id: "crs_int_math_01",
    title: "Intermediate Mathematics: Calculus & Coordinate Geometry",
    code: "INT-MTH12",
    category: "Mathematics",
    educationLevel: "Intermediate",
    branchStream: "MPC (Mathematics, Physics, Chemistry)",
    description: "Comprehensive +2 calculus covering limits, derivatives, integration techniques, matrices, and vectors for board and competitive exams (JEE/EAMCET).",
    iconName: "TrendingUp",
    badgeColor: "violet",
    estimatedHours: 20,
    modules: [
      {
        id: "mod_int_m01",
        title: "Differential Calculus & Limits",
        description: "Limits, continuity, and standard differentiation rules.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_int_m101",
            moduleId: "mod_int_m01",
            title: "Differentiation Rules & Derivatives",
            readingTimeMin: 10,
            content: `### Differentiation Rules in Calculus

The derivative of a function $f(x)$ measures the instantaneous rate of change of $f(x)$ with respect to $x$:
$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$

#### Standard Derivative Formulas:
1. **Power Rule**: $\\frac{d}{dx}(x^n) = n x^{n-1}$
2. **Exponential**: $\\frac{d}{dx}(e^x) = e^x$
3. **Logarithmic**: $\\frac{d}{dx}(\\ln x) = \\frac{1}{x}$
4. **Trigonometric**:
   * $\\frac{d}{dx}(\\sin x) = \\cos x$
   * $\\frac{d}{dx}(\\cos x) = -\\sin x$

#### Key Differentiation Operational Laws:
* **Product Rule**: $\\frac{d}{dx}(u \\cdot v) = u \\frac{dv}{dx} + v \\frac{du}{dx}$
* **Quotient Rule**: $\\frac{d}{dx}\\left(\\frac{u}{v}\\right) = \\frac{v \\frac{du}{dx} - u \\frac{dv}{dx}}{v^2}$
* **Chain Rule**: $\\frac{d}{dx}f(g(x)) = f'(g(x)) \\cdot g'(x)$`,
            codeSnippet: {
              language: "python",
              initialCode: `# Numerical differentiation of f(x) = x^3 - 4x + 7 at x = 2
def f(x):
    return x**3 - 4*x + 7

x0 = 2.0
h = 1e-7
derivative_approx = (f(x0 + h) - f(x0)) / h
print(f"Analytical derivative at x=2: {3 * (x0**2) - 4}")
print(f"Numerical limit approximation: {round(derivative_approx, 4)}")`,
              description: "Inspect instantaneous rate of change via limits.",
              expectedOutput: "Analytical derivative at x=2: 8.0\nNumerical limit approximation: 8.0"
            },
            assessment: {
              question: "What is the derivative of f(x) = 4x^3 - 5x + 9 with respect to x?",
              option_a: "12x^2 - 5",
              option_b: "12x^3 - 5",
              option_c: "4x^2 - 5",
              option_d: "12x^2",
              correct_option: "A",
              explanation: "Using the power rule d/dx(x^n) = n*x^(n-1): d/dx(4x^3) = 12x^2, d/dx(-5x) = -5, and d/dx(9) = 0. Thus, f'(x) = 12x^2 - 5."
            }
          }
        ]
      }
    ]
  },
  {
    id: "crs_int_phy_01",
    title: "Intermediate Physics: Mechanics & Electromagnetism",
    code: "INT-PHY12",
    category: "Science",
    educationLevel: "Intermediate",
    branchStream: "MPC / BiPC (Science Stream)",
    description: "Rotational kinematics, work-energy theorem, wave optics, electrostatics, Gauss's law, and magnetic induction for Class 11 and 12.",
    iconName: "Zap",
    badgeColor: "amber",
    estimatedHours: 18,
    modules: [
      {
        id: "mod_int_p01",
        title: "Electrostatics & Current Electricity",
        description: "Coulomb's Law, Electric Potential, and Ohm's Law.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_int_p101",
            moduleId: "mod_int_p01",
            title: "Coulomb's Law & Electric Potential",
            readingTimeMin: 9,
            content: `### Electrostatics & Coulomb's Law

Coulomb's Law quantifies the electrostatic force of attraction or repulsion between two stationary point charges $q_1$ and $q_2$:
$$F = \\frac{1}{4\\pi\\varepsilon_0} \\frac{|q_1 q_2|}{r^2}$$
where $\\frac{1}{4\\pi\\varepsilon_0} \\approx 9 \\times 10^9 \\text{ N}\\cdot\\text{m}^2/\\text{C}^2$.

#### Key Principles:
* **Like charges repel**; **opposite charges attract**.
* The force acts along the straight line joining the charges.
* It follows an **Inverse-Square Law**: doubling distance $r$ reduces electrostatic force to one-fourth.`,
            assessment: {
              question: "If the separation distance between two point charges is doubled, what happens to the electrostatic force between them?",
              option_a: "It doubles",
              option_b: "It halves",
              option_c: "It decreases to one-fourth",
              option_d: "It remains unchanged",
              correct_option: "C",
              explanation: "According to Coulomb's Law, force is inversely proportional to r^2. Doubling the distance (2r) results in (2)^2 = 4, reducing the force to 1/4th."
            }
          }
        ]
      }
    ]
  },
  {
    id: "crs_int_acc_01",
    title: "Intermediate Accountancy & Financial Principles",
    code: "INT-ACC12",
    category: "Commerce",
    educationLevel: "Intermediate",
    branchStream: "MEC / CEC (Commerce Stream)",
    description: "Double-entry bookkeeping, Journal Entries, Ledger Accounts, Trial Balance, and Final Accounts for junior college commerce students.",
    iconName: "Receipt",
    badgeColor: "emerald",
    estimatedHours: 14,
    modules: [
      {
        id: "mod_int_a01",
        title: "Double Entry & The Accounting Equation",
        description: "Golden rules of accounting and ledger posting.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_int_a101",
            moduleId: "mod_int_a01",
            title: "Golden Rules of Accounting & Journalizing",
            readingTimeMin: 8,
            content: `### The Core Accounting Equation & Golden Rules

Every financial transaction has a dual aspect (Double-Entry Bookkeeping).

#### 1. The Fundamental Accounting Equation:
$$\\text{Assets} = \\text{Liabilities} + \\text{Capital (Equity)}$$

#### 2. The 3 Golden Rules of Accounting:
1. **Real Accounts** (Tangible Assets like Cash, Machinery, Land):
   * *Debit what comes in.*
   * *Credit what goes out.*
2. **Personal Accounts** (Persons, Firms, Debtors, Creditors):
   * *Debit the receiver.*
   * *Credit the giver.*
3. **Nominal Accounts** (Expenses, Incomes, Losses, Gains):
   * *Debit all expenses and losses.*
   * *Credit all incomes and gains.*`,
            assessment: {
              question: "According to the Golden Rules of Accounting, what is the rule for Real Accounts?",
              option_a: "Debit all expenses and credit all incomes",
              option_b: "Debit the receiver and credit the giver",
              option_c: "Debit what comes in and credit what goes out",
              option_d: "Debit liabilities and credit assets",
              correct_option: "C",
              explanation: "Real accounts relate to tangible or intangible assets of the business. The golden rule is: Debit what comes in, Credit what goes out."
            }
          }
        ]
      }
    ]
  },

  // ==========================================
  // 3. B.TECH (ENGINEERING CURRICULUM)
  // ==========================================
  {
    id: "crs_btech_dsa_01",
    title: "Data Structures & Algorithms (B.Tech Core)",
    code: "CS-DSA301",
    category: "Computer Science",
    educationLevel: "B.Tech",
    branchStream: "Computer Science, IT & AI/ML",
    description: "Core algorithms, Asymptotic Analysis (Big-O), Stacks, Queues, Binary Search Trees, Dynamic Programming, and Graph Traversals.",
    iconName: "Binary",
    badgeColor: "indigo",
    estimatedHours: 24,
    modules: [
      {
        id: "mod_bt_d01",
        title: "Linear Data Structures & Complexity",
        description: "Linked lists, Stack architectures, and Big-O notation.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_bt_d101",
            moduleId: "mod_bt_d01",
            title: "Asymptotic Notation & Time-Space Complexity",
            readingTimeMin: 12,
            content: `### Asymptotic Complexity Analysis in Engineering

In computer science, algorithm efficiency is characterized by asymptotic upper, lower, and tight bounds as input size $n \\to \\infty$.

#### The Standard Notations:
1. **Big-O ($O$)**: Represents the asymptotic upper bound (worst-case scenario).
2. **Big-Omega ($\\Omega$)**: Represents the asymptotic lower bound (best-case scenario).
3. **Big-Theta ($\\Theta$)**: Represents the asymptotically tight bound ($f(n)$ is bounded above and below by $g(n)$).

#### Common Time Complexity Hierarchy:
$$O(1) < O(\\log n) < O(n) < O(n \\log n) < O(n^2) < O(2^n) < O(n!)$$`,
            codeSnippet: {
              language: "python",
              initialCode: `# Binary Search: O(log n) vs Linear Search: O(n)
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    steps = 0
    while low <= high:
        steps += 1
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid, steps
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1, steps

dataset = list(range(1, 1025)) # 1024 elements
target = 888
idx, steps = binary_search(dataset, target)
print(f"Target found at index {idx} in just {steps} comparison steps (log2(1024) = 10)!")`,
              description: "Verify O(log n) logarithmic efficiency in binary search.",
              expectedOutput: "Target found at index 887 in just 10 comparison steps (log2(1024) = 10)!"
            },
            assessment: {
              question: "What is the worst-case time complexity of searching for an element in an unsorted array of size n?",
              option_a: "O(log n)",
              option_b: "O(1)",
              option_c: "O(n)",
              option_d: "O(n log n)",
              correct_option: "C",
              explanation: "In an unsorted array, the target element could be at the very end or absent, requiring inspecting all n elements sequentially in O(n) time."
            }
          }
        ]
      }
    ]
  },
  {
    id: "crs_btech_os_01",
    title: "Operating Systems & Concurrency Architecture",
    code: "CS-OS302",
    category: "Systems",
    educationLevel: "B.Tech",
    branchStream: "Computer Science & Engineering",
    description: "Processes, POSIX threads, CPU scheduling algorithms, Deadlock prevention, Paging, and Virtual Memory management.",
    iconName: "Cpu",
    badgeColor: "rose",
    estimatedHours: 20,
    modules: [
      {
        id: "mod_bt_os01",
        title: "Process Scheduling & Deadlocks",
        description: "Round Robin, SJF, Banker's Algorithm, and Semaphores.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_bt_os101",
            moduleId: "mod_bt_os01",
            title: "The 4 Coffman Conditions for Deadlock",
            readingTimeMin: 11,
            content: `### Deadlocks in Operating Systems

A **Deadlock** is a state where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.

#### The 4 Necessary Coffman Conditions:
All four conditions must hold simultaneously for a deadlock to occur:
1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode.
2. **Hold and Wait**: A process must currently hold at least one resource and be waiting to acquire additional resources held by other processes.
3. **No Preemption**: Resources cannot be forcibly seized; a resource can be released only voluntarily by the process holding it.
4. **Circular Wait**: A closed chain of processes exists such that each process holds at least one resource needed by the next process in the cycle ($P_0 \\to P_1 \\to \\dots \\to P_0$).

#### Prevention Strategy:
To prevent deadlocks, operating systems enforce protocol rules that break at least ONE of these four conditions (e.g. strict global resource ordering breaks circular wait).`,
            assessment: {
              question: "Which Coffman condition is broken when an operating system enforces a strict ascending numerical order for acquiring resources?",
              option_a: "Mutual Exclusion",
              option_b: "Hold and Wait",
              option_c: "Circular Wait",
              option_d: "No Preemption",
              correct_option: "C",
              explanation: "Enforcing a global linear ordering on all resources prevents cycles from ever forming in the Resource Allocation Graph, mathematically breaking the Circular Wait condition."
            }
          }
        ]
      }
    ]
  },
  {
    id: "crs_btech_toc_01",
    title: "Theory of Computation & Compiler Design",
    code: "CS-TC304",
    category: "Computer Science",
    educationLevel: "B.Tech",
    branchStream: "Computer Science & Engineering",
    description: "Finite Automata (DFA/NFA), Regular Expressions, Context-Free Grammars, Chomsky Hierarchy, Turing Machines, and LL(1)/LR parsing.",
    iconName: "Workflow",
    badgeColor: "cyan",
    estimatedHours: 22,
    modules: [
      {
        id: "mod_bt_t01",
        title: "Formal Languages & Automata",
        description: "DFA, NFA, Regular Grammars, and Pumping Lemma.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_bt_t101",
            moduleId: "mod_bt_t01",
            title: "Deterministic vs Non-Deterministic Finite Automata",
            readingTimeMin: 12,
            content: `### Finite Automata in Theory of Computation

A Finite Automaton is a 5-tuple mathematical model of computation:
$$M = (Q, \\Sigma, \\delta, q_0, F)$$
where:
* $Q$: Finite set of states
* $\\Sigma$: Finite input alphabet
* $\\delta$: Transition function
* $q_0$: Initial state ($q_0 \\in Q$)
* $F$: Set of accepting states ($F \\subseteq Q$)

#### DFA vs NFA Comparison:
* **DFA (Deterministic)**: For each state and input symbol, there is **exactly one** transition:
  $$\\delta: Q \\times \\Sigma \\to Q$$
* **NFA (Non-Deterministic)**: From a single state, there can be zero, one, or multiple transitions for an input symbol, plus optional $\\epsilon$-transitions:
  $$\\delta: Q \\times \\Sigma \\to 2^Q$$

#### Theorem:
Every NFA can be converted to an equivalent DFA using the **Subset Construction Algorithm** (Rabin-Scott theorem), though the DFA may have up to $2^{|Q|}$ states.`,
            assessment: {
              question: "If an NFA has n states, what is the theoretical maximum number of states in its equivalent converted DFA?",
              option_a: "n^2",
              option_b: "2^n",
              option_c: "n!",
              option_d: "2n",
              correct_option: "B",
              explanation: "Because each state of the equivalent DFA represents a subset of states of the NFA (the power set 2^Q), the maximum number of states is 2^n."
            }
          }
        ]
      }
    ]
  },

  // ==========================================
  // 4. DEGREE (B.Com / BBA / B.Sc / BCA)
  // ==========================================
  {
    id: "crs_deg_acc_01",
    title: "Corporate Accounting & Financial Management",
    code: "COM-ACC201",
    category: "Commerce",
    educationLevel: "Degree",
    branchStream: "B.Com / BBA / M.Com",
    description: "Corporate financial statements, Cash Flow Analysis, Share Capital issue/forfeiture, Ratio Analysis, and Working Capital budgeting.",
    iconName: "PieChart",
    badgeColor: "emerald",
    estimatedHours: 16,
    modules: [
      {
        id: "mod_deg_a01",
        title: "Financial Statement Analysis & Ratios",
        description: "Liquidity ratios, profitability ratios, and DuPont analysis.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_deg_a101",
            moduleId: "mod_deg_a01",
            title: "Financial Ratio Analysis & Liquidity",
            readingTimeMin: 9,
            content: `### Financial Ratio Analysis in Degree Accounting

Ratio analysis is the quantitative analysis of information contained in a company's financial statements to assess solvency, profitability, and operational efficiency.

#### 1. Liquidity Ratios:
* **Current Ratio**:
  $$\\text{Current Ratio} = \\frac{\\text{Current Assets}}{\\text{Current Liabilities}}$$
  *(Standard benchmark: 2:1)*
* **Quick (Acid-Test) Ratio**:
  $$\\text{Quick Ratio} = \\frac{\\text{Current Assets} - \\text{Inventory}}{\\text{Current Liabilities}}$$
  *(Standard benchmark: 1:1)*

#### 2. Profitability Ratios:
* **Return on Equity (ROE)**: Net Income / Shareholder's Equity.
* **Operating Profit Margin**: Operating Profit / Revenue.`,
            assessment: {
              question: "What is the standard recommended ideal benchmark for the Current Ratio in financial analysis?",
              option_a: "1:1",
              option_b: "2:1",
              option_c: "3:1",
              option_d: "0.5:1",
              correct_option: "B",
              explanation: "A Current Ratio of 2:1 is widely regarded as the safe benchmark, indicating a business has twice as many current assets as current liabilities to meet short-term obligations."
            }
          }
        ]
      }
    ]
  },
  {
    id: "crs_deg_stat_01",
    title: "Business Statistics & Quantitative Data Analytics",
    code: "STA-BUS202",
    category: "Mathematics",
    educationLevel: "Degree",
    branchStream: "B.Sc / B.Com / BBA / Economics",
    description: "Measures of central tendency, dispersion, probability distributions, hypothesis testing (z-test, t-test, ANOVA), and regression modeling.",
    iconName: "BarChart3",
    badgeColor: "indigo",
    estimatedHours: 18,
    modules: [
      {
        id: "mod_deg_s01",
        title: "Measures of Central Tendency & Dispersion",
        description: "Mean, Median, Standard Deviation, and Variance.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_deg_s101",
            moduleId: "mod_deg_s01",
            title: "Mean, Standard Deviation & Normal Distribution",
            readingTimeMin: 10,
            content: `### Statistics in Business Decision-Making

Statistics provides the quantitative framework for analyzing uncertainty and business variance.

#### 1. Measures of Dispersion:
* **Variance ($\\sigma^2$)**: Average of the squared differences from the Mean.
* **Standard Deviation ($\\sigma$)**: Square root of variance, measured in the original data units:
  $$\\sigma = \\sqrt{\\frac{\\sum (x_i - \\mu)^2}{N}}$$

#### 2. The Empirical Rule for Normal Distribution (68-95-99.7):
In a bell-shaped normal curve:
* ~**68%** of all observations lie within $\\mu \\pm 1\\sigma$.
* ~**95%** of all observations lie within $\\mu \\pm 2\\sigma$.
* ~**99.7%** of all observations lie within $\\mu \\pm 3\\sigma$.`,
            assessment: {
              question: "In a standard normal distribution, approximately what percentage of values fall within 2 standard deviations of the mean?",
              option_a: "68%",
              option_b: "95%",
              option_c: "99.7%",
              option_d: "50%",
              correct_option: "B",
              explanation: "According to the Empirical 68-95-99.7 Rule, approximately 95% of data points in a normal distribution lie within 2 standard deviations (mean +/- 2*sigma)."
            }
          }
        ]
      }
    ]
  },
  {
    id: "crs_btech_aiml_01",
    title: "Artificial Intelligence & Machine Learning",
    code: "CSE-AI301",
    category: "Computer Science",
    educationLevel: "B.Tech",
    branchStream: "Computer Science & Engineering (AIML / Data Science)",
    description: "Comprehensive curriculum covering heuristic search, supervised machine learning algorithms, deep neural network backpropagation, and transformer architectures with runnable Python code sandboxes.",
    iconName: "Sparkles",
    badgeColor: "purple",
    estimatedHours: 24,
    modules: [
      {
        id: "mod_ai_01",
        title: "Heuristic Search & Foundations of AI",
        description: "State-space representation, informed search, and evaluation functions.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_ai_101",
            moduleId: "mod_ai_01",
            title: "Informed Search & A* Algorithm",
            readingTimeMin: 12,
            content: `### Foundations of Artificial Intelligence & State-Space Search

In Artificial Intelligence, problem solving is framed as searching through a **state space graph** from an initial state to a goal state.

#### 1. Uninformed vs. Informed Search
* **Uninformed (Blind) Search**: BFS and DFS explore nodes without knowing how close they are to the goal ($O(b^d)$ time complexity).
* **Informed (Heuristic) Search**: Uses domain knowledge via a heuristic function $h(n)$ estimating the cost from node $n$ to the goal.

#### 2. The $A^*$ Algorithm
$A^*$ evaluation function combines actual cost and estimated future cost:
$$f(n) = g(n) + h(n)$$
* $g(n)$: Exact path cost accumulated from start to node $n$.
* $h(n)$: Estimated heuristic cost from node $n$ to the goal.

#### 3. Admissibility & Optimality:
For $A^*$ to guarantee the optimal solution on tree search, $h(n)$ must be **admissible**—it must never overestimate the true cost to the goal ($0 \\le h(n) \\le h^*(n)$). For graph search, it must be **consistent (monotonic)** ($h(n) \\le c(n, a, n') + h(n')$).`,
            codeSnippet: {
              language: "python",
              initialCode: `# Python A* Heuristic Cost Calculation
def calculate_f_cost(g_cost, h_cost):
    """f(n) = g(n) + h(n)"""
    return g_cost + h_cost

# Node states (Node, g_cost, h_cost)
candidates = [
    ("Node_A", 4, 8),
    ("Node_B", 6, 3),
    ("Node_C", 2, 11)
]

for name, g, h in candidates:
    f = calculate_f_cost(g, h)
    print(f"{name} -> g: {g}, h: {h} => f(n): {f}")

best_node = min(candidates, key=lambda node: calculate_f_cost(node[1], node[2]))
print(f"\\nOptimal Next Node to expand: {best_node[0]}")`,
              description: "Evaluate node expansion order using the A* f(n) = g(n) + h(n) equation.",
              expectedOutput: "Optimal Next Node to expand: Node_B"
            },
            assessment: {
              question: "Under what condition is the A* algorithm guaranteed to return the optimal path in tree search?",
              option_a: "The heuristic function h(n) is admissible (never overestimates the true cost)",
              option_b: "The heuristic function h(n) equals 0 for all nodes",
              option_c: "The search space contains no loops or cycles",
              option_d: "The depth of the tree is strictly finite",
              correct_option: "A",
              explanation: "Admissibility ensures that A* never overlooks a shorter path by exaggerating its remaining cost, guaranteeing an optimal solution."
            }
          },
          {
            id: "les_ai_102",
            moduleId: "mod_ai_01",
            title: "Gradient Descent & Cost Optimization",
            readingTimeMin: 14,
            content: `### Machine Learning Optimization: Gradient Descent

Supervised learning algorithms find parameters $\\theta$ (weights $W$ and bias $b$) that minimize an objective loss function $J(\\theta)$.

#### 1. Mean Squared Error (MSE)
For linear regression with $m$ training samples:
$$J(W, b) = \\frac{1}{2m} \\sum_{i=1}^{m} (\\hat{y}^{(i)} - y^{(i)})^2$$

#### 2. Parameter Update Rule
At each iteration, parameters step in the direction opposite to the gradient:
$$W := W - \\alpha \\frac{\\partial J}{\\partial W}$$
$$b := b - \\alpha \\frac{\\partial J}{\\partial b}$$
Where $\\alpha$ is the **learning rate**.

#### 3. Learning Rate Selection:
* **Too small ($\\alpha = 10^{-6}$)**: Convergence is extremely slow.
* **Too large ($\\alpha = 1.5$)**: Overshoots the minimum and may diverge ($J \\to \\infty$).`,
            codeSnippet: {
              language: "python",
              initialCode: `# Gradient Descent in Pure Python
# Target function: y = 2x
x_data = [1.0, 2.0, 3.0, 4.0]
y_data = [2.0, 4.0, 6.0, 8.0]

w = 0.0  # Initial weight
lr = 0.05 # Learning rate

print("Initial weight w:", w)
for epoch in range(1, 21):
    # Compute predictions and gradients
    grad = 0.0
    for x, y in zip(x_data, y_data):
        y_pred = w * x
        grad += (y_pred - y) * x
    grad = (2.0 / len(x_data)) * grad
    w = w - lr * grad

print(f"Trained weight w after 20 epochs: {w:.4f}")
print("Predicted y for x=5:", round(w * 5, 2))`,
              description: "Train a single parameter model using manual gradient descent optimization.",
              expectedOutput: "Predicted y for x=5: 10.0"
            },
            assessment: {
              question: "What happens if the learning rate alpha in gradient descent is chosen too large?",
              option_a: "The model will train instantly with zero loss",
              option_b: "The parameters will oscillate and diverge away from the global minimum",
              option_c: "The model will automatically convert to decision tree logic",
              option_d: "The gradient will become strictly zero",
              correct_option: "B",
              explanation: "An excessively large learning rate causes the updates to step over the valley minimum, causing oscillations and eventual numerical divergence."
            }
          }
        ]
      },
      {
        id: "mod_ai_02",
        title: "Deep Neural Networks & Transformers",
        description: "Backpropagation, activation functions, and self-attention in LLMs.",
        orderIndex: 2,
        lessons: [
          {
            id: "les_ai_201",
            moduleId: "mod_ai_02",
            title: "Neural Networks & Backpropagation",
            readingTimeMin: 15,
            content: `### Deep Learning & Feedforward Networks

Deep neural networks compose non-linear layers to learn hierarchical representations from raw data.

#### 1. Forward Pass:
$$z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$$
$$a^{[l]} = g(z^{[l]})$$
Where $g(z)$ is a non-linear activation function (ReLU, Sigmoid, GELU).

#### 2. Activation Functions:
* **ReLU**: $f(x) = \\max(0, x)$ — prevents vanishing gradients in deep architectures.
* **Softmax**: Normalizes logits into probability distributions $\\sum P_i = 1$ for multi-class classification:
  $$\\text{Softmax}(z_i) = \\frac{e^{z_i}}{\\sum_j e^{z_j}}$$

#### 3. Backpropagation (Chain Rule):
Error signals are propagated backwards from the loss $L$ through each layer:
$$\\frac{\\partial L}{\\partial W^{[l]}} = \\frac{\\partial L}{\\partial z^{[l]}} (a^{[l-1]})^T$$`,
            codeSnippet: {
              language: "python",
              initialCode: `import math

def relu(x):
    return max(0.0, x)

def softmax(logits):
    exp_vals = [math.exp(z) for z in logits]
    total = sum(exp_vals)
    return [round(v / total, 4) for v in exp_vals]

# Logits output from final linear layer
model_outputs = [2.5, 1.0, 0.2]
classes = ["Computer Science", "Electronics", "Mechanical"]

probs = softmax(model_outputs)
for c, p in zip(classes, probs):
    print(f"Class: {c:<18} -> Probability: {p * 100:.2f}%")`,
              description: "Compute class probabilities using the Softmax activation function.",
              expectedOutput: "Class: Computer Science"
            },
            assessment: {
              question: "Why is the ReLU activation function predominantly preferred over Sigmoid in deep hidden layers?",
              option_a: "ReLU outputs values between -1 and +1",
              option_b: "ReLU mitigates the vanishing gradient problem for positive inputs and is computationally efficient",
              option_c: "ReLU eliminates the requirement for training weights",
              option_d: "ReLU can only be used with binary classification",
              correct_option: "B",
              explanation: "Sigmoid saturates at 0 and 1 with near-zero derivatives, causing gradients to vanish. ReLU has a constant derivative of 1 for x > 0, avoiding vanishing gradients."
            }
          }
        ]
      }
    ]
  },
  {
    id: "crs_btech_react_01",
    title: "Modern React & Next.js Full-Stack Architecture",
    code: "CSE-WEB302",
    category: "Web Development",
    educationLevel: "B.Tech",
    branchStream: "Computer Science, IT & Software Engineering",
    description: "Master modern component design, React 18 hooks (useState, useEffect, useMemo, useCallback), unidirectional state flow, and asynchronous API integrations.",
    iconName: "Code2",
    badgeColor: "blue",
    estimatedHours: 20,
    modules: [
      {
        id: "mod_react_01",
        title: "React 18 Core & Component Lifecycles",
        description: "Declarative UI, virtual DOM diffing, and state management.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_react_101",
            moduleId: "mod_react_01",
            title: "Hooks, State Immutability & Side Effects",
            readingTimeMin: 12,
            content: `### Modern React with Functional Components & Hooks

React represents user interfaces as pure functions of state. When state changes, React re-renders components using its **Virtual DOM reconciliation** engine.

#### 1. State Immutability
Never mutate state directly. Always return a new object or array reference so React can detect changes via shallow comparison:
\`\`\`javascript
// Correct immutable update
setStudentList(prev => [...prev, newStudent]);
setProfile(prev => ({ ...prev, education_level: "B.Tech" }));
\`\`\`

#### 2. The \`useEffect\` Dependency Contract
* **Empty array \`[]\`**: Runs once when the component mounts.
* **With dependencies \`[studentId]\`**: Runs whenever the listed values change.
* **Cleanup function**: Cleans up subscriptions, intervals, or abort controllers when unmounting:
\`\`\`javascript
useEffect(() => {
  const timer = setInterval(() => tick(), 1000);
  return () => clearInterval(timer); // Cleanup
}, []);
\`\`\``,
            codeSnippet: {
              language: "javascript",
              initialCode: `// Simulating React State & Immutability in JavaScript
let state = {
  studentName: "Ananya",
  completedCourses: ["Python 101", "DSA Basics"],
  gpa: 9.1
};

function updateProfile(currentState, newCourse) {
  // Return a new object reference (Immutability pattern)
  return {
    ...currentState,
    completedCourses: [...currentState.completedCourses, newCourse]
  };
}

const updatedState = updateProfile(state, "React Architecture");
console.log("Original courses:", state.completedCourses);
console.log("Updated courses:", updatedState.completedCourses);
console.log("Reference changed (state !== updatedState):", state !== updatedState);`,
              description: "Demonstration of immutable state transformations in modern web frameworks.",
              expectedOutput: "Reference changed (state !== updatedState): true"
            },
            assessment: {
              question: "Why must React state never be mutated directly (e.g., student.courses.push('DSA'))?",
              option_a: "Direct mutation causes syntax errors in JavaScript",
              option_b: "React performs shallow comparison on state references to determine re-renders; direct mutation retains the old reference",
              option_c: "React automatically locks memory objects from modification",
              option_d: "Direct mutation disables CSS rendering",
              correct_option: "B",
              explanation: "React relies on referential equality checks (Object.is) to detect state changes. Modifying an existing object preserves its memory reference, preventing necessary UI re-renders."
            }
          }
        ]
      }
    ]
  },
  {
    id: "crs_btech_cloud_01",
    title: "Cloud Computing, DevOps & Docker Microservices",
    code: "CSE-CLD303",
    category: "Systems",
    educationLevel: "B.Tech",
    branchStream: "Computer Science, IT & Cloud Systems",
    description: "Understand cloud service models (IaaS, PaaS, SaaS), Docker containerization, microservice decoupling, and automated CI/CD deployment pipelines.",
    iconName: "Layers",
    badgeColor: "cyan",
    estimatedHours: 18,
    modules: [
      {
        id: "mod_cld_01",
        title: "Virtualization, Containers & Docker",
        description: "Containerization fundamentals, Dockerfiles, and image layer caching.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_cld_101",
            moduleId: "mod_cld_01",
            title: "Docker Containers vs. Virtual Machines",
            readingTimeMin: 11,
            content: `### Containerization & Modern DevOps Architecture

DevOps bridges the gap between software development and IT operations through reproducible, portable environments.

#### 1. Containers vs Virtual Machines (VMs)
* **Virtual Machines**: Include a full Guest Operating System running on top of a hypervisor (Type 1 or Type 2). High memory overhead and slow boot times (minutes).
* **Docker Containers**: Share the host OS kernel and isolate processes using Linux **namespaces** (PID, NET, MNT) and **cgroups** (resource limits on CPU and RAM). Near-instant boot time (milliseconds).

#### 2. The Anatomy of a Dockerfile:
\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
\`\`\`

#### 3. Image Layer Caching
Each instruction in a Dockerfile creates a read-only layer. Ordering instructions from least frequently changed (dependencies) to most frequently changed (source code) optimizes rebuild speed.`,
            assessment: {
              question: "What primary mechanism allows Docker containers to be significantly lighter and faster than Virtual Machines?",
              option_a: "Containers share the host operating system kernel and isolate processes using namespaces and cgroups",
              option_b: "Containers execute without any CPU or memory allocation",
              option_c: "Containers compile code directly into hardware firmware",
              option_d: "Containers simulate the BIOS of the motherboard",
              correct_option: "A",
              explanation: "Unlike VMs that require a redundant guest OS and hypervisor translation, containers leverage the host Linux kernel directly with namespace and cgroup boundaries."
            }
          }
        ]
      }
    ]
  },
  {
    id: "crs_btech_cyber_01",
    title: "Cybersecurity & Network Defense",
    code: "CSE-SEC304",
    category: "Computer Science",
    educationLevel: "B.Tech",
    branchStream: "Computer Science, Cybersecurity & Networks",
    description: "Explore cryptographic foundations (AES, RSA, SHA-256), SSL/TLS handshakes, OWASP Top 10 web vulnerabilities, and Zero Trust network security architectures.",
    iconName: "Shield",
    badgeColor: "rose",
    estimatedHours: 20,
    modules: [
      {
        id: "mod_sec_01",
        title: "Applied Cryptography & Web Security",
        description: "Symmetric/Asymmetric encryption, cryptographic hashes, and SQL injection prevention.",
        orderIndex: 1,
        lessons: [
          {
            id: "les_sec_101",
            moduleId: "mod_sec_01",
            title: "Public-Key Cryptography & Digital Signatures",
            readingTimeMin: 12,
            content: `### Fundamentals of Modern Cryptography

Secure communication systems ensure three foundational pillars: **Confidentiality, Integrity, and Authenticity (CIA Triad)**.

#### 1. Symmetric vs. Asymmetric Encryption
* **Symmetric Encryption (e.g., AES-256, ChaCha20)**: Same shared secret key used for encryption and decryption. Fast and computationally lightweight.
* **Asymmetric Encryption (e.g., RSA, ECC)**: Uses a mathematically linked key pair:
  * **Public Key**: Shared openly to encrypt data.
  * **Private Key**: Kept strictly secret by the owner to decrypt data.

#### 2. Digital Signatures:
A digital signature provides **non-repudiation and integrity**:
1. Sender computes cryptographic hash $H(M)$ of message $M$.
2. Sender encrypts $H(M)$ using their **Private Key** $\\to$ Signature.
3. Receiver decrypts the signature using the sender's **Public Key** and verifies it matches $H(M)$.

#### 3. Preventing SQL Injection:
Never concatenate user inputs into SQL strings. Always use **parameterized queries**:
\`\`\`sql
-- Vulnerable to injection:
-- "SELECT * FROM users WHERE email = '" + email + "'"

-- Secure Parameterized Query:
SELECT * FROM users WHERE email = ?;
\`\`\``,
            assessment: {
              question: "When creating a digital signature to prove message authenticity, which key does the sender use to sign the message hash?",
              option_a: "The receiver's public key",
              option_b: "The sender's private key",
              option_c: "A shared symmetric secret key",
              option_d: "The Certificate Authority's public key",
              correct_option: "B",
              explanation: "The sender signs with their private key, which only they possess. Anyone with the sender's public key can verify the signature, proving authenticity and non-repudiation."
            }
          }
        ]
      }
    ]
  }
];

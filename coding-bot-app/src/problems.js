export const problemDatabase = {
  // --- ALGORITHMS TRACK ---
  Algorithms: {
    Beginner: {
      title: "Sum of Two Numbers",
      description: "Write a function that takes two numbers and returns their sum.",
      example: "Input: a = 5, b = 3 -> Output: 8",
      hints: ["Use the + operator", "Return the result"],
      starterCode: "function sum(a, b) {\n  return a + b;\n}",
      testCase: (code) => code.includes("a + b") || code.includes("a+b")
    },
    Intermediate: {
      title: "Valid Parentheses",
      description: "Check if the input string has valid matching brackets '()', '{}', '[]'.",
      example: "Input: '()[]{}' -> true",
      hints: ["Use a Stack", "Push open brackets, pop closed ones"],
      starterCode: "function isValid(s) {\n  // Write logic\n}",
      testCase: (code) => code.includes("stack") || code.includes("[]")
    },
    Advanced: {
      title: "Merge K Sorted Lists",
      description: "Merge k linked lists into one sorted list.",
      example: "Input: [[1,4],[1,3],[2,6]] -> [1,1,2,3,4,6]",
      hints: ["Use a Min-Heap", "Compare heads of lists"],
      starterCode: "function mergeKLists(lists) {\n  // Write logic\n}",
      testCase: (code) => code.includes("heap")
    }
  },

  // --- FRONTEND TRACK ---
  Frontend: {
    Beginner: {
      title: "Change Background Color",
      description: "Write a function that changes the body background color to 'blue'.",
      example: "Input: call function -> Body becomes blue",
      hints: ["Use document.body", "style.backgroundColor"],
      starterCode: "function makeBlue() {\n  // Write logic\n}",
      testCase: (code) => code.includes("document.body.style.backgroundColor")
    },
    Intermediate: {
      title: "Create a Counter",
      description: "Create a closure that increments a counter.",
      example: "const c = createCounter(); c() // 1",
      hints: ["Return a function", "Use a let variable outside"],
      starterCode: "function createCounter() {\n  // Write logic\n}",
      testCase: (code) => code.includes("return function")
    },
    Advanced: {
      title: "Debounce Function",
      description: "Implement a debounce function that limits execution rate.",
      example: "debounce(fn, 1000)",
      hints: ["Use setTimeout", "clearTimeout"],
      starterCode: "function debounce(fn, t) {\n  // Write logic\n}",
      testCase: (code) => code.includes("setTimeout")
    }
  },

  // --- BACKEND TRACK ---
  Backend: {
    Beginner: {
      title: "Basic Express Route",
      description: "Write code to set up a GET route at '/' that returns 'Hello'.",
      example: "GET / -> 'Hello'",
      hints: ["app.get", "res.send"],
      starterCode: "app.get('/', (req, res) => {\n  // Write logic\n})",
      testCase: (code) => code.includes("res.send")
    },
    Intermediate: {
      title: "Middleware Auth",
      description: "Write a middleware function to check if a token exists.",
      example: "No token -> 403 Forbidden",
      hints: ["Check req.headers", "call next()"],
      starterCode: "function auth(req, res, next) {\n  // Write logic\n}",
      testCase: (code) => code.includes("next()")
    },
    Advanced: {
      title: "MongoDB Connection",
      description: "Write the code to connect to MongoDB using Mongoose.",
      example: "mongoose.connect(...)",
      hints: ["Use mongoose.connect", "Handle promises"],
      starterCode: "mongoose.connect(uri).then(() => {\n  // Write logic\n})",
      testCase: (code) => code.includes("mongoose.connect")
    }
  }
};
const challenges = [
    // =====================
    // ALGORITHMS
    // =====================

    {
        id: 1,
        type: "Algorithms",
        level: "Beginner",
        title: "Two Sum",
        description: "Given an array of integers and a target, return the indices of two numbers that add up to the target.",
        example: {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]"
        }
    },
    {
        id: 2,
        type: "Algorithms",
        level: "Beginner",
        title: "Reverse String",
        description: "Given a string, return the string reversed.",
        example: {
            input: 's = "hello"',
            output: '"olleh"'
        }
    },
    {
        id: 3,
        type: "Algorithms",
        level: "Intermediate",
        title: "Longest Substring Without Repeating Characters",
        description: "Given a string, find the length of the longest substring without repeating characters.",
        example: {
            input: 's = "abcabcbb"',
            output: "3"
        }
    },
    {
        id: 4,
        type: "Algorithms",
        level: "Intermediate",
        title: "Valid Parentheses",
        description: "Given a string containing parentheses, determine if the input string is valid.",
        example: {
            input: 's = "()[]{}"',
            output: "true"
        }
    },
    {
        id: 5,
        type: "Algorithms",
        level: "Advanced",
        title: "Merge Intervals",
        description: "Given an array of intervals, merge all overlapping intervals.",
        example: {
            input: "[[1,3],[2,6],[8,10],[15,18]]",
            output: "[[1,6],[8,10],[15,18]]"
        }
    },
    {
        id: 6,
        type: "Algorithms",
        level: "Advanced",
        title: "Kth Largest Element",
        description: "Find the kth largest element in an unsorted array.",
        example: {
            input: "nums = [3,2,1,5,6,4], k = 2",
            output: "5"
        }
    },

    // =====================
    // FRONTEND
    // =====================

    {
        id: 7,
        type: "Frontend",
        level: "Beginner",
        title: "Change Background Color",
        description: "Write a function that changes the page background color to blue when a button is clicked.",
        example: {
            input: "Button click",
            output: "Background color changes to blue"
        }
    },
    {
        id: 8,
        type: "Frontend",
        level: "Beginner",
        title: "Show / Hide Text",
        description: "Create a button that toggles the visibility of a text paragraph.",
        example: {
            input: "Button click",
            output: "Text shown or hidden"
        }
    },
    {
        id: 9,
        type: "Frontend",
        level: "Intermediate",
        title: "Debounce Function",
        description: "Implement a debounce function that limits how often a function can be executed.",
        example: {
            input: "Rapid function calls",
            output: "Function executes after delay"
        }
    },
    {
        id: 10,
        type: "Frontend",
        level: "Intermediate",
        title: "Form Validation",
        description: "Validate a form with email and password fields before submission.",
        example: {
            input: "Invalid email format",
            output: "Error message shown"
        }
    },
    {
        id: 11,
        type: "Frontend",
        level: "Advanced",
        title: "Infinite Scroll",
        description: "Implement infinite scrolling that loads more data when the user reaches the bottom of the page.",
        example: {
            input: "Scroll to bottom",
            output: "More items loaded"
        }
    },
    {
        id: 12,
        type: "Frontend",
        level: "Advanced",
        title: "Drag and Drop List",
        description: "Implement drag-and-drop functionality to reorder a list of items.",
        example: {
            input: "Drag list item",
            output: "Items reordered"
        }
    },

    // =====================
    // BACKEND
    // =====================

    {
        id: 13,
        type: "Backend",
        level: "Beginner",
        title: "Simple API Route",
        description: "Create a GET API endpoint that returns a JSON message.",
        example: {
            input: "GET /api/test",
            output: '{ "message": "Hello World" }'
        }
    },
    {
        id: 14,
        type: "Backend",
        level: "Beginner",
        title: "POST API Endpoint",
        description: "Create a POST API endpoint that accepts JSON data and returns it.",
        example: {
            input: "POST /api/data",
            output: "{ success: true }"
        }
    },
    {
        id: 15,
        type: "Backend",
        level: "Intermediate",
        title: "User Login API",
        description: "Create a POST API that accepts email and password and validates the input.",
        example: {
            input: "{ email, password }",
            output: "Login success or error"
        }
    },
    {
        id: 16,
        type: "Backend",
        level: "Intermediate",
        title: "CRUD API",
        description: "Build a simple CRUD API for managing items.",
        example: {
            input: "POST /api/items",
            output: "Item created"
        }
    },
    {
        id: 17,
        type: "Backend",
        level: "Advanced",
        title: "Protected Route with Middleware",
        description: "Create a protected API route using middleware to verify authentication.",
        example: {
            input: "Request with token",
            output: "Access granted or denied"
        }
    },
    {
        id: 18,
        type: "Backend",
        level: "Advanced",
        title: "Rate Limiter",
        description: "Implement rate limiting middleware to restrict API request frequency.",
        example: {
            input: "Multiple requests",
            output: "429 Too Many Requests"
        }
    }
];

module.exports = challenges;

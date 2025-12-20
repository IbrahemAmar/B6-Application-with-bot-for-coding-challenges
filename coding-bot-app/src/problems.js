export const problemDatabase = {
  Beginner: {
    title: "Sum of Two Numbers",
    description: "Write a function that takes two numbers and returns their sum.",
    example: "Input: a = 5, b = 3 -> Output: 8",
    hints: [
      "You just need to use the plus (+) operator.",
      "Return the result of a + b.",
      "Check if inputs are numbers first."
    ],
    starterCode: "function sum(a, b) {\n  // Write your code here\n  \n}",
    testCase: (code) => code.includes("return a + b") || code.includes("return a+b")
  },
  Intermediate: {
    title: "Valid Parentheses",
    description: "Given a string containing only '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    example: "Input: s = '()[]{}' -> true\nInput: s = '(]' -> false",
    hints: [
      "Use a stack data structure.",
      "Push opening brackets onto the stack.",
      "When you see a closing bracket, check if it matches the top of the stack."
    ],
    starterCode: "function isValid(s) {\n  // Write your code here\n  \n}",
    testCase: (code) => code.includes("stack") || code.includes("[]")
  },
  Advanced: {
    title: "Merge K Sorted Lists",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list.",
    example: "Input: lists = [[1,4,5],[1,3,4],[2,6]] -> [1,1,2,3,4,4,5,6]",
    hints: [
      "Compare the head of every list.",
      "Use a Min-Heap (Priority Queue) to efficiently find the smallest element.",
      "Time complexity should be O(N log k)."
    ],
    starterCode: "function mergeKLists(lists) {\n  // Write your code here\n  \n}",
    testCase: (code) => code.includes("heap") || code.includes("priority")
  }
};
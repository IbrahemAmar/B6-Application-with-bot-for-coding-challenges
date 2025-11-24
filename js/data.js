// js/data.js

// Fake user profile
const currentUser = {
  name: "Ibrahem",
  level: "Intermediate",
  track: "Algorithms",
  solved: 18,
  streak: 5,
  rating: 1420
};

// Fake daily challenges per difficulty
const challengesByDifficulty = {
  Beginner: {
    title: "Two Sum (Beginner)",
    difficulty: "Beginner",
    description:
      "Given an array of integers and a target, return indices of the two numbers such that they add up to the target.",
    io: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9."
  },
  Intermediate: {
    title: "Valid Parentheses",
    difficulty: "Intermediate",
    description:
      "Given a string containing only '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    io: "Input: s = \"()[]{}\" -> true\nInput: s = \"(]\" -> false"
  },
  Advanced: {
    title: "LRU Cache",
    difficulty: "Advanced",
    description:
      "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) operations.",
    io: "Capacity = 2\nput(1,1), put(2,2), get(1) -> 1, put(3,3), get(2) -> -1"
  }
};

// Fake history
const fakeHistory = [
  { title: "Reverse Linked List", difficulty: "Intermediate", score: 100, time: 25, date: "2025-03-01" },
  { title: "Palindrome Number", difficulty: "Beginner", score: 80, time: 15, date: "2025-02-27" },
  { title: "Merge Intervals", difficulty: "Advanced", score: 95, time: 40, date: "2025-02-20" }
];

// Fake achievements
const fakeAchievements = [
  { label: "First Blood", description: "Solved your first challenge.", color: "bg-green-100 text-green-700" },
  { label: "Streak x5", description: "5 days with at least one solved challenge.", color: "bg-yellow-100 text-yellow-700" },
  { label: "Algo Lover", description: "Solved 10+ algorithm problems.", color: "bg-purple-100 text-purple-700" }
];

// Helper for difficulty styling
function difficultyClasses(d) {
  if (d === "Beginner") return "bg-green-100 text-green-700";
  if (d === "Intermediate") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

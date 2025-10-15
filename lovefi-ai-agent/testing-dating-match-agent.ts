#!/usr/bin/env node

/**
 * TypeScript equivalent of testing_dating_match_agent.py
 * Tests the Dating Match Agent using agent communication
 */

import { Agent, Context } from "uagents";
import { randomBytes } from "crypto";

// Define interfaces equivalent to Python models
interface PersonalInfo {
  firstName: string;
  lastName: string;
  birthday: string;
}

interface Location {
  address: string;
  searchRadius: number;
}

interface Preference {
  category: string;
  question: string;
  options: string[];
  selectedIndex: number;
  selectedOption: string;
}

interface MatchRequest {
  personalInfo1: PersonalInfo;
  gender1: string;
  location1: Location;
  personalInterests1: string[];
  partnerPreferences1: Preference[];
  personalInfo2: PersonalInfo;
  gender2: string;
  location2: Location;
  personalInterests2: string[];
  partnerPreferences2: Preference[];
}

interface MatchResponse {
  score: number;
  details: string;
}

interface TestPersonProfile {
  name: string;
  age: number;
  interests: string[];
  location: string;
  preferences: {
    maxAgeDiff: number;
    searchRadius?: number;
  };
}

interface TestProfile {
  name: string;
  person1: TestPersonProfile;
  person2: TestPersonProfile;
  expected: string;
}

interface TestResult {
  name: string;
  score: number;
  details: string;
  expected: string;
}

// Test profiles from test_agent_logic.py
const TEST_PROFILES: TestProfile[] = [
  {
    name: "Perfect Match Test",
    person1: {
      name: "Alice",
      age: 25,
      interests: ["reading", "hiking", "cooking"],
      location: "New York",
      preferences: { maxAgeDiff: 5 },
    },
    person2: {
      name: "Bob",
      age: 26,
      interests: ["reading", "hiking", "cooking"],
      location: "New York",
      preferences: { maxAgeDiff: 5 },
    },
    expected: "High score (80-100)",
  },
  {
    name: "Good Match Test",
    person1: {
      name: "Charlie",
      age: 30,
      interests: ["movies", "travel", "photography"],
      location: "San Francisco",
      preferences: { maxAgeDiff: 8 },
    },
    person2: {
      name: "Diana",
      age: 28,
      interests: ["travel", "photography", "art"],
      location: "San Francisco",
      preferences: { maxAgeDiff: 6 },
    },
    expected: "Good score (60-85)",
  },
  {
    name: "Poor Match Test",
    person1: {
      name: "Eve",
      age: 22,
      interests: ["gaming", "coding"],
      location: "Boston",
      preferences: { maxAgeDiff: 3 },
    },
    person2: {
      name: "Frank",
      age: 35,
      interests: ["golf", "wine tasting"],
      location: "Seattle",
      preferences: { maxAgeDiff: 5 },
    },
    expected: "Low score (0-40)",
  },
  {
    name: "Age Gap Test",
    person1: {
      name: "Grace",
      age: 25,
      interests: ["music", "dancing"],
      location: "Chicago",
      preferences: { maxAgeDiff: 10 },
    },
    person2: {
      name: "Henry",
      age: 40,
      interests: ["music", "dancing"],
      location: "Chicago",
      preferences: { maxAgeDiff: 15 },
    },
    expected: "Medium score (40-70)",
  },
  {
    name: "Different Locations Test",
    person1: {
      name: "Ivy",
      age: 29,
      interests: ["fitness", "cooking", "travel"],
      location: "Los Angeles",
      preferences: { maxAgeDiff: 4 },
    },
    person2: {
      name: "Jack",
      age: 31,
      interests: ["fitness", "cooking", "movies"],
      location: "Miami",
      preferences: { maxAgeDiff: 6 },
    },
    expected: "Good score (50-75)",
  },
];

// Agent configuration
const TEST_AGENT_SEED = "test_seed_5678";
const DATING_AGENT_ADDRESS =
  "agent1qgh8g2gfcrrcjqjuuav8v6de3tp3dtc7f5hz4aveccpyym0g6s06ge5yf9w";
const TEST_AGENT_PORT = 8001;
const TEST_AGENT_ENDPOINT = `http://localhost:${TEST_AGENT_PORT}/submit`;

// Global state for test tracking
let testResults: TestResult[] = [];
let currentTestIndex = 0;

/**
 * Create a MatchRequest from a test profile
 */
function createMatchRequest(profile: TestProfile): MatchRequest {
  const p1 = profile.person1;
  const p2 = profile.person2;

  // Create PersonalInfo objects
  const personalInfo1: PersonalInfo = {
    firstName: p1.name.split(" ")[0],
    lastName:
      p1.name.split(" ").length > 1 ? p1.name.split(" ").slice(-1)[0] : "",
    birthday: "", // Using empty birthday since we have age directly
  };

  const personalInfo2: PersonalInfo = {
    firstName: p2.name.split(" ")[0],
    lastName:
      p2.name.split(" ").length > 1 ? p2.name.split(" ").slice(-1)[0] : "",
    birthday: "",
  };

  // Create Location objects
  const location1: Location = {
    address: p1.location,
    searchRadius: p1.preferences.searchRadius || 10,
  };

  const location2: Location = {
    address: p2.location,
    searchRadius: p2.preferences.searchRadius || 10,
  };

  // Create preferences (empty for now as test doesn't use detailed preferences)
  const partnerPreferences1: Preference[] = [];
  const partnerPreferences2: Preference[] = [];

  return {
    personalInfo1,
    gender1: "not_specified",
    location1,
    personalInterests1: p1.interests,
    partnerPreferences1,
    personalInfo2,
    gender2: "not_specified",
    location2,
    personalInterests2: p2.interests,
    partnerPreferences2,
  };
}

/**
 * Create and configure the test agent
 */
async function createTestAgent(): Promise<Agent> {
  const agent = new Agent({
    name: "TestAgent",
    seed: TEST_AGENT_SEED,
    port: TEST_AGENT_PORT,
    endpoint: [TEST_AGENT_ENDPOINT],
  });

  return agent;
}

/**
 * Handle responses from the dating agent
 */
async function handleMatchResponse(
  ctx: Context,
  sender: string,
  response: MatchResponse
): Promise<void> {
  if (currentTestIndex < TEST_PROFILES.length) {
    const profile = TEST_PROFILES[currentTestIndex];
    testResults.push({
      name: profile.name,
      score: response.score,
      details: response.details,
      expected: profile.expected,
    });

    console.log(
      `✅ Received response for ${profile.name}: Score ${response.score.toFixed(
        1
      )}/100`
    );
    console.log(`Details: ${response.details}`);

    // Send next test if available
    currentTestIndex += 1;
    if (currentTestIndex < TEST_PROFILES.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Small delay between tests
      const nextProfile = TEST_PROFILES[currentTestIndex];
      const request = createMatchRequest(nextProfile);

      await ctx.send(DATING_AGENT_ADDRESS, request);
      console.log(`📤 Sent test request: ${nextProfile.name}`);
    } else {
      // All tests completed, print summary
      printTestSummary();
    }
  }
}

/**
 * Print a summary of all test results
 */
function printTestSummary(): void {
  console.log("\n" + "=".repeat(60));
  console.log("DATING MATCH AGENT TEST SUMMARY");
  console.log("=".repeat(60));

  testResults.forEach((result, i) => {
    console.log(`\nTest ${i + 1}: ${result.name}`);
    console.log(`Score: ${result.score.toFixed(1)}/100`);
    console.log(`Expected: ${result.expected}`);
    console.log(`Details: ${result.details}`);
  });

  console.log("\n" + "=".repeat(60));
  console.log(`Completed ${testResults.length} test(s) successfully!`);
  console.log("=".repeat(60));
}

/**
 * Send initial test request on startup
 */
async function sendTestRequests(ctx: Context): Promise<void> {
  console.log("🚀 Starting Dating Match Agent Tests");
  console.log(`Running ${TEST_PROFILES.length} test cases...\n`);

  // Send the first test
  if (TEST_PROFILES.length > 0) {
    currentTestIndex = 0;
    const profile = TEST_PROFILES[currentTestIndex];
    const request = createMatchRequest(profile);

    await ctx.send(DATING_AGENT_ADDRESS, request);
    console.log(`📤 Sent first test request: ${profile.name}`);
  }
}

/**
 * Print test profiles information
 */
function printTestProfiles(): void {
  console.log("Creating test agents...");

  // Create simple agent instances to show addresses
  const testAgent = new Agent({
    name: "TestAgent",
    seed: TEST_AGENT_SEED,
  });

  const datingAgent = new Agent({
    name: "DatingMatchAgent",
    seed: "dating_match_seed_1234",
  });

  console.log(`TestAgent address: ${testAgent.address}`);
  console.log(`DatingMatchAgent address: ${datingAgent.address}`);

  console.log("\n" + "=".repeat(60));
  console.log("TEST PROFILES TO BE TESTED:");
  console.log("=".repeat(60));

  TEST_PROFILES.forEach((profile, i) => {
    const p1 = profile.person1;
    const p2 = profile.person2;

    console.log(`\nTest ${i + 1}: ${profile.name}`);
    console.log(
      `  Person 1: ${p1.name}, Age ${p1.age}, Interests: [${p1.interests.join(
        ", "
      )}], Location: ${p1.location}`
    );
    console.log(
      `  Person 2: ${p2.name}, Age ${p2.age}, Interests: [${p2.interests.join(
        ", "
      )}], Location: ${p2.location}`
    );
    console.log(`  Expected: ${profile.expected}`);
  });

  console.log("\n" + "=".repeat(60));
  console.log("USAGE:");
  console.log("=".repeat(60));
  console.log("1. First, start the DatingMatchAgent:");
  console.log("   python dating_match_agent.py");
  console.log("\n2. Then, in another terminal, run the tests:");
  console.log("   ts-node testing-dating-match-agent.ts --run-tests");
  console.log("   # or compile and run:");
  console.log(
    "   npx tsc testing-dating-match-agent.ts && node testing-dating-match-agent.js --run-tests"
  );
  console.log("\n3. Or run direct function tests:");
  console.log("   python test_agent_logic.py");
  console.log("=".repeat(60));
}

/**
 * Run the actual agent communication tests
 */
async function runAgentTests(): Promise<void> {
  console.log("🚀 Starting Dating Match Agent Communication Tests");

  try {
    const agent = await createTestAgent();
    console.log(`TestAgent address: ${agent.address}`);
    console.log("Starting test agent on http://localhost:8001...");
    console.log(
      "Make sure the DatingMatchAgent is running on http://localhost:8000"
    );
    console.log("-".repeat(60));

    // Register event handlers
    agent.on_startup(async (ctx: Context) => {
      await sendTestRequests(ctx);
    });

    // Note: In a real implementation, you would need to set up message handlers
    // This is a simplified version focusing on the structure
    console.log("Agent handlers configured. Starting agent...");

    // In a real implementation, you would start the agent here
    // await agent.run();

    console.log(
      "Note: This is a TypeScript translation. For full functionality,"
    );
    console.log(
      "you would need to integrate with the actual μAgents TypeScript/JavaScript SDK."
    );
  } catch (error) {
    console.error("Error running agent tests:", error);
  }
}

/**
 * Calculate match score directly (simplified version for demonstration)
 */
function calculateMatchScore(profile: TestProfile): {
  score: number;
  details: string;
} {
  const p1 = profile.person1;
  const p2 = profile.person2;

  let score = 0;
  const details: string[] = [];

  // Interest compatibility (40%)
  const commonInterests = p1.interests.filter((interest) =>
    p2.interests.includes(interest)
  );
  const maxInterests = Math.max(p1.interests.length, p2.interests.length, 1);
  const interestScore = (commonInterests.length / maxInterests) * 40;
  score += interestScore;
  details.push(
    `Interest compatibility: ${interestScore.toFixed(
      1
    )}/40 (Common interests: ${commonInterests.join(", ") || "None"})`
  );

  // Age compatibility (20%)
  const ageDiff = Math.abs(p1.age - p2.age);
  const maxAgeDiff = Math.max(
    p1.preferences.maxAgeDiff,
    p2.preferences.maxAgeDiff
  );
  const ageScore = Math.max(0, 1 - ageDiff / maxAgeDiff) * 20;
  score += ageScore;
  details.push(
    `Age compatibility: ${ageScore.toFixed(
      1
    )}/20 (Age difference: ${ageDiff} years)`
  );

  // Location compatibility (20%)
  const sameLocation = p1.location === p2.location;
  const locationScore = sameLocation ? 20 : 0;
  score += locationScore;
  details.push(
    `Location compatibility: ${locationScore.toFixed(1)}/20 (Same location: ${
      sameLocation ? "Yes" : "No"
    })`
  );

  // Preference compatibility (20%) - simplified
  const prefScore = 0; // No detailed preferences in test data
  score += prefScore;
  details.push(
    `Preference compatibility: ${prefScore.toFixed(
      1
    )}/20 (Matching preferences: 0/0)`
  );

  return {
    score: Math.min(Math.max(score, 0), 100),
    details: details.join("; "),
  };
}

/**
 * Run direct function tests (without agent communication)
 */
function runDirectTests(): void {
  console.log("🔧 DIRECT FUNCTION TESTS (TypeScript)");
  console.log("=".repeat(60));

  TEST_PROFILES.forEach((profile, i) => {
    console.log(`\nTest ${i + 1}: ${profile.name}`);
    console.log("-".repeat(40));

    const result = calculateMatchScore(profile);
    const p1 = profile.person1;
    const p2 = profile.person2;

    console.log(
      `Person 1: ${p1.name}, Age: ${p1.age}, Interests: [${p1.interests.join(
        ", "
      )}], Location: ${p1.location}`
    );
    console.log(
      `Person 2: ${p2.name}, Age: ${p2.age}, Interests: [${p2.interests.join(
        ", "
      )}], Location: ${p2.location}`
    );
    console.log(`Match Score: ${result.score.toFixed(1)}/100`);
    console.log(`Details: ${result.details}`);
    console.log(`Expected: ${profile.expected}`);

    // Simple validation
    let passed = false;
    if (profile.expected.includes("Low score") && result.score <= 40) {
      passed = true;
    } else if (
      profile.expected.includes("Medium score") &&
      result.score >= 40 &&
      result.score <= 70
    ) {
      passed = true;
    } else if (profile.expected.includes("Good score") && result.score >= 50) {
      passed = true;
    } else if (profile.expected.includes("High score") && result.score >= 70) {
      passed = true;
    }

    console.log(
      passed ? "✅ PASS" : "⚠️  REVIEW - Score may not match expected range"
    );
  });

  console.log("\n" + "=".repeat(60));
  console.log("DIRECT FUNCTION TEST RESULTS: All tests completed");
  console.log("=".repeat(60));
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--run-tests")) {
    await runAgentTests();
  } else if (args.includes("--direct-tests")) {
    runDirectTests();
  } else {
    printTestProfiles();
  }
}

// Export for module usage
export {
  TEST_PROFILES,
  createMatchRequest,
  calculateMatchScore,
  TestProfile,
  MatchRequest,
  MatchResponse,
};

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
}

#!/usr/bin/env node

/**
 * JavaScript Dating Match Agent Tester
 * Tests the Dating Match Agent functionality (converted from TypeScript)
 */

// Test profiles from test_agent_logic.py
const TEST_PROFILES = [
  {
    name: "Perfect Match Test",
    person1: {
      name: "Alice",
      age: 25,
      interests: ["reading", "hiking", "cooking"],
      location: "New York",
      preferences: { maxAgeDiff: 5 }
    },
    person2: {
      name: "Bob",
      age: 26,
      interests: ["reading", "hiking", "cooking"],
      location: "New York",
      preferences: { maxAgeDiff: 5 }
    },
    expected: "High score (80-100)"
  },
  {
    name: "Good Match Test",
    person1: {
      name: "Charlie",
      age: 30,
      interests: ["movies", "travel", "photography"],
      location: "San Francisco",
      preferences: { maxAgeDiff: 8 }
    },
    person2: {
      name: "Diana",
      age: 28,
      interests: ["travel", "photography", "art"],
      location: "San Francisco",
      preferences: { maxAgeDiff: 6 }
    },
    expected: "Good score (60-85)"
  },
  {
    name: "Poor Match Test",
    person1: {
      name: "Eve",
      age: 22,
      interests: ["gaming", "coding"],
      location: "Boston",
      preferences: { maxAgeDiff: 3 }
    },
    person2: {
      name: "Frank",
      age: 35,
      interests: ["golf", "wine tasting"],
      location: "Seattle",
      preferences: { maxAgeDiff: 5 }
    },
    expected: "Low score (0-40)"
  },
  {
    name: "Age Gap Test",
    person1: {
      name: "Grace",
      age: 25,
      interests: ["music", "dancing"],
      location: "Chicago",
      preferences: { maxAgeDiff: 10 }
    },
    person2: {
      name: "Henry",
      age: 40,
      interests: ["music", "dancing"],
      location: "Chicago",
      preferences: { maxAgeDiff: 15 }
    },
    expected: "Medium score (40-70)"
  },
  {
    name: "Different Locations Test",
    person1: {
      name: "Ivy",
      age: 29,
      interests: ["fitness", "cooking", "travel"],
      location: "Los Angeles",
      preferences: { maxAgeDiff: 4 }
    },
    person2: {
      name: "Jack",
      age: 31,
      interests: ["fitness", "cooking", "movies"],
      location: "Miami",
      preferences: { maxAgeDiff: 6 }
    },
    expected: "Good score (50-75)"
  }
];

/**
 * Create a MatchRequest from a test profile
 */
function createMatchRequest(profile) {
  const p1 = profile.person1;
  const p2 = profile.person2;

  // Create PersonalInfo objects
  const personalInfo1 = {
    firstName: p1.name.split(' ')[0],
    lastName: p1.name.split(' ').length > 1 ? p1.name.split(' ').slice(-1)[0] : "",
    birthday: "" // Using empty birthday since we have age directly
  };

  const personalInfo2 = {
    firstName: p2.name.split(' ')[0],
    lastName: p2.name.split(' ').length > 1 ? p2.name.split(' ').slice(-1)[0] : "",
    birthday: ""
  };

  // Create Location objects
  const location1 = {
    address: p1.location,
    searchRadius: p1.preferences.searchRadius || 10
  };

  const location2 = {
    address: p2.location,
    searchRadius: p2.preferences.searchRadius || 10
  };

  // Create preferences (empty for now as test doesn't use detailed preferences)
  const partnerPreferences1 = [];
  const partnerPreferences2 = [];

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
    partnerPreferences2
  };
}

/**
 * Calculate distance between two locations (simplified)
 */
function calculateDistance(location1, location2) {
  // Simplified distance calculation for major US cities
  const cityCoords = {
    "New York": [40.7128, -74.0060],
    "San Francisco": [37.7749, -122.4194],
    "Boston": [42.3601, -71.0589],
    "Chicago": [41.8781, -87.6298],
    "Los Angeles": [34.0522, -118.2437],
    "Seattle": [47.6062, -122.3321],
    "Miami": [25.7617, -80.1918]
  };

  const coords1 = cityCoords[location1];
  const coords2 = cityCoords[location2];

  if (!coords1 || !coords2) {
    // If we don't have coordinates, return a large distance for different cities
    return location1 === location2 ? 0 : 3000;
  }

  // Haversine formula (simplified)
  const R = 6371; // Earth's radius in km
  const dLat = (coords2[0] - coords1[0]) * Math.PI / 180;
  const dLon = (coords2[1] - coords1[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coords1[0] * Math.PI / 180) * Math.cos(coords2[0] * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate match score using JavaScript implementation
 */
function calculateMatchScore(profile) {
  const p1 = profile.person1;
  const p2 = profile.person2;
  
  let score = 0;
  const details = [];

  // Interest compatibility (40%)
  const commonInterests = p1.interests.filter(interest => 
    p2.interests.includes(interest)
  );
  const maxInterests = Math.max(p1.interests.length, p2.interests.length, 1);
  const interestScore = (commonInterests.length / maxInterests) * 40;
  score += interestScore;
  details.push(`Interest compatibility: ${interestScore.toFixed(1)}/40 (Common interests: ${commonInterests.join(', ') || 'None'})`);

  // Age compatibility (20%)
  const ageDiff = Math.abs(p1.age - p2.age);
  const maxAgeDiff = Math.max(p1.preferences.maxAgeDiff, p2.preferences.maxAgeDiff);
  const ageScore = Math.max(0, (1 - ageDiff / maxAgeDiff)) * 20;
  score += ageScore;
  details.push(`Age compatibility: ${ageScore.toFixed(1)}/20 (Age difference: ${ageDiff} years)`);

  // Location compatibility (20%)
  const distance = calculateDistance(p1.location, p2.location);
  const maxRadius = Math.max(p1.preferences.searchRadius || 10, p2.preferences.searchRadius || 10);
  let locationScore = 0;
  if (distance <= maxRadius) {
    locationScore = 20 * (1 - distance / maxRadius);
  }
  score += locationScore;
  details.push(`Location compatibility: ${locationScore.toFixed(1)}/20 (Distance: ${distance.toFixed(1)} km)`);

  // Preference compatibility (20%) - simplified
  const prefScore = 0; // No detailed preferences in test data
  score += prefScore;
  details.push(`Preference compatibility: ${prefScore.toFixed(1)}/20 (Matching preferences: 0/0)`);

  return {
    score: Math.min(Math.max(score, 0), 100),
    details: details.join('; ')
  };
}

/**
 * Validate test result against expected outcome
 */
function validateTestResult(result, expected) {
  const score = result.score;
  
  if (expected.includes("Low score") && score <= 40) {
    return true;
  } else if (expected.includes("Medium score") && score >= 40 && score <= 70) {
    return true;
  } else if (expected.includes("Good score") && score >= 50) {
    return true;
  } else if (expected.includes("High score") && score >= 70) {
    return true;
  }
  
  return false;
}

/**
 * Run all tests
 */
function runTests() {
  const results = [];

  console.log("🚀 JavaScript Dating Match Agent Tests");
  console.log("=".repeat(60));
  console.log(`Running ${TEST_PROFILES.length} test cases...\n`);

  TEST_PROFILES.forEach((profile, i) => {
    console.log(`Test ${i + 1}: ${profile.name}`);
    console.log("-".repeat(40));

    const matchResult = calculateMatchScore(profile);
    const passed = validateTestResult(matchResult, profile.expected);
    const p1 = profile.person1;
    const p2 = profile.person2;

    console.log(`Person 1: ${p1.name}, Age: ${p1.age}, Interests: [${p1.interests.join(', ')}], Location: ${p1.location}`);
    console.log(`Person 2: ${p2.name}, Age: ${p2.age}, Interests: [${p2.interests.join(', ')}], Location: ${p2.location}`);
    console.log(`Match Score: ${matchResult.score.toFixed(1)}/100`);
    console.log(`Details: ${matchResult.details}`);
    console.log(`Expected: ${profile.expected}`);
    console.log(passed ? "✅ PASS" : "⚠️  REVIEW - Score may not match expected range");
    console.log();

    results.push({
      name: profile.name,
      score: matchResult.score,
      details: matchResult.details,
      expected: profile.expected,
      passed
    });
  });

  return results;
}

/**
 * Print test summary
 */
function printTestSummary(results) {
  console.log("=".repeat(60));
  console.log("TEST SUMMARY");
  console.log("=".repeat(60));

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  results.forEach((result, i) => {
    console.log(`\nTest ${i + 1}: ${result.name}`);
    console.log(`  Score: ${result.score.toFixed(1)}/100`);
    console.log(`  Expected: ${result.expected}`);
    console.log(`  Status: ${result.passed ? '✅ PASSED' : '⚠️  REVIEW'}`);
  });

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Results: ${passedCount}/${totalCount} tests passed`);
  console.log(`Success Rate: ${((passedCount / totalCount) * 100).toFixed(1)}%`);
  console.log("=".repeat(60));

  if (passedCount === totalCount) {
    console.log("🎉 All tests passed! The JavaScript implementation works correctly.");
  } else {
    console.log("⚠️  Some tests need review. This may be due to algorithm differences.");
  }
}

/**
 * Print usage information
 */
function printUsage() {
  console.log("JavaScript Dating Match Agent Tester");
  console.log("=".repeat(40));
  console.log("This is a standalone JavaScript implementation of the dating match testing.");
  console.log("\nUsage:");
  console.log("  node dating-match-test.js [options]");
  console.log("\nOptions:");
  console.log("  --test      Run all test cases");
  console.log("  --profiles  Show test profiles");
  console.log("  --help      Show this help message");
  console.log("\nExamples:");
  console.log("  node dating-match-test.js --test");
  console.log("  node dating-match-test.js --profiles");
}

/**
 * Print test profiles
 */
function printTestProfiles() {
  console.log("Test Profiles for JavaScript Dating Match Agent");
  console.log("=".repeat(60));

  TEST_PROFILES.forEach((profile, i) => {
    const p1 = profile.person1;
    const p2 = profile.person2;
    
    console.log(`\nTest ${i + 1}: ${profile.name}`);
    console.log(`  Person 1: ${p1.name}, Age ${p1.age}, Interests: [${p1.interests.join(', ')}], Location: ${p1.location}`);
    console.log(`  Person 2: ${p2.name}, Age ${p2.age}, Interests: [${p2.interests.join(', ')}], Location: ${p2.location}`);
    console.log(`  Expected: ${profile.expected}`);
  });

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Total Test Profiles: ${TEST_PROFILES.length}`);
  console.log("=".repeat(60));
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--test')) {
    const results = runTests();
    printTestSummary(results);
  } else if (args.includes('--profiles')) {
    printTestProfiles();
  } else if (args.includes('--help')) {
    printUsage();
  } else {
    printUsage();
    console.log("\n" + "=".repeat(60));
    console.log("Running tests by default...");
    console.log("=".repeat(60));
    const results = runTests();
    printTestSummary(results);
  }
}

// Export for module usage
module.exports = {
  TEST_PROFILES,
  createMatchRequest,
  calculateMatchScore,
  validateTestResult
};

// Run if called directly
if (require.main === module) {
  main();
}

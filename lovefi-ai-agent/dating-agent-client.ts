import fetch from 'node-fetch';

// Type definitions matching the Python models
interface PersonalInfo {
  first_name: string;
  last_name: string;
  birthday: string;
}

interface Location {
  address: string;
  search_radius: number;
}

interface Preference {
  category: string;
  question: string;
  options: string[];
  selected_index: number;
  selected_option: string;
}

interface MatchRequest {
  personal_info1: PersonalInfo;
  gender1: string;
  location1: Location;
  personal_interests1: string[];
  partner_preferences1: Preference[];
  personal_info2: PersonalInfo;
  gender2: string;
  location2: Location;
  personal_interests2: string[];
  partner_preferences2: Preference[];
}

interface MatchResponse {
  score: number;
  details: string;
}

interface TestProfile {
  name: string;
  person1: {
    name: string;
    age: number;
    interests: string[];
    location: string;
    preferences: { max_age_diff: number };
  };
  person2: {
    name: string;
    age: number;
    interests: string[];
    location: string;
    preferences: { max_age_diff: number };
  };
  expected: string;
}

// Sample test profiles
const TEST_PROFILES: TestProfile[] = [
  {
    name: "Perfect Match Test",
    person1: {
      name: "Alice",
      age: 25,
      interests: ["reading", "hiking", "cooking"],
      location: "New York",
      preferences: { max_age_diff: 5 }
    },
    person2: {
      name: "Bob",
      age: 26,
      interests: ["reading", "hiking", "cooking"],
      location: "New York",
      preferences: { max_age_diff: 5 }
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
      preferences: { max_age_diff: 8 }
    },
    person2: {
      name: "Diana",
      age: 28,
      interests: ["travel", "photography", "art"],
      location: "San Francisco",
      preferences: { max_age_diff: 6 }
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
      preferences: { max_age_diff: 3 }
    },
    person2: {
      name: "Frank",
      age: 35,
      interests: ["golf", "wine tasting"],
      location: "Seattle",
      preferences: { max_age_diff: 5 }
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
      preferences: { max_age_diff: 10 }
    },
    person2: {
      name: "Henry",
      age: 40,
      interests: ["music", "dancing"],
      location: "Chicago",
      preferences: { max_age_diff: 15 }
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
      preferences: { max_age_diff: 4 }
    },
    person2: {
      name: "Jack",
      age: 31,
      interests: ["fitness", "cooking", "movies"],
      location: "Miami",
      preferences: { max_age_diff: 6 }
    },
    expected: "Good score (50-75)"
  }
];

class DatingAgentClient {
  private baseUrl: string;
  private agentAddress: string;

  constructor(baseUrl: string = 'http://localhost:8000', agentAddress: string = 'agent1qgh8g2gfcrrcjqjuuav8v6de3tp3dtc7f5hz4aveccpyym0g6s06ge5yf9w') {
    this.baseUrl = baseUrl;
    this.agentAddress = agentAddress;
  }

  // Helper function to convert test profile to MatchRequest
  private createMatchRequest(profile: TestProfile): MatchRequest {
    const p1 = profile.person1;
    const p2 = profile.person2;

    // Split names into first and last
    const name1Parts = p1.name.split(' ');
    const name2Parts = p2.name.split(' ');

    const personalInfo1: PersonalInfo = {
      first_name: name1Parts[0],
      last_name: name1Parts.length > 1 ? name1Parts.slice(1).join(' ') : '',
      birthday: '' // Using empty birthday since we have age directly
    };

    const personalInfo2: PersonalInfo = {
      first_name: name2Parts[0],
      last_name: name2Parts.length > 1 ? name2Parts.slice(1).join(' ') : '',
      birthday: ''
    };

    const location1: Location = {
      address: p1.location,
      search_radius: p1.preferences.max_age_diff || 10
    };

    const location2: Location = {
      address: p2.location,
      search_radius: p2.preferences.max_age_diff || 10
    };

    return {
      personal_info1: personalInfo1,
      gender1: "not_specified",
      location1: location1,
      personal_interests1: p1.interests,
      partner_preferences1: [], // Empty for now as test doesn't use detailed preferences
      personal_info2: personalInfo2,
      gender2: "not_specified",
      location2: location2,
      personal_interests2: p2.interests,
      partner_preferences2: []
    };
  }

  // Send a match request to the agent
  async sendMatchRequest(matchRequest: MatchRequest): Promise<MatchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/agents/${this.agentAddress}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'MatchRequest',
          data: matchRequest
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result as MatchResponse;
    } catch (error) {
      console.error('Error sending match request:', error);
      throw error;
    }
  }

  // Test a single profile
  async testProfile(profile: TestProfile): Promise<{ profile: TestProfile; result: MatchResponse }> {
    console.log(`\n🧪 Testing: ${profile.name}`);
    console.log(`   Person 1: ${profile.person1.name}, Age ${profile.person1.age}, Location: ${profile.person1.location}`);
    console.log(`   Person 2: ${profile.person2.name}, Age ${profile.person2.age}, Location: ${profile.person2.location}`);
    console.log(`   Expected: ${profile.expected}`);

    const matchRequest = this.createMatchRequest(profile);
    const result = await this.sendMatchRequest(matchRequest);

    console.log(`   ✅ Result: Score ${result.score.toFixed(1)}/100`);
    console.log(`   📝 Details: ${result.details}`);

    return { profile, result };
  }

  // Run all test profiles
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Dating Match Agent Tests (TypeScript Client)');
    console.log(`📡 Connecting to: ${this.baseUrl}`);
    console.log(`🎯 Target Agent: ${this.agentAddress}`);
    console.log(`📊 Running ${TEST_PROFILES.length} test cases...\n`);

    const results: { profile: TestProfile; result: MatchResponse }[] = [];

    try {
      for (const profile of TEST_PROFILES) {
        const testResult = await this.testProfile(profile);
        results.push(testResult);
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Print summary
      this.printTestSummary(results);

    } catch (error) {
      console.error('❌ Error during testing:', error);
    }
  }

  // Print test results summary
  private printTestSummary(results: { profile: TestProfile; result: MatchResponse }[]): void {
    console.log('\n' + '='.repeat(60));
    console.log('DATING MATCH AGENT TEST SUMMARY (TypeScript)');
    console.log('='.repeat(60));

    results.forEach((result, index) => {
      console.log(`\nTest ${index + 1}: ${result.profile.name}`);
      console.log(`Score: ${result.result.score.toFixed(1)}/100`);
      console.log(`Expected: ${result.profile.expected}`);
      console.log(`Details: ${result.result.details}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log(`Completed ${results.length} test(s) successfully!`);
    console.log('='.repeat(60));
  }

  // Check agent status
  async checkAgentStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/agents/${this.agentAddress}`);
      return response.ok;
    } catch (error) {
      console.error('❌ Could not connect to agent:', error);
      return false;
    }
  }

  // Get agent info
  async getAgentInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/agents/${this.agentAddress}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting agent info:', error);
      throw error;
    }
  }
}

// Usage examples and main execution
async function main() {
  const client = new DatingAgentClient();

  // Check if agent is running
  console.log('🔍 Checking agent status...');
  const isRunning = await client.checkAgentStatus();
  
  if (!isRunning) {
    console.log('❌ Agent is not running at http://localhost:8000');
    console.log('Please start the dating match agent first:');
    console.log('   source venv/bin/activate');
    console.log('   python dating_match_agent.py');
    process.exit(1);
  }

  console.log('✅ Agent is running!');

  try {
    // Get agent info
    const agentInfo = await client.getAgentInfo();
    console.log('📋 Agent Info:', JSON.stringify(agentInfo, null, 2));
  } catch (error) {
    console.log('⚠️  Could not fetch agent info, but proceeding with tests...');
  }

  // Run all tests
  await client.runAllTests();
}

// Export the class for use in other modules
export { DatingAgentClient, TEST_PROFILES };

// Run main if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

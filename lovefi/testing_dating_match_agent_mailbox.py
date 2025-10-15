from uagents import Agent, Context, Model
from typing import List
import asyncio
import time

# Import the proper models from dating_match_agent_mailbox
from dating_match_agent_mailbox import MatchRequest, MatchResponse, PersonalInfo, Location, Preference

# Initialize the test agent with mailbox support
test_agent = Agent(
    name="TestAgentMailbox", 
    seed="test_seed_mailbox_9999",
    port=8004,
    endpoint=["http://localhost:8004/submit"],
    metadata={"type": "test", "agent_type": "test"},
    mailbox="YOUR_TEST_MAILBOX_KEY_HERE"  # Replace with actual mailbox key when available
)

# Test profiles from test_agent_logic.py
TEST_PROFILES = [
    {
        "name": "Perfect Match Test (Mailbox)",
        "person1": {
            "name": "Alice",
            "age": 25,
            "interests": ["reading", "hiking", "cooking"],
            "location": "New York",
            "preferences": {"max_age_diff": 5}
        },
        "person2": {
            "name": "Bob", 
            "age": 26,
            "interests": ["reading", "hiking", "cooking"],
            "location": "New York",
            "preferences": {"max_age_diff": 5}
        },
        "expected": "High score (80-100)"
    },
    {
        "name": "Good Match Test (Mailbox)",
        "person1": {
            "name": "Charlie",
            "age": 30,
            "interests": ["movies", "travel", "photography"],
            "location": "San Francisco",
            "preferences": {"max_age_diff": 8}
        },
        "person2": {
            "name": "Diana",
            "age": 28,
            "interests": ["travel", "photography", "art"],
            "location": "San Francisco",
            "preferences": {"max_age_diff": 6}
        },
        "expected": "Good score (60-85)"
    },
    {
        "name": "Poor Match Test (Mailbox)",
        "person1": {
            "name": "Eve",
            "age": 22,
            "interests": ["gaming", "coding"],
            "location": "Boston",
            "preferences": {"max_age_diff": 3}
        },
        "person2": {
            "name": "Frank",
            "age": 35,
            "interests": ["golf", "wine tasting"],
            "location": "Seattle",
            "preferences": {"max_age_diff": 5}
        },
        "expected": "Low score (0-40)"
    },
    {
        "name": "Age Gap Test (Mailbox)",
        "person1": {
            "name": "Grace",
            "age": 25,
            "interests": ["music", "dancing"],
            "location": "Chicago",
            "preferences": {"max_age_diff": 10}
        },
        "person2": {
            "name": "Henry",
            "age": 40,
            "interests": ["music", "dancing"],
            "location": "Chicago",
            "preferences": {"max_age_diff": 15}
        },
        "expected": "Medium score (40-70)"
    },
    {
        "name": "Different Locations Test (Mailbox)",
        "person1": {
            "name": "Ivy",
            "age": 29,
            "interests": ["fitness", "cooking", "travel"],
            "location": "Los Angeles",
            "preferences": {"max_age_diff": 4}
        },
        "person2": {
            "name": "Jack",
            "age": 31,
            "interests": ["fitness", "cooking", "movies"],
            "location": "Miami",
            "preferences": {"max_age_diff": 6}
        },
        "expected": "Good score (50-75)"
    }
]

def create_match_request(profile):
    """Create a MatchRequest from a test profile"""
    p1 = profile["person1"]
    p2 = profile["person2"]
    
    # Create PersonalInfo objects
    personal_info1 = PersonalInfo(
        first_name=p1["name"].split()[0],
        last_name=p1["name"].split()[-1] if len(p1["name"].split()) > 1 else "",
        birthday=""  # Using empty birthday since we have age directly
    )
    
    personal_info2 = PersonalInfo(
        first_name=p2["name"].split()[0],
        last_name=p2["name"].split()[-1] if len(p2["name"].split()) > 1 else "",
        birthday=""
    )
    
    # Create Location objects
    location1 = Location(
        address=p1["location"],
        search_radius=p1["preferences"].get("search_radius", 10)
    )
    
    location2 = Location(
        address=p2["location"],
        search_radius=p2["preferences"].get("search_radius", 10)
    )
    
    # Create preferences (empty for now as test doesn't use detailed preferences)
    partner_preferences1 = []
    partner_preferences2 = []
    
    return MatchRequest(
        personal_info1=personal_info1,
        gender1="not_specified",
        location1=location1,
        personal_interests1=p1["interests"],
        partner_preferences1=partner_preferences1,
        personal_info2=personal_info2,
        gender2="not_specified",
        location2=location2,
        personal_interests2=p2["interests"],
        partner_preferences2=partner_preferences2
    )

# Track test results
test_results = []
current_test_index = 0

# Handle responses from the dating agent
@test_agent.on_message(MatchResponse)
async def handle_match_response(ctx: Context, sender: str, response: MatchResponse):
    global current_test_index, test_results
    
    if current_test_index < len(TEST_PROFILES):
        profile = TEST_PROFILES[current_test_index]
        test_results.append({
            "name": profile["name"],
            "score": response.score,
            "details": response.details,
            "expected": profile["expected"]
        })
        
        ctx.logger.info(f"📬 ✅ Received mailbox response for {profile['name']}: Score {response.score:.1f}/100")
        ctx.logger.info(f"Details: {response.details}")
        
        # Send next test if available
        current_test_index += 1
        if current_test_index < len(TEST_PROFILES):
            await asyncio.sleep(2)  # Slightly longer delay for mailbox processing
            next_profile = TEST_PROFILES[current_test_index]
            request = create_match_request(next_profile)
            # Using the local mailbox dating agent address (will be generated)
            mailbox_dating_agent = Agent(name="DatingMatchAgentMailbox", seed="dating_match_mailbox_seed_5678")
            mailbox_dating_agent_address = mailbox_dating_agent.address
            await ctx.send(mailbox_dating_agent_address, request)
            ctx.logger.info(f"📮 Sent mailbox test request: {next_profile['name']}")
        else:
            # All tests completed, print summary
            print_test_summary(ctx)

def print_test_summary(ctx):
    """Print a summary of all test results"""
    ctx.logger.info("\\n" + "=" * 60)
    ctx.logger.info("DATING MATCH AGENT TEST SUMMARY (Mailbox)")
    ctx.logger.info("=" * 60)
    
    for i, result in enumerate(test_results, 1):
        ctx.logger.info(f"\\nTest {i}: {result['name']}")
        ctx.logger.info(f"Score: {result['score']:.1f}/100")
        ctx.logger.info(f"Expected: {result['expected']}")
        ctx.logger.info(f"Details: {result['details']}")
    
    ctx.logger.info("\\n" + "=" * 60)
    ctx.logger.info(f"Completed {len(test_results)} mailbox test(s) successfully!")
    ctx.logger.info("=" * 60)

# Send initial test request on startup
@test_agent.on_event("startup")
async def send_test_requests(ctx: Context):
    global current_test_index
    
    ctx.logger.info("📬 🚀 Starting Dating Match Agent Mailbox Tests")
    ctx.logger.info(f"Running {len(TEST_PROFILES)} test cases via mailbox...\\n")
    
    # Send the first test
    if TEST_PROFILES:
        current_test_index = 0
        profile = TEST_PROFILES[current_test_index]
        request = create_match_request(profile)
        
        # Create temporary agent to get the mailbox dating agent address
        mailbox_dating_agent = Agent(name="DatingMatchAgentMailbox", seed="dating_match_mailbox_seed_5678")
        mailbox_dating_agent_address = mailbox_dating_agent.address
        
        await ctx.send(mailbox_dating_agent_address, request)
        ctx.logger.info(f"📮 Sent first mailbox test request: {profile['name']}")
        ctx.logger.info(f"Target mailbox agent: {mailbox_dating_agent_address}")

# Periodic status check for mailbox testing
@test_agent.on_interval(period=30.0)
async def mailbox_status_check(ctx: Context):
    """Periodic status check for mailbox functionality"""
    ctx.logger.info("📬 Mailbox test agent is running and monitoring for responses")

# Add this at the end to run the agent
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--run-tests":
        # Run the actual agent communication tests
        print("📬 🚀 Starting Dating Match Agent Mailbox Communication Tests")
        print(f"TestAgent address: {test_agent.address}")
        print("Starting test agent on http://localhost:8004...")
        
        # Generate target agent address for display
        target_agent = Agent(name="DatingMatchAgentMailbox", seed="dating_match_mailbox_seed_5678")
        print(f"Connecting to Mailbox agent: {target_agent.address}")
        print("Make sure the DatingMatchAgentMailbox is running on http://localhost:8003")
        print("-" * 60)
        test_agent.run()
    else:
        # Simple test - just create agents and show addresses
        print("Creating mailbox test agents...")
        
        # Create the test agent
        test_agent_simple = Agent(name="TestAgentMailbox", seed="test_seed_mailbox_9999", metadata={"type": "test", "agent_type": "test"})
        print(f"TestAgent address: {test_agent_simple.address}")
        
        # Create the dating match agent to show address
        dating_agent_mailbox = Agent(name="DatingMatchAgentMailbox", seed="dating_match_mailbox_seed_5678", metadata={"type": "dating_match", "agent_type": "dating_match"})
        print(f"DatingMatchAgentMailbox address: {dating_agent_mailbox.address}")
        
        print("\\n" + "=" * 60)
        print("MAILBOX TEST PROFILES TO BE TESTED:")
        print("=" * 60)
        for i, profile in enumerate(TEST_PROFILES, 1):
            p1 = profile["person1"]
            p2 = profile["person2"]
            print(f"\\nTest {i}: {profile['name']}")
            print(f"  Person 1: {p1['name']}, Age {p1['age']}, Interests: {p1['interests']}, Location: {p1['location']}")
            print(f"  Person 2: {p2['name']}, Age {p2['age']}, Interests: {p2['interests']}, Location: {p2['location']}")
            print(f"  Expected: {profile['expected']}")
        
        print("\\n" + "=" * 60)
        print("MAILBOX USAGE:")
        print("=" * 60)
        print("1. First, start the DatingMatchAgentMailbox:")
        print("   python dating_match_agent_mailbox.py")
        print("\\n2. Then, in another terminal, run the mailbox tests:")
        print("   python testing_dating_match_agent_mailbox.py --run-tests")
        print("\\n3. Features of mailbox version:")
        print("   📬 Asynchronous message processing")
        print("   💌 Persistent message delivery")
        print("   🔄 Automatic retry mechanisms")
        print("   📊 Enhanced monitoring and logging")
        print("=" * 60)

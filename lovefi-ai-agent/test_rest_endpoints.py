#!/usr/bin/env python3
"""
测试脚本：演示如何使用DatingMatchAgent的REST端点
"""

import requests
import json
import time

# 代理的基础URL
BASE_URL = "http://localhost:8000"

def test_get_agent_info():
    """Test GET /api/agent-info endpoint"""
    print("=== Testing GET /api/agent-info endpoint ===")
    try:
        response = requests.get(f"{BASE_URL}/api/agent-info")
        if response.status_code == 200:
            data = response.json()
            print("✅ Successfully retrieved agent information:")
            print(f"  Name: {data['name']}")
            print(f"  Address: {data['address']}")
            print(f"  Status: {data['status']}")
            print(f"  Timestamp: {data['timestamp']}")
            print("  Available endpoints:")
            for endpoint in data['endpoints']:
                print(f"    - {endpoint}")
        else:
            print(f"❌ Request failed, status code: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to agent, please ensure agent is running")
    except Exception as e:
        print(f"❌ An error occurred: {e}")
    print()

def test_simple_match_post():
    """Test POST /api/match/simple endpoint"""
    print("=== Testing POST /api/match/simple endpoint ===")
    
    # Test data
    test_data = {
        "name1": "John",
        "age1": 28,
        "interests1": ["music", "travel", "food", "movies"],
        "location1": "New York",
        "preferences1": {"max_age_diff": 5},
        "name2": "Jane",
        "age2": 26,
        "interests2": ["music", "photography", "food", "sports"],
        "location2": "Boston",
        "preferences2": {"max_age_diff": 5}
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/match/simple",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Successfully calculated match score:")
            print(f"  Match score: {data['score']:.1f}/100")
            print(f"  Details: {data['details']}")
            print(f"  Timestamp: {data['timestamp']}")
            print(f"  Agent address: {data['agent_address']}")
        else:
            print(f"❌ Request failed, status code: {response.status_code}")
            print(f"  Response content: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to agent, please ensure agent is running")
    except Exception as e:
        print(f"❌ An error occurred: {e}")
    print()

def test_full_match_post():
    """Test POST /api/match/full endpoint"""
    print("=== Testing POST /api/match/full endpoint ===")
    
    # Test data - using complete MatchRequest model
    test_data = {
        "personal_info1": {
            "first_name": "Michael",
            "last_name": "Smith",
            "birthday": "1995-06-15"
        },
        "gender1": "male",
        "location1": {
            "address": "Los Angeles",
            "search_radius": 15
        },
        "personal_interests1": ["programming", "gaming", "technology", "coffee"],
        "partner_preferences1": [
            {
                "category": "lifestyle",
                "question": "What lifestyle do you prefer?",
                "options": ["quiet", "active", "balanced"],
                "selected_index": 2,
                "selected_option": "balanced"
            }
        ],
        "personal_info2": {
            "first_name": "Sarah",
            "last_name": "Johnson",
            "birthday": "1997-03-22"
        },
        "gender2": "female",
        "location2": {
            "address": "San Francisco",
            "search_radius": 20
        },
        "personal_interests2": ["programming", "design", "technology", "yoga"],
        "partner_preferences2": [
            {
                "category": "lifestyle",
                "question": "What lifestyle do you prefer?",
            "options": ["quiet", "active", "balanced"],
                "selected_index": 2,
                "selected_option": "balanced"
            }
        ]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/match/full",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Successfully calculated full match score:")
            print(f"  Match score: {data['score']:.1f}/100")
            print(f"  Details: {data['details']}")
        else:
            print(f"❌ Request failed, status code: {response.status_code}")
            print(f"  Response content: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to agent, please ensure agent is running")
    except Exception as e:
        print(f"❌ An error occurred: {e}")
    print()

def test_error_handling():
    """Test error handling"""
    print("=== Testing Error Handling ===")
    
    # Test invalid data
    invalid_data = {
        "name1": "Test",
        "age1": "invalid_age",  # Invalid age type
        "interests1": ["interest1"],
        "location1": "New York",
        "name2": "Test2",
        "age2": 25,
        "interests2": ["interest2"],
        "location2": "Boston"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/match/simple",
            json=invalid_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Error handling working correctly:")
            print(f"  Score: {data['score']}")
            print(f"  Error message: {data['details']}")
        else:
            print(f"❌ Request failed, status code: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to agent, please ensure agent is running")
    except Exception as e:
        print(f"❌ An error occurred: {e}")
    print()

def main():
    """Main function"""
    print("🚀 DatingMatchAgent REST Endpoints Test")
    print("=" * 50)
    print("Please ensure the agent is running on http://localhost:8000")
    print()
    
    # Wait a moment to ensure agent startup
    print("Waiting for agent to start...")
    time.sleep(2)
    
    # Test all endpoints
    test_get_agent_info()
    test_simple_match_post()
    test_full_match_post()
    test_error_handling()
    
    print("🎉 Testing completed!")
    print("\nUsage instructions:")
    print("1. Start agent: python dating_match_agent.py")
    print("2. Run tests: python test_rest_endpoints.py")
    print("3. Or test manually with curl:")
    print("   curl http://localhost:8000/api/agent-info")
    print("   curl -X POST http://localhost:8000/api/match/simple -H 'Content-Type: application/json' -d '{\"name1\":\"John\",\"age1\":28,\"interests1\":[\"music\"],\"location1\":\"New York\",\"name2\":\"Jane\",\"age2\":26,\"interests2\":[\"music\"],\"location2\":\"Boston\"}'")

if __name__ == "__main__":
    main()

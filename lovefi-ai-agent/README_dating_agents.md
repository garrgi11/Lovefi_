# Dating Match Agent Versions

This repository contains multiple versions of a dating compatibility agent built with uAgents framework. Each version demonstrates different capabilities and deployment patterns.

## 📋 Available Versions

### 1. **Original Dating Match Agent** (`dating_match_agent.py`)
- **Port**: 8000
- **Features**: Basic compatibility scoring with chat protocol support
- **Best for**: Local development and testing

### 2. **AgentVerse Integration** (`testing_dating_match_agent_agentverse.py`)
- **Port**: 8002 (test agent)
- **Target**: AgentVerse agent `agent1qggn4c3fsl409wtevwhehxxlhcc47vxw4v9lm59x77gzur63e9xzvnap0vp`
- **Features**: Tests communication with agents deployed on AgentVerse
- **Best for**: Testing cloud-deployed agents

### 3. **Mailbox Agent** (`dating_match_agent_mailbox.py`)
- **Port**: 8003
- **Features**: Asynchronous message processing with mailbox support
- **Best for**: Production deployments requiring offline message handling

## 🎯 Compatibility Scoring Algorithm

All versions use the same core algorithm:

- **Interest Compatibility** (40%): Measures common interests between two people
- **Age Compatibility** (20%): Based on age difference and preferences
- **Location Compatibility** (20%): Uses geocoding and distance calculation
- **Preference Compatibility** (20%): Matches partner preferences

**Score Range**: 0-100 (higher is better compatibility)

## 🚀 Quick Start

### Prerequisites
```bash
python3 -m venv venv
source venv/bin/activate
pip install uagents requests
```

### Run Original Agent
```bash
source venv/bin/activate
python dating_match_agent.py
```

### Test AgentVerse Integration
```bash
# 1. Ensure AgentVerse agent is running
# 2. Run tests
source venv/bin/activate
python testing_dating_match_agent_agentverse.py --run-tests
```

### Run Mailbox Agent
```bash
source venv/bin/activate
python dating_match_agent_mailbox.py
```

## 📊 Test Profiles

All versions include 5 test scenarios:

1. **Perfect Match**: Same interests, location, compatible ages → Expected: 80-100
2. **Good Match**: Overlapping interests, same location → Expected: 60-85  
3. **Poor Match**: Different interests, locations, large age gap → Expected: 0-40
4. **Age Gap Test**: Same interests/location, significant age difference → Expected: 40-70
5. **Different Locations**: Similar interests, different cities → Expected: 50-75

## 🔧 Agent Addresses

- **Original Agent**: `agent1qgh8g2gfcrrcjqjuuav8v6de3tp3dtc7f5hz4aveccpyym0g6s06ge5yf9w`
- **AgentVerse Test Agent**: `agent1qd8f7afqf6yuma2c8fx67xj2ddaa5urhynzerzd5lfgnt83uk637ydwr2ds`
- **Mailbox Agent**: `agent1qvgzrxnvuaqzmll2d7j709tk8jd99s35r4wld9a7vt8s9vgls9p67qq26s4`

## 💬 Message Protocol

### MatchRequest Model
```python
class MatchRequest(Model):
    personal_info1: PersonalInfo      # First person's details
    gender1: str                      # Gender identity
    location1: Location              # Location with search radius
    personal_interests1: List[str]   # List of interests
    partner_preferences1: List[Preference]  # Partner preferences
    # ... same for person2
```

### MatchResponse Model
```python
class MatchResponse(Model):
    score: float       # Compatibility score (0-100)
    details: str       # Detailed breakdown of scoring
```

## 🌐 AgentVerse Integration

The AgentVerse version connects to a deployed agent:
- **URL**: https://agentverse.ai/inspect/?uri=http%3A//127.0.0.1%3A8000&address=agent1qggn4c3fsl409wtevwhehxxlhcc47vxw4v9lm59x77gzur63e9xzvnap0vp
- **Features**: Remote agent communication, persistent deployment
- **Use Case**: Production-ready agent interactions

## 📬 Mailbox Functionality

The mailbox version provides:
- **Asynchronous Processing**: Messages processed when agent is offline
- **Persistent Storage**: Match results stored for future retrieval
- **Enhanced Monitoring**: Regular status checks and detailed logging
- **Configuration**: Replace `YOUR_MAILBOX_KEY_HERE` with actual mailbox key

### Mailbox Setup
```python
# For mailbox mode, update agent configuration:
agent = Agent(
    name="DatingMatchAgentMailbox",
    seed="dating_match_mailbox_seed_5678",
    # Comment out endpoint for mailbox mode:
    # endpoint=["http://localhost:8003/submit"],
    mailbox="YOUR_ACTUAL_MAILBOX_KEY"  # Replace with real key
)
```

## 🧪 Testing

### Run All Tests
```bash
# Test original agent
source venv/bin/activate
python testing_dating_match_agent.py --run-tests

# Test AgentVerse integration  
python testing_dating_match_agent_agentverse.py --run-tests

# Test mailbox agent
python testing_dating_match_agent_mailbox.py --run-tests
```

### Direct Function Testing
```bash
python test_agent_logic.py
```

## 📈 Performance Monitoring

All agents include:
- **Real-time Logging**: Detailed request/response logging
- **Error Handling**: Graceful error recovery with meaningful messages
- **Status Monitoring**: Regular health checks and status updates
- **AgentVerse Integration**: Automatic registration and funding

## 🔍 Inspector URLs

Each agent provides an inspector interface:
- **Original**: https://agentverse.ai/inspect/?uri=http%3A//127.0.0.1%3A8000&address=[agent_address]
- **AgentVerse Test**: https://agentverse.ai/inspect/?uri=http%3A//127.0.0.1%3A8002&address=[agent_address] 
- **Mailbox**: https://agentverse.ai/inspect/?uri=http%3A//127.0.0.1%3A8003&address=[agent_address]

## 🎨 Features Comparison

| Feature | Original | AgentVerse | Mailbox |
|---------|----------|------------|---------|
| Local Development | ✅ | ✅ | ✅ |
| Cloud Deployment | ❌ | ✅ | ✅ |
| Offline Processing | ❌ | ❌ | ✅ |
| Real-time Chat | ✅ | ✅ | ✅ |
| Persistent Storage | ❌ | ❌ | ✅ |
| Auto-retry | ❌ | ❌ | ✅ |

## 🛠️ Troubleshooting

### Common Issues

1. **Port Conflicts**: Each agent uses different ports (8000, 8002, 8003)
2. **Missing Dependencies**: Run `pip install uagents requests`
3. **Agent Info Validation**: Ensure `agent_type` is set in metadata
4. **Mailbox Key**: Replace placeholder with actual mailbox key for production

### Error Messages
- `ValidationError: agent_type Field required` → Add `"agent_type"` to metadata
- `Endpoint configuration overrides mailbox setting` → Choose either endpoint OR mailbox, not both
- `AgentRepresentation' object has no attribute 'wallet'` → Wallet access issue (fixed in current version)

## 📚 Additional Resources

- [uAgents Documentation](https://docs.fetch.ai/uAgents)
- [AgentVerse Platform](https://agentverse.ai)
- [Fetch.ai Developer Portal](https://docs.fetch.ai)

## 🤝 Contributing

1. Fork the repository
2. Create feature branches for new agent versions
3. Test thoroughly with all provided test scenarios
4. Submit pull requests with clear descriptions

## 📄 License

This project is open source. See individual files for specific licensing information.

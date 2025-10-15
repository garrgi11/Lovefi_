#!/usr/bin/env python3
"""
Quick test to verify agent initialization without running full agent
"""

from datetime import datetime, timedelta
from uuid import uuid4
from typing import Any, List, Dict
from uagents import Agent, Context, Model, Protocol

# Try to create the agent with the same configuration
try:
    agent = Agent(
        name="DatingMatchAgentMailbox",
        seed="dating_match_mailbox_seed_5678",
        metadata={
            "type": "dating_match",
            "agent_type": "dating_match",
            "description": "Dating compatibility scoring agent with mailbox support"
        },
        port=8003,
        endpoint=["http://localhost:8003/submit"],
        mailbox="YOUR_MAILBOX_KEY_HERE"  # Replace with actual mailbox key when available
    )
    
    print("✅ Agent created successfully!")
    print(f"Agent address: {agent.address}")
    print(f"Agent name: {agent.name}")
    print(f"Agent metadata: {agent.metadata}")
    
    # Test that we can access agent properties
    print(f"Agent has wallet attribute: {hasattr(agent, 'wallet')}")
    print(f"Agent has address attribute: {hasattr(agent, 'address')}")
    
except Exception as e:
    print(f"❌ Error creating agent: {e}")
    import traceback
    traceback.print_exc()

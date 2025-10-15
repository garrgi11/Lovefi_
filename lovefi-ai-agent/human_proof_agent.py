# Install required libraries:
# pip install uagents noknow

from uagents import Agent, Context, Protocol, Model
from noknow.core import ZK, ZKSignature, ZKProof, ZKData
import uuid

class VerifyRequest(Model):
    characteristic: str  # e.g., "age_over_18" or "human"

class Challenge(Model):
    token: str

class Proof(Model):
    proof: str  # serialized proof

class Result(Model):
    verified: bool
    message: str

# Verifier Agent
verifier = Agent(
    name="zk_verifier",
    seed="verifier_secret_phrase",
    port=8008,
    endpoint=["http://localhost:8008/submit"],
)

# Initialize ZK
zk = ZK.new(curve_name="secp256k1", hash_alg="sha3_256")

# Assume a known signature for the human characteristic
# In real scenario, this would be a public commitment to a human-verified secret
human_secret = "human123"  # Example secret only known to verified humans
human_signature_str = zk.create_signature(human_secret).dump()  # Serialize for storage if needed
human_signature = ZKSignature.load(human_signature_str)

# Protocol for ZK Verification
zk_protocol = Protocol(name="ZKVerify")

@zk_protocol.on_message(model=VerifyRequest, replies=Challenge)
async def request_handler(ctx: Context, sender: str, msg: VerifyRequest):
    ctx.logger.info(f"Received verification request for {msg.characteristic} from {sender}")
    # Generate a random challenge token
    token = str(uuid.uuid4())
    # Store the token temporarily (in production, use storage with sender key)
    await ctx.storage.set(sender, token)
    await ctx.send(sender, Challenge(token=token))

@zk_protocol.on_message(model=Proof, replies=Result)
async def proof_handler(ctx: Context, sender: str, msg: Proof):
    ctx.logger.info(f"Received proof from {sender}")
    # Retrieve the token
    token = await ctx.storage.get(sender)
    if not token:
        await ctx.send(sender, Result(verified=False, message="No challenge found"))
        return
    
    # Deserialize proof
    proof_data = ZKData.load(msg.proof)
    proof = ZKProof(proof_data.params, proof_data.responses)
    
    # Verify the proof
    try:
        verified = zk.verify(proof, human_signature, data=token)
        await ctx.send(sender, Result(verified=verified, message="Verification successful" if verified else "Verification failed"))
    except Exception as e:
        await ctx.send(sender, Result(verified=False, message=str(e)))
    
    # Clean up
    await ctx.storage.remove(sender)

# Include the protocol
verifier.include(zk_protocol)

if __name__ == "__main__":
    verifier.run()
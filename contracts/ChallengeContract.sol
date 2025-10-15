// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ChallengeContract is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _challengeIds;
    
    uint256 public constant MINIMUM_STAKE = 2 ether; // 2 FLOW minimum
    uint256 public constant MAXIMUM_STAKE = 5 ether; // 5 FLOW maximum
    uint256 public constant CHALLENGE_DURATION = 7 days;
    uint256 public constant APPROVAL_THRESHOLD = 3; // Minimum approvals needed
    
    struct Challenge {
        uint256 id;
        address challenger;
        uint256 coupleId;
        string description;
        string proofURI;
        uint256 stakeAmount;
        uint256 startTime;
        uint256 endTime;
        bool isCompleted;
        bool isApproved;
        bool isPaidOut;
        uint256 approvalCount;
        uint256 rejectionCount;
        mapping(address => bool) hasVoted;
        mapping(address => bool) votes;
    }
    
    mapping(uint256 => Challenge) public challenges;
    mapping(uint256 => uint256[]) public coupleChallenges; // coupleId => challengeIds
    mapping(address => uint256[]) public userChallenges;
    mapping(uint256 => bool) public validCouples; // Set by owner
    
    uint256 public totalChallengePool;
    uint256 public totalActiveChallenges;
    
    event ChallengeCreated(
        uint256 indexed challengeId,
        address indexed challenger,
        uint256 indexed coupleId,
        string description,
        uint256 stakeAmount
    );
    
    event ProofSubmitted(
        uint256 indexed challengeId,
        string proofURI,
        uint256 timestamp
    );
    
    event ChallengeVoted(
        uint256 indexed challengeId,
        address indexed voter,
        bool approved
    );
    
    event ChallengeResolved(
        uint256 indexed challengeId,
        bool isApproved,
        uint256 payoutAmount
    );
    
    event CoupleRegistered(uint256 indexed coupleId);
    
    constructor() {}
    
    modifier onlyValidCouple(uint256 coupleId) {
        require(validCouples[coupleId], "Couple not registered");
        _;
    }
    
    modifier onlyChallengeOwner(uint256 challengeId) {
        require(challenges[challengeId].challenger == msg.sender, "Not challenge owner");
        _;
    }
    
    modifier onlyActiveChallenge(uint256 challengeId) {
        require(challenges[challengeId].startTime > 0, "Challenge does not exist");
        require(!challenges[challengeId].isCompleted, "Challenge already completed");
        _;
    }
    
    function registerCouple(uint256 coupleId) public onlyOwner {
        require(!validCouples[coupleId], "Couple already registered");
        validCouples[coupleId] = true;
        emit CoupleRegistered(coupleId);
    }
    
    function createChallenge(
        uint256 coupleId,
        string memory description
    ) public payable onlyValidCouple(coupleId) nonReentrant {
        require(msg.value >= MINIMUM_STAKE, "Stake too small");
        require(msg.value <= MAXIMUM_STAKE, "Stake too large");
        require(bytes(description).length > 0, "Description cannot be empty");
        
        _challengeIds.increment();
        uint256 challengeId = _challengeIds.current();
        
        challenges[challengeId].id = challengeId;
        challenges[challengeId].challenger = msg.sender;
        challenges[challengeId].coupleId = coupleId;
        challenges[challengeId].description = description;
        challenges[challengeId].stakeAmount = msg.value;
        challenges[challengeId].startTime = block.timestamp;
        challenges[challengeId].endTime = block.timestamp + CHALLENGE_DURATION;
        challenges[challengeId].isCompleted = false;
        challenges[challengeId].isApproved = false;
        challenges[challengeId].isPaidOut = false;
        challenges[challengeId].approvalCount = 0;
        challenges[challengeId].rejectionCount = 0;
        
        coupleChallenges[coupleId].push(challengeId);
        userChallenges[msg.sender].push(challengeId);
        
        totalChallengePool += msg.value;
        totalActiveChallenges++;
        
        emit ChallengeCreated(challengeId, msg.sender, coupleId, description, msg.value);
    }
    
    function submitProof(
        uint256 challengeId,
        string memory proofURI
    ) public onlyChallengeOwner(challengeId) onlyActiveChallenge(challengeId) {
        require(bytes(proofURI).length > 0, "Proof URI cannot be empty");
        require(block.timestamp <= challenges[challengeId].endTime, "Challenge expired");
        
        challenges[challengeId].proofURI = proofURI;
        
        emit ProofSubmitted(challengeId, proofURI, block.timestamp);
    }
    
    function voteOnChallenge(
        uint256 challengeId,
        bool approved
    ) public onlyActiveChallenge(challengeId) {
        Challenge storage challenge = challenges[challengeId];
        require(!challenge.hasVoted[msg.sender], "Already voted");
        require(block.timestamp > challenge.endTime, "Challenge still active");
        require(bytes(challenge.proofURI).length > 0, "No proof submitted");
        
        challenge.hasVoted[msg.sender] = true;
        challenge.votes[msg.sender] = approved;
        
        if (approved) {
            challenge.approvalCount++;
        } else {
            challenge.rejectionCount++;
        }
        
        emit ChallengeVoted(challengeId, msg.sender, approved);
        
        // Check if we have enough votes to resolve
        if (challenge.approvalCount + challenge.rejectionCount >= APPROVAL_THRESHOLD) {
            _resolveChallenge(challengeId);
        }
    }
    
    function _resolveChallenge(uint256 challengeId) private {
        Challenge storage challenge = challenges[challengeId];
        challenge.isCompleted = true;
        
        bool isApproved = challenge.approvalCount > challenge.rejectionCount;
        challenge.isApproved = isApproved;
        
        uint256 payoutAmount;
        
        if (isApproved) {
            // Challenger gets stake back plus bonus from pool
            payoutAmount = challenge.stakeAmount + (challenge.stakeAmount / 2);
            totalChallengePool -= challenge.stakeAmount / 2;
            
            (bool success, ) = challenge.challenger.call{value: payoutAmount}("");
            require(success, "Failed to send payout");
        } else {
            // Stake goes to pool
            totalChallengePool += challenge.stakeAmount;
        }
        
        totalActiveChallenges--;
        
        emit ChallengeResolved(challengeId, isApproved, payoutAmount);
    }
    
    function forceResolveChallenge(uint256 challengeId) public onlyOwner {
        require(challenges[challengeId].startTime > 0, "Challenge does not exist");
        require(!challenges[challengeId].isCompleted, "Challenge already completed");
        
        _resolveChallenge(challengeId);
    }
    
    function getChallenge(uint256 challengeId) public view returns (
        uint256 id,
        address challenger,
        uint256 coupleId,
        string memory description,
        string memory proofURI,
        uint256 stakeAmount,
        uint256 startTime,
        uint256 endTime,
        bool isCompleted,
        bool isApproved,
        bool isPaidOut,
        uint256 approvalCount,
        uint256 rejectionCount
    ) {
        Challenge storage challenge = challenges[challengeId];
        return (
            challenge.id,
            challenge.challenger,
            challenge.coupleId,
            challenge.description,
            challenge.proofURI,
            challenge.stakeAmount,
            challenge.startTime,
            challenge.endTime,
            challenge.isCompleted,
            challenge.isApproved,
            challenge.isPaidOut,
            challenge.approvalCount,
            challenge.rejectionCount
        );
    }
    
    function getCoupleChallenges(uint256 coupleId) public view returns (uint256[] memory) {
        return coupleChallenges[coupleId];
    }
    
    function getUserChallenges(address user) public view returns (uint256[] memory) {
        return userChallenges[user];
    }
    
    function hasVoted(uint256 challengeId, address voter) public view returns (bool) {
        return challenges[challengeId].hasVoted[voter];
    }
    
    function getVote(uint256 challengeId, address voter) public view returns (bool) {
        require(challenges[challengeId].hasVoted[voter], "User has not voted");
        return challenges[challengeId].votes[voter];
    }
    
    function getActiveChallengesForCouple(uint256 coupleId) public view returns (uint256[] memory) {
        uint256[] memory allChallenges = coupleChallenges[coupleId];
        uint256 activeCount = 0;
        
        // Count active challenges
        for (uint256 i = 0; i < allChallenges.length; i++) {
            if (!challenges[allChallenges[i]].isCompleted) {
                activeCount++;
            }
        }
        
        // Create array with only active challenges
        uint256[] memory activeChallenges = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < allChallenges.length; i++) {
            if (!challenges[allChallenges[i]].isCompleted) {
                activeChallenges[currentIndex] = allChallenges[i];
                currentIndex++;
            }
        }
        
        return activeChallenges;
    }
    
    // Emergency functions
    function emergencyWithdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function pauseChallenges() public onlyOwner {
        // Implementation would pause new challenges
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CoupleStaking is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _coupleIds;
    
    uint256 public constant MINIMUM_STAKE = 5 ether; // 5 FLOW tokens
    uint256 public constant SEASON_DURATION = 365 days;
    
    struct Couple {
        address user1;
        address user2;
        uint256 stakeAmount;
        uint256 startTime;
        uint256 currentMilestone;
        bool isActive;
        uint256 seasonId;
    }
    
    struct Season {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 totalStaked;
        uint256 coupleCount;
        bool isActive;
    }
    
    mapping(uint256 => Couple) public couples;
    mapping(uint256 => Season) public seasons;
    mapping(address => uint256) public userCoupleId;
    mapping(address => bool) public isInCouple;
    
    uint256 public currentSeasonId;
    uint256 public totalStaked;
    
    event CoupleCreated(
        uint256 indexed coupleId,
        address indexed user1,
        address indexed user2,
        uint256 stakeAmount,
        uint256 seasonId
    );
    
    event MilestoneReached(
        uint256 indexed coupleId,
        uint256 milestone,
        uint256 timestamp
    );
    
    event CoupleEnded(
        uint256 indexed coupleId,
        address indexed user1,
        address indexed user2,
        uint256 finalMilestone
    );
    
    event SeasonCreated(uint256 indexed seasonId, uint256 startTime, uint256 endTime);
    
    constructor() {
        _createSeason();
    }
    
    function _createSeason() private {
        currentSeasonId++;
        seasons[currentSeasonId] = Season({
            id: currentSeasonId,
            startTime: block.timestamp,
            endTime: block.timestamp + SEASON_DURATION,
            totalStaked: 0,
            coupleCount: 0,
            isActive: true
        });
        
        emit SeasonCreated(currentSeasonId, block.timestamp, block.timestamp + SEASON_DURATION);
    }
    
    function createCouple(address partner) public payable nonReentrant {
        require(msg.value == MINIMUM_STAKE, "Must stake exactly 5 FLOW");
        require(partner != address(0), "Invalid partner address");
        require(partner != msg.sender, "Cannot couple with yourself");
        require(!isInCouple[msg.sender], "Already in a couple");
        require(!isInCouple[partner], "Partner already in a couple");
        
        // Check if current season is ending soon
        if (block.timestamp > seasons[currentSeasonId].endTime - 30 days) {
            _createSeason();
        }
        
        _coupleIds.increment();
        uint256 coupleId = _coupleIds.current();
        
        couples[coupleId] = Couple({
            user1: msg.sender,
            user2: partner,
            stakeAmount: MINIMUM_STAKE,
            startTime: block.timestamp,
            currentMilestone: 1, // Start at milestone 1 (Official)
            isActive: true,
            seasonId: currentSeasonId
        });
        
        userCoupleId[msg.sender] = coupleId;
        userCoupleId[partner] = coupleId;
        isInCouple[msg.sender] = true;
        isInCouple[partner] = true;
        
        seasons[currentSeasonId].coupleCount++;
        totalStaked += MINIMUM_STAKE;
        
        emit CoupleCreated(coupleId, msg.sender, partner, MINIMUM_STAKE, currentSeasonId);
    }
    
    function reachMilestone(uint256 milestone) public {
        uint256 coupleId = userCoupleId[msg.sender];
        require(coupleId > 0, "Not in a couple");
        
        Couple storage couple = couples[coupleId];
        require(couple.isActive, "Couple not active");
        require(
            msg.sender == couple.user1 || msg.sender == couple.user2,
            "Not couple member"
        );
        
        require(milestone > couple.currentMilestone, "Milestone must be higher");
        require(milestone <= 5, "Invalid milestone");
        
        // Check time requirements for milestones
        uint256 timeSinceStart = block.timestamp - couple.startTime;
        
        if (milestone == 2 && timeSinceStart < 30 days) revert("Too early for Exclusive");
        if (milestone == 3 && timeSinceStart < 90 days) revert("Too early for Serious");
        if (milestone == 4 && timeSinceStart < 180 days) revert("Too early for Engaged");
        if (milestone == 5 && timeSinceStart < 365 days) revert("Too early for Married");
        
        couple.currentMilestone = milestone;
        
        emit MilestoneReached(coupleId, milestone, block.timestamp);
    }
    
    function endCouple() public nonReentrant {
        uint256 coupleId = userCoupleId[msg.sender];
        require(coupleId > 0, "Not in a couple");
        
        Couple storage couple = couples[coupleId];
        require(couple.isActive, "Couple already ended");
        require(
            msg.sender == couple.user1 || msg.sender == couple.user2,
            "Not couple member"
        );
        
        couple.isActive = false;
        isInCouple[couple.user1] = false;
        isInCouple[couple.user2] = false;
        
        // Return stake to both users
        uint256 returnAmount = couple.stakeAmount / 2;
        
        (bool success1, ) = couple.user1.call{value: returnAmount}("");
        (bool success2, ) = couple.user2.call{value: returnAmount}("");
        
        require(success1 && success2, "Failed to return stakes");
        
        totalStaked -= couple.stakeAmount;
        seasons[couple.seasonId].coupleCount--;
        
        emit CoupleEnded(coupleId, couple.user1, couple.user2, couple.currentMilestone);
    }
    
    function getCouple(uint256 coupleId) public view returns (Couple memory) {
        return couples[coupleId];
    }
    
    function getUserCouple(address user) public view returns (uint256) {
        return userCoupleId[user];
    }
    
    function getCurrentSeason() public view returns (Season memory) {
        return seasons[currentSeasonId];
    }
    
    function getSeason(uint256 seasonId) public view returns (Season memory) {
        return seasons[seasonId];
    }
    
    // Emergency functions for owner
    function emergencyWithdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function pauseSeason() public onlyOwner {
        seasons[currentSeasonId].isActive = false;
    }
}




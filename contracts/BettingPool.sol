// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BettingPool is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _betIds;
    
    uint256 public constant MINIMUM_BET = 1 ether; // 1 FLOW minimum
    uint256 public constant MAXIMUM_BET = 10 ether; // 10 FLOW maximum
    
    struct Bet {
        uint256 id;
        address bettor;
        uint256 coupleId;
        uint256 predictedMilestone;
        uint256 betAmount;
        uint256 betTime;
        bool isActive;
        bool isWon;
        bool isPaidOut;
    }
    
    struct CoupleBet {
        uint256 coupleId;
        uint256 totalBets;
        uint256 totalAmount;
        mapping(uint256 => uint256) milestoneBets; // milestone => total amount bet
        mapping(uint256 => uint256[]) milestoneBettors; // milestone => array of bet IDs
    }
    
    mapping(uint256 => Bet) public bets;
    mapping(uint256 => CoupleBet) public coupleBets; // coupleId => CoupleBet
    mapping(address => uint256[]) public userBets;
    mapping(uint256 => bool) public validCouples; // Set by owner
    
    uint256 public totalPoolAmount;
    uint256 public totalActiveBets;
    
    event BetPlaced(
        uint256 indexed betId,
        address indexed bettor,
        uint256 indexed coupleId,
        uint256 predictedMilestone,
        uint256 betAmount
    );
    
    event BetResolved(
        uint256 indexed betId,
        uint256 indexed coupleId,
        uint256 finalMilestone,
        bool isWon
    );
    
    event BetPaidOut(
        uint256 indexed betId,
        address indexed bettor,
        uint256 payoutAmount
    );
    
    event CoupleRegistered(uint256 indexed coupleId);
    
    constructor() {}
    
    modifier onlyValidCouple(uint256 coupleId) {
        require(validCouples[coupleId], "Couple not registered");
        _;
    }
    
    function registerCouple(uint256 coupleId) public onlyOwner {
        require(!validCouples[coupleId], "Couple already registered");
        validCouples[coupleId] = true;
        
        coupleBets[coupleId] = CoupleBet({
            coupleId: coupleId,
            totalBets: 0,
            totalAmount: 0
        });
        
        emit CoupleRegistered(coupleId);
    }
    
    function placeBet(
        uint256 coupleId,
        uint256 predictedMilestone
    ) public payable onlyValidCouple(coupleId) nonReentrant {
        require(msg.value >= MINIMUM_BET, "Bet too small");
        require(msg.value <= MAXIMUM_BET, "Bet too large");
        require(predictedMilestone >= 1 && predictedMilestone <= 5, "Invalid milestone");
        
        _betIds.increment();
        uint256 betId = _betIds.current();
        
        bets[betId] = Bet({
            id: betId,
            bettor: msg.sender,
            coupleId: coupleId,
            predictedMilestone: predictedMilestone,
            betAmount: msg.value,
            betTime: block.timestamp,
            isActive: true,
            isWon: false,
            isPaidOut: false
        });
        
        userBets[msg.sender].push(betId);
        
        CoupleBet storage coupleBet = coupleBets[coupleId];
        coupleBet.totalBets++;
        coupleBet.totalAmount += msg.value;
        coupleBet.milestoneBets[predictedMilestone] += msg.value;
        coupleBet.milestoneBettors[predictedMilestone].push(betId);
        
        totalPoolAmount += msg.value;
        totalActiveBets++;
        
        emit BetPlaced(betId, msg.sender, coupleId, predictedMilestone, msg.value);
    }
    
    function resolveBets(
        uint256 coupleId,
        uint256 finalMilestone
    ) public onlyOwner onlyValidCouple(coupleId) {
        require(finalMilestone >= 1 && finalMilestone <= 5, "Invalid final milestone");
        
        CoupleBet storage coupleBet = coupleBets[coupleId];
        
        // Mark all bets for this couple as resolved
        for (uint256 i = 0; i < coupleBet.totalBets; i++) {
            // We need to iterate through all bets to find the ones for this couple
            // This is a simplified version - in production you'd want a better data structure
        }
        
        // Mark specific milestone bets as won/lost
        uint256[] memory milestoneBettors = coupleBet.milestoneBettors[finalMilestone];
        
        for (uint256 i = 0; i < milestoneBettors.length; i++) {
            uint256 betId = milestoneBettors[i];
            if (bets[betId].isActive) {
                bets[betId].isActive = false;
                bets[betId].isWon = true;
                totalActiveBets--;
                
                emit BetResolved(betId, coupleId, finalMilestone, true);
            }
        }
        
        // Mark all other bets as lost
        for (uint256 milestone = 1; milestone <= 5; milestone++) {
            if (milestone != finalMilestone) {
                uint256[] memory otherBettors = coupleBet.milestoneBettors[milestone];
                for (uint256 i = 0; i < otherBettors.length; i++) {
                    uint256 betId = otherBettors[i];
                    if (bets[betId].isActive) {
                        bets[betId].isActive = false;
                        bets[betId].isWon = false;
                        totalActiveBets--;
                        
                        emit BetResolved(betId, coupleId, finalMilestone, false);
                    }
                }
            }
        }
    }
    
    function claimWinnings(uint256 betId) public nonReentrant {
        Bet storage bet = bets[betId];
        require(bet.bettor == msg.sender, "Not bet owner");
        require(bet.isWon, "Bet not won");
        require(!bet.isPaidOut, "Already paid out");
        require(bet.isActive == false, "Bet not resolved");
        
        bet.isPaidOut = true;
        
        // Calculate winnings based on total pool and winning bets
        uint256 coupleId = bet.coupleId;
        CoupleBet storage coupleBet = coupleBets[coupleId];
        
        // Simple payout: winner gets their bet back plus proportional share of losing bets
        uint256 totalWinningAmount = coupleBet.milestoneBets[bet.predictedMilestone];
        uint256 totalLosingAmount = coupleBet.totalAmount - totalWinningAmount;
        
        uint256 payout = bet.betAmount + (totalLosingAmount * bet.betAmount / totalWinningAmount);
        
        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Failed to send payout");
        
        emit BetPaidOut(betId, msg.sender, payout);
    }
    
    function getUserBets(address user) public view returns (uint256[] memory) {
        return userBets[user];
    }
    
    function getBet(uint256 betId) public view returns (Bet memory) {
        return bets[betId];
    }
    
    function getCoupleBetStats(uint256 coupleId) public view returns (
        uint256 totalBets,
        uint256 totalAmount,
        uint256[5] memory milestoneAmounts
    ) {
        CoupleBet storage coupleBet = coupleBets[coupleId];
        totalBets = coupleBet.totalBets;
        totalAmount = coupleBet.totalAmount;
        
        for (uint256 i = 0; i < 5; i++) {
            milestoneAmounts[i] = coupleBet.milestoneBets[i + 1];
        }
    }
    
    function getActiveBetsForCouple(uint256 coupleId) public view returns (uint256[] memory) {
        CoupleBet storage coupleBet = coupleBets[coupleId];
        uint256[] memory allBets = new uint256[](coupleBet.totalBets);
        uint256 activeCount = 0;
        
        // This is a simplified version - in production you'd want a better way to track active bets
        for (uint256 i = 0; i < coupleBet.totalBets; i++) {
            // Would need to iterate through all bets to find active ones for this couple
        }
        
        uint256[] memory activeBets = new uint256[](activeCount);
        return activeBets;
    }
    
    // Emergency functions
    function emergencyWithdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function pauseBetting() public onlyOwner {
        // Implementation would pause new bets
    }
}

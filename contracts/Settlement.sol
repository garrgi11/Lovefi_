// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Settlement is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _settlementIds;
    
    struct SettlementData {
        uint256 id;
        uint256 coupleId;
        uint256 finalMilestone;
        uint256 totalPool;
        uint256 coupleReward;
        uint256 predictorReward;
        uint256 timestamp;
        bool isCompleted;
        address[] winners;
        uint256[] winningAmounts;
    }
    
    mapping(uint256 => SettlementData) public settlements;
    mapping(uint256 => uint256) public coupleSettlements; // coupleId => settlementId
    mapping(address => uint256[]) public userSettlements;
    
    // Contract addresses
    address public coupleStakingContract;
    address public bettingPoolContract;
    address public milestoneNFTContract;
    
    uint256 public totalSettlements;
    uint256 public totalDistributed;
    
    event SettlementCreated(
        uint256 indexed settlementId,
        uint256 indexed coupleId,
        uint256 finalMilestone,
        uint256 totalPool
    );
    
    event SettlementCompleted(
        uint256 indexed settlementId,
        uint256 indexed coupleId,
        uint256 coupleReward,
        uint256 predictorReward
    );
    
    event WinnerPaid(
        uint256 indexed settlementId,
        address indexed winner,
        uint256 amount
    );
    
    constructor(
        address _coupleStakingContract,
        address _bettingPoolContract,
        address _milestoneNFTContract
    ) {
        coupleStakingContract = _coupleStakingContract;
        bettingPoolContract = _bettingPoolContract;
        milestoneNFTContract = _milestoneNFTContract;
    }
    
    modifier onlyValidContracts() {
        require(
            msg.sender == coupleStakingContract || 
            msg.sender == bettingPoolContract || 
            msg.sender == owner(),
            "Not authorized contract"
        );
        _;
    }
    
    function createSettlement(
        uint256 coupleId,
        uint256 finalMilestone,
        uint256 totalPool
    ) public onlyValidContracts returns (uint256) {
        require(finalMilestone >= 1 && finalMilestone <= 5, "Invalid milestone");
        require(totalPool > 0, "Pool must be greater than 0");
        require(coupleSettlements[coupleId] == 0, "Settlement already exists");
        
        _settlementIds.increment();
        uint256 settlementId = _settlementIds.current();
        
        settlements[settlementId] = SettlementData({
            id: settlementId,
            coupleId: coupleId,
            finalMilestone: finalMilestone,
            totalPool: totalPool,
            coupleReward: 0,
            predictorReward: 0,
            timestamp: block.timestamp,
            isCompleted: false,
            winners: new address[](0),
            winningAmounts: new uint256[](0)
        });
        
        coupleSettlements[coupleId] = settlementId;
        totalSettlements++;
        
        emit SettlementCreated(settlementId, coupleId, finalMilestone, totalPool);
        
        return settlementId;
    }
    
    function processSettlement(
        uint256 settlementId,
        address[] memory winners,
        uint256[] memory winningAmounts
    ) public onlyValidContracts nonReentrant {
        SettlementData storage settlement = settlements[settlementId];
        require(settlement.id > 0, "Settlement does not exist");
        require(!settlement.isCompleted, "Settlement already completed");
        require(winners.length == winningAmounts.length, "Arrays length mismatch");
        
        settlement.winners = winners;
        settlement.winningAmounts = winningAmounts;
        
        uint256 totalWinningAmount = 0;
        for (uint256 i = 0; i < winningAmounts.length; i++) {
            totalWinningAmount += winningAmounts[i];
        }
        
        // Calculate rewards
        if (settlement.finalMilestone == 5) {
            // Married: 50% to couple, 50% to predictors
            settlement.coupleReward = settlement.totalPool / 2;
            settlement.predictorReward = settlement.totalPool - settlement.coupleReward;
        } else {
            // Earlier stop: 100% to predictors
            settlement.coupleReward = 0;
            settlement.predictorReward = settlement.totalPool;
        }
        
        settlement.isCompleted = true;
        
        // Distribute rewards
        _distributeRewards(settlementId);
        
        totalDistributed += settlement.totalPool;
        
        emit SettlementCompleted(
            settlementId,
            settlement.coupleId,
            settlement.coupleReward,
            settlement.predictorReward
        );
    }
    
    function _distributeRewards(uint256 settlementId) private {
        SettlementData storage settlement = settlements[settlementId];
        
        // Pay couple reward if applicable
        if (settlement.coupleReward > 0) {
            // This would need to be integrated with the couple staking contract
            // to get the couple addresses and distribute the reward
        }
        
        // Pay predictor rewards
        for (uint256 i = 0; i < settlement.winners.length; i++) {
            if (settlement.winningAmounts[i] > 0) {
                (bool success, ) = settlement.winners[i].call{value: settlement.winningAmounts[i]}("");
                require(success, "Failed to send reward");
                
                emit WinnerPaid(settlementId, settlement.winners[i], settlement.winningAmounts[i]);
            }
        }
    }
    
    function getSettlement(uint256 settlementId) public view returns (
        uint256 id,
        uint256 coupleId,
        uint256 finalMilestone,
        uint256 totalPool,
        uint256 coupleReward,
        uint256 predictorReward,
        uint256 timestamp,
        bool isCompleted,
        address[] memory winners,
        uint256[] memory winningAmounts
    ) {
        SettlementData storage settlement = settlements[settlementId];
        return (
            settlement.id,
            settlement.coupleId,
            settlement.finalMilestone,
            settlement.totalPool,
            settlement.coupleReward,
            settlement.predictorReward,
            settlement.timestamp,
            settlement.isCompleted,
            settlement.winners,
            settlement.winningAmounts
        );
    }
    
    function getCoupleSettlement(uint256 coupleId) public view returns (uint256) {
        return coupleSettlements[coupleId];
    }
    
    function getUserSettlements(address user) public view returns (uint256[] memory) {
        return userSettlements[user];
    }
    
    function calculateRewards(
        uint256 finalMilestone,
        uint256 totalPool,
        address[] memory winners,
        uint256[] memory betAmounts
    ) public pure returns (
        uint256 coupleReward,
        uint256[] memory winningAmounts
    ) {
        if (finalMilestone == 5) {
            coupleReward = totalPool / 2;
            uint256 predictorPool = totalPool - coupleReward;
            
            winningAmounts = new uint256[](winners.length);
            uint256 totalBetAmount = 0;
            
            for (uint256 i = 0; i < betAmounts.length; i++) {
                totalBetAmount += betAmounts[i];
            }
            
            for (uint256 i = 0; i < winners.length; i++) {
                winningAmounts[i] = (predictorPool * betAmounts[i]) / totalBetAmount;
            }
        } else {
            coupleReward = 0;
            uint256 totalBetAmount = 0;
            
            for (uint256 i = 0; i < betAmounts.length; i++) {
                totalBetAmount += betAmounts[i];
            }
            
            winningAmounts = new uint256[](winners.length);
            for (uint256 i = 0; i < winners.length; i++) {
                winningAmounts[i] = (totalPool * betAmounts[i]) / totalBetAmount;
            }
        }
    }
    
    function getSettlementStats() public view returns (
        uint256 totalSettlements,
        uint256 totalDistributed,
        uint256 activeSettlements
    ) {
        totalSettlements = Settlement.totalSettlements;
        totalDistributed = Settlement.totalDistributed;
        
        uint256 active = 0;
        for (uint256 i = 1; i <= _settlementIds.current(); i++) {
            if (settlements[i].id > 0 && !settlements[i].isCompleted) {
                active++;
            }
        }
        activeSettlements = active;
    }
    
    // Admin functions
    function updateContractAddresses(
        address _coupleStakingContract,
        address _bettingPoolContract,
        address _milestoneNFTContract
    ) public onlyOwner {
        coupleStakingContract = _coupleStakingContract;
        bettingPoolContract = _bettingPoolContract;
        milestoneNFTContract = _milestoneNFTContract;
    }
    
    function emergencyWithdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function pauseSettlements() public onlyOwner {
        // Implementation would pause new settlements
    }
}

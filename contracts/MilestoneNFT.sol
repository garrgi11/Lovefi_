// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MilestoneNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    mapping(uint256 => MilestoneData) public milestoneData;
    mapping(uint256 => uint256[]) public coupleMilestones; // coupleId => milestone tokenIds
    mapping(address => uint256[]) public userMilestones;
    
    string[5] public milestoneNames = [
        "Official",
        "Exclusive", 
        "Serious",
        "Engaged",
        "Married"
    ];
    
    string[5] public milestoneColors = [
        "#FF6B6B", // Red
        "#4ECDC4", // Teal
        "#45B7D1", // Blue
        "#96CEB4", // Green
        "#FFEAA7"  // Gold
    ];
    
    struct MilestoneData {
        uint256 coupleId;
        uint256 milestoneLevel;
        uint256 achievedAt;
        string milestoneName;
        string milestoneColor;
        string tokenURI;
    }
    
    event MilestoneMinted(
        uint256 indexed tokenId,
        uint256 indexed coupleId,
        uint256 milestoneLevel,
        string milestoneName,
        uint256 timestamp
    );
    
    constructor() ERC721("LovefiMilestone", "MILESTONE") {}
    
    function mintMilestone(
        address user1,
        address user2,
        uint256 coupleId,
        uint256 milestoneLevel,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        require(milestoneLevel >= 1 && milestoneLevel <= 5, "Invalid milestone level");
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Mint to both users in the couple
        _safeMint(user1, newTokenId);
        _safeMint(user2, newTokenId);
        
        milestoneData[newTokenId] = MilestoneData({
            coupleId: coupleId,
            milestoneLevel: milestoneLevel,
            achievedAt: block.timestamp,
            milestoneName: milestoneNames[milestoneLevel - 1],
            milestoneColor: milestoneColors[milestoneLevel - 1],
            tokenURI: tokenURI
        });
        
        coupleMilestones[coupleId].push(newTokenId);
        userMilestones[user1].push(newTokenId);
        userMilestones[user2].push(newTokenId);
        
        emit MilestoneMinted(
            newTokenId,
            coupleId,
            milestoneLevel,
            milestoneNames[milestoneLevel - 1],
            block.timestamp
        );
        
        return newTokenId;
    }
    
    function getMilestone(uint256 tokenId) public view returns (MilestoneData memory) {
        require(_exists(tokenId), "Milestone does not exist");
        return milestoneData[tokenId];
    }
    
    function getCoupleMilestones(uint256 coupleId) public view returns (uint256[] memory) {
        return coupleMilestones[coupleId];
    }
    
    function getUserMilestones(address user) public view returns (uint256[] memory) {
        return userMilestones[user];
    }
    
    function getMilestoneName(uint256 milestoneLevel) public view returns (string memory) {
        require(milestoneLevel >= 1 && milestoneLevel <= 5, "Invalid milestone level");
        return milestoneNames[milestoneLevel - 1];
    }
    
    function getMilestoneColor(uint256 milestoneLevel) public view returns (string memory) {
        require(milestoneLevel >= 1 && milestoneLevel <= 5, "Invalid milestone level");
        return milestoneColors[milestoneLevel - 1];
    }
    
    function hasMilestone(
        uint256 coupleId,
        uint256 milestoneLevel
    ) public view returns (bool) {
        uint256[] memory milestones = coupleMilestones[coupleId];
        
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestoneData[milestones[i]].milestoneLevel == milestoneLevel) {
                return true;
            }
        }
        
        return false;
    }
    
    function getHighestMilestone(uint256 coupleId) public view returns (uint256) {
        uint256[] memory milestones = coupleMilestones[coupleId];
        uint256 highest = 0;
        
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestoneData[milestones[i]].milestoneLevel > highest) {
                highest = milestoneData[milestones[i]].milestoneLevel;
            }
        }
        
        return highest;
    }
    
    function getMilestoneProgress(uint256 coupleId) public view returns (
        bool[5] memory achieved,
        uint256[5] memory achievedAt
    ) {
        uint256[] memory milestones = coupleMilestones[coupleId];
        
        for (uint256 i = 0; i < milestones.length; i++) {
            uint256 level = milestoneData[milestones[i]].milestoneLevel;
            if (level >= 1 && level <= 5) {
                achieved[level - 1] = true;
                achievedAt[level - 1] = milestoneData[milestones[i]].achievedAt;
            }
        }
    }
    
    function getMilestoneStats() public view returns (
        uint256 totalMilestones,
        uint256[5] memory milestoneCounts
    ) {
        totalMilestones = _tokenIds.current();
        
        for (uint256 i = 0; i < 5; i++) {
            uint256 count = 0;
            for (uint256 j = 1; j <= _tokenIds.current(); j++) {
                if (_exists(j) && milestoneData[j].milestoneLevel == i + 1) {
                    count++;
                }
            }
            milestoneCounts[i] = count;
        }
    }
    
    // Override transfer functions to make milestone NFTs non-transferable
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override {
        require(from == address(0) || to == address(0), "Milestone NFT is non-transferable");
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }
    
    // Admin functions
    function updateMilestoneNames(string[5] memory newNames) public onlyOwner {
        milestoneNames = newNames;
    }
    
    function updateMilestoneColors(string[5] memory newColors) public onlyOwner {
        milestoneColors = newColors;
    }
    
    function setTokenURI(uint256 tokenId, string memory newTokenURI) public onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _setTokenURI(tokenId, newTokenURI);
        milestoneData[tokenId].tokenURI = newTokenURI;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MatchNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    mapping(uint256 => MatchData) public matchData;
    mapping(address => uint256[]) public userMatches;
    mapping(bytes32 => bool) public existingMatches;
    
    struct MatchData {
        address user1;
        address user2;
        uint256 matchedAt;
        bool isActive;
        string matchURI;
    }
    
    event MatchCreated(
        uint256 indexed tokenId,
        address indexed user1,
        address indexed user2,
        uint256 timestamp
    );
    
    event MatchDeactivated(uint256 indexed tokenId);
    
    constructor() ERC721("LovefiMatch", "MATCH") {}
    
    function createMatch(
        address user1,
        address user2,
        string memory matchURI
    ) public returns (uint256) {
        require(user1 != user2, "Cannot match with yourself");
        require(user1 != address(0) && user2 != address(0), "Invalid addresses");
        
        // Create unique match identifier
        bytes32 matchId = keccak256(abi.encodePacked(
            user1 < user2 ? user1 : user2,
            user1 < user2 ? user2 : user1
        ));
        
        require(!existingMatches[matchId], "Match already exists");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, matchURI);
        
        matchData[newTokenId] = MatchData({
            user1: user1,
            user2: user2,
            matchedAt: block.timestamp,
            isActive: true,
            matchURI: matchURI
        });
        
        userMatches[user1].push(newTokenId);
        userMatches[user2].push(newTokenId);
        existingMatches[matchId] = true;
        
        emit MatchCreated(newTokenId, user1, user2, block.timestamp);
        return newTokenId;
    }
    
    function deactivateMatch(uint256 tokenId) public {
        MatchData storage matchInfo = matchData[tokenId];
        require(matchInfo.isActive, "Match already deactivated");
        require(
            msg.sender == matchInfo.user1 || 
            msg.sender == matchInfo.user2 || 
            msg.sender == owner(),
            "Not authorized"
        );
        
        matchInfo.isActive = false;
        emit MatchDeactivated(tokenId);
    }
    
    function getMatch(uint256 tokenId) public view returns (MatchData memory) {
        require(_exists(tokenId), "Match does not exist");
        return matchData[tokenId];
    }
    
    function getUserMatches(address user) public view returns (uint256[] memory) {
        return userMatches[user];
    }
    
    function isMatched(address user1, address user2) public view returns (bool) {
        bytes32 matchId = keccak256(abi.encodePacked(
            user1 < user2 ? user1 : user2,
            user1 < user2 ? user2 : user1
        ));
        return existingMatches[matchId];
    }
    
    function getActiveMatches(address user) public view returns (uint256[] memory) {
        uint256[] memory allMatches = userMatches[user];
        uint256 activeCount = 0;
        
        // Count active matches
        for (uint256 i = 0; i < allMatches.length; i++) {
            if (matchData[allMatches[i]].isActive) {
                activeCount++;
            }
        }
        
        // Create array with only active matches
        uint256[] memory activeMatches = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < allMatches.length; i++) {
            if (matchData[allMatches[i]].isActive) {
                activeMatches[currentIndex] = allMatches[i];
                currentIndex++;
            }
        }
        
        return activeMatches;
    }
}




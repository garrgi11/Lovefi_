// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ProfileNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    mapping(address => uint256) public userProfiles;
    mapping(uint256 => ProfileData) public profileData;
    
    struct ProfileData {
        string firstName;
        string lastName;
        string birthday;
        string gender;
        string sexuality;
        string location;
        uint256 radius;
        string[] personalInterests;
        string[] partnerPreferences;
        string[] photoHashes; // IPFS hashes of photos
        string metadataURI; // IPFS metadata URI
        uint256 createdAt;
        bool isActive;
    }
    
    event ProfileMinted(address indexed user, uint256 tokenId, string firstName, string lastName);
    event ProfileUpdated(address indexed user, uint256 tokenId);
    
    constructor() ERC721("LovefiProfile", "LOVE") {}
    
    function mintProfile(
        address user,
        string memory firstName,
        string memory lastName,
        string memory birthday,
        string memory gender,
        string memory sexuality,
        string memory location,
        uint256 radius,
        string[] memory personalInterests,
        string[] memory partnerPreferences,
        string[] memory photoHashes,
        string memory metadataURI
    ) public returns (uint256) {
        require(userProfiles[user] == 0, "Profile already exists");
        require(bytes(firstName).length > 0, "First name cannot be empty");
        require(bytes(lastName).length > 0, "Last name cannot be empty");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(user, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        
        userProfiles[user] = newTokenId;
        profileData[newTokenId] = ProfileData({
            firstName: firstName,
            lastName: lastName,
            birthday: birthday,
            gender: gender,
            sexuality: sexuality,
            location: location,
            radius: radius,
            personalInterests: personalInterests,
            partnerPreferences: partnerPreferences,
            photoHashes: photoHashes,
            metadataURI: metadataURI,
            createdAt: block.timestamp,
            isActive: true
        });
        
        emit ProfileMinted(user, newTokenId, firstName, lastName);
        return newTokenId;
    }
    
    function updateProfile(
        string memory location,
        uint256 radius,
        string[] memory personalInterests,
        string[] memory partnerPreferences,
        string[] memory photoHashes,
        string memory metadataURI
    ) public {
        uint256 tokenId = userProfiles[msg.sender];
        require(tokenId > 0, "Profile does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not profile owner");
        
        profileData[tokenId].location = location;
        profileData[tokenId].radius = radius;
        profileData[tokenId].personalInterests = personalInterests;
        profileData[tokenId].partnerPreferences = partnerPreferences;
        profileData[tokenId].photoHashes = photoHashes;
        profileData[tokenId].metadataURI = metadataURI;
        
        // Update the token URI as well
        _setTokenURI(tokenId, metadataURI);
        
        emit ProfileUpdated(msg.sender, tokenId);
    }
    
    function getUserProfileTokenId(address user) public view returns (uint256) {
        return userProfiles[user];
    }
    
    function getTotalProfiles() public view returns (uint256) {
        return _tokenIds.current();
    }
    
    function getProfile(address user) public view returns (ProfileData memory) {
        uint256 tokenId = userProfiles[user];
        require(tokenId > 0, "Profile does not exist");
        return profileData[tokenId];
    }
    
    function hasProfile(address user) public view returns (bool) {
        return userProfiles[user] > 0;
    }
    
    // Override transfer functions to make NFT soulbound
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override {
        require(from == address(0) || to == address(0), "Profile NFT is soulbound");
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }
}

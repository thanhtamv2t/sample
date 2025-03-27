// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";


// Implementation contract that will be cloned
contract SampleERC721 is Initializable, ERC721Upgradeable, OwnableUpgradeable {
    using ECDSAUpgradeable for bytes32;
    
    string private _baseTokenURI;
    
    struct VerificationItem {
        string key;
        string value;
    }
    
    struct VerificationData {
        address verification_from;
        VerificationItem[] verification_data;
    }
    
    // Mapping from token ID to its verification data array
    mapping(uint256 => VerificationData[]) private _tokenVerifications;
    
    // Mapping from token ID to whitelisted addresses
    mapping(uint256 => mapping(address => bool)) private _tokenWhitelists;

    bytes32 public constant MESSAGE_HASH = 
            keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n16Get verification"));

    function initialize(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address owner
    ) external initializer {
        __ERC721_init(name, symbol);
        __Ownable_init();
        _baseTokenURI = baseTokenURI;
        transferOwnership(owner);
    }

    function mint(address to, uint256 tokenId) external onlyOwner {
        _mint(to, tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    // Add verification data for a token - anyone can add
    function addVerificationData(
        uint256 tokenId,
        VerificationItem[] calldata items
    ) external {
        require(_exists(tokenId), "Token does not exist");
        
        // Create a new verification data entry directly in storage
        _tokenVerifications[tokenId].push();
        
        // Get a reference to the newly added entry
        VerificationData storage newVerification = _tokenVerifications[tokenId][_tokenVerifications[tokenId].length - 1];
        
        // Set the verification_from field
        newVerification.verification_from = _msgSender();
        
        // Push items one by one to storage
        for (uint i = 0; i < items.length; i++) {
            newVerification.verification_data.push(items[i]);
        }
    }
    
    // Manage whitelist for a token
    function addToWhitelist(uint256 tokenId, address account) external {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Not owner or approved");
        _tokenWhitelists[tokenId][account] = true;
    }
    
    function removeFromWhitelist(uint256 tokenId, address account) external {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Not owner or approved");
        _tokenWhitelists[tokenId][account] = false;
    }
    
    // Get verification data with signature verification
    function getVerificationData(
        uint256 tokenId,
        bytes calldata signature
    ) external view returns (VerificationData[] memory) {
        address signer = MESSAGE_HASH.recover(signature);

        require(_tokenWhitelists[tokenId][signer], "Signer not whitelisted");
        
        return _tokenVerifications[tokenId];
    }
    
    // Owner access to verification data
    function getVerificationDataAsOwner(
        uint256 tokenId
    ) external view returns (VerificationData[] memory) {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Not owner or approved");
        
        return _tokenVerifications[tokenId];
    }
}

// Factory contract to deploy minimal proxies
contract ERC721Factory is Ownable {
    using Clones for address;
    
    address public immutable implementationContract;
    mapping(address => bool) public isDeployedByFactory;
    address[] public allTokens;
    
    event ERC721Created(address indexed tokenAddress, string name, string symbol, address owner);
    
    constructor() {
        implementationContract = address(new SampleERC721());
    }
    
    function createERC721(
        string memory name, 
        string memory symbol, 
        string memory baseTokenURI
    ) external returns (address) {
        address clone = implementationContract.clone();
        SampleERC721(clone).initialize(name, symbol, baseTokenURI, msg.sender);
        
        isDeployedByFactory[clone] = true;
        allTokens.push(clone);
        
        emit ERC721Created(clone, name, symbol, msg.sender);
        return clone;
    }
    
    function getTokensCount() external view returns (uint256) {
        return allTokens.length;
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

// Library for KYC operations to reduce main contract size
library KYCLib {
    enum KYCStatus { NONE, PENDING, APPROVED, REJECTED }
    
    struct KYCRequest {
        string documentHash;
        uint256 timestamp;
        KYCStatus status;
        string rejectionReason;
    }
    
    struct KYCData {
        mapping(address => KYCRequest) requests;
        mapping(address => KYCStatus) status;
        address[] pendingRequests;
        mapping(address => bool) inPending;
    }
    
    event KYCRequested(address indexed user, string documentHash, uint256 timestamp);
    event KYCApproved(address indexed user, uint256 timestamp);
    event KYCRejected(address indexed user, string reason, uint256 timestamp);
    event KYCDocumentUpdated(address indexed user, string oldHash, string newHash, uint256 timestamp);
    
    function requestKYC(KYCData storage self, address user, string calldata documentHash) external {
        require(bytes(documentHash).length > 0, "Hash required");
        require(self.status[user] != KYCStatus.APPROVED, "Already approved");
        
        string memory oldHash = self.requests[user].documentHash;
        bool isUpdate = bytes(oldHash).length > 0;
        
        if (!self.inPending[user]) {
            self.pendingRequests.push(user);
            self.inPending[user] = true;
        }
        
        self.requests[user] = KYCRequest({
            documentHash: documentHash,
            timestamp: block.timestamp,
            status: KYCStatus.PENDING,
            rejectionReason: ""
        });
        
        self.status[user] = KYCStatus.PENDING;
        
        if (isUpdate) {
            emit KYCDocumentUpdated(user, oldHash, documentHash, block.timestamp);
        } else {
            emit KYCRequested(user, documentHash, block.timestamp);
        }
    }
    
    function approveKYC(KYCData storage self, address user) external returns (bool) {
        require(self.status[user] == KYCStatus.PENDING, "No pending request");
        
        self.requests[user].status = KYCStatus.APPROVED;
        self.status[user] = KYCStatus.APPROVED;
        
        _removeFromPending(self, user);
        emit KYCApproved(user, block.timestamp);
        
        return true; // Return success for automatic whitelisting
    }
    
    function rejectKYC(KYCData storage self, address user, string calldata reason) external {
        require(self.status[user] == KYCStatus.PENDING, "No pending request");
        
        self.requests[user].status = KYCStatus.REJECTED;
        self.requests[user].rejectionReason = reason;
        self.status[user] = KYCStatus.REJECTED;
        
        _removeFromPending(self, user);
        emit KYCRejected(user, reason, block.timestamp);
    }
    
    function _removeFromPending(KYCData storage self, address user) internal {
        if (!self.inPending[user]) return;
        
        uint len = self.pendingRequests.length;
        for (uint i = 0; i < len; i++) {
            if (self.pendingRequests[i] == user) {
                self.pendingRequests[i] = self.pendingRequests[len - 1];
                self.pendingRequests.pop();
                break;
            }
        }
        self.inPending[user] = false;
    }
}

// Library for limit operations
library LimitLib {
    enum UserTier {NONE, TIER1, TIER2, TIER3, VIP }
    
    struct Limit { 
        uint256 used; 
        uint256 day; 
    }
    
    struct LimitData {
        mapping(address => Limit) sent;
        mapping(UserTier => uint256) tierLimits;
        mapping(address => UserTier) userTiers;
    }
    
    function initLimits(LimitData storage self) external {
        self.tierLimits[UserTier.NONE] = 0 ether;
        self.tierLimits[UserTier.TIER1] = 1500 ether;
        self.tierLimits[UserTier.TIER2] = 3000 ether;
        self.tierLimits[UserTier.TIER3] = 6000 ether;
        self.tierLimits[UserTier.VIP] = 15000 ether;
    }
    
    function updateDay(LimitData storage self, address user) external {
        uint256 d = block.timestamp / 1 days;
        if (self.sent[user].day != d) { 
            self.sent[user].day = d; 
            self.sent[user].used = 0; 
        }
    }
    
    function canSend(LimitData storage self, address user, uint256 amount) 
        external view returns (bool, uint256) 
    {
        uint256 limit = self.tierLimits[self.userTiers[user]];
        uint256 dayUsed = (self.sent[user].day == block.timestamp / 1 days) ? self.sent[user].used : 0;
        
        if (dayUsed + amount > limit) return (false, limit - dayUsed);
        return (true, limit - dayUsed - amount);
    }
}

contract Remittance is Ownable, ReentrancyGuard, Pausable {
    using KYCLib for KYCLib.KYCData;
    using LimitLib for LimitLib.LimitData;
    
    // Storage structures
    KYCLib.KYCData private kycData;
    LimitLib.LimitData private limitData;
    
    // Core mappings - NOW PRIVATE FOR SECURITY
    mapping(address => uint256) private balances;
    mapping(address => bool) private whitelisted;
    mapping(address => bool) private blacklisted;
    mapping(address => bool) private frozenRecipient;

    // Events
    event Sent(address indexed sender, address indexed recipient, uint256 amount);
    event Claimed(address indexed recipient, uint256 amount);
    event Frozen(address indexed recipient, bool frozen);
    event TierUpdated(address indexed user, LimitLib.UserTier newTier);
    event UserWhitelisted(address indexed user, bool status);
    event UserBlacklisted(address indexed user, bool status);

    modifier onlyKYCApproved(address user) {
        require(kycData.status[user] == KYCLib.KYCStatus.APPROVED, "KYC not approved");
        require(whitelisted[user] && !blacklisted[user], "Access denied");
        _;
    }

    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        _;
    }

    modifier onlyUserOrOwner(address user) {
        require(msg.sender == user || msg.sender == owner(), "Unauthorized access");
        _;
    }

    constructor() Ownable(msg.sender) {
        limitData.initLimits();
    }

    // === KYC FUNCTIONS ===
    
    function requestKYC(string calldata documentHash) external {
        require(bytes(documentHash).length > 0, "Document hash required");
        kycData.requestKYC(msg.sender, documentHash);
    }
    
    function approveKYC(address user, LimitLib.UserTier tier) external onlyOwner validAddress(user) {
        require(kycData.status[user] == KYCLib.KYCStatus.PENDING, "No pending KYC request");
        
        // Approve KYC first
        bool approved = kycData.approveKYC(user);
        
        if (approved) {
            // Automatically whitelist user upon KYC approval
            whitelisted[user] = true;
            limitData.userTiers[user] = tier;
            
            emit UserWhitelisted(user, true);
            emit TierUpdated(user, tier);
        }
    }
    
    function rejectKYC(address user, string calldata reason) external onlyOwner validAddress(user) {
        require(bytes(reason).length > 0, "Rejection reason required");
        kycData.rejectKYC(user, reason);
    }
    
    function batchApprove(address[] calldata users, LimitLib.UserTier[] calldata tiers) 
        external onlyOwner 
    {
        require(users.length == tiers.length, "Array length mismatch");
        require(users.length <= 50, "Batch size too large"); // Prevent gas issues
        
        for (uint i = 0; i < users.length; i++) {
            require(users[i] != address(0), "Invalid address in batch");
            
            if (kycData.status[users[i]] == KYCLib.KYCStatus.PENDING) {
                bool approved = kycData.approveKYC(users[i]);
                
                if (approved) {
                    // Automatically whitelist upon approval
                    whitelisted[users[i]] = true;
                    limitData.userTiers[users[i]] = tiers[i];
                    
                    emit UserWhitelisted(users[i], true);
                    emit TierUpdated(users[i], tiers[i]);
                }
            }
        }
    }

    // === CORE REMITTANCE ===

    function sendRemittance(address recipient)
        external payable whenNotPaused onlyKYCApproved(msg.sender) onlyKYCApproved(recipient)
    {
        require(recipient != msg.sender, "Cannot send to self");
        require(msg.value > 0, "Amount must be greater than zero");
        require(!frozenRecipient[recipient], "Recipient is frozen");
        
        limitData.updateDay(msg.sender);
        
        (bool canSend, uint256 remaining) = limitData.canSend(msg.sender, msg.value);
        require(canSend, string(abi.encodePacked("Daily limit exceeded. Remaining: ", remaining)));
        
        limitData.sent[msg.sender].used += msg.value;
        balances[recipient] += msg.value;
        
        emit Sent(msg.sender, recipient, msg.value);
    }

    function claimRemittance() external nonReentrant whenNotPaused onlyKYCApproved(msg.sender) {
        require(!frozenRecipient[msg.sender], "Account is frozen");
        require(balances[msg.sender] > 0, "No funds to claim");
        
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Claimed(msg.sender, amount);
    }

    // === ADMIN FUNCTIONS WITH ENHANCED SECURITY ===
    
    function setBlacklist(address user, bool status) external onlyOwner validAddress(user) {
        require(blacklisted[user] != status, "Status already set");
        blacklisted[user] = status;
        emit UserBlacklisted(user, status);
    }
    
    function setUserTier(address user, LimitLib.UserTier tier) external onlyOwner validAddress(user) {
        require(kycData.status[user] == KYCLib.KYCStatus.APPROVED, "User not KYC approved");
        require(whitelisted[user], "User not whitelisted");
        
        limitData.userTiers[user] = tier;
        emit TierUpdated(user, tier);
    }
    
    function setTierLimit(LimitLib.UserTier tier, uint256 limit) external onlyOwner {
        require(limit > 0, "Limit must be greater than zero");
        require(limit <= 100000 ether, "Limit too high"); // Reasonable upper bound
        
        limitData.tierLimits[tier] = limit;
    }

    function pause() external onlyOwner { 
        _pause(); 
    }
    
    function unpause() external onlyOwner { 
        _unpause(); 
    }
    
    function freezeRecipient(address user, bool frozen) external onlyOwner validAddress(user) {
        require(frozenRecipient[user] != frozen, "Status already set");
        frozenRecipient[user] = frozen;
        emit Frozen(user, frozen);
    }

    // === EMERGENCY FUNCTIONS ===
    
    function emergencyRecovery(address user) external onlyOwner nonReentrant validAddress(user) {
        uint256 amount = balances[user];
        require(amount > 0, "No funds to recover");
        
        balances[user] = 0;
        (bool success, ) = payable(user).call{value: amount}("");
        require(success, "Recovery transfer failed");
        
        emit Claimed(user, amount);
    }
    
    function emergencyWithdraw() external onlyOwner {
        require(paused(), "Contract must be paused for emergency withdrawal");
        
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: contractBalance}("");
        require(success, "Emergency withdrawal failed");
    }

    // === PRIVATE DATA ACCESS FUNCTIONS (USER OR OWNER ONLY) ===
    
    function getBalance(address user) external view onlyUserOrOwner(user) returns (uint256) {
        return balances[user];
    }
    
    function isWhitelisted(address user) external view onlyUserOrOwner(user) returns (bool) {
        return whitelisted[user];
    }
    
    function isBlacklisted(address user) external view onlyUserOrOwner(user) returns (bool) {
        return blacklisted[user];
    }
    
    function isFrozen(address user) external view onlyUserOrOwner(user) returns (bool) {
        return frozenRecipient[user];
    }
    
    function isKYCApproved(address user) external view onlyUserOrOwner(user) returns (bool) {
        return kycData.status[user] == KYCLib.KYCStatus.APPROVED;
    }

    // === VIEW FUNCTIONS WITH PROPER ACCESS CONTROL ===
    
    function getPendingKYC() external view onlyOwner returns (address[] memory) {
        return kycData.pendingRequests;
    }
    
    function getKYCStatus(address user) external view onlyUserOrOwner(user) returns (KYCLib.KYCStatus) {
        return kycData.status[user];
    }
    
    function getKYCRequest(address user) external view onlyUserOrOwner(user) returns (
        string memory documentHash,
        uint256 timestamp,
        KYCLib.KYCStatus status,
        string memory rejectionReason
    ) {
        KYCLib.KYCRequest memory req = kycData.requests[user];
        return (req.documentHash, req.timestamp, req.status, req.rejectionReason);
    }
    
    function getUserInfo(address user) external view onlyUserOrOwner(user) returns (
        LimitLib.UserTier tier,
        uint256 dailyLimit,
        uint256 todayUsed,
        uint256 balance,
        bool isWhitelistedUser,
        bool isBlacklistedUser,
        bool isFrozenUser,
        KYCLib.KYCStatus kycStatus
    ) {
        tier = limitData.userTiers[user];
        dailyLimit = limitData.tierLimits[tier];
        
        todayUsed = (limitData.sent[user].day == block.timestamp / 1 days) ? 
                    limitData.sent[user].used : 0;
        
        balance = balances[user];
        isWhitelistedUser = whitelisted[user];
        isBlacklistedUser = blacklisted[user];
        isFrozenUser = frozenRecipient[user];
        kycStatus = kycData.status[user];
    }
    
    function getRemainingLimit(address user) external view onlyUserOrOwner(user) returns (uint256) {
        (, uint256 remaining) = limitData.canSend(user, 0);
        return remaining;
    }
    
    function getTierLimit(LimitLib.UserTier tier) external view returns (uint256) {
        return limitData.tierLimits[tier];
    }

    // === PUBLIC VIEW FUNCTIONS (Only for msg.sender) ===
    
    function getMyBalance() external view returns (uint256) {
        return balances[msg.sender];
    }
    
    function getMyKYCStatus() external view returns (KYCLib.KYCStatus) {
        return kycData.status[msg.sender];
    }
    
    function getMyTier() external view returns (LimitLib.UserTier) {
        return limitData.userTiers[msg.sender];
    }
    
    function getMyRemainingLimit() external view returns (uint256) {
        (, uint256 remaining) = limitData.canSend(msg.sender, 0);
        return remaining;
    }
    
    function getMyWhitelistStatus() external view returns (bool) {
        return whitelisted[msg.sender];
    }
    
    function getMyBlacklistStatus() external view returns (bool) {
        return blacklisted[msg.sender];
    }
    
    function getMyFrozenStatus() external view returns (bool) {
        return frozenRecipient[msg.sender];
    }

    // === CONTRACT INFO ===
    
    function getContractBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }
    
    receive() external payable {
        revert("Direct payments not allowed");
    }
    
    fallback() external {
        revert("Function not found");
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DelegationManager
 * @dev Simple delegation manager for testing purposes
 * This is a simplified version for Monad testnet deployment
 */
contract DelegationManager is Ownable {
    
    struct Delegation {
        address delegator;
        address delegate;
        bytes32 authority;
        Caveat[] caveats;
        bytes32 salt;
        bytes signature;
        bool active;
        uint256 createdAt;
    }
    
    struct Caveat {
        string caveatType;
        address tokenAddress;
        uint256 periodAmount;
        uint256 periodDuration;
        uint256 startDate;
    }
    
    struct Execution {
        address target;
        uint256 value;
        bytes data;
    }
    
    // Storage
    mapping(bytes32 => Delegation) public delegations;
    mapping(address => bytes32[]) public userDelegations;
    mapping(address => uint256) public nonces;
    
    // Events
    event DelegationCreated(
        bytes32 indexed delegationId,
        address indexed delegator,
        address indexed delegate,
        bytes32 authority
    );
    
    event DelegationRedeemed(
        bytes32 indexed delegationId,
        address indexed delegate,
        uint256 amount,
        address token
    );
    
    event DelegationRevoked(
        bytes32 indexed delegationId,
        address indexed delegator
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new delegation
     */
    function createDelegation(
        address delegate,
        bytes32 authority,
        Caveat[] memory caveats,
        bytes32 salt,
        bytes memory signature
    ) external returns (bytes32) {
        bytes32 delegationId = keccak256(
            abi.encodePacked(
                msg.sender,
                delegate,
                authority,
                keccak256(abi.encode(caveats)),
                salt,
                nonces[msg.sender]++
            )
        );
        
        // Store delegation
        delegations[delegationId].delegator = msg.sender;
        delegations[delegationId].delegate = delegate;
        delegations[delegationId].authority = authority;
        delegations[delegationId].salt = salt;
        delegations[delegationId].signature = signature;
        delegations[delegationId].active = true;
        delegations[delegationId].createdAt = block.timestamp;
        
        // Store caveats individually
        for (uint256 i = 0; i < caveats.length; i++) {
            delegations[delegationId].caveats.push(caveats[i]);
        }
        
        // Track user delegations
        userDelegations[msg.sender].push(delegationId);
        userDelegations[delegate].push(delegationId);
        
        emit DelegationCreated(delegationId, msg.sender, delegate, authority);
        
        return delegationId;
    }
    
    /**
     * @dev Redeem delegations (simplified version)
     */
    function redeemDelegations(
        bytes32[] memory delegationIds,
        uint256[] memory modes,
        Execution[][] memory executions
    ) external {
        require(delegationIds.length == modes.length, "Array length mismatch");
        require(delegationIds.length == executions.length, "Array length mismatch");
        
        for (uint256 i = 0; i < delegationIds.length; i++) {
            bytes32 delegationId = delegationIds[i];
            Delegation storage delegation = delegations[delegationId];
            
            require(delegation.active, "Delegation not active");
            require(delegation.delegate == msg.sender, "Not authorized");
            
            // Execute each execution in the batch
            for (uint256 j = 0; j < executions[i].length; j++) {
                Execution memory execution = executions[i][j];
                
                // For ERC20 transfers, we'll handle them specially
                if (execution.target != address(0)) {
                    (bool success, ) = execution.target.call{value: execution.value}(execution.data);
                    require(success, "Execution failed");
                }
            }
            
            emit DelegationRedeemed(
                delegationId,
                msg.sender,
                executions[i].length,
                executions[i].length > 0 ? executions[i][0].target : address(0)
            );
        }
    }
    
    /**
     * @dev Revoke a delegation
     */
    function revokeDelegation(bytes32 delegationId) external {
        Delegation storage delegation = delegations[delegationId];
        require(delegation.delegator == msg.sender, "Not authorized");
        require(delegation.active, "Already revoked");
        
        delegation.active = false;
        
        emit DelegationRevoked(delegationId, msg.sender);
    }
    
    /**
     * @dev Get delegation details
     */
    function getDelegation(bytes32 delegationId) external view returns (Delegation memory) {
        return delegations[delegationId];
    }
    
    /**
     * @dev Get user's delegations
     */
    function getUserDelegations(address user) external view returns (bytes32[] memory) {
        return userDelegations[user];
    }
    
    /**
     * @dev Check if delegation is active
     */
    function isDelegationActive(bytes32 delegationId) external view returns (bool) {
        return delegations[delegationId].active;
    }
    
    /**
     * @dev Emergency function to pause contract (owner only)
     */
    function emergencyPause() external onlyOwner {
        // Implementation for emergency pause if needed
    }
}

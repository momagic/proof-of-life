// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IWorldID} from "./IWorldID.sol";

/// @title MockWorldIDRouter
/// @notice Mock implementation of World ID Router for testing orb verification
/// @dev This contract simulates the behavior of the real World ID Router
contract MockWorldIDRouter is IWorldID {
    
    // Track valid roots for testing
    mapping(uint256 => bool) public validRoots;
    
    // Track valid nullifiers for testing
    mapping(uint256 => bool) public validNullifiers;
    
    // Flag to simulate verification failures
    bool public simulateFailure;
    
    event ProofVerified(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash
    );
    
    constructor() {
        // Add some default valid roots for testing
        validRoots[0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef] = true;
        validRoots[0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890] = true;
    }
    
    /// @notice Verifies a World ID proof (mock implementation)
    /// @param root The Merkle root of the World ID tree
    /// @param groupId The group ID for the proof (must be 1 for orb verification)
    /// @param signalHash The hash of the signal
    /// @param nullifierHash The nullifier hash to prevent double-signaling
    /// @param externalNullifierHash The external nullifier hash
    /// @param proof The zero-knowledge proof (ignored in mock)
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view override {
        // Simulate failure if flag is set
        require(!simulateFailure, "Mock: Verification failed");
        
        // Ensure only orb verification (groupId = 1) is accepted
        require(groupId == 1, "Mock: Only orb verification supported");
        
        // Check if root is valid (for testing purposes)
        require(validRoots[root], "Mock: Invalid root");
        
        // Check if nullifier is valid (for testing purposes)
        require(validNullifiers[nullifierHash], "Mock: Invalid nullifier");
        
        // In a real implementation, this would verify the ZK proof
        // For testing, we just emit an event
        // Note: This is a view function, so we can't emit events
        // The emit is here for documentation purposes
    }
    
    /// @notice Add a valid root for testing
    function addValidRoot(uint256 root) external {
        validRoots[root] = true;
    }
    
    /// @notice Add a valid nullifier for testing
    function addValidNullifier(uint256 nullifierHash) external {
        validNullifiers[nullifierHash] = true;
    }
    
    /// @notice Remove a valid root
    function removeValidRoot(uint256 root) external {
        validRoots[root] = false;
    }
    
    /// @notice Remove a valid nullifier
    function removeValidNullifier(uint256 nullifierHash) external {
        validNullifiers[nullifierHash] = false;
    }
    
    /// @notice Toggle simulation of verification failures
    function setSimulateFailure(bool _simulateFailure) external {
        simulateFailure = _simulateFailure;
    }
    
    /// @notice Check if a root is valid
    function isValidRoot(uint256 root) external view returns (bool) {
        return validRoots[root];
    }
    
    /// @notice Check if a nullifier is valid
    function isValidNullifier(uint256 nullifierHash) external view returns (bool) {
        return validNullifiers[nullifierHash];
    }
}

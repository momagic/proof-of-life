// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/// @title IWorldID Interface
/// @notice Interface for the World ID Router contract that verifies World ID proofs
interface IWorldID {
    /// @notice Verifies a World ID proof
    /// @param root The Merkle root of the World ID tree
    /// @param groupId The group ID for the proof (1 for orb verification)
    /// @param signalHash The hash of the signal (usually the user's address)
    /// @param nullifierHash The nullifier hash to prevent double-signaling
    /// @param externalNullifierHash The external nullifier hash (app_id + action)
    /// @param proof The zero-knowledge proof
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
}

/// @title ByteHasher Library
/// @notice Library for hashing arbitrary data to field elements
library ByteHasher {
    /// @notice Creates a keccak256 hash of a bytestring.
    /// @param value The bytestring to hash
    /// @return The hash of the specified value
    /// @dev `>> 8` makes sure that the result is included in our field
    function hashToField(bytes memory value) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(value))) >> 8;
    }
}

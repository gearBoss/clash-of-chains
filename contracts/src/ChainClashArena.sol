// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ChainClashArena
/// @notice Anchors async PvP match results onchain with EIP-712 server signature verification.
contract ChainClashArena is EIP712, Ownable {
    using ECDSA for bytes32;

    bytes32 public constant MATCH_RESULT_TYPEHASH =
        keccak256(
            "MatchResult(bytes32 matchId,address p1,address p2,address winner,int32 ratingDeltaP1,int32 ratingDeltaP2)"
        );

    address public authorizedSigner;
    uint256 public totalMatchesRecorded;

    mapping(bytes32 => bool) public matchRecorded;

    event MatchRecorded(
        bytes32 indexed matchId,
        address indexed p1,
        address indexed p2,
        address winner,
        int32 ratingDeltaP1,
        int32 ratingDeltaP2
    );

    event SignerUpdated(address indexed oldSigner, address indexed newSigner);

    error MatchAlreadyRecorded(bytes32 matchId);
    error WinnerNotPlayer();
    error InvalidSignature();
    error ZeroAddress();

    constructor(
        address _signer
    ) EIP712("ChainClashArena", "1") Ownable(msg.sender) {
        if (_signer == address(0)) revert ZeroAddress();
        authorizedSigner = _signer;
    }

    /// @notice Record a completed match result, verified by EIP-712 server signature.
    /// @param matchId Unique match identifier (keccak256 of DB match id).
    /// @param p1 Player 1 address.
    /// @param p2 Player 2 address.
    /// @param winner Winner address (must be p1 or p2).
    /// @param ratingDeltaP1 Elo change for player 1 (can be negative).
    /// @param ratingDeltaP2 Elo change for player 2 (can be negative).
    /// @param signature EIP-712 signature from the authorized server signer.
    function recordResult(
        bytes32 matchId,
        address p1,
        address p2,
        address winner,
        int32 ratingDeltaP1,
        int32 ratingDeltaP2,
        bytes calldata signature
    ) external {
        if (matchRecorded[matchId]) revert MatchAlreadyRecorded(matchId);
        if (winner != p1 && winner != p2) revert WinnerNotPlayer();

        bytes32 structHash = keccak256(
            abi.encode(
                MATCH_RESULT_TYPEHASH,
                matchId,
                p1,
                p2,
                winner,
                ratingDeltaP1,
                ratingDeltaP2
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address recovered = digest.recover(signature);
        if (recovered != authorizedSigner) revert InvalidSignature();

        matchRecorded[matchId] = true;
        totalMatchesRecorded++;

        emit MatchRecorded(
            matchId,
            p1,
            p2,
            winner,
            ratingDeltaP1,
            ratingDeltaP2
        );
    }

    /// @notice Update the authorized signer. Only callable by owner.
    function setSigner(address _signer) external onlyOwner {
        if (_signer == address(0)) revert ZeroAddress();
        address old = authorizedSigner;
        authorizedSigner = _signer;
        emit SignerUpdated(old, _signer);
    }

    /// @notice Returns the EIP-712 domain separator for off-chain signature construction.
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}

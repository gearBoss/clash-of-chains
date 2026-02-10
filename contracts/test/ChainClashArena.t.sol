// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ChainClashArena.sol";

contract ChainClashArenaTest is Test {
    ChainClashArena public arena;

    uint256 internal signerPk = 0xA11CE;
    address internal signer;
    address internal owner;
    address internal p1 = address(0x1);
    address internal p2 = address(0x2);

    function setUp() public {
        signer = vm.addr(signerPk);
        owner = address(this);
        arena = new ChainClashArena(signer);
    }

    function _signResult(
        bytes32 matchId,
        address _p1,
        address _p2,
        address winner,
        int32 deltaP1,
        int32 deltaP2
    ) internal view returns (bytes memory) {
        bytes32 structHash = keccak256(
            abi.encode(
                arena.MATCH_RESULT_TYPEHASH(),
                matchId,
                _p1,
                _p2,
                winner,
                deltaP1,
                deltaP2
            )
        );

        bytes32 domainSeparator = arena.getDomainSeparator();
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", domainSeparator, structHash)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPk, digest);
        return abi.encodePacked(r, s, v);
    }

    function test_recordResult() public {
        bytes32 matchId = keccak256("match-1");
        int32 deltaP1 = 16;
        int32 deltaP2 = -16;

        bytes memory sig = _signResult(
            matchId,
            p1,
            p2,
            p1,
            deltaP1,
            deltaP2
        );

        vm.expectEmit(true, true, true, true);
        emit ChainClashArena.MatchRecorded(
            matchId,
            p1,
            p2,
            p1,
            deltaP1,
            deltaP2
        );

        arena.recordResult(matchId, p1, p2, p1, deltaP1, deltaP2, sig);

        assertTrue(arena.matchRecorded(matchId));
        assertEq(arena.totalMatchesRecorded(), 1);
    }

    function test_revert_duplicateMatch() public {
        bytes32 matchId = keccak256("match-dup");
        bytes memory sig = _signResult(matchId, p1, p2, p1, 16, -16);

        arena.recordResult(matchId, p1, p2, p1, 16, -16, sig);

        vm.expectRevert(
            abi.encodeWithSelector(
                ChainClashArena.MatchAlreadyRecorded.selector,
                matchId
            )
        );
        arena.recordResult(matchId, p1, p2, p1, 16, -16, sig);
    }

    function test_revert_winnerNotPlayer() public {
        bytes32 matchId = keccak256("match-bad-winner");
        address fakeWinner = address(0x999);
        bytes memory sig = _signResult(
            matchId,
            p1,
            p2,
            fakeWinner,
            0,
            0
        );

        vm.expectRevert(ChainClashArena.WinnerNotPlayer.selector);
        arena.recordResult(matchId, p1, p2, fakeWinner, 0, 0, sig);
    }

    function test_revert_invalidSignature() public {
        bytes32 matchId = keccak256("match-bad-sig");
        // Sign with wrong data
        bytes memory sig = _signResult(matchId, p1, p2, p1, 16, -16);

        // Use different delta to make signature invalid
        vm.expectRevert(ChainClashArena.InvalidSignature.selector);
        arena.recordResult(matchId, p1, p2, p1, 20, -20, sig);
    }

    function test_setSigner() public {
        address newSigner = address(0xBEEF);
        arena.setSigner(newSigner);
        assertEq(arena.authorizedSigner(), newSigner);
    }

    function test_revert_setSignerNotOwner() public {
        vm.prank(address(0xDEAD));
        vm.expectRevert();
        arena.setSigner(address(0xBEEF));
    }

    function test_revert_zeroAddressSigner() public {
        vm.expectRevert(ChainClashArena.ZeroAddress.selector);
        arena.setSigner(address(0));
    }

    function test_multipleMatches() public {
        for (uint256 i = 0; i < 5; i++) {
            bytes32 matchId = keccak256(abi.encodePacked("match-", i));
            address winner = i % 2 == 0 ? p1 : p2;
            int32 d1 = i % 2 == 0 ? int32(16) : int32(-16);
            int32 d2 = i % 2 == 0 ? int32(-16) : int32(16);

            bytes memory sig = _signResult(matchId, p1, p2, winner, d1, d2);
            arena.recordResult(matchId, p1, p2, winner, d1, d2, sig);
        }

        assertEq(arena.totalMatchesRecorded(), 5);
    }
}

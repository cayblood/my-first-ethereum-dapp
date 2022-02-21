// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "ds-test/test.sol";
import "../Polls.sol";

interface CheatCodes {
    function addr(uint256 privateKey) external returns (address);
    function expectEmit(bool, bool, bool, bool) external;
    function expectRevert(bytes calldata msg) external;
    function prank(address) external;
    function startPrank(address) external;
    function stopPrank() external;
}

contract PollsTest is DSTest {
    Polls polls;
    CheatCodes cheats = CheatCodes(HEVM_ADDRESS);
    event pollModified(address a, uint b);
    address alice;
    address bob;

    function setUp() public {
        polls = new Polls();
        alice = cheats.addr(1);
        bob = cheats.addr(2);
    }

    function testCreateNew() public {
        assertEq(polls.pollCount(), 0);
        cheats.expectEmit(false, true, false, false);
        cheats.prank(alice);
        emit pollModified(alice, 0);
        uint index = polls.createPoll("title", "question", "Alice Pool");
        assertEq(polls.pollCount(), 1);
    }

    function testModifyingUnownedPollFails() public {
        cheats.prank(alice);
        polls.createPoll("title", "question", "Alice Pool");
        cheats.prank(bob);
        cheats.expectRevert(bytes("Polls can only be modified by their owners"));
        polls.addOption(0, 'Blue');
    }

    function testCanRetrieveAllPolls() public {
        bytes32 title;
        cheats.startPrank(alice);
        polls.createPoll("title1", "question1", "Alice Pool");
        polls.createPoll("title2", "question2", "Alice Pool");
        cheats.stopPrank();
        (title, , , , , ) = polls.getPoll(0);
        assertEq(title, "title1");
        (title, , , , , ) = polls.getPoll(1);
        assertEq(title, "title2");
    }

    function testCanViewNewlyCreatedPoll() public {
        bytes32 title;
        string memory question;
        uint optionCount;
        uint voteCount;
        address owner;
        bytes32 ownerName;

        cheats.prank(alice);
        polls.createPoll("title1", "question1", "Alice Pool");
        (title, question, optionCount, voteCount, owner, ownerName) = polls.getPoll(0);
        assertEq(title, "title1");
        assertEq(question, "question1");
        assertEq(optionCount, 0);
        assertEq(voteCount, 0);
        assertEq(owner, alice);
        assertEq(ownerName, "Alice Pool");
    }

    function testGettingNonExistingPollReturnsError() public {
        cheats.prank(alice);
        cheats.expectRevert(bytes("Specified poll does not exist"));
        polls.getPoll(0);
    }

    function testCanAddPollOption() public {
        cheats.startPrank(alice);
        polls.createPoll("title1", "question1", "Alice Pool");
        cheats.expectEmit(false, true, false, false);
        emit pollModified(alice, 0);
        polls.addOption(0, "Blue");
        cheats.stopPrank();
    }

    function testCanGetOptionCount() public {
        uint optionCount;
        cheats.startPrank(alice);
        polls.createPoll("title1", "question1", "Alice Pool");
        polls.addOption(0, "Red");
        polls.addOption(0, "Yellow");
        polls.addOption(0, "Blue");
        cheats.stopPrank();
        optionCount = polls.getPollOptionCount(0);
        assertEq(optionCount, 3);
    }

    function testGetPollOption() public {
        string memory option;
        cheats.startPrank(alice);
        polls.createPoll("title1", "question1", "Alice Pool");
        polls.addOption(0, "Red");
        polls.addOption(0, "Yellow");
        polls.addOption(0, "Blue");
        cheats.stopPrank();
        (option,,) = polls.getPollOption(0, 1);
        assertEq(option, "Yellow");
    }

    function testGettingNonExistingPollOptionReturnsError() public {
        cheats.startPrank(alice);
        polls.createPoll("title1", "question1", "Alice Pool");
        polls.addOption(0, "Red");
        cheats.expectRevert(bytes("Specified option does not exist"));
        polls.getPollOption(0, 1);
    }

    function testCanRemovePollOption() public {
        string memory option;
        cheats.startPrank(alice);
        polls.createPoll("title1", "question1", "Alice Pool");
        polls.addOption(0, "Red");
        polls.addOption(0, "Yellow");
        polls.addOption(0, "Blue");
        cheats.expectEmit(false, true, false, false);
        emit pollModified(alice, 0);
        polls.removeOptionFromPoll(0, 1);
        cheats.stopPrank();
        uint count = polls.getPollOptionCount(0);
        assertEq(count, 2);
        (option, , ) = polls.getPollOption(0, 0);
        assertEq(option, "Red");
        (option, , ) = polls.getPollOption(0, 1);
        assertEq(option, "Blue");
    }

    function testCanEditOptionText() public {
        string memory option;
        cheats.startPrank(alice);
        polls.createPoll("title1", "question1", "Alice Pool");
        polls.addOption(0, "Red");
        polls.addOption(0, "Yellow");
        polls.addOption(0, "Blue");
        cheats.expectEmit(false, true, false, false);
        emit pollModified(alice, 0);
        polls.changePollOption(0, 1, "Mauve");
        cheats.stopPrank();
        uint count = polls.getPollOptionCount(0);
        assertEq(count, 3);
        (option, , ) = polls.getPollOption(0, 1);
        assertEq(option, "Mauve");
    }

    function testCanEditPollTitle() public {
        bytes32 title;
        cheats.startPrank(alice);
        polls.createPoll("title1", "question1", "Alice Pool");
        cheats.expectEmit(false, true, false, false);
        emit pollModified(alice, 0);
        polls.changePollTitle(0, "Title2");
        cheats.stopPrank();
        (title, , , , ,) = polls.getPoll(0);
        assertEq(title, "Title2");
    }

    function testCanEditPollQuestion() public {
        string memory question;
        cheats.startPrank(alice);
        polls.createPoll("title1", "question1", "Alice Pool");
        cheats.expectEmit(false, true, false, false);
        emit pollModified(alice, 0);
        polls.changePollQuestion(0, "question2");
        cheats.stopPrank();
        (, question, , , ,) = polls.getPoll(0);
        assertEq(question, "question2");
    }

    function testCanVoteForPollOption() public {
        cheats.startPrank(alice);
        polls.createPoll("title1", "question1", "Alice Pool");
        polls.addOption(0, "Red");
        polls.addOption(0, "Yellow");
        polls.addOption(0, "Blue");
        cheats.expectEmit(false, true, false, false);
        emit pollModified(alice, 0);
        polls.togglePollOptionVote(0, 1);
        cheats.stopPrank();
    }

    function testCanSeeIfAlreadyVoted() public {
        cheats.startPrank(alice);
        polls.createPoll("title1", "question1", "Alice Pool");
        polls.addOption(0, "Red");
        polls.addOption(0, "Yellow");
        polls.addOption(0, "Blue");
        cheats.expectEmit(false, true, false, false);
        emit pollModified(alice, 0);
        polls.togglePollOptionVote(0, 1);
        bool voted = polls.voterStatusForPollOption(0, 1);
        assertTrue(voted);
        cheats.expectEmit(false, true, false, false);
        emit pollModified(alice, 0);
        polls.togglePollOptionVote(0, 1);
        voted = polls.voterStatusForPollOption(0, 1);
        assertTrue(!voted);
        cheats.stopPrank();
    }
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

contract Polls {
    struct Poll {
        bytes32 title;
        string question;
        uint optionCount;
        uint voteCount;
        string[] options;
        uint[] optionVoteCounts;
        mapping(address => uint) votes;
        uint index;
        address owner;
    }

    event pollModified(address indexed _owner, uint _index);

    uint public pollCount = 0;
    Poll[] public polls;
    mapping(address => bytes32) ownerNames;

    function createPoll(bytes32 title, string memory question, bytes32 ownerName) public returns (uint index) {
        uint256 idx = polls.length;
        polls.push();
        Poll storage p = polls[idx];
        p.title = title;
        p.question = question;
        p.index = pollCount;
        p.owner = msg.sender;
        pollCount++;
        ownerNames[msg.sender] = ownerName;
        emit pollModified(p.owner, p.index);
        return p.index;
    }

    function getPoll(uint i) public view returns (bytes32 title, string memory question, uint optionCount, uint voteCount, address owner, bytes32 ownerName) {
        if (pollCount <= i)
            revert('Specified poll does not exist');
        return (
            polls[i].title,
            polls[i].question,
            polls[i].optionCount,
            polls[i].voteCount,
            polls[i].owner,
            ownerNames[polls[i].owner]
        );
    }

    function verifyPollExists(uint i) private view {
        if (pollCount <= i)
            revert('Specified poll does not exist');
    }

    function verifyPollOptionExists(uint i, uint j) private view {
        verifyPollExists(i);
        if (polls[i].optionCount <= j)
            revert('Specified option does not exist');
    }

    function verifyPollOwnership(uint i) private view {
        verifyPollExists(i);
        if (polls[i].owner != msg.sender)
            revert('Polls can only be modified by their owners');
    }

    function addOption(uint i, string memory option) public {
        verifyPollOwnership(i);
        Poll storage p = polls[i];
        p.optionCount++;
        p.options.push(option);
        p.optionVoteCounts.push(0);
        emit pollModified(p.owner, p.index);
    }

    function removeOptionFromPoll(uint i, uint j) public {
        verifyPollOwnership(i);
        verifyPollOptionExists(i, j);
        Poll storage p = polls[i];
        uint last_index = p.optionCount - 1;
        for (uint index = j; index < last_index; index++) {
            p.options[index] = p.options[index + 1];
            p.optionVoteCounts[index] = p.optionVoteCounts[index + 1];
        }
        delete p.options[last_index];
        delete p.optionVoteCounts[last_index];
        p.optionCount--;
        emit pollModified(p.owner, p.index);
    }

    function getPollOptionCount(uint i) public view returns (uint count) {
        verifyPollExists(i);
        return polls[i].optionCount;
    }

    function getPollOption(uint i, uint j) public view returns (string memory option, uint voteCount, bool voted) {
        verifyPollOptionExists(i, j);
        Poll storage p = polls[i];
        uint existingVote = p.votes[msg.sender];
        return (
            p.options[j],
            p.optionVoteCounts[j],
            existingVote == j + 1
        );
    }

    function changePollOption(uint i, uint j, string memory option) public {
        verifyPollOptionExists(i, j);
        verifyPollOwnership(i);
        Poll storage p = polls[i];
        p.options[j] = option;
        emit pollModified(p.owner, p.index);
    }

    function changePollTitle(uint i, bytes32 title) public {
        verifyPollOwnership(i);
        Poll storage p = polls[i];
        p.title = title;
        emit pollModified(p.owner, p.index);
    }

    function changePollQuestion(uint i, string memory question) public {
        verifyPollOwnership(i);
        Poll storage p = polls[i];
        p.question = question;
        emit pollModified(p.owner, p.index);
    }

    function getPollOptionVoteCount(uint i, uint j) public view returns (uint count) {
        verifyPollOptionExists(i, j);
        return polls[i].optionVoteCounts[j];
    }

    function togglePollOptionVote(uint i, uint j) public {
        verifyPollOptionExists(i, j);
        Poll storage p = polls[i];

        // store votes as index + 1 to avoid false negatives
        uint existingVote = p.votes[msg.sender];
        if (existingVote == j + 1) {
            // user wishes to 'uncast' a previous vote
            p.optionVoteCounts[existingVote - 1]--;
            p.voteCount--;
            p.votes[msg.sender] = 0;
        } else {
            if (existingVote != 0) {
                // decrement previous vote if there is one
                p.optionVoteCounts[existingVote - 1]--;
            } else {
                // only increment the total vote count if the user hasn't voted before
                p.voteCount++;
            }
            p.optionVoteCounts[j]++;
            p.votes[msg.sender] = j + 1;
        }
        emit pollModified(p.owner, p.index);
    }

    function voterStatusForPollOption(uint i, uint j) public view returns (bool voted) {
        verifyPollOptionExists(i, j);
        Poll storage p = polls[i];
        uint existingVote = p.votes[msg.sender];
        return existingVote == j + 1;
    }
}

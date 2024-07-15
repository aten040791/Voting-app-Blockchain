// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.16;

contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
        bool exists;
    }

    struct VoteInfo {
        uint voteBy;
        uint voteFor;
    }

    // Store Candidates
    mapping(uint => Candidate) public candidates;

    // Mapping voteNumber to Vote
    mapping(uint => VoteInfo) public votes;

    // Mapping voterId has already voted
    mapping(uint => bool) public alreadyVoted;

    uint voteCount;
    
    // voted event
    event votedEvent (uint voterId, uint candidateId);

    event HasAlreadyVotedEvent(string message, uint candidateId);

    // core function
    function vote (uint voterId, uint candidateId, string memory name) public {
        // require voter doesn't vote before
        if (alreadyVoted[voterId]) {
            emit HasAlreadyVotedEvent("Has already voted", candidateId);
            require(false);
        }
        
        // require a valid candidate, revert execution
        require(candidateId > 0, "Candidate id must be > 0");

        if (isCandidate(candidateId)) { 
            candidates[candidateId] = Candidate(candidateId, name, 0, false);
        } 
        else {
            // update candidate vote Count
            candidates[candidateId].voteCount ++;
        }
        votes[voteCount] = VoteInfo(voterId, candidateId);
        voteCount++;

        // store candidates voted
        alreadyVoted[voterId] = true;
        
        // trigger voted event
        emit votedEvent(voterId, candidateId);
    }

    function getVotedCandidates() public view returns (VoteInfo[] memory) {
        VoteInfo[] memory voteArray = new VoteInfo[](voteCount);
        for (uint256 i = 0; i < voteCount; i++) {
            voteArray[i] = votes[i];
        }
        return voteArray;
    }

    function isCandidate(uint256 candidateId) public view returns (bool) {
        return candidates[candidateId].exists;
    }
}

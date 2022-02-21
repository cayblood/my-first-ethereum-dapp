# My First Ethereum Dapp

This is a simple Ethereum decentralized application (dapp). It consists of a
smart contract storing user-created polls, along with other user's responses to
this poll, as well as a frontend web application that provides a user interface
for these polls. The purpose of the application is to help newcomers to
blockchain development to understand some of the basic principles of dapp
development with an example that demonstrates multi-user interactivity.

## Setup dev environment

Install [nvm](https://github.com/nvm-sh/nvm) if you haven't already.

```shell
nvm install 14
nvm use 14
npm install
```

Install [foundry](https://github.com/gakonst/foundry).

## Running tests

```text
> forge test
compiling...
Compiling 3 files with 0.8.10
Compilation finished successfully
success.
Running 15 tests for PollsTest.json:PollsTest
[PASS] testCanAddPollOption() (gas: 235165)
[PASS] testCanEditOptionText() (gas: 309265)
[PASS] testCanEditPollQuestion() (gas: 156398)
[PASS] testCanEditPollTitle() (gas: 152566)
[PASS] testCanGetOptionCount() (gas: 293035)
[PASS] testCanRemovePollOption() (gas: 296489)
[PASS] testCanRetrieveAllPolls() (gas: 249092)
[PASS] testCanSeeIfAlreadyVoted() (gas: 312738)
[PASS] testCanViewNewlyCreatedPoll() (gas: 147921)
[PASS] testCanVoteForPollOption() (gas: 361955)
[PASS] testCreateNew() (gas: 141611)
[PASS] testGetPollOption() (gas: 298605)
[PASS] testGettingNonExistingPollOptionReturnsError() (gas: 235469)
[PASS] testGettingNonExistingPollReturnsError() (gas: 3263)
[PASS] testModifyingUnownedPollFails() (gas: 141055)
``` 

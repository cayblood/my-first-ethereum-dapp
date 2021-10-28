const { assert } = require('chai');
const { ethers } = require('hardhat');

describe('Polls', async () => {
  let instance, creator, respondent;

  const assertPollModifiedEvent = async (tx, i) => {
    const receipt = await tx.wait();
    assert.equal(receipt.events[0].event, 'pollModified', 'Expected pollModified event');
    assert.equal(receipt.events[0].args[0], creator.address);
    assert.equal(receipt.events[0].args[1], i);
  };

  beforeEach(async () => {
    [creator, respondent] = await ethers.getSigners();;
    const Polls = await ethers.getContractFactory("Polls");
    const polls = await Polls.deploy();
    instance = await polls.deployed();
  });

  describe('A user', () => {
    it('can create a new poll', async () => {
      const title = ethers.utils.formatBytes32String('My Cool Poll');
      const ownerName = ethers.utils.formatBytes32String('Alice');
      const question = 'What is your favorite color?';
      assert.equal(await instance.pollCount(), 0);
      const tx = await instance.createPoll(title, question, ownerName);
      assertPollModifiedEvent(tx, 0, 0);
      assert.equal(await instance.pollCount(), 1);
    });

    it("cannot modify another user's poll", async () => {
      const title = ethers.utils.formatBytes32String('My Cool Poll');
      const ownerName = ethers.utils.formatBytes32String('Alice');
      const question = 'What is your favorite color?';
      await instance.createPoll(title, question, ownerName);
      try {
        await instance.connect(respondent).addOption(0, 'Blue');
      } catch (e) {
        assert(e.message.includes('Polls can only be modified by their owners'));
      }
    });

    it('can retrieve all polls', async () => {
      const title1 = 'poll1';
      const encoded_title1 = ethers.utils.formatBytes32String(title1);
      const question1 = 'Question 1?';
      const ownerName = ethers.utils.formatBytes32String('Alice');
      let result = await instance.createPoll(encoded_title1, question1, ownerName);
      const title2 = 'poll2';
      const encoded_title2 = ethers.utils.formatBytes32String(title2);
      const question2 = 'Question 2?';
      result = await instance.createPoll(encoded_title2, question2, ownerName);
      assert.equal(await instance.pollCount(), 2);
      result = await instance.getPoll(0);
      assert.equal(ethers.utils.parseBytes32String(result[0]), title1);
      assert.equal(result[1], question1);
      result = await instance.getPoll(1);
      assert.equal(ethers.utils.parseBytes32String(result[0]), title2);
      assert.equal(result[1], question2);
    });

    it('can view a recently created poll', async () => {
      const title = 'My Cool Poll';
      const encoded_title = ethers.utils.formatBytes32String(title);
      const ownerName = ethers.utils.formatBytes32String('Alice');
      const question = 'What is your favorite color?';
      await instance.createPoll(encoded_title, question, ownerName);
      const result = await instance.getPoll(0);
      assert.equal(ethers.utils.parseBytes32String(result[0]), title);
      assert.equal(result[1], question);
      assert.equal(result[2], 0);
      assert.equal(result[3], 0);
    });

    it('gets an error if a requested poll does not exist', async () => {
      try {
        const result = await instance.getPoll(0);
      } catch (e) {
        assert(e.message.includes('Specified poll does not exist'));
      }
    });

    it('can add an option to a poll', async () => {
      const title = 'My Cool Poll';
      const encoded_title = ethers.utils.formatBytes32String(title);
      const question = 'What is your favorite color?';
      const ownerName = ethers.utils.formatBytes32String('Alice');
      await instance.createPoll(encoded_title, question, ownerName);
      const result = await instance.addOption(0, 'Blue');
      assertPollModifiedEvent(result, 0, 0);
      await instance.addOption(0, 'Red');
      await instance.addOption(0, 'Green');
    });

    it('can retrieve the count of options in a poll', async () => {
      const title = 'My Cool Poll';
      const encoded_title = ethers.utils.formatBytes32String(title);
      const question = 'What is your favorite color?';
      const ownerName = ethers.utils.formatBytes32String('Alice');
      await instance.createPoll(encoded_title, question, ownerName);
      await instance.addOption(0, 'Blue');
      await instance.addOption(0, 'Red');
      await instance.addOption(0, 'Green');
      const count = await instance.getPollOptionCount(0);
      assert.equal(count, 3);
    });

    it('can retrieve a specified option from a poll', async () => {
      const title = 'My Cool Poll';
      const encoded_title = ethers.utils.formatBytes32String(title);
      const question = 'What is your favorite color?';
      const ownerName = ethers.utils.formatBytes32String('Alice');
      await instance.createPoll(encoded_title, question, ownerName);
      await instance.addOption(0, 'Blue');
      await instance.addOption(0, 'Red');
      await instance.addOption(0, 'Green');
      const result = await instance.getPollOption(0, 1);
      assert.equal(result[0], 'Red');
    });

    it('gets an error if a requested option does not exist', async () => {
      const title = 'My Cool Poll';
      const encoded_title = ethers.utils.formatBytes32String(title);
      const question = 'What is your favorite color?';
      const ownerName = ethers.utils.formatBytes32String('Alice');
      await instance.createPoll(encoded_title, question, ownerName);
      try {
        await instance.getPollOption(0, 0);
      } catch (e) {
        assert(e.message.includes('Specified option does not exist'));
      }
    });

    it('can remove an option from a poll', async () => {
      const title = 'My Cool Poll';
      const encoded_title = ethers.utils.formatBytes32String(title);
      const question = 'What is your favorite color?';
      const ownerName = ethers.utils.formatBytes32String('Alice');
      await instance.createPoll(encoded_title, question, ownerName);
      await instance.addOption(0, 'Blue');
      await instance.addOption(0, 'Red');
      await instance.addOption(0, 'Green');
      let result = await instance.removeOptionFromPoll(0, 1);
      assertPollModifiedEvent(result, 0);
      const count = await instance.getPollOptionCount(0);
      assert.equal(count, 2);
      result = await instance.getPollOption(0, 0);
      assert.equal(result[0], 'Blue');
      result = await instance.getPollOption(0, 1);
      assert.equal(result[0], 'Green');
    });

    it('can edit the text of an existing poll option', async () => {
      const title = 'My Cool Poll';
      const encoded_title = ethers.utils.formatBytes32String(title);
      const question = 'What is your favorite color?';
      const ownerName = ethers.utils.formatBytes32String('Alice');
      await instance.createPoll(encoded_title, question, ownerName);
      await instance.addOption(0, 'Blue');
      await instance.addOption(0, 'Red');
      await instance.addOption(0, 'Green');
      let result = await instance.changePollOption(0, 1, 'Mauve');
      assertPollModifiedEvent(result, 0);
      const count = await instance.getPollOptionCount(0);
      assert.equal(count, 3);
      result = await instance.getPollOption(0, 1);
      assert.equal(result[0], 'Mauve');
    });

    it('can edit the title of an existing poll', async () => {
      const title = 'My Cool Poll';
      const encoded_title = ethers.utils.formatBytes32String(title);
      const question = 'What is your favorite color?';
      const ownerName = ethers.utils.formatBytes32String('Alice');
      await instance.createPoll(encoded_title, question, ownerName);
      const newTitle = 'My Awesome Poll';
      let result = await instance.changePollTitle(0, ethers.utils.formatBytes32String(newTitle));
      assertPollModifiedEvent(result, 0);
      result = await instance.getPoll(0);
      assert.equal(ethers.utils.parseBytes32String(result[0]), newTitle);
    });

    it('can edit the question of an existing poll', async () => {
      const title = 'My Cool Poll';
      const encoded_title = ethers.utils.formatBytes32String(title);
      const question = 'What is your favorite color?';
      const ownerName = ethers.utils.formatBytes32String('Alice');
      await instance.createPoll(encoded_title, question, ownerName);
      const newQuestion = 'What is your favorite movie?';
      let result = await instance.changePollQuestion(0, newQuestion);
      assertPollModifiedEvent(result, 0);
      result = await instance.getPoll(0);
      assert.equal(result[1], newQuestion);
    });

    it('can vote for an option in a poll', async () => {
      const title = 'My Cool Poll';
      const encoded_title = ethers.utils.formatBytes32String(title);
      const question = 'What is your favorite color?';
      const ownerName = ethers.utils.formatBytes32String('Alice');
      await instance.createPoll(encoded_title, question, ownerName);
      await instance.addOption(0, 'Blue');
      await instance.addOption(0, 'Red');
      await instance.addOption(0, 'Green');
      let result = await instance.togglePollOptionVote(0, 1);
      assertPollModifiedEvent(result, 0);
      let count = await instance.getPollOptionVoteCount(0, 0);
      assert.equal(count, 0);
      count = await instance.getPollOptionVoteCount(0, 1);
      assert.equal(count, 1);
      count = await instance.getPollOptionVoteCount(0, 2);
      assert.equal(count, 0);
      result = await instance.getPoll(0);
      assert.equal(result[3], 1);
    });

    it("can see if they've already voted for a poll", async () => {
      const title = 'My Cool Poll';
      const encoded_title = ethers.utils.formatBytes32String(title);
      const question = 'What is your favorite color?';
      const ownerName = ethers.utils.formatBytes32String('Alice');
      await instance.createPoll(encoded_title, question, ownerName);
      await instance.addOption(0, 'Blue');
      await instance.addOption(0, 'Red');
      await instance.addOption(0, 'Green');
      let result = await instance.togglePollOptionVote(0, 1);
      assertPollModifiedEvent(result, 0);
      let voted = await instance.voterStatusForPollOption(0, 1);
      assert(voted);
      result = await instance.togglePollOptionVote(0, 1);
      voted = await instance.voterStatusForPollOption(0, 1);
      assert.equal(voted, false);
    });
  });
});

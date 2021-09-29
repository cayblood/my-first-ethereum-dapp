let instance = await Polls.deployed()
let title = web3.utils.utf8ToHex('My cool poll')
let result = await instance.createPoll(title, 'What is your favorite color?')
result = await instance.addOption(0, 'Red')
result = await instance.addOption(0, 'Yellow')
result = await instance.addOption(0, 'Blue')
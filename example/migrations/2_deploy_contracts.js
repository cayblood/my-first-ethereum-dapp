const Polls = artifacts.require("Polls");

module.exports = function(deployer) {
  deployer.deploy(Polls);
};

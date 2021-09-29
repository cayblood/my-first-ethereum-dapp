import Web3 from "web3";
import Polls from "./contracts/Polls.json";

const options = {
  web3: {
    block: false,
    customProvider: new Web3("ws://localhost:8545"),
  },
  contracts: [Polls],
  events: {
    Polls: ["pollModified"]
  },
  polls: {
    blocks: 1000,
  },
};

export default options;

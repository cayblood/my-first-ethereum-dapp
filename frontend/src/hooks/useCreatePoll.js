import { useState, useEffect } from 'react';
import ContractData from "../Polls.json";
import { useContractFunction } from '@usedapp/core';
import { utils } from 'ethers';
import { Contract } from '@ethersproject/contracts';

export const useCreatePoll = () => {
  const contractInterface = new utils.Interface(ContractData.abi);
  const contract = new Contract(ContractData.address, contractInterface);
  const { send: createPollSend, state: createPollStatus } =
    useContractFunction(contract, 'createPoll', {
      transactionName: 'Create Poll'
    });
  // const {state: stateAddOption, send: addOptionSend} = useContractFunction(contract, 'addOption');
  const [pollState, setPollState] = useState(createPollStatus);

  useEffect(() => {
    console.log(createPollStatus);
  }, [createPollStatus]);

  const createPoll = (title, question, name) => {
    const titleBytes = utils.formatBytes32String(title);
    const questionBytes = utils.formatBytes32String(question);
    const nameBytes = utils.formatBytes32String(name);
    return createPollSend(titleBytes, questionBytes, nameBytes, { gasPrice: 40000000000, gasLimit: 600000 });
  };

  return { createPoll, pollState };
}

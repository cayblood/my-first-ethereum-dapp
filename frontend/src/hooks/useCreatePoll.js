import { useState, useEffect } from 'react';
import ContractData from "../Polls.json";
import { useContractFunction } from '@usedapp/core';
import { utils } from 'ethers';
import { Contract } from '@ethersproject/contracts';

export const useCreatePoll = () => {
  const contractInterface = new utils.Interface(ContractData.abi);
  const contract = new Contract(ContractData.address, contractInterface);
  const { send: createPollSend, state: createPollStatus, events: createPollEvents } =
    useContractFunction(contract, 'createPoll', {
      transactionName: 'Create poll'
    });
  const {send: addOptionSend, state: addOptionStatus} =
    useContractFunction(contract, 'addOption', {
      transactionName: 'Add poll option'
    });
  const [pollOptions, setPollOptions] = useState([]);

  useEffect(() => {
    const createPollOptions = async () => {
      if (Array.isArray(createPollEvents)) {
        const event = createPollEvents.find(e => (e.name === 'pollModified'))
        if (event) {
          const pollId = event.args[1].toNumber();
          for (let i = 0; i < pollOptions.length; i++) {
            await addOptionSend(pollId, pollOptions[i]);
          }
          setPollOptions([]);
        }
      }
    };
    createPollOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createPollEvents]);

  const createPoll = (title, question, name, options) => {
    options.forEach(o => setPollOptions(pollOptions => [...pollOptions, o]));
    const titleBytes = utils.formatBytes32String(title);
    const nameBytes = utils.formatBytes32String(name);
    return createPollSend(titleBytes, question, nameBytes);
  };

  return { createPoll, createPollStatus, addOptionStatus };
}

import { useState, useEffect } from 'react';
import ContractData from "../Polls.json";
import { useEthers, useContractCall } from '@usedapp/core';
import { ethers, utils } from 'ethers';

const contractInterface = new utils.Interface(ContractData.abi);

export const usePollCount = () => {
  const [pollCount] =
    useContractCall({
      abi: contractInterface,
      address: ContractData.address,
      method: 'pollCount',
      args: []
    }) || [];
  return pollCount;
};

export const usePolls = () => {
  const pollCount = usePollCount();
  const [polls, setPolls] = useState([]);
  const { library } = useEthers();
  const ethersContract = new ethers.Contract(ContractData.address, ContractData.abi, library);

  useEffect(() => {
    (async () => {
      const count = pollCount && pollCount.toNumber();
      let newPoll, poll;
      if (count) {
        for (let i = 0; i < count; i++) {
          poll = await ethersContract.getPoll(i);
          newPoll = {
            id: i,
            title: utils.parseBytes32String(poll.title),
            question: poll.question,
            owner: poll.owner,
            ownerName: utils.parseBytes32String(poll.ownerName),
            voteCount: poll.voteCount.toNumber(),
            optionCount: poll.optionCount.toNumber(),
            options: []
          };
          for (let j = 0; j < newPoll.optionCount; j++) {
            const pollOption = await ethersContract.getPollOption(i, j);
            // console.log('option', i, j, pollOption);
            const opt = {
              id: j,
              text: pollOption.option,
              voteCount: pollOption.voteCount.toNumber(),
              voted: pollOption.voted
            };
            const existingOption = newPoll.options.find(o => o.id === opt.id);
            // console.log({existingOption: existingOption});
            if (!existingOption) {
              newPoll.options.push(opt);
            }
          }
          let existingPoll = polls.find(p => p.id === newPoll.id); // eslint-disable-line
          if (!existingPoll) {
            setPolls(polls => [...polls, newPoll]); // eslint-disable-line
          }
        }
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollCount]);
  return { polls };
};
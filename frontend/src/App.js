import React from 'react';
import {useEthers} from '@usedapp/core';

import Wrapper from "./Wrapper";
import Header from "./Header";
import { Polls } from "./Polls";
import NewPoll from "./NewPoll";

export default function App() {
  const { account, error } = useEthers();
  if (error) console.log(error);
  return (
    <div className="min-h-full">
      <Header/>
      {account &&
        <Wrapper>
          <Polls/>
          <NewPoll/>
        </Wrapper>
      }
    </div>
  )
}
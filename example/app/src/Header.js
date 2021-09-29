import React, { Component } from "react";
import PropTypes from "prop-types";
import {drizzleConnect} from "@drizzle/react-plugin";
import _ from 'lodash';
import contractJSON from './contracts/Polls';

// This is not a perfect solution. It looks at the owners of existing polls and avoids assigning their accounts to this
// user. The weakness in this approach is that new users browsing at the same time will get the same name/account. To
// avoid this during a demo, make sure that each new user creates a new poll before another one browses to the site.

const getLoggedInUserName = async state => {
  // hack--using direct web3 calls due to not finding drizzle solution for dependent call chains
  const web3 = state.web3;
  const rawContract = new web3.eth.Contract(contractJSON.abi, contractJSON.networks["5777"].address);
  const names = ['Alice', 'Bob', 'Carol', 'Dan', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'];
  const name = sessionStorage.getItem('name');
  const accounts = _.values(state.accounts);
  let returnVal = name;
  if (!name) {
    let assignedAccounts = [];
    const pollCount = parseInt(await rawContract.methods.pollCount().call());
    let poll = {};
    let i = 0;
    for (i = 0; i < pollCount; i++) {
      poll = await rawContract.methods.getPoll(i).call();
      assignedAccounts.push(poll.owner);
    }
    i = 0;
    while (i < accounts.length) {
      if (!_.includes(assignedAccounts, accounts[i])) {
        break;
      }
      i++;
    }
    if (i === accounts.length) { // all accounts are used up
      i = Math.floor(Math.random() * 10); // random number between 0 and 9
    }
    sessionStorage.setItem('name', names[i]);
    returnVal = names[i];
    sessionStorage.setItem('account', accounts[i]);
  }
  return {loggedInUserName: returnVal};
};

class Header extends Component {
  constructor(props, context) {
    super(props);
    const contract = context.drizzle.contracts['Polls'];
    this.state = {
      accounts: props.accounts,
      web3: context.drizzle.web3,
      dataKey: contract.methods['pollCount'].cacheCall()
    };
  }

  componentDidMount() {
    getLoggedInUserName(this.state).then(data => this.setState(data));
  }

  render () {
    return (
      <div
        className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom shadow-sm sticky-top">
        <h5 className="my-0 mr-md-auto font-weight-normal">Polls</h5>
        <div>Signed in as: {this.state.loggedInUserName}</div>
      </div>
    );
  }
}

Header.contextTypes = {
  drizzle: PropTypes.object,
  accounts: PropTypes.array
};

/*
 * Export connected component.
 */

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    accounts: state.accounts,
  };
};

export default drizzleConnect(Header, mapStateToProps);

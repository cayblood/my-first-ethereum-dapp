import {drizzleConnect} from "@drizzle/react-plugin";
import React, {Component} from "react";
import PropTypes from "prop-types";
import _ from 'lodash';
import PollOption from "./PollOption";

class Poll extends Component {
  constructor(props, context) {
    super(props);
    this.handler = this.handleVote.bind(this);
    const contract = context.drizzle.contracts['Polls'];
    this.state = {
      contract: contract,
      dataKey: contract.methods['getPoll'].cacheCall(props.pollIndex)
    };
  }

  // kludge: research how to pass the { from: _ } option with cacheCall()
  componentDidMount() {
    this.interval = setInterval(() => this.setState({ time: Date.now() }), 2000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  async handleVote(pollIndex, optionIndex) {
    const togglePollOptionVote = this.state.contract.methods['togglePollOptionVote'];
    const getPoll = this.state.contract.methods['getPoll'];
    const options = {
      gas: 600000,
      gasPrice: 40000000000
    };
    const account = sessionStorage.getItem('account');
    if (account) {
      options.from = account;
    }
    const result = await togglePollOptionVote(pollIndex, optionIndex).send(options);
    const pollState = await getPoll(pollIndex).call(options);
    this.setState({blockNumber: result.blockNumber, voteCount: parseInt(pollState.voteCount)});
  }

  render() {
    const contract = this.props.contracts['Polls'];
    // Contract is not yet intialized.
    if (!contract.initialized) {
      return <span>Initializing...</span>;
    }

    // If the cache key we received earlier isn't in the store yet; the initial value is still being fetched.
    if (!(this.state.dataKey in contract['getPoll'])) {
      return <span>Fetching...</span>;
    }

    const displayData = contract['getPoll'][this.state.dataKey].value;
    const title = this.context.drizzle.web3.utils.hexToUtf8(displayData['title']);
    const optionCount = parseInt(displayData['optionCount']);
    const voteCount = parseInt(isNaN(this.state.voteCount) ? displayData['voteCount'] : this.state.voteCount);
    const ownerName = this.context.drizzle.web3.utils.hexToUtf8(displayData['ownerName']);
    const range = _.range(0, optionCount);
    return (
      <div className="card mb-4 box-shadow text-left">
        <div className="card-header">
          <div className="container">
            <div className="row">
              <div className="pl-0 col-sm align-middle">
                <h5>{title}</h5>
              </div>
              <div>
                <span className="badge badge-success">{ownerName}</span>
                &nbsp;
                <span className="badge badge-primary">{voteCount} votes</span>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="row">
              <h6 className="card-subtitle mb-2 text-muted">{displayData['question']}</h6>
            </div>
          </div>
        </div>
        <ul className="list-group list-group-flush">
          { _.map(range, (val) => {
            let key = this.props.pollIndex + '_' + val;
            return (<PollOption key={key} time={this.state.time} blockNumber={this.state.blockNumber} pollIndex={this.props.pollIndex} optionIndex={val} totalVoteCount={voteCount} handler={this.handler} />);
          }) }
        </ul>
      </div>
    );
  }
}

Poll.contextTypes = {
  drizzle: PropTypes.object,
};

Poll.propTypes = {
  pollIndex: PropTypes.number,
  hideIndicator: PropTypes.bool,
  render: PropTypes.func
};

/*
 * Export connected component.
 */

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
  };
};

export default drizzleConnect(Poll, mapStateToProps);

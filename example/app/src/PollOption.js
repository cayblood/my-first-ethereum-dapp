import { drizzleConnect } from "@drizzle/react-plugin";
import React, { Component } from "react";
import PropTypes from "prop-types";

const updatePollOptionDetails = async state => {
  let options = {};
  const account = sessionStorage.getItem('account');
  if (account) {
    options.from = account;
  }

  // kludge: research how to pass the { from: _ } option with cacheCall()
  const result = await state.contract.methods.getPollOption(state.pollIndex, state.optionIndex).call(options);
  result.percentage = result.voteCount > 0 ? (result.voteCount / state.totalVoteCount * 100.0) : 0;
  return result;
};

class PollOption extends Component {
  constructor(props, context) {
    super(props);
    this.state = {
      totalVoteCount: props.totalVoteCount,
      percentage: 0,
      contract: context.drizzle.contracts['Polls'],
      pollIndex: props.pollIndex,
      optionIndex: props.optionIndex
    };
  }

  componentDidMount() {
    updatePollOptionDetails(this.state).then(data => this.setState(data));
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const newState = {totalVoteCount: this.props.totalVoteCount};
    if (prevProps.blockNumber !== this.props.blockNumber ||
        prevProps.time !== this.props.time ||
        prevProps.totalVoteCount !== this.props.totalVoteCount) {
      this.setState(newState);
      updatePollOptionDetails({...this.state, ...newState}).then(data => this.setState(data));
    }
  }

  render() {
    const { pollIndex, optionIndex } = this.state;
    return (
      <li className={'list-group-item poll-option ' + (this.state.voted ? 'voted' : '')} onClick={() => { this.props.handler(pollIndex, optionIndex); }}>
        <div className="container">
          <div className="row">
            <div className="pl-0 col-sm">
              {this.state.option} <div className="float-right">{this.state.voteCount} ({this.state.percentage.toFixed(0)} %)</div>
              <span className="poll-option-hidden">click to vote</span>
            </div>
          </div>
        </div>
      </li>
    );
  }
}

PollOption.contextTypes = {
  drizzle: PropTypes.object,
};

PollOption.propTypes = {
  totalVoteCount: PropTypes.number,
  pollIndex: PropTypes.number,
  optionIndex: PropTypes.number
};

/*
 * Export connected component.
 */

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
  };
};

export default drizzleConnect(PollOption, mapStateToProps);

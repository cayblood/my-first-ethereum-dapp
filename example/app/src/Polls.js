import {drizzleConnect} from "@drizzle/react-plugin";
import React, {Component} from "react";
import PropTypes from "prop-types";
import _ from 'lodash';
import Poll from "./Poll";

class Polls extends Component {
  constructor(props, context) {
    super(props);
    const contract = context.drizzle.contracts['Polls'];
    this.state = {
      dataKey: contract.methods['pollCount'].cacheCall()
    };
  }

  render() {
    const contract = this.props.contracts['Polls'];
    // Contract is not yet intialized.
    if (!contract.initialized) {
      return <span>Initializing...</span>;
    }

    // If the cache key we received earlier isn't in the store yet; the initial value is still being fetched.
    if (!(this.state.dataKey in contract['pollCount'])) {
      return <span>Fetching...</span>;
    }

    // // Show a loading spinner for future updates.
    // let pendingSpinner = contract.synced ? "" : " 🔄";
    //
    // // Optionally hide loading spinner (EX: ERC20 token symbol).
    // if (this.props.hideIndicator) {
    //   pendingSpinner = "";
    // }

    const count = contract['pollCount'][this.state.dataKey].value;
    let range = _.range(0, count);
    return (
      <div className="card-deck mb-3">
        { _.map(range, (val) => {
          let key = val;
          return (<Poll key={key} pollIndex={val} />);
        }) }
      </div>
    );
  }
}

Polls.contextTypes = {
  drizzle: PropTypes.object,
};

Polls.propTypes = {
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

export default drizzleConnect(Polls, mapStateToProps);

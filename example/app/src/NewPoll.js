import { drizzleConnect } from "@drizzle/react-plugin";
import React, { Component } from "react";
import _ from 'lodash';
import PropTypes from "prop-types";
import { PlusIcon } from 'react-open-iconic-svg';

class NewPoll extends Component {
  constructor(props, context) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addOption = this.addOption.bind(this);
    this.contracts = context.drizzle.contracts;
    this.utils = context.drizzle.web3.utils;
    this.state = {
      addedOption: false,
      pollOptions: [0]
    };
  }

  componentDidMount() {
    this.titleInput.focus();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.addedOption) {
      this.lastOptionInput.focus();
      this.setState((state) => {
        return {
          addedOption: false
        }
      });
    }
  }

  addOption() {
    this.setState((state) => {
      return {
        addedOption: true,
        pollOptions: state.pollOptions.concat([state.pollOptions.length])
      }
    });
  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  async handleSubmit(event) {
    event.preventDefault();
    const contract = this.contracts['Polls'];
    const createPoll = contract.methods['createPoll'];
    const addOption = contract.methods['addOption'];
    const title = this.utils.utf8ToHex(this.state.title);
    const question = this.state.question;
    const ownerName = this.utils.utf8ToHex(sessionStorage.getItem('name') || 'Jane Doe');
    let options = {
      gas: 600000,
      gasPrice: 40000000000
    };
    const account = sessionStorage.getItem('account');
    if (account) {
      options.from = account;
    }
    let result = await createPoll(title, question, ownerName).send(options);
    if (_.has(result.events, 'pollModified')) {
      let index = result.events.pollModified.returnValues._index;
      this.state.pollOptions.forEach((optionIndex) => {
        let val = this.state['option' + optionIndex];
        addOption(index, val).send(options);
      });
    }
    this.setState((state) => {
      return {
        title: '',
        question: '',
        pollOptions: [0]
      };
    });
    this.titleInput.value = '';
    this.questionInput.value = '';
    this.lastOptionInput.value = '';
    this.titleInput.focus();
  }

  render() {
    return (
        <div className="card cmb-4 box-shadow text-left">
          <form onSubmit={this.handleSubmit}>
            <div className="card-body">
              <div className="form-group form-row">
                <label className="col-sm-2 col-form-label right-aligned" htmlFor="title">Title</label>
                <div className="col-sm-10">
                  <input ref={(input) => { this.titleInput = input; }}
                         className="form-control"
                         type="text"
                         name="title"
                         onChange={this.handleInputChange} />
                </div>
              </div>
              <div className="form-group form-row">
                <label className="col-sm-2 col-form-label right-aligned"  htmlFor="question">Question</label>
                <div className="col-sm-10">
                  <input ref={(input) => { this.questionInput = input; }}
                         className="form-control"
                         type="text"
                         name="question"
                         onChange={this.handleInputChange} />
                </div>
              </div>
              {_.map(this.state.pollOptions, (index) => {
                if (index === this.state.pollOptions.length - 1) {
                  return (
                      <div key={index} className="form-group form-row">
                        <label className="col-sm-2 col-form-label right-aligned" htmlFor={'option' + index}>{'Option ' + (index + 1)}</label>
                        <div className="col-sm-8">
                          <input ref={(input) => { this.lastOptionInput = input; this['optionInput' + index] = input; }}
                                 className="form-control"
                                 type="text"
                                 name={'option' + index}
                                 id={'option' + index}
                                 onChange={this.handleInputChange} />
                        </div>
                        <div className="col-sm-2">
                          <button className="form-control" type="button" onClick={this.addOption}><PlusIcon /></button>
                        </div>
                      </div>
                  );
                } else {
                  return (
                      <div key={index} className="form-group form-row">
                        <label className="col-sm-2 col-form-label right-aligned" htmlFor={'option' + index}>{'Option ' + (index + 1)}</label>
                        <div className="col-sm-10">
                          <input className="form-control" type="text" name={'option' + index} id={'option' + index} onChange={this.handleInputChange} />
                        </div>
                      </div>
                  );
                }
              })}
              <div className="form-group form-row">
                <div className="col-sm-2" />
                <div className="col-sm-4">
                  <button className="form-control" type="submit">Create poll</button>
                </div>
              </div>
            </div>
          </form>
        </div>
    );
  }
}

NewPoll.contextTypes = {
  drizzle: PropTypes.object
};

NewPoll.propTypes = {
};

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
  };
};

export default drizzleConnect(NewPoll, mapStateToProps);

import React, { useState, useEffect } from 'react';
import { PlusCircleIcon } from "@heroicons/react/solid";
import { useNotifications } from "@usedapp/core";
import { useCreatePoll } from './hooks';

function NewPoll() {
  const [poll, setPoll] = useState({
    title: "",
    question: "",
    options: [""]
  });
  const addOption = () => {
    setPoll({...poll, options: [...poll.options, ""]})
  };
  const { createPoll, createPollStatus, addOptionStatus } = useCreatePoll();
  const { notifications } = useNotifications();
  const submit = (e) => {
    e.preventDefault();
    const name = sessionStorage.getItem('name') || 'Jane Doe';
    return createPoll(poll.title, poll.question, name, poll.options);
  };

  useEffect(() => {
    if (notifications.filter(
      (notification) =>
        notification.type === "transactionSucceed" &&
        notification.transactionName === 'Create poll'
      ).length > 0) {
      poll.title = '';
      poll.question = '';
      poll.options = [''];
    }
  }, [notifications, poll]);

  const isMining = createPollStatus.status === 'Mining' || addOptionStatus.status === 'Mining';

  return (
    <div className="py-8 col-span-1 flex shadow-sm rounded-md">
      <form className="" onSubmit={submit}>
        <h3 className="text-lg leading-6 font-medium text-gray-900">New poll</h3>
        <div className="pt-5">
          <div className="sm:col-span-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                value={poll.title}
                onChange={e => setPoll({ ...poll, title: e.target.value })}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md w-max"
              />
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="sm:col-span-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Question
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="question"
                value={poll.question}
                onChange={e => setPoll({ ...poll, question: e.target.value })}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md w-max"
              />
            </div>
          </div>
        </div>

        {poll.options.map((value, index) => {
          if (index === poll.options.length - 1) {
            return (
              <div className="pt-5" key={'option' + index}>
                <div className="sm:col-span-6 w-full">
                  <label htmlFor="{'option' + index}"
                         className="block text-sm font-medium text-gray-700">{'Option ' + (index + 1)}</label>
                  <div className="mt-1 flex">
                    <input className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md w-11/12"
                           type="text"
                           name={'option' + index}
                           value={poll.options[index]}
                           onChange={e => setPoll({ ...poll, options: [...poll.options.slice(0, index), e.target.value, ...poll.options.slice(index + 1)] })}/>
                    <button className="block sm:text-sm w-8" type="button" onClick={addOption}><PlusCircleIcon/></button>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div className="pt-5" key={'option' + index}>
              <div className="sm:col-span-6 w-full">
                <label htmlFor="{'option' + index}"
                       className="block text-sm font-medium text-gray-700">{'Option ' + (index + 1)}</label>
                <div className="mt-1">
                  <input className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md w-max"
                         type="text"
                         name={'option' + index}
                         value={poll.options[index]}
                         onChange={e => setPoll({ ...poll, options: poll.options.splice(index, 0, e.target.value) })}/>
                </div>
              </div>
            </div>
          );
        })}

        <div className="pt-5">
          <div className="flex justify-end">
            {isMining &&
              <div className="flex items-center justify-center space-x-2 animate-pulse">
                <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
              </div>
            }
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isMining}
            >
              Add
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default NewPoll;

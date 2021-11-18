import React from "react";
import { usePolls } from './hooks';

function Polls() {
  const { polls } = usePolls();
  const nameToInitials = (name) => {
    const rgx = new RegExp(/(\p{L}{1})\p{L}+/, 'gu');
    let initials = [...name.matchAll(rgx)] || [];
    initials = (
      (initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')
    ).toUpperCase();
    return initials;
  };

  return (
    <ul className="mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.isArray(polls) && polls.map(poll => (
        <li key={poll.id} className="col-span-1 flex shadow-sm rounded-md">
          <div className="bg-pink-600 flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md">
            {nameToInitials(poll.ownerName)}
          </div>
          <div className="flex-1 px-4 py-2 text-sm truncate bg-white rounded-r-md truncate">
            { /* eslint-disable */ }
            <a href="#" className="text-gray-900 font-medium hover:text-gray-600">{poll.title}</a>
            { /* eslint-enable */ }
            <p>{poll.question}</p>
            {Array.isArray(poll.options) && poll.options.map(opt => (
              <div className="relative flex items-start" key={`${poll.id}_${opt.id}`}>
                <div className="flex items-center h-5">
                  <input id="comments" aria-describedby="comments-description" name="comments" type="checkbox"
                         className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                </div>
                <div className="ml-3 text-sm">
                  <span id="comments-description" className="text-gray-500">{opt.text}</span>
                </div>
              </div>
            ))}
            <p className="text-gray-500">{poll.voteCount} responses</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
export default Polls;
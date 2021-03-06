import {Menu, Transition } from "@headlessui/react";
import {Fragment} from "react";
import {useEthers} from "@usedapp/core";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AccountProfile() {
  const { deactivate, error } = useEthers();
  if (error) console.log(error);
  const user = {
    name: 'Tom Cook',
    email: 'tom@example.com',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  }
  return (
    <div className="hidden sm:ml-6 sm:flex sm:items-center">
      {/* Profile dropdown */}
      <Menu as="div" className="ml-3 relative">
        <div>
          <Menu.Button
            className="bg-white flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <span className="sr-only">Open user menu</span>
            <img className="h-8 w-8 rounded-full" src={user.imageUrl} alt=""/>
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div>
            <Menu.Items
              className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({active}) => (
                  // eslint-disable-next-line
                  <a href="#" className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                     onClick={deactivate}
                  >
                    Disconnect
                  </a>
                )}
              </Menu.Item>
            </Menu.Items>
          </div>
        </Transition>
      </Menu>
    </div>
  );
}
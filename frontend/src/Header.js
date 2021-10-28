import {Disclosure} from "@headlessui/react";
import {Menu} from "@headlessui/react";
import {Logo} from "./Logo";
import AccountProfile from "./AccountProfile";
import {useEthers} from '@usedapp/core';
import React from "react";

export default function Header() {
  const { activateBrowserWallet, account, error } = useEthers();
  if (error) console.log(error);
  return (
    <Disclosure as="nav" className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Logo/>
          {!account &&
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Menu as="div" className="ml-3 relative">
              <div>
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={activateBrowserWallet}
                >
                  Connect
                </button>
              </div>
            </Menu>
          </div>
          }
          {account && <AccountProfile/>}
        </div>
      </div>
    </Disclosure>
  );
}

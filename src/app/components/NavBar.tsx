import React from "react";
import { ModeToggle } from "./ModeToggle";
import AuthButton from "./AuthButton";

const NavBar = () => {
  return (
    <nav className='border-b h-16 z-[49] w-full fixed bg-background'>
      <div className='max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-3'>
        <a href='#' className='flex items-center space-x-3 rtl:space-x-reverse'>
          {/* <img
              src='#'
              className='h-8'
              alt='Sync Space Logo'
            /> */}
          <span className='self-center text-2xl font-semibold whitespace-nowrap text--foreground'>
            Sync Space
          </span>
        </a>
        <div className='block w-auto'>
          <ul className='font-medium p-0 flex rounded-lg flex-row gap-4 rtl:space-x-reverse items-center justify-center'>
            <li className='flex justify-center items-center'>
              <AuthButton />
            </li>
            <li className='flex justify-center items-center'>
              <ModeToggle />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

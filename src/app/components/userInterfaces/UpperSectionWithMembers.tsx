import { faLink, faUserAstronaut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const UpperSectionWithMembers = () => {
  return (
    <>
      <div className='relative'>
        <div className='w-48 h-48 bg-primary/10 rounded-full flex items-center justify-center z-10'>
          <FontAwesomeIcon
            icon={faUserAstronaut}
            className='text-6xl text-primary'
          />{" "}
        </div>
        <div className='absolute -bottom-2 -right-2 w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center z-20'>
          <FontAwesomeIcon icon={faLink} className='text-2xl text-secondary' />
        </div>
      </div>

      <div className='space-y-4'>
        <h1 className='text-4xl font-bold dark:text-base-content text-neutral-600'>
          Connect with Anyone, Anywhere
        </h1>
        <p className='text-xl dark:text-base-content/70 text-neutral-600/70'>
          Share this link to invite more people!
        </p>
      </div>
    </>
  );
};

export default UpperSectionWithMembers;

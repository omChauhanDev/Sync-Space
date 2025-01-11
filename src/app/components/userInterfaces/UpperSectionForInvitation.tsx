import { faLink, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const UpperSectionForInvitation = () => {
  return (
    <>
      <div className='relative'>
        <div className='w-48 h-48 bg-primary/10 rounded-full flex items-center justify-center z-10'>
          <FontAwesomeIcon icon={faUsers} className='text-6xl text-primary' />{" "}
        </div>
        <div className='absolute -bottom-2 -right-2 w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center z-20'>
          <FontAwesomeIcon icon={faLink} className='text-2xl text-secondary' />
        </div>
      </div>

      <div className='space-y-4'>
        <p className='text-lg sm:text-xl text-base-content/70'>
          Share this link to get connected!
        </p>
      </div>
    </>
  );
};

export default UpperSectionForInvitation;

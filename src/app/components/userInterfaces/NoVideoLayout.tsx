import React from "react";
import InvitePeople from "../InvitePeople";
import UpperSectionOneMember from "./UpperSectionOneMember";
import UpperSectionWithMembers from "./UpperSectionWithMembers";

const NoVideoLayout = ({ noOneExists }: { noOneExists: boolean }) => {
  const upperSection = noOneExists ? (
    <UpperSectionOneMember />
  ) : (
    <UpperSectionWithMembers />
  );
  return (
    <div className='absolute top-0 right-0 hero h-full w-full min-h-screen flex justify-center items-center sm:pb-24 z-0 pb-16'>
      <div className='hero-content text-center'>
        <div className='max-w-2xl'>
          <div className='flex flex-col items-center gap-8'>
            {upperSection}
            <InvitePeople />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoVideoLayout;

import {
  faCopy,
  faEnvelope,
  faHashtag,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import toast from "react-hot-toast";
import { SendInvite } from "./modals/SendInvite";

const InvitePeople = ({
  setIsOpen = undefined,
}: {
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const spaceLink = window.location.href;
  const spaceId = spaceLink.split("/space/")[1];
  const copyToClipboard = async (type: "spaceId" | "spaceLink") => {
    try {
      if (setIsOpen) {
        setIsOpen(false);
      }
      if (type === "spaceId") {
        await navigator.clipboard.writeText(spaceId);
        toast.success(
          <div className='flex items-center gap-2 text-md font-bold'>
            <span>Space Id Copied</span>
          </div>
        );
      } else if (type === "spaceLink") {
        await navigator.clipboard.writeText(spaceLink);
        toast.success(
          <div className='flex items-center gap-2 text-md font-bold'>
            <span>Invite Link Copied</span>
          </div>
        );
      }
    } catch (error) {
      console.error("Error copying space link to clipboard:", error);
    }
  };
  return (
    <div className='flex flex-col gap-8 items-center'>
      <div className='space-id-container'>
        <div className='join'>
          <div className='bg-[#dcdfe7] dark:bg-[#191e24] join-item px-4 flex items-center font-mono justify-center'>
            <FontAwesomeIcon icon={faHashtag} className='mr-2' />
          </div>

          <input
            className='bg-[#dcdfe7] dark:bg-[#1d232a] input input-bordered border-slate-500 join-item font-mono'
            readOnly
            value={spaceId}
          />
          <button
            className='btn join-item btn-info'
            onClick={() => copyToClipboard("spaceId")}
          >
            <FontAwesomeIcon icon={faCopy} />
          </button>
        </div>
      </div>

      <div className='flex flex-wrap justify-center gap-4'>
        <button
          className='btn btn-outline btn-info'
          onClick={() => copyToClipboard("spaceLink")}
        >
          <FontAwesomeIcon icon={faCopy} className='mr-2' />
          Copy Invite Link
        </button>
        <SendInvite setIsInviteOpen={setIsOpen} />
      </div>
    </div>
  );
};

export default InvitePeople;

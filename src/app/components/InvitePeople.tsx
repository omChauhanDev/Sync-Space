import {
  faCopy,
  faEnvelope,
  faHashtag,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import toast from "react-hot-toast";

const InvitePeople = () => {
  const spaceLink = window.location.href;
  const spaceId = spaceLink.split("/space/")[1];
  const copyToClipboard = async (type: "spaceId" | "spaceLink") => {
    try {
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
          <div className='bg-base-200 join-item px-4 flex items-center font-mono'>
            <FontAwesomeIcon icon={faHashtag} className='mr-2' />
          </div>

          <input
            className='input input-bordered join-item font-mono'
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
        <button className='btn btn-outline btn-secondary'>
          <FontAwesomeIcon icon={faEnvelope} className='mr-2' />
          Share via Email
        </button>
      </div>
    </div>
  );
};

export default InvitePeople;

{
  /* <div className='min-h-screen bg-base-200 flex items-center justify-center p-4'>
<div className='card w-full max-w-2xl bg-base-100 shadow-xl'>
  <div className='card-body items-center text-center space-y-6'>
    <div className='avatar placeholder'>
      <div className='bg-neutral text-neutral-content rounded-full w-24'>
        <span className='text-3xl'>
          <i className='fas fa-video-slash'></i>
        </span>
      </div>
    </div>

    <h2 className='card-title text-3xl font-bold'>
      Camera is turned off
    </h2>

    <p className='text-base-content/80 max-w-md'>
      Your camera is currently disabled. Enable it to join the video
      meeting or continue with audio only.
    </p>

    <div className='divider'>Meeting Details</div>

    <div className='join w-full max-w-md'>
      <input
        className='join-item input input-bordered flex-1'
        value='meet.google.com/abc-defg-hij'
        readOnly
      />
      <button
        className='join-item btn btn-primary'
        onClick={() => copyToClipboard(spaceLink)}
      >
        <i className='fas fa-copy mr-2'></i>
        Copy Link
      </button>
    </div>

    <div className='flex flex-wrap gap-4 justify-center mt-6'>
      <button className='btn btn-primary'>
        <i className='fas fa-video mr-2'></i>
        Enable Camera
      </button>
      <button className='btn btn-outline'>
        <i className='fas fa-phone-alt mr-2'></i>
        Join with Audio
      </button>
    </div>

    <div className='alert alert-info shadow-lg mt-4'>
      <i className='fas fa-info-circle'></i>
      <span>
        Having trouble? Check your camera settings or device
        permissions.
      </span>
    </div>
  </div>
</div>
</div> */
}

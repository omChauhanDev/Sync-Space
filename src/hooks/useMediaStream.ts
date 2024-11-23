import { useEffect, useRef, useState } from "react";

const useMediaStream = () => {
  const [state, setState] = useState<MediaStream | undefined>(undefined);
  const isStreamSet = useRef(false);

  useEffect(() => {
    if (isStreamSet.current) return;
    isStreamSet.current = true;
    (async function initStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log("Requesting your stream from browser");
        setState(stream);
      } catch (e) {
        console.log("Error while requesting your stream", e);
      }
    })();
  }, []);

  return {
    stream: state,
  };
};

export default useMediaStream;

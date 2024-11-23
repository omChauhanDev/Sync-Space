// const { useState, useEffect, useRef } = require("react");

// const usePeer = () => {
//   const [peer, setPeer] = useState(null);
//   const [myPeerId, setMyPeerId] = useState("");
//   const isPeerSet = useRef(null);

//   // Inside this useEffect peerjs is imported on client side.
//   useEffect(() => {
//     (async function initPeer(params) {
//       const myPeer = new (await import("peerjs")).default();
//       setPeer(myPeer);
//       myPeer.on("open", (id) => {
//         console.log("My peer ID is: " + id);
//         setMyPeerId(id);
//       });
//     })();
//   }, []);
// };

// export default usePeer;

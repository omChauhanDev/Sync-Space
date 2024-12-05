// import React, { useMemo } from "react";

// const VideoGrid = ({ allVideoStreams }: { allVideoStreams: any[] }) => {
//   const gridLayout = useMemo(() => {
//     const streamCount = allVideoStreams.length;

//     // Special cases for small numbers of streams
//     const layoutMap: { [key: number]: { rows: number; cols: number } } = {
//       1: { rows: 1, cols: 1 },
//       2: { rows: 1, cols: 1 },
//       3: { rows: 1, cols: 3 },
//       4: { rows: 2, cols: 2 },
//     };

//     // If the stream count is in our predefined map, use that
//     if (layoutMap[streamCount]) {
//       return layoutMap[streamCount];
//     }

//     // For larger numbers of streams, calculate dynamically
//     const calculateOptimalLayout = () => {
//       // Get current window dimensions
//       const windowWidth = window.innerWidth;
//       const windowHeight = window.innerHeight;
//       const isLandscape = windowWidth > windowHeight;

//       // Function to calculate grid dimensions that minimize wasted space
//       const findBestGridDimensions = () => {
//         let bestLayout = { rows: 1, cols: streamCount };
//         let minWastedSpace = Infinity;

//         // Try different row/column combinations
//         for (let rows = 1; rows <= streamCount; rows++) {
//           const cols = Math.ceil(streamCount / rows);

//           // Calculate how these dimensions would look on screen
//           const cellWidth = windowWidth / cols;
//           const cellHeight = windowHeight / rows;

//           // Calculate aspect ratio of cells
//           const cellAspectRatio = cellWidth / cellHeight;

//           // Prefer aspect ratios close to 16:9
//           const idealAspectRatio = 16 / 9;
//           const aspectRatioDiff = Math.abs(cellAspectRatio - idealAspectRatio);

//           // Calculate wasted space
//           const usedCells = rows * cols;
//           const wastedSpace = usedCells - streamCount;

//           // Prefer layouts with less wasted space and aspect ratios closer to 16:9
//           const layoutScore = wastedSpace + aspectRatioDiff;

//           if (layoutScore < minWastedSpace) {
//             minWastedSpace = layoutScore;
//             bestLayout = { rows, cols };
//           }
//         }

//         return bestLayout;
//       };

//       // Determine the best layout based on screen orientation
//       const { rows, cols } = findBestGridDimensions();
//       return { rows, cols };
//     };

//     return calculateOptimalLayout();
//   }, [allVideoStreams]);

//   return (
//     <div
//       className={`
//         grid
//         w-full
//         h-full
//         gap-2
//         p-2
//       `}
//       style={{
//         gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`,
//         gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
//       }}
//     >
//       {allVideoStreams.map((stream, index) => (
//         <div
//           key={index}
//           className='
//             w-full
//             h-full
//             flex
//             items-center
//             justify-center
//             overflow-hidden
//           '
//         >
//           {/* Placeholder for your video player component */}
//           <div className='w-full h-full bg-gray-200'>
//             {/* Your video player will go here */}

//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default VideoGrid;

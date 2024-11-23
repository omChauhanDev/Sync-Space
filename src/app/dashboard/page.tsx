import React from "react";
import CreateSpace from "./components/buttons/CreateSpace";
import JoinSpace from "./components/buttons/JoinSpace";

const Dashboard = () => {
  return (
    <div className='min-h-screen h-full flex flex-col items-center justify-center gap-4'>
      <h1 className='text-2xl'>Welcome to dashboard</h1>
      <div className='flex flex-col items-center justify-center gap-4'>
        <div className='flex flex-col items-center justify-center'>
          <CreateSpace />
        </div>
        <JoinSpace />
      </div>
    </div>
  );
};

export default Dashboard;

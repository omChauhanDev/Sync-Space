"use client";
import { useSession } from "next-auth/react";

const Dashboard = () => {
  // Credentials received from Google Auth
  const { data: session } = useSession();
  console.log("session", session);
  return (
    <div className='min-h-screen h-full flex flex-col items-center justify-center gap-4'>
      <h1 className='text-2xl'>Welcome to dashboard</h1>
    </div>
  );
};

export default Dashboard;

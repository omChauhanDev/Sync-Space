import BgPattern from "./components/BgPattern";
import Image from "next/image";
import rightPattern from "../../public/lp_right_section.png";
import NavBar from "./components/NavBar";
import CreateSpace from "./components/buttons/CreateSpace";
import JoinSpace from "./components/buttons/JoinSpace";

export default function Home() {
  return (
    <>
      <NavBar />
      <div className='min-h-screen h-full flex items-center justify-center'>
        <BgPattern />
        <section className='grid h-full px-20 flex-1 grid-cols-8 w-[90%] items-center justify-center gap-8 mx-auto'>
          <div className='pl-16 h-full flex flex-col items-center justify-center col-span-3 gap-12'>
            <h1 className='text-4xl bg-background'>
              Connect with Anyone, Anywhere
            </h1>
            <div className='flex flex-col items-center justify-center gap-4 w-full'>
              <div className='flex flex-col items-center justify-center w-full'>
                <CreateSpace />
              </div>
              <JoinSpace />
            </div>
          </div>
          <div className='h-full col-span-5'>
            <Image
              alt='people in a video conference'
              width={1000}
              height={1000}
              src={rightPattern}
              // className='bg-background'
              // sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            />
          </div>
        </section>
      </div>
    </>
  );
}

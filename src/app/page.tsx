import BgPattern from "./components/BgPattern";
import Image from "next/image";
import rightPattern from "../../public/lp_right_section.png";

export default function Home() {
  return (
    <div className='min-h-screen h-full flex items-center justify-center'>
      <BgPattern />
      <section className='grid h-full px-20 flex-1 grid-cols-8 w-[90%] items-center justify-center gap-8 mx-auto'>
        <div className='pl-16 h-full flex items-center justify-center col-span-3'>
          <h1 className='text-4xl'>Connect with Anyone, Anywhere</h1>
        </div>
        <div className='h-full col-span-5'>
          <Image
            alt='people in a video conference'
            width={1000}
            height={1000}
            src={rightPattern}
            // sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
        </div>
      </section>
    </div>
  );
}

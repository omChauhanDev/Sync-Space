import Image from "next/image";
import illustration from "../../../public/BgOnlyPattern.png";
export default function BgPattern() {
  console.log("BgPattern render");
  return (
    <Image
      alt='Pattern'
      src={illustration}
      placeholder='blur'
      quality={100}
      className='h-full w-full'
      fill
      sizes='100vw'
      style={{
        objectFit: "cover",
        // top: 60,
        zIndex: 1,
      }}
    />
  );
}

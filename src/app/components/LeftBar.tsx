import React, { useMemo } from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

type UserData = {
  name: string;
  email: string;
  image: string;
  isAudioOn: boolean;
  isVideoOn: boolean;
};

// const predefinedColors = ["bg-[#EDC79B]"];
const predefinedColors = [
  "bg-[#0D9488]", // Teal
  "bg-[#F59E0B]", // Amber
  "bg-[#7C3AED]", // Violet
  "bg-[#0284C7]", // Sky Blue
  "bg-[#DB2777]", // Pink
  "bg-[#65A30D]", // Lime
  "bg-[#BE123C]", // Rose Red
  "bg-[#334155]", // Slate Gray
  "bg-[#0BC5EA]", // Cyan
  "bg-[#FACC15]", // Golden Yellow
  "bg-[#4ADE80]", // Soft Green
  "bg-[#EA580C]", // Deep Orange
];

const LeftBar = ({
  noOfMembers,
  allMembersRef,
}: {
  noOfMembers: number;
  allMembersRef: React.MutableRefObject<Map<string, UserData>>;
}) => {
  const colorMap = useMemo(() => {
    const map = new Map<string, string>();
    Array.from(allMembersRef.current.entries()).forEach(([email], index) => {
      map.set(email, predefinedColors[index % predefinedColors.length]);
    });
    return map;
  }, [allMembersRef.current.size]);

  const lettersOfName = (name: string) => {
    const nameParts = name?.split(" ");
    if (nameParts?.length === 2) {
      return nameParts[0][0] + nameParts[1][0];
    } else if (nameParts?.length === 1) {
      return nameParts[0].slice(0, 2);
    }
    return "";
  };

  const myItems = Array.from(allMembersRef.current.entries()).map(
    ([email, member]) => ({
      title: member.name,
      icon: (
        <Avatar
          className={`hover:cursor-pointer h-full w-full rounded-full flex items-center justify-center text-white dark:text-black ${colorMap.get(
            email
          )}`}
        >
          <AvatarImage
            src={member.image || undefined}
            alt='Avatar'
            className={`h-full w-full rounded-full ${
              member.isAudioOn ? "ring-2 ring-white" : ""
            }`}
          />
          <AvatarFallback className='flex items-center justify-center font-medium text-2xl'>
            <span>{lettersOfName(member.name)}</span>
          </AvatarFallback>
        </Avatar>
      ),
      isAudioOn: member.isAudioOn,
      href: `#`,
    })
  );

  return (
    <div className='absolute top-6 left-4 md:top-8 md:left-6 lg:left-8 z-10'>
      <div className='relative w-12 h-12 bg-background rounded-full flex items-center justify-center'>
        <FontAwesomeIcon icon={faUsers} className='text-3xl text-white' />
        <div className='absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-3 -end-3 dark:border-gray-900'>
          {noOfMembers}
        </div>
      </div>

      <div className='flex items-center justify-center h-[35rem] w-full'>
        <FloatingDock
          mobileClassName='translate-y-20'
          items={myItems}
          desktopClassName='max-h-[40rem] scroll-py-2 overflow-y-auto no-scrollbar'
        />
      </div>
    </div>
  );
};

export default LeftBar;

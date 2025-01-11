"use client";

import { useEffect, useState } from "react";

const DateAndTime = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };
  const getFormattedDate = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "June",
      "July",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];

    const day = days[currentDateTime.getDay()];
    const date = currentDateTime.getDate();
    const month = months[currentDateTime.getMonth()];

    return `${day}, ${date}${getOrdinalSuffix(date)} ${month}`;
  };

  const getFormattedTime = () => {
    const hours = currentDateTime.getHours();
    const minutes = currentDateTime.getMinutes();

    const formattedHours = hours % 12 || 12;
    const ampm = hours >= 12 ? "pm" : "am";

    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };
  return (
    <div className='sm:flex ml-10 lg:font-medium lg:text-md hidden'>
      <h3 className=''>{getFormattedDate()}</h3>
      <p className='px-2'>|</p>
      <h3 className=''>{getFormattedTime()}</h3>
    </div>
  );
};

export default DateAndTime;

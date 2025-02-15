import React, { useState, useEffect } from "react";
import Legend from "../../../components/staff/mcq/Legend";

export default function SectionBasedHeader({ contestId, totalDuration, sectionRemainingTime }) {
  const [totalTimeLeft, setTotalTimeLeft] = useState(() => {
    const storedTotalTime = sessionStorage.getItem(`totalTimeLeft_${contestId}`);
    return storedTotalTime ? JSON.parse(storedTotalTime) : totalDuration;
  });

  const [sectionTimeLeft, setSectionTimeLeft] = useState(() => {
    const storedSectionTime = sessionStorage.getItem(`sectionTimeLeft_${contestId}`);
    return storedSectionTime ? JSON.parse(storedSectionTime) : sectionRemainingTime;
  });

  useEffect(() => {
    const totalTimer = setInterval(() => {
      setTotalTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(totalTimer);
          return 0;
        }
        sessionStorage.setItem(`totalTimeLeft_${contestId}`, JSON.stringify(prevTime - 1));
        return prevTime - 1;
      });
    }, 1000);

    const sectionTimer = setInterval(() => {
      setSectionTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(sectionTimer);
          return 0;
        }
        sessionStorage.setItem(`sectionTimeLeft_${contestId}`, JSON.stringify(prevTime - 1));
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(totalTimer);
      clearInterval(sectionTimer);
    };
  }, [totalDuration, sectionRemainingTime, contestId]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-between items-center mb-7 bg-white border-b border-gray-200 p-4 ">
      <div className="flex items-center gap-2">
        <h1 className="text-[#111933] text-2xl ml-8 font-bold">MCQ ASSESSMENT</h1>
      </div>
      <div className="flex items-center -mr-96 ml-52 mt-4 gap-2 ">
        <span className="w-8 h-8 text-bold text-4xl pr-4  flex items-center justify-center">⏰</span>
        <div>
          <div className="text-[#111933] text-xl font-bold">
            {formatTime(totalTimeLeft)}
          </div>
          <div className="text-[#111933] text-xl">Total Time Left</div>
        </div>
      </div>
      <div className="items-end">
        <div className="mt-4 mr-16">
            <Legend/>
        </div>
      </div>
    </div>
  );
}
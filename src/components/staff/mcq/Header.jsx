import React, { useState, useEffect } from "react";

export default function Header({ duration }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [duration]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-between items-center mb-7">
      <div className="flex items-center gap-2">
        <h1 className="text-[#00296b] text-2xl ml-8 font-bold">MCQ ASSESSMENT</h1>
      </div>
      <div className="flex items-center mr-7 mt-4 gap-2">
        <span className="w-8 h-8 text-bold text-4xl pr-4 flex items-center justify-center">⏰</span>
        <div>
          <div className="text-[#00296b] text-xl font-bold">
            {formatTime(timeLeft)}
          </div>
          <div className="text-[#00296b] text-xl">Time Left</div>
        </div>
      </div>
    </div>
  );
}
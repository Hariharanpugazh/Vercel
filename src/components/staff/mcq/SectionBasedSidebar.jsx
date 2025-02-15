import React, { useEffect, useState } from "react";
import SectionBasedQuestionNumbers from "./SectionBasedQuestionNumbers";


export default function SectionBasedSidebar({
  sections,
  currentSectionIndex,
  currentQuestionIndex,
  selectedAnswers,
  reviewStatus,
  onQuestionClick,
  contestId,
}) {
  const [sectionTimes, setSectionTimes] = useState(() => {
    const storedTimes = sessionStorage.getItem(`sectionTimes_${contestId}`);
    return storedTimes ? JSON.parse(storedTimes) : sections.map((section) => ({
      remainingTime: section.duration.hours * 3600 + section.duration.minutes * 60,
      isActive: false,
    }));
  });

  const [openSections, setOpenSections] = useState(new Set([currentSectionIndex]));

  useEffect(() => {
    sessionStorage.setItem(`sectionTimes_${contestId}`, JSON.stringify(sectionTimes));
  }, [sectionTimes, contestId]);

  useEffect(() => {
    let intervalId;

    const updateTimer = () => {
      setSectionTimes((prevTimes) =>
        prevTimes.map((time, index) => {
          if (index === currentSectionIndex && time.isActive && time.remainingTime > 0) {
            return { ...time, remainingTime: time.remainingTime - 1 };
          }
          return time;
        })
      );
    };

    intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [currentSectionIndex, contestId]);

  useEffect(() => {
    setSectionTimes((prevTimes) =>
      prevTimes.map((time, index) => ({
        ...time,
        isActive: index === currentSectionIndex,
      }))
    );
  }, [currentSectionIndex]);

  useEffect(() => {
    setOpenSections((prevOpenSections) => {
      const newOpenSections = new Set(prevOpenSections);
      newOpenSections.add(currentSectionIndex);
      return newOpenSections;
    });
  }, [currentSectionIndex]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSection = (sectionIndex) => {
    setOpenSections((prevOpenSections) => {
      const newOpenSections = new Set(prevOpenSections);
      if (newOpenSections.has(sectionIndex)) {
        newOpenSections.delete(sectionIndex);
      } else {
        newOpenSections.forEach((index) => newOpenSections.delete(index));
        newOpenSections.add(sectionIndex);
      }
      return newOpenSections;
    });
  };

  const handleSectionClick = (sectionIndex) => {
    onQuestionClick(sectionIndex, 0); // Navigate to the first question of the section
    toggleSection(sectionIndex);
  };

  const getQuestionStatus = (sectionIndex, questionIndex) => {
    if (reviewStatus[sectionIndex]?.[questionIndex]) return "review";
    if (sectionIndex === currentSectionIndex && questionIndex === currentQuestionIndex) return "current";
    if (selectedAnswers[sectionIndex]?.[questionIndex] !== undefined) return "answered";
    return "notAnswered";
  };

  return (
    <div className="w-full p-4 space-y-6">
      {sections.map((section, sectionIndex) => {
        const remainingTime = sectionTimes[sectionIndex].remainingTime;
        const formattedTime = formatTime(remainingTime);

        return (
          <div key={sectionIndex} className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-2">
              <button
                className="flex items-center text-[#111933] font-medium hover:underline"
                onClick={() => handleSectionClick(sectionIndex)}
              >
                <span>{section.sectionName}</span>
                <svg
                  className={`w-4 h-4 ml-2 ${openSections.has(sectionIndex) ? "transform rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              <span className="text-gray-600">{formattedTime}</span>
            </div>
            {openSections.has(sectionIndex) && (
              <SectionBasedQuestionNumbers
                questionNumbers={section.questions.map((_, i) => i + 1)}
                questionStatuses={section.questions.map((_, i) => getQuestionStatus(sectionIndex, i))}
                onQuestionClick={(index) => onQuestionClick(sectionIndex, index)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

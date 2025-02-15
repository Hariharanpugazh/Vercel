import React, { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Sidebar Component
function Sidebar({
  totalQuestions,
  currentIndex,
  selectedAnswers,
  reviewStatus,
  onQuestionClick,
  sections,
}) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [isSectionBased, setIsSectionBased] = useState(false);
  const [sectionTimers, setSectionTimers] = useState({});
  const [activeSectionIndex, setActiveSectionIndex] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    const isSectionTest = sections && sections.length > 0;
    setIsSectionBased(isSectionTest);

    // Default to first section expanded if sections exist
    if (isSectionTest) {
      setExpandedSection(0);
      setActiveSectionIndex(0);
    }

    // Initialize each section's timer (in seconds)
    const initialTimers = {};
    sections?.forEach((section, index) => {
      // Convert duration from minutes to seconds
      initialTimers[index] = (section.duration || 10) * 60; // Default: 10 minutes = 600s
    });
    setSectionTimers(initialTimers);
  }, [sections]);

  useEffect(() => {
    // Clear existing interval
    if (timerRef.current) clearInterval(timerRef.current);

    // If we have a valid active section, run the countdown for that section
    if (activeSectionIndex !== null) {
      timerRef.current = setInterval(() => {
        setSectionTimers((prevTimers) => {
          const updatedTimers = { ...prevTimers };
          if (updatedTimers[activeSectionIndex] > 0) {
            updatedTimers[activeSectionIndex] -= 1;
          }
          return updatedTimers;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [activeSectionIndex]);

  const getGlobalIndex = (sectionIndex, questionIndex) => {
    return (
      questionIndex +
      sections.slice(0, sectionIndex).reduce((total, sec) => total + sec.questions.length, 0)
    );
  };

  const toggleSection = (newSectionIndex) => {
    // If clicking the same section, just collapse/expand without additional checks
    if (newSectionIndex === activeSectionIndex) {
      setExpandedSection((prev) => (prev === newSectionIndex ? null : newSectionIndex));
      return;
    }

    // If user is switching away from the currently active section,
    // check if all questions are answered or its time is up
    if (activeSectionIndex !== null && sectionTimers[activeSectionIndex] > 0) {
      // There's still time in the active section. Verify all questions are answered.
      const currentSectionQuestions = sections[activeSectionIndex]?.questions || [];
      const allQuestionsAnswered = currentSectionQuestions.every((_, questionIndex) => {
        const globalIndex = getGlobalIndex(activeSectionIndex, questionIndex);
        return !!selectedAnswers[globalIndex]; // Must be answered
      });

      if (!allQuestionsAnswered) {
        toast.error("Please answer all questions in the current section or wait for time to run out before moving to another section.");
        return;
      }
    }

    // Everything is fine; proceed to switch sections
    setExpandedSection((prevIndex) => (prevIndex === newSectionIndex ? null : newSectionIndex));
    setActiveSectionIndex((prevIndex) => (prevIndex === newSectionIndex ? null : newSectionIndex));
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-[320px] bg-white p-6">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#1e3a8a] font-bold text-2xl">Sections</h3>
        </div>

        {isSectionBased && sections.length > 0 ? (
          <div className="space-y-6">
            {sections.map((section, sectionIndex) => {
              const isSectionActive = sectionIndex === activeSectionIndex;
              const isSectionExpanded = expandedSection === sectionIndex;
              const timeLeftForSection = sectionTimers[sectionIndex] || 0;

              return (
                <div key={sectionIndex} className="space-y-3">
                  {/* Section Header */}
                  <div
                    className={`flex items-center justify-between px-5 py-4 rounded-lg transition-all duration-300 shadow-sm border border-gray-300
                      ${
                        isSectionActive
                          ? "bg-[#2563eb] text-white shadow-lg cursor-pointer"
                          : timeLeftForSection > 0
                          ? "bg-gray-200 text-gray-700 cursor-not-allowed"
                          : "bg-gray-100 hover:bg-gray-50 cursor-pointer"
                      }
                    `}
                    onClick={() => {
                      // Only allow clicking if the section's timer is up OR it's the active section
                      // (i.e. we can close/expand the current section),
                      // otherwise it's disabled.
                      if (isSectionActive || timeLeftForSection <= 0) {
                        toggleSection(sectionIndex);
                      }
                    }}
                  >
                    <span className="font-medium text-lg">{section.sectionName}</span>
                    <span className="text-sm font-mono">
                      {timeLeftForSection > 0
                        ? `Time Left: ${formatTime(timeLeftForSection)}`
                        : "Time Up"}
                    </span>
                    <span className="text-2xl font-bold">
                      {isSectionExpanded ? "▲" : "▼"}
                    </span>
                  </div>

                  {/* Question Number Grid */}
                  {isSectionExpanded && timeLeftForSection > 0 && (
                    <QuestionNumbers
                      sectionIndex={sectionIndex}
                      questionNumbers={section.questions.map((_, i) => i + 1)}
                      questionStatuses={section.questions.map((_, questionIndex) => {
                        const globalIndex = getGlobalIndex(sectionIndex, questionIndex);
                        if (reviewStatus[globalIndex]) return "review";
                        if (globalIndex === currentIndex) return "current";
                        if (selectedAnswers[globalIndex]) return "answered";
                        return "notAnswered";
                      })}
                      onQuestionClick={(questionIndex) => {
                        const globalIndex = getGlobalIndex(sectionIndex, questionIndex);
                        onQuestionClick(globalIndex);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Non section-based: Flatten the questions
          <QuestionNumbers
            questionNumbers={sections?.flatMap((section) =>
              section.questions.map((_, index) => index + 1)
            ) ?? []}
            questionStatuses={
              sections?.flatMap((section, sectionIndex) =>
                section.questions.map((_, questionIndex) => {
                  const globalIndex = getGlobalIndex(sectionIndex, questionIndex);
                  if (reviewStatus[globalIndex]) return "review";
                  if (globalIndex === currentIndex) return "current";
                  if (selectedAnswers[globalIndex]) return "answered";
                  return "notAnswered";
                })
              ) ?? []
            }
            onQuestionClick={(globalIndex) => onQuestionClick(globalIndex)}
          />
        )}
      </div>
    </div>
  );
}

// Header Component
function Header({ sectionDuration }) {
  const [timeLeft, setTimeLeft] = useState(sectionDuration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-between bg-white shadow-sm border-b-2 px-4 py-3">
      {/* Left Section: Title */}
      <div className="text-left">
        <h1 className="text-[#000975] text-xl font-bold">MCQ Mock Test</h1>
        <p className="text-[#2563eb] text-sm">Section 3</p>
      </div>

      {/* Right Section: Timer and Legend */}
      <div className="flex items-center gap-4">
        {/* Timer */}
        <span className="text-2xl">⏰</span>
        <div className="text-center">
          <p className="text-[#e63946] text-lg font-semibold">{formatTime(timeLeft)}</p>
          <p className="text-gray-500 text-sm">Time left</p>
        </div>

        {/* Legend with Border */}
        <div className="border-l-2 border-gray-300 pl-4">
          <Legend />
        </div>
      </div>
    </div>
  );
}

// QuestionNumbers Component
function QuestionNumbers({
  sectionIndex,
  questionNumbers,
  questionStatuses,
  onQuestionClick,
}) {
  const handleClick = (index) => {
    onQuestionClick(index);
  };

  return (
    <div className="grid grid-cols-5 gap-2 mt-2">
      {questionNumbers.map((num, index) => {
        const status = questionStatuses[index];
        return (
          <div
            key={`${sectionIndex ?? "flat"}-q${num}`}
            className={`p-2 border rounded-md text-center cursor-pointer
              ${
                status === "current"
                  ? "bg-yellow-400 text-white"
                  : status === "review"
                  ? "bg-blue-600 text-white"
                  : status === "answered"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }
            `}
            onClick={() => handleClick(index)}
          >
            {num}
          </div>
        );
      })}
    </div>
  );
}

// Legend Component
function Legend() {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300"></div>
          <span>Not Answered</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span>Review</span>
        </div>
      </div>
    </div>
  );
}

export { Sidebar, Header, QuestionNumbers, Legend };

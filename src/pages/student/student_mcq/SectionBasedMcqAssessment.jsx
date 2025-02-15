import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SectionBasedHeader from "../../../components/staff/mcq/SectionBasedHeader";
import SectionBasedQuestion from "../../../components/staff/mcq/SectionBasedQuestion";
import SectionBasedSidebar from "../../../components/staff/mcq/SectionBasedSidebar";
import useDeviceRestriction from "../../../components/staff/mcq/useDeviceRestriction";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import FaceDetectionComponent from "../../../components/staff/mcq/useVideoDetection";
import Legend from "../../../components/staff/mcq/Legend";

export default function SectionBasedMcqAssessment() {
  const { contestId } = useParams();
  const studentId = sessionStorage.getItem("studentId");
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  const [sections, setSections] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState(() => {
    const storedAnswers = sessionStorage.getItem(`selectedAnswers_${contestId}`);
    return storedAnswers ? JSON.parse(storedAnswers) : Array.from({ length: 0 }, () => ({}));
  });
  const [reviewStatus, setReviewStatus] = useState(() => {
    const storedReviewStatus = sessionStorage.getItem(`reviewStatus_${contestId}`);
    return storedReviewStatus ? JSON.parse(storedReviewStatus) : Array.from({ length: 0 }, () => ({}));
  });
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalDuration, setTotalDuration] = useState(0);
  const [sectionRemainingTimes, setSectionRemainingTimes] = useState(() => {
    const storedTimes = sessionStorage.getItem(`sectionRemainingTimes_${contestId}`);
    return storedTimes ? JSON.parse(storedTimes) : Array(sections.length).fill(0);
  });
  const [faceDetection, setFaceDetection] = useState(() => {
    const storedFaceDetection = localStorage.getItem(`faceDetection_${contestId}`);
    return storedFaceDetection === "true";
  });
  const [fullScreenMode, setFullScreenMode] = useState(() => {
    const currentTest = JSON.parse(localStorage.getItem("currentTest"));
    return currentTest?.fullScreenMode === true;
  });
  const [fullscreenWarnings, setFullscreenWarnings] = useState(() => {
    return Number(sessionStorage.getItem(`fullscreenWarnings_${contestId}`)) || 0;
  });
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(() => {
    return Number(sessionStorage.getItem(`tabSwitchWarnings_${contestId}`)) || 0;
  });
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [noiseDetectionCount, setNoiseDetectionCount] = useState(0);
  const [showNoiseWarningModal, setShowNoiseWarningModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [expandedSectionIndex, setExpandedSectionIndex] = useState(null);
  const [hasFocus, setHasFocus] = useState(true);
  const lastActiveTime = useRef(Date.now());
  const lastWarningTime = useRef(Date.now());
  const [isFreezePeriodOver, setIsFreezePeriodOver] = useState(false);
  const [faceDetectionWarning, setFaceDetectionWarning] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const disableAutoFullscreen = false;

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const apiUrl = `${API_BASE_URL}/api/mcq/sections/${contestId}/`;
        const response = await axios.get(apiUrl);

        let parsedSections = response.data.map(section => ({
          sectionName: section.sectionName,
          questions: section.questions,
          duration: section.duration,
        }));

        let totalDuration = 0;
        let sectionDurations = parsedSections.map((section) => {
          const { hours, minutes } = section.duration || { hours: "0", minutes: "0" };
          const durationInSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60;
          totalDuration += durationInSeconds;
          return durationInSeconds;
        });

        setSections(parsedSections);
        setTotalDuration(totalDuration);

        const storedTimes = sessionStorage.getItem(`sectionRemainingTimes_${contestId}`);
        const initialRemainingTimes = storedTimes ? JSON.parse(storedTimes) : sectionDurations;
        setSectionRemainingTimes(initialRemainingTimes);

        const startTime = sessionStorage.getItem(`startTime_${contestId}`);
        if (startTime) {
          const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
          setRemainingTime(totalDuration - elapsedTime);
        } else {
          sessionStorage.setItem(`startTime_${contestId}`, Date.now());
          setRemainingTime(totalDuration);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [API_BASE_URL, contestId, studentId]);

  useEffect(() => {
    sessionStorage.setItem(`selectedAnswers_${contestId}`, JSON.stringify(selectedAnswers));
    sessionStorage.setItem(`reviewStatus_${contestId}`, JSON.stringify(reviewStatus));
  }, [selectedAnswers, reviewStatus, contestId]);

  useEffect(() => {
    localStorage.setItem(`faceDetection_${contestId}`, faceDetection);
  }, [faceDetection, contestId]);

  useEffect(() => {
    sessionStorage.setItem(`sectionRemainingTimes_${contestId}`, JSON.stringify(sectionRemainingTimes));
  }, [sectionRemainingTimes, contestId]);

  const handleFaceDetection = (isDetected) => {
    setFaceDetection(isDetected);
    if (!isDetected) {
      setFaceDetectionWarning("Face not detected. Please ensure you are visible to the camera.");
    }
  };

  const handleAnswerSelect = (sectionIndex, questionIndex, answer) => {
    setSelectedAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[sectionIndex] = { ...newAnswers[sectionIndex], [questionIndex]: answer };
      return newAnswers;
    });
  };

  const handleReviewMark = (sectionIndex, questionIndex) => {
    setReviewStatus((prev) => {
      const newReviewStatus = [...prev];
      newReviewStatus[sectionIndex] = {
        ...newReviewStatus[sectionIndex],
        [questionIndex]: !newReviewStatus[sectionIndex]?.[questionIndex],
      };
      return newReviewStatus;
    });
  };

  const addWarning = useCallback((type) => {
    const currentTime = Date.now();
    if (currentTime - lastWarningTime.current < 100) {
      return;
    }
    lastWarningTime.current = currentTime;

    if (type === 'fullscreen' || type === 'tabSwitch') {
      const combinedWarnings = fullscreenWarnings + tabSwitchWarnings + 1;
      setFullscreenWarnings((prevWarnings) => {
        const newWarnings = type === 'fullscreen' ? prevWarnings + 1 : prevWarnings;
        sessionStorage.setItem(`fullscreenWarnings_${contestId}`, newWarnings);
        return newWarnings;
      });
      setTabSwitchWarnings((prevWarnings) => {
        const newWarnings = type === 'tabSwitch' ? prevWarnings + 1 : prevWarnings;
        sessionStorage.setItem(`tabSwitchWarnings_${contestId}`, newWarnings);
        return newWarnings;
      });
      setShowWarningModal(true);
    }
  }, [contestId, fullscreenWarnings, tabSwitchWarnings]);

  const actuallyEnforceFullScreen = async () => {
    try {
      const element = document.documentElement;
      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement
      ) {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          await element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          await element.msRequestFullscreen();
        }
      }
    } catch (error) {
      console.error("Error requesting fullscreen mode:", error);
    }
  };

  useEffect(() => {
    const currentTest = JSON.parse(localStorage.getItem("currentTest"));
    const isFullScreenEnabled = currentTest?.fullScreenMode === true;

    if (!isTestFinished && isFullScreenEnabled) {
      (async () => {
        try {
          await actuallyEnforceFullScreen();
        } catch (error) {
          console.error("Error initializing fullscreen:", error);
        }
      })();
    }

    const onFullscreenChange = async () => {
      const isFullscreen = document.fullscreenElement ||
                             document.webkitFullscreenElement ||
                             document.mozFullScreenElement ||
                             document.msFullscreenElement;

      if (!isFullscreen && !isTestFinished && isFullScreenEnabled) {
        addWarning("fullscreen");
        await actuallyEnforceFullScreen();
      }
      setFullScreenMode(isFullscreen);
      localStorage.setItem(
        `fullScreenMode_${contestId}`,
        isFullscreen ? "true" : "false"
      );
    };

    const preventReload = (e) => {
      if (!isTestFinished) {
        e.preventDefault();
        e.returnValue = "";
        addWarning("tabSwitch");
        return e.returnValue;
      }
    };

    const handleKeyDown = async (e) => {
      const currentTest = JSON.parse(localStorage.getItem("currentTest"));
      const isFullScreenEnabled = currentTest?.fullScreenMode === true;

      if (!isTestFinished && fullScreenMode) {
        if (e.key === "Escape" && !disableAutoFullscreen && isFullScreenEnabled) {
          e.preventDefault();
          e.stopPropagation();
          addWarning("fullscreen");
          await actuallyEnforceFullScreen();
          return false;
        }
        if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
          e.preventDefault();
          e.stopPropagation();
          addWarning("tabSwitch");
          return false;
        }
        if (e.altKey && e.key === "Tab") {
          e.preventDefault();
          addWarning("tabSwitch");
          return false;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "w") {
          e.preventDefault();
          addWarning("tabSwitch");
          return false;
        }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "W") {
          e.preventDefault();
          addWarning("tabSwitch");
          return false;
        }
        if (e.altKey && e.key === "F4") {
          e.preventDefault();
          addWarning("tabSwitch");
          return false;
        }
        if (e.ctrlKey && e.altKey && e.key === "Delete") {
          e.preventDefault();
          addWarning("tabSwitch");
          return false;
        }
        if (e.key === "Meta" || e.key === "OS") {
          e.preventDefault();
          addWarning("tabSwitch");
          return false;
        }
        if (e.ctrlKey && e.shiftKey && e.key === "I") {
          e.preventDefault();
          addWarning("tabSwitch");
          return false;
        }
      }
    };

    const handleClick = async () => {
      const currentTest = JSON.parse(localStorage.getItem("currentTest"));
      const isFullScreenEnabled = currentTest?.fullScreenMode === true;

      if (!isTestFinished && isFullScreenEnabled && !fullScreenMode) {
        await actuallyEnforceFullScreen();
      }
    };

    window.addEventListener("beforeunload", preventReload);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("click", handleClick);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange", onFullscreenChange);
    document.addEventListener("MSFullscreenChange", onFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      document.removeEventListener("mozfullscreenchange", onFullscreenChange);
      document.removeEventListener("MSFullscreenChange", onFullscreenChange);
      document.removeEventListener("click", handleClick);
    };
  }, [isTestFinished, contestId, fullScreenMode, addWarning, disableAutoFullscreen]);

  useEffect(() => {
    if (!disableAutoFullscreen && !isTestFinished && fullScreenMode) {
      (async () => {
        try {
          await actuallyEnforceFullScreen();
        } catch (error) {
          console.error("Error initializing fullscreen:", error);
        }
      })();
    }
  }, [fullScreenMode, disableAutoFullscreen, isTestFinished]);

  const { openDeviceRestrictionModal, handleDeviceRestrictionModalClose } = useDeviceRestriction(contestId);

  const handleNext = () => {
    const currentSection = sections[currentSectionIndex];
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      if (currentSectionIndex < sections.length - 1) {
        setCurrentSectionIndex(currentSectionIndex + 1);
        setCurrentQuestionIndex(0);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      if (currentSectionIndex > 0) {
        setCurrentSectionIndex(currentSectionIndex - 1);
        setCurrentQuestionIndex(sections[currentSectionIndex - 1].questions.length - 1);
      }
    }
  };

  const handleNoiseDetection = () => {
    setNoiseDetectionCount((prevCount) => {
      const newCount = prevCount + 1;
      sessionStorage.setItem(`noiseDetectionCount_${contestId}`, newCount);
      return newCount;
    });
    setShowNoiseWarningModal(true);
  };

  const handleFinish = useCallback(async () => {
    try {
      const formattedAnswers = {};

      sections.forEach((section, sectionIndex) => {
        formattedAnswers[section.sectionName] = {};
        section.questions.forEach((question, questionIndex) => {
          formattedAnswers[section.sectionName][question.text] =
            selectedAnswers[sectionIndex]?.[questionIndex] || "notattended";
        });
      });

      const resultVisibility = localStorage.getItem(`resultVisibility_${contestId}`);
      const isPublish = resultVisibility === "Immediate release";

      let correctAnswers = 0;
      sections.forEach((section) => {
        section.questions.forEach((question, questionIndex) => {
          if (selectedAnswers[currentSectionIndex]?.[questionIndex] === question.correctAnswer) {
            correctAnswers++;
          }
        });
      });

      const passPercentage =
        parseFloat(sessionStorage.getItem(`passPercentage_${contestId}`)) || 50;

      const totalQuestions = sections.reduce((total, section) => total + section.questions.length, 0);
      const percentage = (correctAnswers / totalQuestions) * 100;
      const grade = percentage >= passPercentage ? "Pass" : "Fail";

      console.log("Correct Answers:", correctAnswers);
      console.log("Total Questions:", totalQuestions);
      console.log("Percentage:", percentage);
      console.log("Pass Percentage:", passPercentage);
      console.log("Grade:", grade);

      const fullscreenWarning = sessionStorage.getItem(`fullscreenWarnings_${contestId}`);
      const faceWarning = sessionStorage.getItem(`faceDetectionCount_${contestId}`);

      const payload = {
        contestId,
        studentId: localStorage.getItem("studentId"),
        answers: formattedAnswers,
        FullscreenWarning: fullscreenWarnings,
        NoiseWarning: noiseDetectionCount,
        FaceWarning: faceWarning,
        TabSwitchWarning: tabSwitchWarnings,
        isPublish: isPublish,
        grade: grade,
        passPercentage: passPercentage,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/mcq/submit_assessment/`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        navigate("/studentdashboard");
      }

      console.log("Test submitted successfully:", response.data);
      alert("Test submitted successfully!");

      setIsTestFinished(true);

      sessionStorage.removeItem(`fullscreenWarnings_${contestId}`);
      sessionStorage.removeItem(`tabSwitchWarnings_${contestId}`);
      sessionStorage.removeItem(`keydownWarnings_${contestId}`);
      sessionStorage.removeItem(`reloadWarnings_${contestId}`);
      sessionStorage.removeItem(`inspectWarnings_${contestId}`);

      localStorage.setItem(`testFinished_${contestId}`, "true");
    } catch (error) {
      console.error("Error submitting test:", error);
      alert("Failed to submit the test.");
    }
  }, [
    contestId,
    sections,
    selectedAnswers,
    fullscreenWarnings,
    tabSwitchWarnings,
    noiseDetectionCount,
    navigate,
    API_BASE_URL,
  ]);

  useEffect(() => {
    if (remainingTime > 0) {
      const interval = setInterval(() => {
        setSectionRemainingTimes((prevTimes) => {
          const newTimes = [...prevTimes];
          newTimes[currentSectionIndex] = Math.max(newTimes[currentSectionIndex] - 1, 0);
          sessionStorage.setItem(`sectionRemainingTimes_${contestId}`, JSON.stringify(newTimes));
          return newTimes;
        });
        setRemainingTime((prevTime) => {
          const newTime = Math.max(prevTime - 1, 0);
          sessionStorage.setItem(`totalTimeLeft_${contestId}`, JSON.stringify(newTime));
          return newTime;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else if (isFreezePeriodOver) {
      handleFinish();
    }
  }, [remainingTime, isFreezePeriodOver, handleFinish, currentSectionIndex, contestId]);

  useEffect(() => {
    const disableRightClick = (e) => {
      if (fullScreenMode) {
        e.preventDefault();
      }
    };
    const disableTextSelection = (e) => {
      if (fullScreenMode) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("selectstart", disableTextSelection);
    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("selectstart", disableTextSelection);
    };
  }, [fullScreenMode]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isTestFinished && fullScreenMode) {
        e.preventDefault();
        e.returnValue = "";
        addWarning("tabSwitch");
        return "";
      }
    };
    const handleBlur = () => {
      if (!isTestFinished && fullScreenMode) {
        setHasFocus(false);
        addWarning("tabSwitch");
      }
    };
    const handleFocus = () => {
      setHasFocus(true);
    };
    const handleVisibilityChange = () => {
      if (!isTestFinished && fullScreenMode) {
        if (document.hidden) {
          const currentTime = Date.now();
          if (currentTime - lastActiveTime.current > 500) {
            addWarning("tabSwitch");
          }
        }
        lastActiveTime.current = Date.now();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const focusCheckInterval = setInterval(() => {
      if (!isTestFinished && !document.hasFocus() && fullScreenMode) {
        addWarning("tabSwitch");
      }
    }, 1000);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(focusCheckInterval);
    };
  }, [isTestFinished, fullScreenMode, addWarning]);

  const warningLimits = useMemo(() => ({
    fullscreen: 3,
    tabSwitch: 1,
    noiseDetection: 2,
    faceDetection: 3,
  }), []);

  useEffect(() => {
    const allLimitsExceeded =
      fullscreenWarnings >= warningLimits.fullscreen &&
      tabSwitchWarnings >= warningLimits.tabSwitch &&
      noiseDetectionCount >= warningLimits.noiseDetection &&
      parseInt(sessionStorage.getItem(`faceDetectionCount_${contestId}`)) >= warningLimits.faceDetection;

    if (allLimitsExceeded) {
      handleFinish();
    }
  }, [fullscreenWarnings, tabSwitchWarnings, noiseDetectionCount, handleFinish, contestId, warningLimits]);

  const handleFullscreenReEntry = async () => {
    const currentTest = JSON.parse(localStorage.getItem("currentTest"));
    const isFullScreenEnabled = currentTest?.fullScreenMode === true;

    if (!isFullScreenEnabled) {
      setShowWarningModal(false);
      return;
    }

    setShowWarningModal(false);
    const element = document.documentElement;
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
    } catch (error) {
      console.error("Error entering fullscreen mode:", error);
      setTimeout(handleFullscreenReEntry, 500);
    }
  };

  useEffect(() => {
    const isFinished = localStorage.getItem(`testFinished_${contestId}`) === "true";
    if (isFinished) {
      navigate("/studentdashboard");
    }
  }, [contestId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-gray-700 mb-4">No questions available</p>
          <button
            onClick={() => navigate("/studentdashboard")}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen max-w-full bg-gray-50 text-xs sm:text-sm md:text-base"
      style={{
        userSelect: fullScreenMode ? "none" : "auto",
        WebkitUserSelect: fullScreenMode ? "none" : "auto",
        MozUserSelect: fullScreenMode ? "none" : "auto",
        msUserSelect: fullScreenMode ? "none" : "auto",
        pointerEvents: !hasFocus ? "none" : "auto",
        filter: !hasFocus ? "blur(5px)" : "none",
      }}
      onCopy={(e) => fullScreenMode && e.preventDefault()}
      onCut={(e) => fullScreenMode && e.preventDefault()}
      onPaste={(e) => fullScreenMode && e.preventDefault()}
      onKeyDown={(e) => fullScreenMode && e.preventDefault()}
    >
      <meta
        httpEquiv="Content-Security-Policy"
        content="frame-ancestors 'none'"
      ></meta>
      <div className="max-w-[1900px] max-h-[1540px] mx-auto ">
        <div className="bg-white ">
          <SectionBasedHeader
            contestId={contestId}
            totalDuration={totalDuration}
            sectionRemainingTime={sectionRemainingTimes[currentSectionIndex]}
          />
          <div className="absolute top-4 right-4 lg:hidden z-50">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-2 text-gray-700 bg-gray-200 rounded-md"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 min-h-[600px] sm:min-h-[750px] mt-2 sm:mt-7 relative">
            <div className="flex-grow relative border-r-2">
              <SectionBasedQuestion
                sections={sections}
                currentSectionIndex={currentSectionIndex}
                currentQuestionIndex={currentQuestionIndex}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onFinish={() => setShowPopup(true)}
                onAnswerSelect={handleAnswerSelect}
                selectedAnswers={selectedAnswers}
                onReviewMark={handleReviewMark}
                reviewStatus={reviewStatus}
              />
            </div>

            <div
              className={`lg:w-80 bg-white z-40 lg:z-auto
              fixed lg:static top-0 bottom-0 right-0 transition-transform
              transform
              ${
                screenWidth >= 1024
                  ? "translate-x-0"
                  : isMobileSidebarOpen
                  ? "translate-x-0"
                  : "translate-x-full"
              }`}
            >
              <div className="sticky top-6 p-4 sm:p-0">
                <SectionBasedSidebar
                  sections={sections}
                  currentSectionIndex={currentSectionIndex}
                  currentQuestionIndex={currentQuestionIndex}
                  selectedAnswers={selectedAnswers}
                  reviewStatus={reviewStatus}
                  onQuestionClick={(sectionIndex, questionIndex) => {
                    setCurrentSectionIndex(sectionIndex);
                    setCurrentQuestionIndex(questionIndex);
                  }}
                  contestId={contestId}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-md flex justify-between items-center z-50">
        <button
          className="bg-[#fdc500] text-[#00296b] px-8 py-2 rounded-full flex items-center gap-2"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 && currentSectionIndex === 0}
        >
          ← Previous
        </button>
        <button
          className="bg-[#fdc500] text-[#00296b] px-8 py-2 rounded-full flex items-center gap-2"
          onClick={handleNext}
          disabled={currentQuestionIndex === sections[currentSectionIndex].questions.length - 1 && currentSectionIndex === sections.length - 1}
        >
          Next →
        </button>
        <button
          className="bg-[#fdc500] text-[#00296b] px-8 py-2 rounded-full"
          onClick={() => setShowPopup(true)}
          disabled={isSubmitting}
        >
          Finish
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[800px] p-8 rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-[#00296b] text-lg font-bold mb-4">
              MCT Mock Test
            </h3>
            <p className="text-center text-sm mb-4">
              You have gone through all the questions. <br />
              Either browse through them once again or finish your assessment.
            </p>
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-6">
                <div
                  className="flex justify-between items-center mb-2 cursor-pointer"
                  onClick={() =>
                    setExpandedSectionIndex(expandedSectionIndex === sectionIndex ? null : sectionIndex)
                  }
                >
                  <h4 className="text-[#00296b] font-semibold flex items-center">
                    {section.sectionName}
                    <svg
                      className={`ml-2 transition-transform ${expandedSectionIndex === sectionIndex ? 'rotate-180' : 'rotate-0'}`}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 10L12 15L17 10"
                        stroke="#00296b"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </h4>
                </div>
                {expandedSectionIndex === sectionIndex && (
                  <div className="mt-2">
                    <div className="grid grid-cols-6 gap-2 mb-2">
                      {section.questions.map((_, questionIndex) => (
                        <div
                          key={questionIndex}
                          className={`w-10 h-10 flex items-center justify-center rounded-md text-white ${
                            selectedAnswers[sectionIndex]?.[questionIndex]
                              ? "bg-green-500"
                              : reviewStatus[sectionIndex]?.[questionIndex]
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        >
                          {questionIndex + 1}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm text-gray-700">
                        Attempted: {Object.keys(selectedAnswers[sectionIndex] || {}).length}/{section.questions.length}
                      </p>
                      <p className="text-sm text-gray-700">
                        Unattempted: {section.questions.length - Object.keys(selectedAnswers[sectionIndex] || {}).length}
                      </p>
                      <p className="text-sm text-gray-700">
                        Marked for Review: {Object.values(reviewStatus[sectionIndex] || {}).filter(Boolean).length}
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{
                          width: `${(Object.keys(selectedAnswers[sectionIndex] || {}).length / section.questions.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-center text-sm">
                      {((Object.keys(selectedAnswers[sectionIndex] || {}).length / section.questions.length) * 100).toFixed(0)}% Completed
                    </p>
                  </div>
                )}
              </div>
            ))}
            <div className="flex justify-between mt-4">
              <button
                className="border border-red-500 text-red-500 px-6 py-2 rounded-full"
                onClick={() => setShowPopup(false)}
              >
                Close
              </button>
              <button
                className="bg-[#fdc500] text-[#00296b] px-6 py-2 rounded-full"
                onClick={handleFinish}
              >
                Finish
              </button>
            </div>
          </div>
        </div>
      )}

      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
            <div className="text-red-600 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-center mb-4">
              Warning
            </h3>
            <p className="text-gray-700 mb-6">
              You have {fullscreenWarnings + tabSwitchWarnings} warnings. Please return to fullscreen mode and avoid switching tabs to continue the test.
            </p>
            <button
              onClick={handleFullscreenReEntry}
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              Return to Test
            </button>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-center mb-4">
              Submit Assessment
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to submit your assessment? This action
              cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  handleFinish();
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Confirm Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={openDeviceRestrictionModal}
        onClose={handleDeviceRestrictionModalClose}
        aria-labelledby="device-restriction-modal-title"
        aria-describedby="device-restriction-modal-description"
      >
        <DialogTitle id="device-restriction-modal-title">{"Device Restriction"}</DialogTitle>
        <DialogContent>
          <DialogContent id="device-restriction-modal-description">
            This test cannot be taken on a mobile or tablet device.
          </DialogContent>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeviceRestrictionModalClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {showNoiseWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
            <div className="text-red-600 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-center mb-4">
              Noise Detected
            </h3>
            <p className="text-gray-700 mb-6">
              Noise has been detected. Please ensure a quiet environment to continue the test.
            </p>
            <button
              onClick={() => setShowNoiseWarningModal(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {faceDetection && (
        <FaceDetectionComponent
          contestId={contestId}
          onWarning={handleFaceDetection}
        />
      )}

      {faceDetectionWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
            <div className="text-red-600 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-center mb-4">
              Face Detection Warning
            </h3>
            <p className="text-gray-700 mb-6">
              {faceDetectionWarning}
            </p>
            <button
              onClick={() => setFaceDetectionWarning('')}
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

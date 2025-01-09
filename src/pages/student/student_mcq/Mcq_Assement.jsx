import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../../components/staff/mcq/Header";
import Question from "../../../components/staff/mcq/Question";
import Sidebar from "../../../components/staff/mcq/Sidebar";

export default function Mcq_Assessment() {
  const { contestId } = useParams();
  const studentId = sessionStorage.getItem("studentId");
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState(() => {
    const storedAnswers = sessionStorage.getItem(`selectedAnswers_${contestId}`);
    return storedAnswers ? JSON.parse(storedAnswers) : {};
  });
  const [reviewStatus, setReviewStatus] = useState(() => {
    const storedReviewStatus = sessionStorage.getItem(`reviewStatus_${contestId}`);
    return storedReviewStatus ? JSON.parse(storedReviewStatus) : {};
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [fullScreenMode, setFullScreenMode] = useState(() => {
    const storedFullScreenMode = localStorage.getItem(`fullScreenMode_${contestId}`);
    return storedFullScreenMode === "true";
  });
  const [fullscreenWarnings, setFullscreenWarnings] = useState(() => {
    return Number(sessionStorage.getItem(`fullscreenWarnings_${contestId}`)) || 0;
  });
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(() => {
    return Number(sessionStorage.getItem(`tabSwitchWarnings_${contestId}`)) || 0;
  });
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const mediaStreamRef = useRef(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasFocus, setHasFocus] = useState(true);
  const lastActiveTime = useRef(Date.now());
  const lastWarningTime = useRef(Date.now());
  const [isFreezePeriodOver, setIsFreezePeriodOver] = useState(false);

  // ADDED: State to track mobile sidebar open/close and current screen width
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // ADDED
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);     // ADDED

  // ADDED: A flag to ALLOW auto-fullscreen (set to false previously). Now TRUE => auto FS
  const disableAutoFullscreen = false; // CHANGED to false so it goes fullscreen on load

  // ADDED: Keep track of screen resizing so we can display the sidebar if width ≥ 1024
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
        const response = await axios.get(
          `${API_BASE_URL }/api/mcq/get_mcqquestions/${contestId}`
        );
        setQuestions(response.data.questions);
        const { hours, minutes } = response.data.duration;
        const totalDuration = parseInt(hours) * 3600 + parseInt(minutes) * 60;
        setDuration(totalDuration);

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
  }, [contestId, studentId]);

  useEffect(() => {
    sessionStorage.setItem(`selectedAnswers_${contestId}`, JSON.stringify(selectedAnswers));
    sessionStorage.setItem(`reviewStatus_${contestId}`, JSON.stringify(reviewStatus));
  }, [selectedAnswers, reviewStatus, contestId]);

  const handleAnswerSelect = (index, answer) => {
    setSelectedAnswers((prev) => ({ ...prev, [index]: answer }));
  };

  const handleReviewMark = (index) => {
    setReviewStatus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const addWarning = (type) => {
    const currentTime = Date.now();
    if (currentTime - lastWarningTime.current < 1000) {
      return; // Debounce warnings
    }
    lastWarningTime.current = currentTime;

    if (type === 'fullscreen') {
      setFullscreenWarnings((prevWarnings) => {
        const newWarnings = prevWarnings + 1;
        sessionStorage.setItem(`fullscreenWarnings_${contestId}`, newWarnings);
        return newWarnings;
      });
    } else if (type === 'tabSwitch') {
      setTabSwitchWarnings((prevWarnings) => {
        const newWarnings = prevWarnings + 1;
        sessionStorage.setItem(`tabSwitchWarnings_${contestId}`, newWarnings);
        return newWarnings;
      });
    }
    setShowWarningModal(true);
  };

  // Original "enforceFullScreen" code
  const enforceFullScreen = async () => {
    try {
      if (!disableAutoFullscreen === false) {
        // Not needed. We'll just check "if (!disableAutoFullscreen)" below
      }
      if (!disableAutoFullscreen) {
        return;
      }
    } catch (err) {
      console.error("Error ignoring fullscreen:", err);
    }
  };

  // ADJUSTED: This version DOES force FS, because disableAutoFullscreen = false
  const actuallyEnforceFullScreen = async () => {
    // This is a new helper method to actually request fullscreen.
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
    // On mount: If autoFullscreen is allowed => actuallyEnforceFullScreen
    if (!isTestFinished && !disableAutoFullscreen && fullScreenMode) {
      actuallyEnforceFullScreen();
    }

    const onFullscreenChange = async () => {
      const isFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      // If user exits fullscreen in the middle of the test, we show a warning
      if (!isFullscreen && !isTestFinished && !disableAutoFullscreen && fullScreenMode) {
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
        return e.returnValue;
      }
    };

    const handleKeyDown = async (e) => {
      if (!isTestFinished && fullScreenMode) {
        // Prevent ESC
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Prevent F5 & Ctrl+R
        if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
          e.preventDefault();
          e.stopPropagation();
          addWarning("tabSwitch");
          return false;
        }
        // Prevent Alt+Tab
        if (e.altKey && e.key === "Tab") {
          e.preventDefault();
          addWarning("tabSwitch");
          return false;
        }
        // Prevent Ctrl+W / Cmd+W
        if ((e.ctrlKey || e.metaKey) && e.key === "w") {
          e.preventDefault();
          addWarning("tabSwitch");
          return false;
        }
        // Prevent Ctrl+Shift+W, Cmd+Shift+W
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "W") {
          e.preventDefault();
          addWarning("tabSwitch");
          return false;
        }
        // Prevent Alt+F4
        if (e.altKey && e.key === "F4") {
          e.preventDefault();
          addWarning("tabSwitch");
          return false;
        }
        // Prevent Ctrl+Alt+Delete
        if (e.ctrlKey && e.altKey && e.key === "Delete") {
          e.preventDefault();
          addWarning("tabSwitch");
          return false;
        }
        // Prevent Windows key
        if (e.key === "Meta" || e.key === "OS") {
          e.preventDefault();
          addWarning("tabSwitch");
          return false;
        }
        // Prevent Ctrl+Shift+I
        if (e.ctrlKey && e.shiftKey && e.key === "I") {
          e.preventDefault();
          addWarning("tabSwitch");
          return false;
        }
      }
    };

    window.addEventListener("beforeunload", preventReload);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange", onFullscreenChange);
    document.addEventListener("MSFullscreenChange", onFullscreenChange);

    return () => {
      window.removeEventListener("beforeunload", preventReload);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      document.removeEventListener("mozfullscreenchange", onFullscreenChange);
      document.removeEventListener("MSFullscreenChange", onFullscreenChange);
    };
  }, [isTestFinished, contestId, fullScreenMode]);

  const handleFullscreenReEntry = async () => {
    setShowWarningModal(false);
    // Return to FS if user left it
    if (!disableAutoFullscreen && !fullScreenMode) {
      try {
        await actuallyEnforceFullScreen();
      } catch (error) {
        console.error("Error returning to fullscreen:", error);
        setTimeout(handleFullscreenReEntry, 500);
      }
    }
  };

  useEffect(() => {
    // If not finished, try to do fullscreen on load
    if (!disableAutoFullscreen && !isTestFinished && fullScreenMode) {
      (async () => {
        try {
          await actuallyEnforceFullScreen();
        } catch (error) {
          console.error("Error initializing fullscreen:", error);
        }
      })();
    }
  }, [fullScreenMode]); // Added fullScreenMode as a dependency

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = useCallback(async () => {
    try {
      const formattedAnswers = {};
      questions.forEach((question, index) => {
        formattedAnswers[question.text] = selectedAnswers[index];
      });
  
      const payload = {
        contestId,
        answers: formattedAnswers,
        warnings: fullscreenWarnings + tabSwitchWarnings,
      };
  
      const response = await axios.post(
        "http://localhost:8000/api/mcq/submit_assessment/",
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
    } catch (error) {
      console.error("Error submitting test:", error);
      alert("Failed to submit the test.");
    }
  }, [contestId, questions, selectedAnswers, fullscreenWarnings, tabSwitchWarnings, navigate]);

  useEffect(() => {
    const freezeTimeout = setTimeout(() => {
      setIsFreezePeriodOver(true); // Enable auto-finish after 5 seconds
    }, 5000);
  
    return () => clearTimeout(freezeTimeout); // Cleanup timeout on unmount
  }, []);

  useEffect(() => {
    if (remainingTime > 0) {
      const interval = setInterval(() => {
        setRemainingTime((prevTime) => Math.max(prevTime - 1, 0));
      }, 1000);
      return () => clearInterval(interval);
    } else if (isFreezePeriodOver) {
      // Only trigger the Finish button if the freeze period is over
      handleFinish();
    }
  }, [remainingTime, isFreezePeriodOver, handleFinish]);
  

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
  }, [isTestFinished, fullScreenMode]);

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

  if (!questions.length) {
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

  // TEXT NOW EVEN SMALLER ON MOBILE => text-xs on phones, sm => text-sm, md => text-base
  return (
    <div
      className="min-h-screen bg-gray-50 text-xs sm:text-sm md:text-base"
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
      <div className="max-w-[1800px] max-h-[1540px] mx-auto p-3 sm:p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-4 sm:mt-12">
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <Header duration={remainingTime} />
          </div>

          {/* Hamburger button for mobile */}
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
            <div className="flex-grow relative">
              <Question
                // If you have direct control of how "Previous / Next / Finish" are laid out
                // you might add special classes for them so we can apply custom logic in CSS
                question={questions[currentIndex]}
                currentIndex={currentIndex}
                totalQuestions={questions.length}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onFinish={() => setShowConfirmModal(true)}
                onAnswerSelect={handleAnswerSelect}
                selectedAnswers={selectedAnswers}
                onReviewMark={handleReviewMark}
                reviewStatus={reviewStatus}
              />
            </div>

            {/*
              SIDEBAR: now "slides in" from the right side on mobile
              We comment out the old style prop with display, and use a transform approach.
            */}
            {/* style={{
                display:
                  screenWidth >= 1024 || isMobileSidebarOpen ? "block" : "none"
              }} */}
            <div
              className={`lg:w-80 bg-white z-40 lg:z-auto
              fixed lg:static top-0 bottom-0 right-0 transition-transform
              transform
              ${
                // If large screen => sidebar is always visible
                screenWidth >= 1024
                  ? "translate-x-0"
                  : isMobileSidebarOpen
                  ? "translate-x-0"
                  : "translate-x-full"
              }`}
            >
              <div className="sticky top-6 p-4 sm:p-0">
                <Sidebar
                  totalQuestions={questions.length}
                  currentIndex={currentIndex}
                  selectedAnswers={selectedAnswers}
                  reviewStatus={reviewStatus}
                  onQuestionClick={(index) => setCurrentIndex(index)}
                />
              </div>
            </div>
          </div>
        </div>

        {showWarningModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
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
                Warning #{fullscreenWarnings + tabSwitchWarnings}
              </h3>
              <p className="text-gray-600 text-center mb-6">
                {tabSwitchWarnings > 0
                  ? "You have switched tabs. Please return to the test tab to continue."
                  : "You have exited fullscreen mode. Please return to fullscreen to continue the test."}
              </p>
              <button
                onClick={handleFullscreenReEntry}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Fullscreen
              </button>
            </div>
          </div>
        )}

        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-xl font-semibold text-center mb-4">
                Submit Assessment
              </h3>
              <p className="text-gray-600 text-center mb-6">
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
      </div>

      {/*
        ADDED: Some global CSS override to place "Finish" below "Previous/Next" on mobile
        (assuming inside <Question> you have a container with .button-row or .question-nav, etc.)
        If not, you might have to adjust these class names accordingly.
      */}
      <style>
        {`
          @media (max-width: 640px) {
            /* On phone: Put "Previous" and "Next" side by side, "Finish" below */
            .question-nav {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 0.5rem;
            }
            .question-nav .prev-button,
            .question-nav .next-button {
              order: 1;
            }
            .question-nav .finish-button {
              order: 3;
              margin-top: 0.5rem;
            }
          }
          @media (min-width: 641px) {
            /* Desktop: all three horizontally */
            .question-nav {
              display: flex;
              flex-direction: row;
              gap: 1rem;
            }
          }
        `}
      </style>
    </div>
  );
}

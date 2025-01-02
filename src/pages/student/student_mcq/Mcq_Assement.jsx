import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../../components/staff/mcq/Header";
import Question from "../../../components/staff/mcq/Question";
import Sidebar from "../../../components/staff/mcq/Sidebar";

export default function Mcq_Assessment() {
  const { contestId } = useParams();
  const studentId = sessionStorage.getItem("studentId");
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [reviewStatus, setReviewStatus] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [fullscreenWarnings, setFullscreenWarnings] = useState(0);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const mediaStreamRef = useRef(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `https://render-frontend-f05v.onrender.com/api/mcq/get_mcqquestions/${contestId}`
        );
        setQuestions(response.data.questions);
        const { hours, minutes } = response.data.duration;
        const totalDuration = parseInt(hours) * 3600 + parseInt(minutes) * 60;
        setDuration(totalDuration);

        const storedFullScreenMode = JSON.parse(sessionStorage.getItem(`fullScreenMode_${contestId}`));
        setFullScreenMode(storedFullScreenMode !== null ? storedFullScreenMode : true);

        setFullscreenWarnings(
          Number(sessionStorage.getItem(`fullscreenWarnings_${studentId}`)) || 0
        );

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

  const handleAnswerSelect = (index, answer) => {
    setSelectedAnswers((prev) => ({ ...prev, [index]: answer }));
  };

  const handleReviewMark = (index) => {
    setReviewStatus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    const goFullScreen = async () => {
      try {
        if (fullScreenMode && !isTestFinished) {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
            await document.documentElement.webkitRequestFullscreen();
          } else if (document.documentElement.mozRequestFullScreen) {
            await document.documentElement.mozRequestFullScreen();
          } else if (document.documentElement.msRequestFullscreen) {
            await document.documentElement.msRequestFullscreen();
          }
        }
      } catch (error) {
        console.error("Error entering fullscreen mode:", error);
      }
    };

    const addWarning = () => {
      let warnings = fullscreenWarnings + 1;
      setFullscreenWarnings(warnings);
      sessionStorage.setItem(`fullscreenWarnings_${studentId}`, warnings);
      setShowWarningModal(true);
    };

    const onFullscreenChange = () => {
      const isFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      setFullScreenMode(isFullscreen);
      sessionStorage.setItem(
        `fullScreenMode_${contestId}`,
        isFullscreen ? "true" : "false"
      );

      if (!isFullscreen && !isTestFinished) {
        addWarning();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !isTestFinished) {
        addWarning();
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("msfullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    goFullScreen();

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("mozfullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      document.removeEventListener("msfullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [fullScreenMode, studentId, contestId, isTestFinished]);

  const handleFullscreenReEntry = async () => {
    setShowWarningModal(false);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        await document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen();
      }
    } catch (error) {
      console.error("Error entering fullscreen mode:", error);
    }
  };

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

  const handleFinish = async () => {
    try {
      const payload = {
        contestId,
        answers: selectedAnswers,
        warnings: fullscreenWarnings,
      };

      const response = await axios.post(
        "https://render-frontend-f05v.onrender.com/api/mcq/submit_assessment/",
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
  };

  useEffect(() => {
    if (remainingTime > 0) {
      const interval = setInterval(() => {
        setRemainingTime((prevTime) => Math.max(prevTime - 1, 0));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [remainingTime]);

  useEffect(() => {
    const disableRightClick = (e) => {
      e.preventDefault();
    };

    const disableTextSelection = (e) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("selectstart", disableTextSelection);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("selectstart", disableTextSelection);
    };
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50" style={{ userSelect: "none" }}>
      <div className="max-w-[1800px] max-h-[1540px] mx-auto p-7 sm:p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-12">
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <Header duration={remainingTime} />
          </div>
          <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-[750px] mt-7">
            <div className="flex-grow">
              <Question
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
            <div className="lg:w-80">
              <div className="sticky top-6">
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
        <div className="fixed inset-0 pointer-events-none z-[5] flex items-center justify-center">
          <div className="transform -rotate-45 text-gray-200 text-[72px] font-bold opacity-30">
            SNSGROUPS
          </div>
        </div>
        <div className="fixed inset-0 pointer-events-none z-[5] flex items-center justify-center">
          <div className="transform rotate-45 text-gray-200 text-[72px] font-bold opacity-30">
            SNSGROUPS
          </div>
        </div>
        {showWarningModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">
                Warning #{fullscreenWarnings}
              </h3>
              <p className="text-gray-600 text-center mb-6">
                You have exited fullscreen mode. Please return to fullscreen to continue the test.
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
                Are you sure you want to submit your assessment? This action cannot be undone.
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
                  {isSubmitting ? 'Submitting...' : 'Confirm Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

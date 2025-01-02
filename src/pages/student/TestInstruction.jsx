import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import assessmentIllustration from '../../assets/testinstruction.png';

const TestInstructions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { contestId } = useParams();
  const { assessment_type } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [mcqTests, setMcqTests] = useState([]);

  // Coding Assessment API function
  const start_codingTest = async (contestId, studentId) => {
    try {
      const startTestResponse = await axios.post('https://render-frontend-f05v.onrender.com/api/start_test/', {
        contest_id: contestId,
        student_id: studentId,
      });

      console.log("Fetched from start_test API:", startTestResponse.data.message);

      const saveReportResponse = await axios.post('https://render-frontend-f05v.onrender.com/api/save_coding_report/', {
        contest_id: contestId,
        student_id: studentId,
      });

      console.log("Fetched from save_contest_report API:", saveReportResponse.data.message);

    } catch (error) {
      console.error("Error during API calls:", error);
      throw error;
    }
  };

  // MCQ Assessment API function
  const start_mcqTest = async (contestId, studentId) => {
    try {
      const response = await axios.post('https://render-frontend-f05v.onrender.com/api/start_mcqtest/', {
        contest_id: contestId,
        student_id: studentId,
      });
      console.log("Fetched from API:", response.data.message);
    } catch (error) {
      console.error("Error starting test:", error);
      throw error;
    }
  };

  const fetchMcqTests = async (regno) => {
    try {
      const response = await axios.get(`https://render-frontend-f05v.onrender.com/api/student/mcq-tests?regno=${regno}`, {
        withCredentials: true,
      });

      const formattedTests = response.data.map((test) => {
        const { hours, minutes } = test.testConfiguration.duration;
        const duration = (parseInt(hours) * 3600) + (parseInt(minutes) * 60);
        const fullScreenMode = test.testConfiguration.fullScreenMode;
        const faceDetection = test.testConfiguration.faceDetection;
        const passPercentage = test.testConfiguration.passPercentage;

        localStorage.setItem(`testDuration_${test._id}`, duration);
        localStorage.setItem(`fullScreenMode_${test._id}`, fullScreenMode);
        localStorage.setItem(`faceDetection_${test._id}`, faceDetection);

        return {
          testId: test._id,
          name: test.assessmentOverview?.name || "Unknown Test",
          description: test.assessmentOverview?.description || "No description available.",
          starttime: test.assessmentOverview?.registrationStart || "No Time",
          endtime: test.assessmentOverview?.registrationEnd || "No Time",
          questions: parseInt(test.testConfiguration?.questions, 10) || 0,
          duration: `${hours} hours ${minutes} minutes`,
          passPercentage: passPercentage,
          assessment_type: "mcq",
          status: test.status,
          fullScreenMode: test.testConfiguration.fullScreenMode,
          faceDetection: test.testConfiguration.faceDetection,
          deviceRestriction: test.testConfiguration.deviceRestriction,
          noiseDetection: test.testConfiguration.noiseDetection,
          guidelines: test.assessmentOverview?.guidelines || "No guidelines available.",
        };
      });

      return formattedTests;
    } catch (error) {
      console.error("Error fetching MCQ tests:", error);
      return [];
    }
  };

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    if (studentId && contestId) {
      localStorage.setItem("contestState", JSON.stringify({ contest_id: contestId, student_id: studentId }));

      const fetchTests = async () => {
        const tests = await fetchMcqTests(studentId);
        setMcqTests(tests);
      };

      fetchTests();
    }
  }, [contestId]);

  const handleStartTest = async () => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) {
      alert("Student ID not found. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      if (assessment_type === "coding") {
        await start_codingTest(contestId, studentId);
        navigate(`/coding/${contestId}`, {
          state: { contest_id: contestId, student_id: studentId }
        });
      } else if (assessment_type === "mcq") {
        await start_mcqTest(contestId, studentId);
        navigate(`/mcq/${contestId}`, {
          state: { contest_id: contestId, student_id: studentId }
        });
      }
    } catch (error) {
      console.error("Error starting test:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentTest = mcqTests.find(test => test.testId === contestId);

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="max-w-[1920px] mx-auto">
        <div className="space-y-6">
        <div className="bg-white rounded-lg p-10 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12 mb-10">
      {/* Left Column - Image */}
      <div className="lg:w-1/4 mb-6 lg:mb-0 pt-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <img
            src={assessmentIllustration}
            alt="Assessment illustration"
            className="w-full rounded-lg object-cover h-96"
          />
        </div>
      </div>
      {/* Right Column - Content */}
      <div className="lg:flex-1 pt-4 h-fit overflow-y-auto">
        {/* Test Title and Description */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-6">
            {currentTest?.name || "Test Name"}
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            {currentTest?.description || 
             "Embark on a journey to sharpen your analytical thinking and problem-solving skills with our course."}
          </p>
          
          {/* Test Details Title */}
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            Test Details
          </h2>
        </div>
        {/* Test Details Grid - Modified to always show 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          {/* Duration */}
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="text-gray-600 mb-3 text-lg font-medium">
              Duration
            </h3>
            <p className="font-semibold text-xl">
              {currentTest?.duration || "0 Hour"}
            </p>
          </div>
          {/* Questions */}
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="text-gray-600 mb-3 text-lg font-medium">
              Questions
            </h3>
            <p className="font-semibold text-xl">
              {currentTest?.questions || "0"}
            </p>
          </div>
          {/* Pass Percentage */}
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="text-gray-600 mb-3 text-lg font-medium">
              Pass Percentage
            </h3>
            <p className="font-semibold text-xl">
              {currentTest?.passPercentage || "0"}%
            </p>
          </div>
          {/* Sections */}
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="text-gray-600 mb-3 text-lg font-medium">
              Sections
            </h3>
            <p className="font-semibold text-xl">
              {currentTest?.sections || "0"}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

          {/* Registration Dates */}
          <div className="bg-white rounded-lg p-10 shadow-lg">
            <h2 className="text-3xl font-bold text-blue-900 mb-8">Registration Period</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-6 bg-blue-50 rounded-lg">
                <h3 className="text-gray-600 mb-3 text-lg">Start Date</h3>
                <p className="font-semibold text-xl">{currentTest?.starttime || "23 AUG 2023 Time: 7 PM"}</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-lg">
                <h3 className="text-gray-600 mb-3 text-lg">End Date</h3>
                <p className="font-semibold text-xl">{currentTest?.endtime || "24 AUG 2023 Time: 7 PM"}</p>
              </div>
            </div>
          </div>

          {/* Test Settings */}
          {/* <div className="bg-white rounded-lg p-10 shadow-lg">
            <h2 className="text-3xl font-bold text-blue-900 mb-8">Test Settings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <h3 className="text-2xl font-semibold mb-6">Proctoring Features</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="text-lg">Face Detection</span>
                    <div className="w-14 h-7 bg-yellow-400 rounded-full relative">
                      <div className={`absolute right-1 top-1 w-5 h-5 bg-white rounded-full transition-transform ${currentTest?.faceDetection ? 'translate-x-7' : ''}`}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="text-lg">Noise Detection</span>
                    <div className="w-14 h-7 bg-yellow-400 rounded-full relative">
                      <div className={`absolute right-1 top-1 w-5 h-5 bg-white rounded-full transition-transform ${currentTest?.noiseDetection ? 'translate-x-7' : ''}`}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="text-lg">Full Screen Mode</span>
                    <div className="w-14 h-7 bg-yellow-400 rounded-full relative">
                      <div className={`absolute right-1 top-1 w-5 h-5 bg-white rounded-full transition-transform ${currentTest?.fullScreenMode ? 'translate-x-7' : ''}`}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="text-lg">Mobile Access Restriction</span>
                    <div className="w-14 h-7 bg-yellow-400 rounded-full relative">
                      <div className={`absolute right-1 top-1 w-5 h-5 bg-white rounded-full transition-transform ${currentTest?.deviceRestriction ? 'translate-x-7' : ''}`}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-6">Test Rules</h3>
                <div className="space-y-4">
                  <p className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg text-lg">
                    <span className="text-green-500 text-2xl">✓</span>
                    Immediate Result Release
                  </p>
                  <p className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg text-lg">
                    <span className="text-green-500 text-2xl">✓</span>
                    Complete Test Duration Required
                  </p>
                  <p className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg text-lg">
                    <span className="text-green-500 text-2xl">✓</span>
                    Minimum Pass Percentage: 50%
                  </p>
                  <p className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg text-lg">
                    <span className="text-green-500 text-2xl">✓</span>
                    Section-wise Timer Enabled
                  </p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Instructions */}
          <div className="bg-white rounded-lg p-10 shadow-lg">
            <h2 className="text-3xl font-bold text-blue-900 mb-8">Test Instructions</h2>
            <div className="space-y-6">
              <p className="text-gray-600 text-lg">Please read the following instructions carefully before starting the test:</p>
              <ul className="list-disc pl-8 space-y-3 text-gray-700 text-lg">
                <li>Questions: {currentTest?.questions || "30"} questions, 1 mark each.</li>
                <li>Duration: {currentTest?.duration || "45"} minutes.</li>
                <li>Device: Use a stable internet connection on a laptop or suitable device (iPhones not recommended).</li>
                <li>Submission: Click "Submit" after each question.</li>
                <li>Fair Play: Unfair practices, including plagiarism, result in disqualification.</li>
              </ul>
            </div>

            {/* Start Button */}
            <div className="mt-10">
              <button
                onClick={handleStartTest}
                disabled={loading}
                className="px-10 py-4 bg-yellow-400 text-black rounded-full font-semibold text-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Start Test'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestInstructions;
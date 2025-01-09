import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import assessmentIllustration from '../../assets/testinstruction.jpg';
import { FaCheckCircle, FaTimesCircle, FaUserCheck, FaMicrophoneSlash, FaExpand, FaMobile } from 'react-icons/fa'; // Importing new icons

const TestInstructions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { contestId } = useParams();
  const { assessment_type } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [mcqTests, setMcqTests] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

  // Coding Assessment API function
  const start_codingTest = async (contestId, studentId) => {
    try {
      const startTestResponse = await axios.post(`${API_BASE_URL }/api/start_test/`, {
        contest_id: contestId,
        student_id: studentId,
      });

      console.log("Fetched from start_test API:", startTestResponse.data.message);

      const saveReportResponse = await axios.post(`${API_BASE_URL }/api/save_coding_report/`, {
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
      const response = await axios.post(`${API_BASE_URL }/api/start_mcqtest/`, {
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
      const response = await axios.get(`${API_BASE_URL }/api/student/mcq-tests?regno=${regno}`, {
        withCredentials: true,
      });

      const formattedTests = response.data.map((test) => {
        const { hours = 0, minutes = 0 } = test.testConfiguration?.duration || {};
        const duration = (parseInt(hours) * 3600) + (parseInt(minutes) * 60);
        const fullScreenMode = test.testConfiguration?.fullScreenMode || false;
        const faceDetection = test.testConfiguration?.faceDetection || false;
        const passPercentage = test.testConfiguration?.passPercentage || 0;
      
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
          fullScreenMode,
          faceDetection,
          deviceRestriction: test.testConfiguration?.deviceRestriction || false,
          noiseDetection: test.testConfiguration?.noiseDetection || false,
          guidelines: test.assessmentOverview?.guidelines || "No guidelines available.",
          resultVisibility: test.testConfiguration?.resultVisibility || "Host Control",
          shuffleQuestions: test.testConfiguration?.shuffleQuestions || false,
          shuffleOptions: test.testConfiguration?.shuffleOptions || false,
        };
      });
      

      return formattedTests;
    } catch (err) {
      if (err.response?.status === 401) {
        // Redirect to login if unauthorized
        navigate("/studentlogin");
      } else {
        console.error("Failed to fetch test details");
        console.error("Error fetching test details:", err);
      }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString(undefined, options);
  };

  const currentTest = mcqTests.find(test => test.testId === contestId);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-[1920px] mx-auto">
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 md:p-10 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12 mb-10">
              {/* Left Column - Image */}
              <div className="lg:w-1/4 mb-6 lg:mb-0 pt-4">
                <div className="bg-[#facc15] rounded-lg p-4">
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
                  <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">
                    {currentTest?.name || "Test Name"}
                  </h1>
                  <p className="text-gray-600 text-lg mb-6">
                    {currentTest?.description ||
                    "Embark on a journey to sharpen your analytical thinking and problem-solving skills with our course."}
                  </p>

                  {/* Test Details Title */}
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                    Test Details
                  </h2>
                </div>
                {/* Test Details Grid - Modified to always show 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                  {/* Duration */}
                  <div className="p-6 bg-gray-100 rounded-lg">
                    <h3 className="text-gray-600 mb-3 text-lg font-medium">
                      Duration
                    </h3>
                    <p className="font-semibold text-xl">
                      {currentTest?.duration || "0 Hour"}
                    </p>
                  </div>
                  {/* Questions */}
                  <div className="p-6 bg-gray-100 rounded-lg">
                    <h3 className="text-gray-600 mb-3 text-lg font-medium">
                      Questions
                    </h3>
                    <p className="font-semibold text-xl">
                      {currentTest?.questions || "0"}
                    </p>
                  </div>
                  {/* Pass Percentage */}
                  <div className="p-6 bg-gray-100 rounded-lg">
                    <h3 className="text-gray-600 mb-3 text-lg font-medium">
                      Pass Percentage
                    </h3>
                    <p className="font-semibold text-xl">
                      {currentTest?.passPercentage || "0"}%
                    </p>
                  </div>
                  {/* Sections */}
                  <div className="p-6 bg-gray-100 rounded-lg">
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
          <div className="bg-white rounded-lg p-6 md:p-10 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Registration Period</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-6 bg-gray-100 rounded-lg">
                <h3 className="text-gray-600 mb-3 text-lg">Start Date</h3>
                <p className="font-semibold text-xl">{formatDate(currentTest?.starttime) || "23 AUG 2023 Time: 7 PM"}</p>
              </div>
              <div className="p-6 bg-gray-100 rounded-lg">
                <h3 className="text-gray-600 mb-3 text-lg">End Date</h3>
                <p className="font-semibold text-xl">{formatDate(currentTest?.endtime) || "24 AUG 2023 Time: 7 PM"}</p>
              </div>
            </div>
          </div>

          {/* Test Settings */}
          <div className="bg-white rounded-lg p-6 md:p-10 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Test Settings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <h3 className="text-xl md:text-2xl font-semibold mb-6">Proctoring Features</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                    <span className="text-lg">Face Detection</span>
                    {currentTest?.faceDetection ? <FaCheckCircle className="text-green-500 text-2xl" /> : <FaTimesCircle className="text-red-500 text-2xl" />}
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                    <span className="text-lg">Noise Detection</span>
                    {currentTest?.noiseDetection ? <FaCheckCircle className="text-green-500 text-2xl" /> : <FaTimesCircle className="text-red-500 text-2xl" />}
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                    <span className="text-lg">Full Screen Mode</span>
                    {currentTest?.fullScreenMode ? <FaCheckCircle className="text-green-500 text-2xl" /> : <FaTimesCircle className="text-red-500 text-2xl" />}
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                    <span className="text-lg">Mobile Access Restriction</span>
                    {currentTest?.deviceRestriction ? <FaCheckCircle className="text-green-500 text-2xl" /> : <FaTimesCircle className="text-red-500 text-2xl" />}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-semibold mb-6">Test Rules</h3>
                <div className="space-y-4">
                  <p className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg text-lg">
                    <span className="text-gray-700 text-2xl">•</span>
                    {currentTest?.resultVisibility === "Host Control" ? "Host will release the result" : "Immediately result will release"}
                  </p>

                  <p className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg text-lg">
                    <span className="text-gray-700 text-2xl">•</span>
                    Minimum Pass Percentage: {currentTest?.passPercentage || "50"}%
                  </p>
                  <p className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg text-lg">
                    <span className="text-gray-700 text-2xl">•</span>
                    {currentTest?.shuffleQuestions ? "The questions will be shuffled" : "The questions will not be shuffled"}
                  </p>
                  <p className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg text-lg">
                    <span className="text-gray-700 text-2xl">•</span>
                    {currentTest?.shuffleOptions ? "The options will be shuffled" : "The options will not be shuffled"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg p-6 md:p-10 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Test Instructions</h2>
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
            <div className="mt-10 flex justify-end">
              <button
                onClick={handleStartTest}
                disabled={loading}
                className="px-10 py-4 bg-[#facc15] text-black rounded-full font-semibold text-lg hover:bg-[#e5b810] transition-colors disabled:opacity-50"
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

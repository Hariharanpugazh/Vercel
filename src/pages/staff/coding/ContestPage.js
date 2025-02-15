import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TestCaseSelection from "../../../components/staff/coding/TestCaseSelection";
import ProblemDetails from "../../../components/staff/coding/ProblemDetails";
import ExampleTestCase from "../../../components/staff/coding/ExampleTestCase";
import CodeEditor from "../../../components/staff/coding/CodeEditor";
import Buttons from "../../../components/staff/coding/Buttons";
import TestcaseResults from "../../../components/staff/coding/TestcaseResults";

function ContestPage() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  // const location = useLocation();
  // const { assessment_type } = location.state || {};
  const duration = parseInt(localStorage.getItem(`testDuration_${contestId}`), 10) || 0;
  const fullScreenMode = JSON.parse(localStorage.getItem(`fullScreenMode_${contestId}`));
  const faceDetection = JSON.parse(localStorage.getItem(`faceDetection_${contestId}`));
  const [selectedProblemId, setSelectedProblemId] = useState(1);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [testResults, setTestResults] = useState(null);
  const [submitSummary, setSubmitSummary] = useState(null);
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const mediaStreamRef = useRef(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';
  const [setTestEvaluations] = useState([]);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setTimerExpired(true);
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

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch('/json/questions.json');
        const data = await response.json();
        setProblems(data.problems);

        const savedSubmissions = localStorage.getItem('contestSubmissions');
        if (savedSubmissions) {
          setSubmissions(JSON.parse(savedSubmissions));
        } else {
          const initialSubmissions = {};
          data.problems.forEach(problem => {
            initialSubmissions[problem.id] = {
              submitted: false,
              result: null,
              evaluations: []
            };
          });
          setSubmissions(initialSubmissions);
          localStorage.setItem('contestSubmissions', JSON.stringify(initialSubmissions));
        }
      } catch (error) {
        console.error("Error loading problems:", error);
      }
    };

    fetchProblems();
  }, []);

  useEffect(() => {
    const setDefaultCodeStructure = () => {
      let defaultCode = "";
      switch (language) {
        case "python":
          defaultCode = `def main():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    main()`;
          break;
        case "javascript":
          defaultCode = `function main() {\n    // Write your code here\n}\n\nmain();`;
          break;
        default:
          defaultCode = "// Start coding here";
      }
      setCode(defaultCode);
    };

    const goFullScreen = async () => {
      try {
        if (fullScreenMode) {
          const docElm = document.documentElement;
          if (docElm.requestFullscreen) {
            await docElm.requestFullscreen();
          } else if (docElm.mozRequestFullScreen) {
            await docElm.mozRequestFullScreen();
          } else if (docElm.webkitRequestFullScreen) {
            await docElm.webkitRequestFullScreen();
          } else if (docElm.msRequestFullscreen) {
            await docElm.msRequestFullscreen();
          }
        }
      } catch (error) {
        console.error("Error entering fullscreen mode:", error);
      }
    };

    const requestMediaAccess = async () => {
      try {
        if (faceDetection) {
          console.log("Requesting media access...");
          mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          console.log("Media stream obtained:", mediaStreamRef.current);
        }
      } catch (error) {
        if (error.name === "NotAllowedError") {
          alert("Please allow access to camera and microphone to proceed.");
        } else if (error.name === "NotFoundError") {
          alert("No media devices found. Please connect a camera or microphone.");
        } else {
          console.error("Error accessing media devices:", error);
          alert(`An unexpected error occurred: ${error.message}.`);
        }
      }
    };

    setDefaultCodeStructure();
    goFullScreen();
    requestMediaAccess();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [language, fullScreenMode, faceDetection]);

  const handleProblemSelect = (problemId) => {
    setSelectedProblemId(problemId);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const evaluateResults = (results) => {
    return results.map((result) => {
      const normalize = (str) =>
        typeof str === "string" ? str.trim().replace(/\s+/g, " ").toLowerCase() : "";
      const stdout = normalize(result.stdout);
      const expectedOutput = normalize(result.expected_output.toString());
      return stdout === expectedOutput ? "Success" : "Failure";
    });
  };

  const handleCompileAndRun = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/compile/`, {
        user_code: code,
        language: language,
        problem_id: selectedProblemId,
      });
      setTestResults(response.data.results);

      const evaluations = evaluateResults(response.data.results);
      setTestEvaluations(evaluations);

      setSubmitSummary(null);
    } catch (error) {
      console.error("Error during compile and run:", error);
      alert("There was an error running your code. Please try again.");
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/submit/`, {
        user_code: code,
        language: language,
        problem_id: selectedProblemId,
      });

      const results = response.data.results;
      const evaluations = evaluateResults(results);
      setTestEvaluations(evaluations);

      const passedCount = results.filter((result, index) => evaluations[index] === "Success").length;
      const failedCount = results.length - passedCount;
      const isCorrect = failedCount === 0;

      const updatedSubmissions = {
        ...submissions,
        [selectedProblemId]: {
          submitted: true,
          result: isCorrect ? "Correct" : "Wrong",
          evaluations: evaluations
        }
      };
      setSubmissions(updatedSubmissions);
      localStorage.setItem('contestSubmissions', JSON.stringify(updatedSubmissions));

      setSubmitSummary({
        passed: passedCount,
        failed: failedCount > 0 ? failedCount : null,
      });
      setTestResults(null);
    } catch (error) {
      console.error("Error during submission:", error);
      alert("There was an error submitting your code. Please try again.");
    }
  };

  const handleFinish = async () => {
    try {
      // Map problem IDs to titles
      const idToTitleMap = problems.reduce((map, problem) => {
        map[problem.id] = problem.title;
        return map;
      }, {});
  
      // Transform submissions with titles instead of IDs
      const results = Object.entries(submissions).map(([problemId, data]) => ({
        title: idToTitleMap[parseInt(problemId)],
        ...data,
      }));
  
      const studentId = localStorage.getItem("studentId");
      const payload = {
        contest_id: contestId,
        student_id: studentId,
        results: results,
      };
  
      await axios.post(`${API_BASE_URL}/api/finish_test/`, payload);
  
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      localStorage.removeItem("contestSubmissions");
  
      navigate("/studentdashboard");
    } catch (error) {
      console.error("Error finishing test:", error);
      alert("An error occurred while finishing the test. Please try again.");
    }
  };
  

  const allProblemsSubmitted = problems.length > 0 &&
    problems.every(problem => submissions[problem.id]?.submitted);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Contest Page</h1>
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 text-[#000975]">⏰</span>
          <div>
            <div className="text-[#000975] font-medium">
              {formatTime(timeLeft)}
            </div>
            <div className="text-[#000975] text-xs">Time Left</div>
          </div>
        </div>
      </div>
      {timerExpired && (
        <div className="text-red-600 font-bold mb-4">
          Time's up! You can no longer submit answers.
        </div>
      )}
      <div className="flex">
        <div className="w-1/2 p-4">
          <TestCaseSelection
            selectedProblem={selectedProblemId}
            onSelectProblem={handleProblemSelect}
            submissions={submissions}
          />
          <ProblemDetails selectedProblemId={selectedProblemId} />
          <ExampleTestCase />
        </div>
        <div className="w-1/2 p-4">
          <CodeEditor
            language={language}
            setLanguage={setLanguage}
            code={code}
            setCode={handleCodeChange}
          />
          <Buttons onCompile={handleCompileAndRun} onSubmit={handleSubmit} />
          <button
            className={`${
              allProblemsSubmitted
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-gray-400 cursor-not-allowed'
            } text-white font-bold py-2 px-4 rounded mt-4`}
            onClick={handleFinish}
            disabled={!allProblemsSubmitted || timerExpired}
          >
            {allProblemsSubmitted ? 'Finish' : 'Submit all problems to finish'}
          </button>
        </div>
      </div>
      <div className="mt-6">
        {submitSummary ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Submission Summary</h2>
            <h3 className="text-lg font-semibold mb-2">Hidden Test Case Results</h3>
            <div className="flex justify-normal items-center">
              <p className="text-green-600 font-medium">Passed: {submitSummary.passed}</p>
              {submitSummary.failed && (
                <p className="text-red-600 font-medium ml-4">Failed: {submitSummary.failed}</p>
              )}
            </div>
          </div>
        ) : (
          <TestcaseResults results={testResults} />
        )}
      </div>
    </div>
  );
}

export default ContestPage;

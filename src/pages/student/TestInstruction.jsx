import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import image from '../../assets/test_view_hero_img.png';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Navbar from "./Navbar";
import { CiCalendar } from "react-icons/ci";
import { MdAccessTime } from "react-icons/md";
import { LuFileQuestion } from "react-icons/lu";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { Skeleton } from '@mui/material'
import { MdOutlinePublish } from "react-icons/md";

const TestInstructions = () => {
  const [testDetails, setTestDetails] = useState(() => {
    const storedDetails = localStorage.getItem("testDetails");
    return storedDetails ? JSON.parse(storedDetails) : {};
  });

  const [currentTest, setCurrentTest] = useState(() => {
    const storedCurrentTest = localStorage.getItem("currentTest");
    return storedCurrentTest ? JSON.parse(storedCurrentTest) : null;
  });

  const [sections, setSections] = useState()
  const [guidelines, setGuidelines] = useState('')



  const navigate = useNavigate();
  const location = useLocation();
  const { contestId } = useParams();
  const { assessment_type } = location.state || {};
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  const student_details = [
    { name: "John Doe", status: "Yet to Complete" },
    { name: "Jane Doe", status: "Completed" },
    { name: "Alex Smith", status: "Completed" },
  ];

  // const sections = [
  //   { sectionName: "Math", numQuestions: 10 },
  //   { sectionName: "Science", numQuestions: 15 },
  // ];

  const testConfiguration = {
    questions: 25,
    // totalMarks: 100,
    fullScreenMode: true,
    faceDetection: false,
    deviceRestriction: true,
    noiseDetection: false,
  };

  useEffect(() => {
    const fetchSectionDetails = async () => {
      if (!contestId) return; // Ensure contestId is provided before making the request
      try {
        const response = await fetch(`http://localhost:8000/api/student/student_section_details/${contestId}/`);
        const data = await response.json();
        if (data.sections) {
          setSections(data.sections);
          setGuidelines(data.guidelines);
        }
      } catch (error) {
        console.error("Error fetching section details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSectionDetails();
  }, [contestId]);


  // Add cleanup function for navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Cancel the event
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = '';
    };

    // Add event listener for beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Clear navigation state when component unmounts
      if (window.history.state) {
        window.history.replaceState(null, '');
      }
    };
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event) => {
      if (!loading) {
        // If we're not in the middle of loading, allow navigation
        navigate(-1);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [loading, navigate]);

  // Rest of your existing code remains the same...

  const start_codingTest = async (contestId, studentId) => {
    try {
      const startTestResponse = await axios.post(`${API_BASE_URL}/api/start_test/`, {
        contest_id: contestId,
        student_id: studentId,
      });

      console.log("Fetched from start_test API:", startTestResponse.data.message);

      const saveReportResponse = await axios.post(`${API_BASE_URL}/api/save_coding_report/`, {
        contest_id: contestId,
        student_id: studentId,
      });

      console.log("Fetched from save_contest_report API:", saveReportResponse.data.message);

    } catch (error) {
      console.error("Error during API calls:", error);
      throw error;
    }
  };

  const start_mcqTest = async (contestId, studentId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/start_mcqtest/`, {
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
      const response = await axios.get(`${API_BASE_URL}/api/student/mcq-tests?regno=${regno}`, {
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
          sectionDetails: test.assessmentOverview?.sectionDetails || "No",
          totalMarks: test.testConfiguration?.totalMarks || '0',
          noOfSections: test.no_of_section || 'None',
          sectionName: test.sections?.sectionName || 'None',
        };
      });

      return formattedTests;
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/studentlogin");
      } else {
        console.error("Failed to fetch test details");
        console.error("Error fetching test details:", err);
      }
    }
  };

  useEffect(() => {
    if (testDetails) {
      localStorage.setItem("testDetails", JSON.stringify(testDetails));
    }
    if (currentTest) {
      localStorage.setItem("currentTest", JSON.stringify(currentTest));
    }
  }, [testDetails, currentTest]);

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    const fetchAndSetTestDetails = async () => {
      if (!studentId || !contestId) {
        console.error("Student ID or Contest ID is missing!");
        return;
      }

      try {
        const response = await fetchMcqTests(studentId);
        if (response && response.length > 0) {
          const parsedDetails = response.reduce((acc, test) => {
            acc[test.testId] = test;
            return acc;
          }, {});

          setTestDetails(parsedDetails);
          localStorage.setItem("testDetails", JSON.stringify(parsedDetails));

          if (parsedDetails[contestId]) {
            setCurrentTest(parsedDetails[contestId]);
          } else {
            console.error("Contest ID not found in test details!");
          }
        } else {
          console.error("No test details found for the student!");
        }
      } catch (error) {
        console.error("Error fetching test details:", error);
      }
    };

    fetchAndSetTestDetails();
  }, [contestId]);

  const handleStartTest = async () => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) {
      alert("Student ID not found. Please log in again.");
      return;
    }

    if (!currentTest) {
      alert("Test details not found. Please try again later.");
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
        if (currentTest.sectionDetails === "Yes") {
          navigate(`/section-based-mcq/${contestId}`, {
            state: { formData: { assessmentOverview: { sectionDetails: "Yes" } } }
          });
        } else {
          await start_mcqTest(contestId, studentId);
          navigate(`/mcq/${contestId}`, {
            state: { contest_id: contestId, student_id: studentId }
          });
        }
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

  return (
    <div className="min-h-screen  bg-[#f4f6ff86]">
      <Navbar />
      <div className=" px-20 rounded-2xl">
        <div className="w-full p-8 text-lg">
          <section className="flex p-6 shadow-sm flex-1 bg-white mb-6 rounded-lg text-[#111933] items-start">
            <div className="flex-1 p-2 flex flex-col mr-12 justify-between">
              <div className="mb-6">
                <p className="text-2xl font-semibold mb-2">
                  {currentTest?.name || "Test Name"}
                </p>
                <p className="text-sm text-black break-words text-justify">
                  {currentTest?.description || "No description available."}
                </p>
              </div>

              <div className="mt-4 border-2 rounded-lg">
  <table className="min-w-full bg-white rounded-lg overflow-hidden">
    <thead className="bg-[#111933] text-white">
      <tr>
        {[
          "Registration Start",
          "Total Duration",
          "Assessment Type",
          "Registration End",
        ].map((title, index) => (
          <th
            key={index}
            className={`relative font-normal py-2 px-6 text-center ${
              index === 0 ? "rounded-tl-lg" : index === 3 ? "rounded-tr-lg" : ""
            }`}
          >
            {title}
            {index !== 0 && (
              <span
                className="absolute top-1/2 -translate-y-1/2 left-0 h-3/4 w-[1px] bg-gray-200"
                style={{
                  marginTop: "0.001rem",
                  marginBottom: "2rem",
                }}
              ></span>
            )}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-gray-300 hover:bg-gray-100">
        <td className="py-3 px-6 text-center">
          {formatDate(currentTest?.starttime) || "23 AUG 2023 Time: 7 PM"}
        </td>
        
        {/* Total Duration - Show total if sections exist, else show test duration */}
        <td className="py-3 px-6 text-center">
        {sections && sections.length > 0
    ? (() => {
        const totalMinutes = sections.reduce(
          (acc, section) => acc + (section.duration || 0),
          0
        );
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours} hours ${minutes} minutes`;
      })()
            : currentTest?.duration || "0"}
        </td>

        <td className="py-3 px-6 text-center">
          {currentTest?.assessment_type?.toUpperCase() || "N/A"}
        </td>
        <td className="py-3 px-6 text-center">
          {formatDate(currentTest?.endtime) || "23 AUG 2023 Time: 7 PM"}
        </td>
      </tr>
    </tbody>
  </table>
</div>

            </div>

            <img
              src={image}
              alt="test_instruction_img"
              className="w-[200px] ml-1 lg:w-[250px]"
            />
          </section>

          <section className="flex space-x-6 flex-1 mb-6">
            {/* <div className="flex-1 flex flex-col items-center bg-white text-[#111933] border border-gray-300 rounded-xl shadow-md">
              <p className="bg-[#111933] rounded-t-xl py-3 text-[#ffffff] text-lg font-medium w-full text-center">
                Progress Details
              </p>
              <div className="flex flex-col w-full">
                <div className="grid grid-cols-2  border-b border-gray-300 p-2">
                  <p className="p-2 border-r border-gray-300 font-medium text-center">Assigned</p>
                  {loading ? (
                    <Skeleton variant="text" width={50} height={20} />
                  ) : (
                    <p className="p-2 text-center">{student_details.length}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 border-b border-gray-300 p-2">
                  <p className="p-2 border-r border-gray-300 font-medium text-center ">Yet to Complete</p>
                  {loading ? (
                    <Skeleton variant="text" width={50} height={20} />
                  ) : (
                    <p className="p-2 text-center">{student_details.filter(student => student.status === 'Yet to Complete').length}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 p-2">
                  <p className="p-2 border-r border-gray-300 font-medium text-center">Completed</p>
                  {loading ? (
                    <Skeleton variant="text" width={50} height={20} />
                  ) : (
                    <p className="p-2 text-center">{student_details.filter(student => student.status === 'Completed').length}</p>
                  )}
                </div>
              </div>
            </div> */}


<div className="flex-1 flex flex-col items-center bg-white text-[#111933] border border-gray-300 rounded-xl shadow-md">
  <p className="bg-[#111933] rounded-t-xl py-3 text-[#ffffff] text-lg font-medium w-full text-center">
    Progress Details
  </p>
  <div className="flex flex-1 flex-col w-full">
    {/* No. of Questions */}
    <div className="flex-1 items-center grid grid-cols-2 border-b border-gray-300 p-2">
      <p className="p-2 border-r border-gray-300 font-medium text-center">No. of Questions</p>
      {loading ? (
        <Skeleton variant="text" width={50} height={20} />
      ) : (
        <>
        <p className='p-2 text-center'>
          {sections && sections.length > 0
            ? sections.reduce((total, section) => total + Number(section.numQuestions || 0), 0)
            : currentTest?.questions || 0}
            </p>
        </>
      )}
    </div>
    <div className="flex-1 items-center grid grid-cols-2 border-b border-gray-300 p-2">
  <p className="p-2 border-r border-gray-300 font-medium text-center">Marks per Question</p>
  {loading ? (
    <Skeleton variant="text" width={50} height={20} />
  ) : (
    <p className="p-2 text-center">
      {sections && sections.length > 0
        ? "1"
        : currentTest?.questions && currentTest?.totalMarks
        ? (currentTest.totalMarks / currentTest.questions).toFixed(0)
        : "0"}
    </p>
  )}
</div>


    {/* No. of Sections */}
    <div className="flex-1 items-center grid grid-cols-2 border-b border-gray-300 p-2">
      <p className="p-2 border-r border-gray-300 font-medium text-center">No. of Sections</p>
      {loading ? (
        <Skeleton variant="text" width={50} height={20} />
      ) : (
        <p className="p-2 text-center">{currentTest?.noOfSections || 0}</p>
      )}
    </div>

    {/* Total Marks */}
    <div className="flex-1 items-center grid grid-cols-2 p-2">
      <p className="p-2 border-r border-gray-300 font-medium text-center">Total Marks</p>
      {loading ? (
        <Skeleton variant="text" width={50} height={20} />
      ) : (
        <p className="p-2 text-center">
        {sections && sections.length > 0
          ? sections.reduce((total, section) => total + Number(section.numQuestions || 0), 0)
          : currentTest?.totalMarks || 0}
      </p>
      )}
    </div>
    
  </div>
</div>



            <div className="flex-1 flex flex-col items-center bg-white text-[#111933] border border-gray-300 rounded-xl shadow-md">
              <p className="bg-[#111933] rounded-t-xl py-3 text-[#ffffff] text-lg font-medium w-full text-center">
                Sections & Questions
              </p>
              <div className="w-full">
                <div className="grid grid-cols-2 border-b border-gray-300 p-2">
                  <p className="p-2 border-r border-gray-300 font-medium text-center">Sections</p>
                  <p className="p-2 text-center font-medium">Questions</p>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <Skeleton variant="rectangular" width="100%" height={100} />
                  </div>
                ) : (
                  (sections ?? []).length === 0 ? (
                    <div className="flex items-center justify-center p-4">
                      <p className="text-center font-semibold">!! No Sections here to Display !!</p>
                    </div>
                  ) : (
                    <>
                      {sections?.map((section, index) => (
                        <div key={index} className="grid grid-cols-2 border-b border-gray-300 p-2">
                          <p className="p-2 border-r border-gray-300 text-center flex items-center justify-center">{section.name}</p>
                          <p className="p-2 text-center flex items-center justify-center">{section.numQuestions}</p>
                        </div>
                      ))}
                      <div className="grid grid-cols-2 p-2 border-t border-gray-300">
                        <p className="p-2 border-r border-gray-300 text-center font-medium">Total</p>
                        <p className="p-2 text-center font-medium">
                          {sections.reduce((total, section) => total + Number(section.numQuestions || 0), 0)}
                        </p>
                      </div>
                    </>
                  )
                )}
              </div>
            </div>


            <div className="flex-1 flex flex-col text-center bg-white text-[#111933] border-[1px] border-gray-200 rounded-md pb-2">
              <p className="bg-[#111933] rounded-tl-xl rounded-tr-xl p-2 text-[#ffffff] text-lg font-normal">
                Proctoring Enabled
              </p>
              {[
                {
                  title: "Full Screen Mode",
                  value: currentTest?.fullScreenMode
                    ? "Enabled"
                    : "Disabled",
                  enabled: currentTest?.fullScreenMode,
                  icon: "fullscreen-icon",
                },
                {
                  title: "Face Detection",
                  value: currentTest?.faceDetection
                    ? "Enabled"
                    : "Disabled",
                  enabled: currentTest?.faceDetection,
                  icon: "face-detection-icon",
                },
                {
                  title: "Device Restriction",
                  value: currentTest?.deviceRestriction
                    ? "Enabled"
                    : "Disabled",
                  enabled: currentTest?.deviceRestriction,
                  icon: "device-restriction-icon",
                },
                {
                  title: "Noise Detection",
                  value: currentTest?.noiseDetection
                    ? "Enabled"
                    : "Disabled",
                  enabled: currentTest?.noiseDetection,
                  icon: "noise-detection-icon",
                },
              ].map((configParam) => (
                <div
                  key={configParam.title}
                  className="flex flex-1 items-center justify-between p-2 w-[85%] self-center"
                >
                  <p className="text-center">{configParam.title}</p>
                  <label className="relative inline-flex items-center cursor-pointer ml-auto">
                    <input
                      type="checkbox"
                      checked={configParam.enabled}
                      disabled
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 cursor-auto bg-gray-300 rounded-full peer-focus:ring-2 peer-focus:ring-blue-900 peer-checked:bg-[#111933] transition-all duration-300 flex items-center">
                      <div
                        className={`absolute left-0.5 h-4 w-4 bg-white rounded-full shadow-md transition-transform duration-300 ${configParam.enabled ? "translate-x-5" : "translate-x-0"
                          }`}
                      ></div>
                    </div>
                  </label>
                </div>

              ))}
            </div>
          </section>


          {/* <div className='flex flex-1 items-stretch gap-6 mb-8'>
            <div className='w-4/6 bg-white p-8 rounded-3xl shadow-md'>
              <h1 className="text-[#111933] font-bold text-2xl mb-8">
                Questions & Section Details
              </h1>
              <div className='w-3/5 space-y-3'>
                <div className="flex items-center justify-between">
                  <p className='w-1/2 flex items-center font-semibold text-[#111933]'><FaRegCircleQuestion className='mr-2 text-2xl' />No. Of Questions</p>
                  <p className='w-1/2'>: {currentTest?.questions || "0"}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className='w-1/2 flex items-center font-semibold text-[#111933]'><MdAccessTime className='mr-2 text-2xl' />No. Of Sections</p>
                  <p className='w-1/2'>: {currentTest?.noOfSections}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className='w-1/2 flex items-center font-semibold text-[#111933]'><MdAccessTime className='mr-2 text-2xl' />Total Marks</p>
                  <p className='w-1/2'>: {currentTest?.totalMarks || "0"}</p>
                </div>
              </div>
            </div>
            <div className='w-2/6 bg-white rounded-3xl shadow-md text-[#111933]'>
              <table className="w-full border-collapse text-center">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="px-8 py-4 border-r border-gray-300 text-xl">Sections</th>
                    <th className="px-8 py-4 text-xl">No. Of Questions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="px-8 py-4 border-r border-gray-300">Coding Test I</td>
                    <td className="px-8 py-4">7</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="px-8 py-4 border-r border-gray-300">Coding Test I</td>
                    <td className="px-8 py-4">7</td>
                  </tr>
                  <tr className='font-semibold'>
                    <td className="px-8 py-4 border-r border-gray-300">Total</td>
                    <td className="px-8 py-4">7</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div> */}

          <div className="mb-8 bg-white shadow-md p-8 rounded-3xl">
            <div className='flex items-center'>
              <div className='w-full'>
                <h1 className="text-[#111933] font-bold text-2xl mb-4">
                  Rules & Regulations
                </h1>
                <div className="mb-8 text-md text-[#111933]">
                <p className="mb-2 ml-5 text-md text-[#111933] font-semibold">Instructions: Read carefully; contact the Department for clarifications.</p>
                  {guidelines ? (
                    <ul className="list-none list-inside space-y-2 ml-10">
                      {guidelines.split("\n").map((rule, index) => (
                        <li key={index}>{rule}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-lg font-medium">Loading guidelines...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex justify-end">
            {/* <h1 className='text-2xl absolute inset-0 z-5 flex justify-center items-center text-[#111933] font-semibold'>All The Best!</h1> */}
            <button
              onClick={handleStartTest}
              disabled={loading}
              className="px-7 p-1 rounded-lg bg-[#111933] border-[#111933] text-white border-[1px] mx-2 hover:bg-[#12204b] flex items-center z-10"
            >
              {loading ? 'Loading...' : 'Start Assessment'}
              <MdOutlinePublish className='ml-2' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestInstructions;

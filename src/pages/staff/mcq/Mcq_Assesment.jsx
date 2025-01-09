import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Popover, Transition } from "@headlessui/react";
import { FaClipboard, FaCog, FaCalendarAlt, FaEdit, FaList, FaCheckCircle, FaRandom, FaEye, FaClock, FaPercentage, FaQuestionCircle, FaDesktop, FaUser, FaMobile, FaVolumeUp } from "react-icons/fa";

const McqAssessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [contestid, setContestId] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';
  const [formData, setFormData] = useState({
    assessmentOverview: {
      name: "",
      description: "",
      registrationStart: "",
      registrationEnd: "",
      guidelines: `1. Students must join 15 minutes before the test starts.
2. Ensure a stable internet connection during the test.
3. Follow the test rules strictly.
4. Use only approved devices to attempt the test.
5. Maintain silence and avoid distractions.`,
  },
    testConfiguration: {
      totalMarks: "",
      questions: "",
      duration: { hours: '', minutes: '' },
      fullScreenMode: false,
      faceDetection: false,
      deviceRestriction: false,
      noiseDetection: false,
      passPercentage: "",
      shuffleQuestions: false,
      shuffleOptions: false,
      resultVisibility: "",
      sectionDetails: "",
    },
  });

  const steps = [
    { label: "Assessment Overview", icon: <FaClipboard /> },
    { label: "Test Configuration", icon: <FaCog /> },
  ];

  const validateStep = () => {
    if (currentStep === 1) {
      const { name, description, registrationStart, registrationEnd, guidelines } = formData.assessmentOverview;
      return name && description && registrationStart && registrationEnd && guidelines;
    }
    if (currentStep === 2) {
      const { totalMarks, questions, duration, passPercentage, sectionDetails } = formData.testConfiguration;
      return totalMarks && questions && (duration.hours || duration.minutes) && passPercentage && sectionDetails;
    }
    return true;
  };

  const handleInputChange = (e, step) => {
    const { name, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [step]: {
        ...prevData[step],
        [name]: type === "checkbox" ? checked : e.target.value,
      },
    }));
  };

  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken"))
    ?.split("=")[1];

  const handleChange = (e, step) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => {
      const newValue = type === "checkbox" ? checked : value;
      return {
        ...prevData,
        [step]: {
          ...prevData[step],
          [name]: name === "duration" ? { ...prevData[step].duration, ...newValue } : newValue,
        },
      };
    });
  };

  const nextStep = async () => {
    if (validateStep()) {
      if (currentStep === 2) {
        const generatedContestId = Math.random().toString(36).substr(2, 9);
        setContestId(generatedContestId);
        try {
          if (formData.testConfiguration.sectionDetails === "Yes") {
            await saveSectionDataToMongoDB(generatedContestId);
          } else {
            await saveDataToMongoDB(generatedContestId);
          }

          const response = await axios.post(
            `${API_BASE_URL }/api/mcq/start-contest/`,
            { contestId: generatedContestId },
            {
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
              },
            }
          );
          const token = response.data.token;
          localStorage.setItem("contestToken", token);
          localStorage.setItem("totalMarks", formData.testConfiguration.totalMarks);
          localStorage.setItem("duration", JSON.stringify(formData.testConfiguration.duration));
          localStorage.setItem("passPercentage", formData.testConfiguration.passPercentage);
          navigate("/mcq/combinedDashboard", { state: { formData, sectionDetails: formData.testConfiguration.sectionDetails } });
          toast.success("Contest started successfully!");
        } catch (error) {
          console.error("Error starting contest:", {
            message: error.message,
            data: error.response?.data,
            status: error.response?.status,
          });
          toast.error("Failed to start the contest. Please try again.");
        }
        return;
      }
      if (currentStep < steps.length) {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      toast.warning("Please fill in all required fields before proceeding.");
    }
  };

  const previousStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const saveDataToMongoDB = async (contestId) => {
    const payload = {
      contestId,
      assessmentOverview: formData.assessmentOverview,
      testConfiguration: {
        ...formData.testConfiguration,
        duration: {
          hours: formData.testConfiguration.duration.hours || 0,
          minutes: formData.testConfiguration.duration.minutes || 0,
        },
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL }/api/mcq/save-data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (response.ok) {
        console.log("Data saved successfully with Contest ID:", contestId);
      } else {
        console.error("Failed to save data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const saveSectionDataToMongoDB = async (contestId) => {
    const payload = {
      contestId,
      assessmentOverview: formData.assessmentOverview,
      testConfiguration: {
        ...formData.testConfiguration,
        duration: {
          hours: formData.testConfiguration.duration.hours || 0,
          minutes: formData.testConfiguration.duration.minutes || 0,
        },
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL }/api/mcq/save-section-data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (response.ok) {
        console.log("Section data saved successfully with Contest ID:", contestId);
      } else {
        console.error("Failed to save section data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 flex flex-col items-center py-10">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Stepper */}
      <div className="flex justify-between items-center w-full max-w-4xl mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center w-1/3">
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg transition-all duration-300 ${
                currentStep === index + 1
                  ? "bg-[#000975] text-white shadow-lg"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {index + 1}
            </div>
            <p
              className={`mt-2 text-sm font-medium ${
                currentStep === index + 1
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-lg p-8 transition-all duration-500">
        {/* Step 1: Assessment Overview */}
        {currentStep === 1 && (
          <div className="px-6">
            <h2 className="text-3xl font-bold mb-5 text-center text-blue-900">
              Assessment Overview
            </h2>
            <p className="text-sm font-normal mb-4 text-center text-gray-600">
              This section captures essential information about the test. Ensure clarity and completeness.
            </p>
            <hr className="mb-6 border-gray-200" />

            <form onSubmit={handleChange} className="space-y-6 text-start">
              {/* Assessment Name */}
              <div>
                <label className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                  <FaEdit className="mr-2" /> Assessment Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    maxLength="25"
                    value={formData.assessmentOverview.name}
                    onChange={(e) => handleChange(e, "assessmentOverview")}
                    className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter the name of the assessment"
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    {formData.assessmentOverview.name.length}/25
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                  <FaList className="mr-2" /> Description *
                </label>
                <div className="relative">
                  <textarea
                    name="description"
                    maxLength="150"
                    value={formData.assessmentOverview.description}
                    onChange={(e) => handleChange(e, "assessmentOverview")}
                    rows={4}
                    className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="Provide a brief overview of the assessment"
                  />
                  <span className="absolute right-2 bottom-2 text-gray-500 text-sm">
                    {formData.assessmentOverview.description.length}/150
                  </span>
                </div>
              </div>

              {/* Registration Dates */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className=" text-lg font-semibold text-blue-900 mb-2 flex items-center">
                    <FaCalendarAlt className="mr-2" /> Registration Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="registrationStart"
                    value={formData.assessmentOverview.registrationStart}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => handleChange(e, "assessmentOverview")}
                    className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className=" text-lg font-semibold text-blue-900 mb-2 flex items-center">
                    <FaCalendarAlt className="mr-2" /> Registration End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="registrationEnd"
                    value={formData.assessmentOverview.registrationEnd}
                    min={formData.assessmentOverview.registrationStart || new Date().toISOString().slice(0, 16)}
                    onChange={(e) => {
                      if (e.target.value <= formData.assessmentOverview.registrationStart) {
                        toast.warning("The end time must be after the start time.");
                        return;
                      }
                      handleChange(e, "assessmentOverview");
                    }}
                    className=" w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Guidelines and Rules */}
              <div>
                <label className=" text-lg font-semibold text-blue-900 mb-2 flex items-center">
                  <FaCheckCircle className="mr-2" /> Guidelines and Rules *
                </label>
                <textarea
                  name="guidelines"
                  value={formData.assessmentOverview.guidelines}
                  onChange={(e) => handleChange(e, "assessmentOverview")}
                  rows={6}
                  className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Test Configuration */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-3xl font-bold mb-5 text-center text-blue-900">
              Test Configuration
            </h2>
            <p className="text-sm font-normal mb-5 text-center text-gray-600">
              This section captures essential information about the test. Ensure clarity and completeness.
            </p>
            <hr className="mb-6 border-gray-200" />
            <form onSubmit={handleChange} className="space-y-8 text-start">
              {/* Total Marks and Questions */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className=" text-lg font-semibold text-blue-900 mb-2 flex items-center">
                    <FaPercentage className="mr-2" /> Total Marks *
                  </label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.testConfiguration.totalMarks}
                    onChange={(e) => handleChange(e, "testConfiguration")}
                    className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="Specify the total marks for the test"
                  />
                </div>
                <div>
                  <label className=" text-lg font-semibold text-blue-900 mb-2 flex items-center">
                    <FaQuestionCircle className="mr-2" /> Number of Questions *
                  </label>
                  <input
                    type="number"
                    name="questions"
                    value={formData.testConfiguration.questions}
                    onChange={(e) => handleChange(e, "testConfiguration")}
                    className=" w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter total number of questions"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className=" text-lg font-semibold text-blue-900 mb-2 flex items-center">
                  <FaClock className="mr-2" /> Duration of the Test *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="hours"
                    min="0"
                    max="24"
                    placeholder="HH"
                    value={formData.testConfiguration.duration.hours || ""}
                    onChange={(e) =>
                      handleChange(
                        { target: { name: "duration", value: { ...formData.testConfiguration.duration, hours: e.target.value || 0 } } },
                        "testConfiguration"
                      )
                    }
                    className="w-16 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center transition-all duration-300"
                    required
                  />
                  <span>:</span>
                  <input
                    type="number"
                    name="minutes"
                    min="0"
                    max="59"
                    placeholder="MM"
                    value={formData.testConfiguration.duration.minutes || ""}
                    onChange={(e) =>
                      handleChange(
                        { target: { name: "duration", value: { ...formData.testConfiguration.duration, minutes: e.target.value || 0 } } },
                        "testConfiguration"
                      )
                    }
                    className="w-16 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center transition-all duration-300"
                    required
                  />
                  <span className="text-gray-500 text-sm">HH:MM</span>
                </div>
              </div>

              {/* Proctoring Enablement */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                  <FaEye className="mr-2" /> Proctoring Enablement
                </h2>
                <p className="text-sm text-gray-500 font-normal mb-6">
                  (Select the types of proctoring to enforce during the test)
                </p>

                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  {[
                    { label: "Full Screen Mode", name: "fullScreenMode", icon: <FaDesktop className="mr-2" /> },
                    { label: "Face Detection", name: "faceDetection", icon: <FaUser className="mr-2" /> },
                    { label: "Device Restriction", name: "deviceRestriction", icon: <FaMobile className="mr-2" /> },
                    { label: "Noise Detection", name: "noiseDetection", icon: <FaVolumeUp className="mr-2" /> },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex justify-between items-center px-6 py-3 border border-gray-300 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <span className="text-blue-900 font-semibold text-sm flex items-center">
                        {item.icon} {item.label}
                      </span>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name={item.name}
                          checked={formData.testConfiguration[item.name]}
                          onChange={(e) => handleInputChange(e, "testConfiguration")}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-gray-200 rounded-full peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:bg-blue-400 transition-all duration-300">
                          <div
                            className={`absolute left-0.5 top-0.5 h-4 w-4 bg-white rounded-full shadow-md transition-transform duration-300 ${
                              formData.testConfiguration[item.name]
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          ></div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div className="mt-8">
                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                  {[
                    { label: "Shuffle Questions", name: "shuffleQuestions", description: "(Randomize question order for each attempt)", icon: <FaRandom className="mr-2" /> },
                    { label: "Shuffle Options", name: "shuffleOptions", description: "(Rearrange answer choices for added fairness)", icon: <FaRandom className="mr-2" /> },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex justify-between items-center col-span-1"
                    >
                      <div>
                        <span className=" justify text-blue-900 font-semibold text-lg flex items-center">
                          {item.icon} {item.label}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.description}
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name={item.name}
                          checked={formData.testConfiguration[item.name]}
                          onChange={(e) => handleInputChange(e, "testConfiguration")}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-gray-200 rounded-full peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:bg-blue-400 transition-all duration-300">
                          <div
                            className={`absolute left-0.5 top-0.5 h-4 w-4 bg-white rounded-full shadow-md transition-transform duration-300 ${
                              formData.testConfiguration[item.name]
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          ></div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scoring & Result Preferences */}
              <div>
                <h2 className="text-lg font-semibold text-blue-900 mb-2 text-center">
                  Scoring & Result Preferences
                </h2>
                <p className="text-sm text-gray-500 font-normal text-center mb-4">
                  Set the pass criteria and how and when results are released to students.
                </p>

                {/* Pass Percentage */}
                <div className="mb-6">
                  <label className=" text-lg font-semibold text-blue-900 mb-2 flex items-center">
                    <FaPercentage className="mr-2" /> Pass Percentage *
                  </label>
                  <input
                    type="number"
                    name="passPercentage"
                    value={formData.testConfiguration.passPercentage}
                    onChange={(e) => handleChange(e, "testConfiguration")}
                    className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter the pass percentage"
                    required
                  />
                </div>

                {/* Result Visibility */}
                <div>
                  <label className=" text-lg font-semibold text-blue-900 mb-4 text-start flex items-center">
                    <FaEye className="mr-2" /> Result Visibility
                  </label>
                  <p className="text-sm text-gray-500 font-normal">
                    (Clarifies when and how students can see their results and answer keys)
                  </p>
                  <div className="flex space-x-6">
                    {["Immediate release", "Host Control"].map((option) => (
                      <label
                        key={option}
                        className={`flex items-center justify-start w-[250px] px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                          formData.testConfiguration.resultVisibility === option
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-300 hover:border-blue-200"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 flex items-center justify-center rounded-full border transition-all duration-300 ${
                            formData.testConfiguration.resultVisibility === option
                              ? "bg-blue-400"
                              : "border-gray-400"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              formData.testConfiguration.resultVisibility === option
                                ? "bg-white"
                                : ""
                            }`}
                          ></div>
                        </div>
                        <input
                          type="radio"
                          name="resultVisibility"
                          value={option}
                          checked={
                            formData.testConfiguration.resultVisibility === option
                          }
                          onChange={(e) => handleChange(e, "testConfiguration")}
                          className="hidden"
                        />
                        <span className="ml-2 text-blue-900 font-medium text-sm">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Section Based */}
                  <div>
                    <label className="text-lg font-semibold text-blue-900 mb-4 mt-3 text-start flex items-center">
                      <FaList className="mr-2" /> Section Based *
                    </label>
                    <p className="text-sm text-gray-500 font-normal">
                      (Does this contest contain multiple sections?)
                    </p>
                    <div className="flex space-x-6">
                      {["Yes", "No"].map((option) => (
                        <label
                          key={option}
                          className={`flex items-center justify-start w-[250px] px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                            formData.testConfiguration.sectionDetails === option
                              ? "border-blue-400 bg-blue-50"
                              : "border-gray-300 hover:border-blue-200"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 flex items-center justify-center rounded-full border transition-all duration-300 ${
                              formData.testConfiguration.sectionDetails === option
                                ? "bg-blue-400"
                                : "border-gray-400"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                formData.testConfiguration.sectionDetails === option
                                  ? "bg-white"
                                  : ""
                              }`}
                            ></div>
                          </div>
                          <input
                            type="radio"
                            name="sectionDetails"
                            value={option}
                            checked={
                              formData.testConfiguration.sectionDetails === option
                            }
                            onChange={(e) => handleChange(e, "testConfiguration")}
                            className="hidden"
                          />
                          <span className="ml-2 text-blue-900 font-medium text-sm">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between w-full max-w-4xl mt-8">
        {currentStep > 1 && (
          <button
            onClick={previousStep}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md shadow hover:bg-gray-300 transition-all duration-300 flex items-center"
          >
            <FaCog className="mr-2" /> Previous
          </button>
        )}
        {currentStep < 3 && (
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-600 text-white font-semibold rounded-md shadow hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center"
          >
            Next <FaClipboard className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default McqAssessment;
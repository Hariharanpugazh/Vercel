import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronRight } from "lucide-react";

const McqAssessment = () => {
  const navigate = useNavigate();
  const currentDateTime = new Date();

  // Add 5 minutes to current time
  currentDateTime.setMinutes(currentDateTime.getMinutes() + 5);
  const currentDateTimeFormatted = `${currentDateTime.getFullYear()}-${(
    currentDateTime.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${currentDateTime.getDate().toString().padStart(2, "0")}T${currentDateTime
    .getHours()
    .toString()
    .padStart(2, "0")}:${currentDateTime.getMinutes().toString().padStart(2, "0")}`;

  const [currentStep, setCurrentStep] = useState(1);
  const [contestId, setContestId] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://render-frontend-f05v.onrender.com";
  const [formData, setFormData] = useState({
    assessmentOverview: {
      name: "",
      description: "",
      registrationStart: currentDateTimeFormatted,
      registrationEnd: "",
      guidelines: `1. Students must join 15 minutes before the test starts.
2. Ensure a stable internet connection during the test.
3. Use only approved devices to attempt the test.
4. Maintain silence and avoid distractions.`,
      sectionDetails: "No",
    },
    testConfiguration: {
      totalMarks: "",
      questions: "",
      duration: { hours: "", minutes: "" },
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

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Load form data from session storage on component mount
    const savedFormData = sessionStorage.getItem("mcqAssessmentFormData");
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
  }, []);

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
      const { name, description, registrationEnd, guidelines, sectionDetails } =
        formData.assessmentOverview;
      if (!name) newErrors.name = true;
      if (!description) newErrors.description = true;
      if (!registrationEnd) newErrors.registrationEnd = true;
      if (!guidelines) newErrors.guidelines = true;
      if (!sectionDetails) newErrors.sectionDetails = true;
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (currentStep === 2) {
      const { totalMarks, questions, duration, passPercentage, resultVisibility } = formData.testConfiguration;
      const { registrationStart, registrationEnd } = formData.assessmentOverview;

      const totalDuration = calculateTotalDuration(duration.hours, duration.minutes);
      const startDate = new Date(registrationStart);
      const endDate = new Date(registrationEnd);
      const timeDifference = (endDate - startDate) / (1000 * 60);

      if (formData.assessmentOverview.sectionDetails === "Yes") {
        if (!passPercentage) newErrors.passPercentage = true;
        if (!resultVisibility) newErrors.resultVisibility = true;
        if (totalDuration > timeDifference) newErrors.duration = true;
      } else {
        if (!totalMarks) newErrors.totalMarks = true;
        if (!questions) newErrors.questions = true;
        if (!duration.hours && !duration.minutes) newErrors.duration = true;
        if (!passPercentage) newErrors.passPercentage = true;
        if (!resultVisibility) newErrors.resultVisibility = true;
        if (totalDuration > timeDifference) newErrors.duration = true;
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    return true;
  };

  const calculateTotalDuration = (hours, minutes) => {
    return Number.parseInt(hours) * 60 + Number.parseInt(minutes);
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

    if (name.endsWith("Count")) {
      localStorage.setItem(name, e.target.value);
    }
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

    // Clear the error for the specific field when the user starts typing
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[name];
      return newErrors;
    });

    if (name === "shuffleType") {
      setFormData((prevData) => ({
        ...prevData,
        testConfiguration: {
          ...prevData.testConfiguration,
          shuffleQuestions: value === "questions" || value === "both",
          shuffleOptions: value === "options" || value === "both",
        },
      }));
    }

    // Save form data to session storage
    sessionStorage.setItem("mcqAssessmentFormData", JSON.stringify(formData));
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      const { registrationStart, registrationEnd } = formData.assessmentOverview;
      const startDate = new Date(registrationStart);
      const endDate = new Date(registrationEnd);
      const now = new Date();

      if (startDate < now) {
        toast.warning("Assessment start time cannot be in the past.");
        return;
      }

      if (endDate <= startDate) {
        toast.warning("Assessment end time must be greater than start time.");
        return;
      }
    }

    if (currentStep === 2) {
      const { duration } = formData.testConfiguration;
      const { registrationStart, registrationEnd } = formData.assessmentOverview;

      const totalDuration = calculateTotalDuration(duration.hours, duration.minutes);
      const startDate = new Date(registrationStart);
      const endDate = new Date(registrationEnd);
      const timeDifference = (endDate - startDate) / (1000 * 60);

      if (totalDuration > timeDifference) {
        toast.warning("Duration is greater than the time difference between assessment start and end times.");
        return;
      }
    }

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
            `${API_BASE_URL}/api/mcq/start-contest/`,
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
          localStorage.setItem("totalquestions", formData.testConfiguration.questions);
          
          // Only clear session storage after successful navigation
          navigate("/mcq/combinedDashboard", {
            state: { formData, sectionDetails: formData.testConfiguration.sectionDetails },
          }, () => {
            // Clear session storage after successful navigation
            sessionStorage.removeItem("mcqAssessmentFormData");
          });
          
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

    delete payload.testConfiguration.shuffleType;

    try {
      const response = await fetch(`${API_BASE_URL}/api/mcq/save-data/`, {
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
      const response = await fetch(`${API_BASE_URL}/api/mcq/save-section-data/`, {
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

  const steps = ["Assessment Overview", "Test Configuration", "Structure Setup"];

  return (
    <div className="h-[calc(100vh-95px)] overflow-hidden bg-[#f4f6ff86] ">
      <div className="w-full px-24 h-full">
        <div className="h-14 py-4">
          <div className="flex items-center gap-2 text-[#111933]">
            <span className={`${currentStep >= 1 ? "opacity-60" : ""}`}>Home</span>
            <span>{">"}</span>
            <span className={`${currentStep === 2 ? "opacity-60" : ""}`}>Assessment Overview</span>
            {currentStep === 2 && (
              <>
                <span>{">"}</span>
                <span>Test Configuration</span>
              </>
            )}
          </div>
        </div>
        <div className="flex-1 ">
          <div className="bg-white rounded-lg p-4 md:p-7 lg:px-20 h-[calc(100%-3.5rem)] overflow-auto">
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-2 text-left text-[#111933]">Assessment Overview</h2>
                <p className="text-sm font-normal mb-4 text-left text-[#111933]">
                  This section captures essential information about the test. Ensure clarity and completeness.
                </p>
                <hr className="mb-6 border-gray-200" />

                <div className="grid grid-cols-2 gap-28">
                  <div className="space-y-6">
                    <div>
                      <label className="text-md font-medium text-[#111933] mb-2 flex items-center">
                        Assessment Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          maxLength="30"
                          value={formData.assessmentOverview.name}
                          onChange={(e) => handleChange(e, "assessmentOverview")}
                          className={`block w-full h-12 py-2 px-4 bg-white border rounded-[10px] ${
                            errors.name ? "border-red-500" : ""
                          }`}
                          placeholder="Enter the assessment name"
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          {formData.assessmentOverview.name.length}/30
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-md font-medium text-[#111933] mb-2 flex items-center">
                        Assessment Start*
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={formData.assessmentOverview.registrationStart || currentDateTimeFormatted}
                          min={currentDateTimeFormatted}
                          onChange={(e) => {
                            const selectedDateTime = e.target.value;
                            if (new Date(selectedDateTime) >= new Date(currentDateTimeFormatted)) {
                              handleChange(
                                { target: { name: "registrationStart", value: selectedDateTime } },
                                "assessmentOverview"
                              );
                            }
                          }}
                          className={`block w-full h-12 py-2 px-4 bg-white border rounded-[10px] ${
                            errors.registrationStart ? "border-red-500" : ""
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-md font-medium text-[#111933] mb-2 flex items-center">
                        Assessment End*
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={formData.assessmentOverview.registrationEnd || ""}
                          min={formData.assessmentOverview.registrationStart || currentDateTimeFormatted}
                          onChange={(e) => {
                            const endDateTime = new Date(e.target.value);
                            const startDateTime = new Date(formData.assessmentOverview.registrationStart || currentDateTimeFormatted);
                            
                            if (endDateTime >= startDateTime) {
                              handleChange(
                                { target: { name: "registrationEnd", value: e.target.value } },
                                "assessmentOverview"
                              );
                            } else {
                              toast.warning("End date cannot be before the start date");
                            }
                          }}
                          className={`block w-full h-12 py-2 px-4 bg-white border rounded-[10px] ${
                            errors.registrationEnd ? "border-red-500" : ""
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex mb-2 items-center">
                        <label className="text-md font-medium text-[#111933] mr-8 flex ">Section Based</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="sectionDetails"
                            checked={formData.assessmentOverview.sectionDetails === "Yes"}
                            onChange={(e) =>
                              handleChange(
                                {
                                  target: {
                                    name: "sectionDetails",
                                    value: e.target.checked ? "Yes" : "No",
                                  },
                                },
                                "assessmentOverview"
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111933]"></div>
                        </label>
                      </div>
                      <span className="text-sm text-gray-500 font-normal mr-4">
                        (Does this contest contain multiple sections?)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div>
                      <label className="text-md font-medium text-[#111933] mb-2 flex items-center">Description *</label>
                      <div className="relative">
                        <textarea
                          name="description"
                          value={formData.assessmentOverview.description}
                          onChange={(e) => {
                            let inputText = e.target.value;
                            const words = inputText.split(/\s+/).filter(Boolean);
                            const wordCount = words.length;
                            if (wordCount > 30) {
                              inputText = words.slice(0, 30).join(" ");
                            }
                            handleChange({ target: { name: "description", value: inputText } }, "assessmentOverview");
                          }}
                          rows={4}
                          className={`block w-full p-4  rounded-[10px] border ${
                            errors.description ? "border-red-500" : ""
                          }`}
                          placeholder="Provide a brief overview of the assessment (max 30 words)"
                        />
                        <span className="absolute right-2 bottom-2 text-gray-500 text-sm">
                          {formData.assessmentOverview.description.split(/\s+/).filter(Boolean).length}/30 words
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-md font-medium text-[#111933] mb-2 flex items-center">
                        Guidelines and Rules *
                      </label>
                      <textarea
                        name="guidelines"
                        value={formData.assessmentOverview.guidelines}
                        onChange={(e) => {
                          const words = e.target.value.trim().split(/\s+/);
                          if (words.length <= 200) {
                            handleChange(e, "assessmentOverview");
                          }
                        }}
                        rows={4}
                        className={`block w-full p-4 rounded-[10px] border ${
                          errors.guidelines ? "border-red-500" : ""
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex-1"></div>
                      {currentStep < 3 && (
                        <button
                          onClick={nextStep}
                          className="pl-3 pr-2 py-1 gap-1 bg-[#111933] text-white rounded-lg flex items-center"
                        >
                          Next <ChevronRight size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-2 text-left text-[#111933]">Test Configuration</h2>
                <p className="text-sm font-normal mb-4 text-left text-[#111933]">
                  This section captures essential information about the test. Ensure clarity and completeness.
                </p>
                <hr className="mb-6 border-gray-200" />
                <div className="space-y-10">
                  {formData.assessmentOverview.sectionDetails === "No" && (
                    <div className="grid grid-cols-2 gap-52">
                      <div className="flex items-center">
                        <label className="text-md font-medium text-[#111933] flex-1">Number of Questions *</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          name="questions"
                          value={formData.testConfiguration.questions}
                          onChange={(e) => {
                            const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                            handleChange({ target: { name: "questions", value: onlyNums } }, "testConfiguration");
                          }}
                          className={`w-1/2 p-2 border rounded-[10px] text-sm ${
                            errors.questions ? "border-red-500" : ""
                          }`}
                          placeholder="Enter number"
                          required
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="text-md font-medium text-[#111933] flex-1">Total Marks *</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          name="totalMarks"
                          value={formData.testConfiguration.totalMarks}
                          onChange={(e) => {
                            const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                            handleChange({ target: { name: "totalMarks", value: onlyNums } }, "testConfiguration");
                          }}
                          className={`w-1/2 p-2 border rounded-[10px] text-sm ${
                            errors.totalMarks ? "border-red-500" : ""
                          }`}
                          placeholder="Enter marks"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {formData.assessmentOverview.sectionDetails === "No" && (
                    <div className="grid grid-cols-2 gap-52">
                      <div className="flex items-center">
                        <label className="text-md font-medium text-[#111933] flex-1">Duration *</label>
                        <div className="w-1/2 flex items-center space-x-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            name="hours"
                            value={formData.testConfiguration.duration.hours}
                            onChange={(e) => {
                              const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                              handleChange(
                                {
                                  target: {
                                    name: "duration",
                                    value: { hours: onlyNums, minutes: formData.testConfiguration.duration.minutes },
                                  },
                                },
                                "testConfiguration"
                              );
                            }}
                            className={`w-1/2 p-2 border rounded-[10px] text-sm text-center ${errors.duration ? "border-red-500" : ""}`}
                            placeholder="HH"
                          />
                          <span>:</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            name="minutes"
                            value={formData.testConfiguration.duration.minutes}
                            onChange={(e) => {
                              let onlyNums = e.target.value.replace(/[^0-9]/g, "");
                              if (Number.parseInt(onlyNums) > 59) {
                                onlyNums = "59";
                              }
                              handleChange(
                                {
                                  target: {
                                    name: "duration",
                                    value: { hours: formData.testConfiguration.duration.hours, minutes: onlyNums },
                                  },
                                },
                                "testConfiguration"
                              );
                            }}
                            className={`w-1/2 p-2 border rounded-[10px] text-sm text-center ${errors.duration ? "border-red-500" : ""}`}
                            placeholder="MM"
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <label className="text-md font-medium text-[#111933] flex-1">Pass Percentage *</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          name="passPercentage"
                          value={formData.testConfiguration.passPercentage}
                          onChange={(e) => {
                            const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                            handleChange({ target: { name: "passPercentage", value: onlyNums } }, "testConfiguration");
                          }}
                          className={`w-1/2 p-2 border rounded-[10px] text-sm ${errors.passPercentage ? "border-red-500" : ""}`}
                          placeholder="Enter"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {formData.assessmentOverview.sectionDetails === "Yes" && (
                    <div className="grid grid-cols-2 gap-52">
                      <div className="flex items-center">
                        <label className="text-md font-medium text-[#111933] flex-1">Pass Percentage *</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          name="passPercentage"
                          value={formData.testConfiguration.passPercentage}
                          onChange={(e) => {
                            const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                            handleChange({ target: { name: "passPercentage", value: onlyNums } }, "testConfiguration");
                          }}
                          className={`w-1/2 p-2 border rounded-[10px] text-sm ${errors.passPercentage ? "border-red-500" : ""}`}
                          placeholder="Enter"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-52">
                    <div className="flex items-center">
                      <label className="text-md font-medium text-[111933] flex-1">Result Visibility *</label>
                      <select
                        name="resultVisibility"
                        value={formData.testConfiguration.resultVisibility}
                        onChange={(e) => handleChange(e, "testConfiguration")}
                        className={`w-1/2 p-2 border rounded-[10px] text-sm ${
                          errors.resultVisibility ? "border-red-500" : ""
                        }`}
                        required
                      >
                        <option value="">Select</option>
                        <option value="Immediate release">Immediate release</option>
                        <option value="Host Control">Host Control</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <label className="text-md font-medium text-[#111933] flex-1">Enable Shuffling</label>
                      <select
                        name="shuffleType"
                        value={formData.testConfiguration.shuffleType}
                        onChange={(e) => handleChange(e, "testConfiguration")}
                        className="w-1/2 p-2 border rounded-[10px] text-sm"
                      >
                        <option value="">Select</option>
                        <option value="questions">Questions</option>
                        <option value="options">Options</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[#111933] mb-4">Proctoring Enablement</h3>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: "Full Screen Mode", name: "fullScreenMode" },
                        { label: "Face Detection", name: "faceDetection" },
                        { label: "Noise Detection", name: "noiseDetection" },
                        { label: "Device Restriction", name: "deviceRestriction" },
                      ].map((item) => (
                        <div key={item.name} className="flex flex-col space-y-5">
                          <div className="flex items-center justify-between p-2 border rounded-[10px]">
                            <span className="text-sm font-medium text-[#111933]">{item.label}</span>
                            <label
                              className="relative inline-flex items-center cursor-pointer"
                              style={{
                                cursor: item.name === "faceDetection" || item.name === "noiseDetection" ? "not-allowed" : "pointer",
                              }}
                            >
                              <input
                                type="checkbox"
                                name={item.name}
                                checked={formData.testConfiguration[item.name]}
                                onChange={(e) => handleInputChange(e, "testConfiguration")}
                                className="sr-only peer"
                                disabled={item.name === "faceDetection" || item.name === "noiseDetection"}
                              />
                              <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#111933]"></div>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    {currentStep > 1 && (
                      <button
                        onClick={previousStep}
                        className="pl-2 pr-3 py-1 gap-1 bg-[#111933] text-white rounded-lg flex items-center"
                      >
                        <ChevronRight size={20} className="rotate-180" />Previous
                      </button>
                    )}
                    {currentStep < 3 && (
                      <button
                        onClick={nextStep}
                        className="bg-[#111933] pl-3 pr-2 py-1 gap-1 text-white rounded-lg flex items-center ml-auto"
                      >
                        Next <ChevronRight size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default McqAssessment;
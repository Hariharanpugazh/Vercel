  import React, { useState } from "react";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";

  const Mcq_Assesment = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [contestid, setContestId] = useState(null);
    const [formData, setFormData] = useState({
      assessmentOverview: {
        name: "",
        description: "",
        registrationStart: "",
        registrationEnd: "",
        guidelines: "",
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
      },
      sectionDetails: {
        sectionTitles: [],
      },
    });

    const validateStep = () => {
      if (currentStep === 1) {
        const { name, description, registrationStart, registrationEnd, guidelines } = formData.assessmentOverview;
        return name && description && registrationStart && registrationEnd && guidelines;
      }
      if (currentStep === 2) {
        const { totalMarks, questions, duration, passPercentage } = formData.testConfiguration;
        return totalMarks && questions && duration && passPercentage;
      }
      if (currentStep === 3) {
        const { sectionTitles } = formData.sectionDetails;
        return sectionTitles.length > 0;
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
      setFormData((prevData) => ({
        ...prevData,
        [step]: {
          ...prevData[step],
          [name]: type === "checkbox" ? checked : value,
        },
      }));
    };

    const nextStep = async () => {
      if (validateStep()) {
        if (currentStep === 2) {
          const generatedContestId = Math.random().toString(36).substr(2, 9);
          setContestId(generatedContestId);

          try {
            await saveDataToMongoDB(generatedContestId);

            const response = await axios.post(
              "https://render-frontend-f05v.onrender.com//api/mcq/start-contest/",
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
            navigate("/mcq/combinedDashboard", { state: { formData } });
          } catch (error) {
            console.error("Error starting contest:", {
              message: error.message,
              data: error.response?.data,
              status: error.response?.status,
            });
            alert("Failed to start the contest. Please try again.");
          }
          return;
        }
        if (currentStep < 3) {
          setCurrentStep((prev) => prev + 1);
        }
      } else {
        alert("Please fill in all required fields before proceeding.");
      }
    };

    const previousStep = () => {
      if (currentStep > 1) setCurrentStep((prev) => prev - 1);
    };

    const saveDataToMongoDB = async (contestId) => {
      const payload = {
        contestId,
        assessmentOverview: formData.assessmentOverview,
        testConfiguration: formData.testConfiguration,
      };

      try {
        const response = await fetch("https://render-frontend-f05v.onrender.com//api/mcq/save-data/", {
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

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
        {/* Stepper */}
        <div className="flex justify-between items-center w-full max-w-4xl mb-8">
          {["Assessment Overview", "Test Configuration"].map((step, index) => (
            <div key={index} className="flex flex-col items-center w-1/3">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                  currentStep === index + 1
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                {index + 1}
              </div>
              <p
                className={`mt-2 text-sm ${
                  currentStep === index + 1
                    ? "font-bold text-yellow-500"
                    : "text-gray-500"
                }`}
              >
                {step}
              </p>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
          {/* Step 1: Assessment Overview */}
          {currentStep === 1 && (
            <div className="px-6">
              <h2 className="text-2xl font-semibold mb-5 text-center text-indigo-950">
                Assessment Overview
              </h2>
              <p className="text-sm font-normal mb-4 text-center text-slate-500">
                This section captures essential information about the test. Ensure clarity and completeness.
              </p>
              <hr className="mb-6" />

              <form onSubmit={handleChange} className="space-y-6 text-start">
                {[
                  {label: "Assessment Name *", name: "name", type: "text", placeholder: "Enter the name of the assessment"},
                  {label: "Description *", name: "description", type: "textarea", placeholder: "Provide a brief overview of the assessment", description: "Provide a brief overview of the assessment, including its purpose and topics covered.", rows: 4},
                  {label: "Registration Start Date & Time *", name: "registrationStart", type: "datetime-local"},
                  {label: "Registration End Date & Time *", name: "registrationEnd", type: "datetime-local"},
                  {label: "Guidelines and Rules *", name: "guidelines", type: "textarea", placeholder: "Outline the rules students must follow during the test", description: "Outline the rules students must follow during the test, including dress code, behavior expectations, and device policies.", rows: 6}
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-lg font-medium text-indigo-950 mb-2">
                      {field.label}
                      {field.description && (
                        <p className="text-sm font-normal text-slate-500 mb-2">
                          {field.description}
                        </p>
                      )}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        name={field.name}
                        value={formData.assessmentOverview[field.name]}
                        onChange={(e) => handleChange(e, "assessmentOverview")}
                        rows={field.rows}
                        className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder={field.placeholder}
                      />
                    ) : field.type === 'datetime-local' ? (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData.assessmentOverview[field.name]}
                        min={new Date().toISOString().slice(0, 16)} // Prevent selection of past dates
                        onChange={(e) => {
                          const startTime = formData.assessmentOverview.registrationStart;
                          const endTime = formData.assessmentOverview.registrationEnd;
                          const selectedTime = e.target.value;

                          if (field.name === 'registrationEnd' && startTime && selectedTime <= startTime) {
                            // Ensure end time is after start time
                            alert("The end time must be after the start time.");
                            return;
                          }

                          handleChange(e, "assessmentOverview");
                        }}
                        className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData.assessmentOverview[field.name]}
                        onChange={(e) => handleChange(e, "assessmentOverview")}
                        className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
              </form>
            </div>
          )}

          {/* Step 2: Test Configuration */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-semibold mb-5 text-center text-indigo-950">
                Test Configuration
              </h2>
              <p className="text-sm font-normal mb-5 text-center text-slate-500">
                This section captures essential information about the test. Ensure
                clarity and completeness.
              </p>
              <hr />
              <form onSubmit={handleChange} className="space-y-8 text-start">
                {[
                  { label: "Total Marks *", name: "totalMarks", type: "number", placeholder: "Specify the total marks for the test" },
                  {label: "Number of Questions *", name: "questions", type: "number", placeholder: "Enter total number of questions"},
                  {label: "Duration of the Test *", name: "duration", type: "custom"}
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-lg font-medium text-indigo-950 mb-1 text-start">
                      {field.label}
                    </label>
                    {field.name === 'duration' ? (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Duration</label>
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
                                { target: { name: "duration", value: { ...formData.testConfiguration.duration, hours: e.target.value } } },
                                "testConfiguration"
                              )
                            }
                            className="w-16 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-center"
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
                                { target: { name: "duration", value: { ...formData.testConfiguration.duration, minutes: e.target.value } } },
                                "testConfiguration"
                              )
                            }
                            className="w-16 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-center"
                            required
                          />
                          <span className="text-gray-500 text-sm">HH:MM</span>
                        </div>
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData.testConfiguration[field.name]}
                        onChange={(e) => handleChange(e, "testConfiguration")}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}

                {/* Proctoring Enablement */}
                <div className="mt-8">
                  <h2 className="text-lg font-medium text-indigo-950 mb-1 text-start">
                    Proctoring Enablement
                  </h2>
                  <p className="text-sm text-gray-500 font-normal mb-6 text-start">
                    (Select the types of proctoring to enforce during the test)
                  </p>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {[
                      { label: "Full Screen Mode", name: "fullScreenMode" },
                      { label: "Face Detection", name: "faceDetection" },
                      { label: "Device Restriction", name: "deviceRestriction" },
                      { label: "Noise Detection", name: "noiseDetection" },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex justify-between items-center px-6 py-3 border border-gray-300 rounded-full bg-white shadow-sm"
                      >
                        <span className="text-indigo-950 font-semibold text-sm">
                          {item.label}
                        </span>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name={item.name}
                            checked={formData.testConfiguration[item.name]}
                            onChange={(e) => handleInputChange(e, "testConfiguration")}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-200 rounded-full peer-focus:ring-2 peer-focus:ring-yellow-500 peer-checked:bg-yellow-400">
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

                  {/* Additional Options */}
                  <div className="mt-8">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                      {[
                        {label: "Shuffle Questions",name: "shuffleQuestions",description:"(Randomize question order for each attempt)",},
                        {label: "Shuffle Options",name: "shuffleOptions",description: "(Rearrange answer choices for added fairness)",},
                      ].map((item) => (
                        <div
                          key={item.name}
                          className="flex justify-between items-center col-span-1"
                        >
                          <div>
                            <span className="flex justify text-indigo-950 font-semibold text-lg">
                              {item.label}
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
                            <div className="w-10 h-5 bg-gray-200 rounded-full peer-focus:ring-2 peer-focus:ring-yellow-500 peer-checked:bg-yellow-400">
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
                </div>

                {/* Scoring & Result Preferences */}
                <div>
                  <h2 className="text-lg font-medium text-indigo-950 mb-2 text-center">
                    Scoring & Result Preferences
                  </h2>
                  <p className="text-sm text-gray-500 font-normal text-center mb-4">
                    Set the pass criteria and how and when
                    results are released to students.
                  </p>

                  {/* Pass Percentage */}
                  <div className="mb-6">
                    <label className="block text-lg font-medium text-indigo-950 mb-1 text-start">
                      Pass Percentage *
                    </label>
                    <p className="text-sm text-gray-500 font-normal mb-2 text-start">
                      (Enter the minimum percentage required to pass the test.)
                    </p>
                    <input
                      type="number"
                      name="passPercentage"
                      value={formData.testConfiguration.passPercentage}
                      onChange={(e) => handleChange(e, "testConfiguration")}
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Enter the pass percentage"
                      required
                    />
                  </div>

                  {/* Result Visibility */}
                  <div>
                    <label className="block text-lg font-medium text-indigo-950 mb-4 text-start">
                      Result Visibility
                      <p className="text-sm text-gray-500 font-normal">
                        (Clarifies when and how students can see their results and
                        answer keys)
                      </p>
                    </label>
                    <div className="flex space-x-6">
                      {["Immediate release", "Host Control"].map((option) => (
                        <label
                          key={option}
                          className={`flex items-center justify-start w-[250px] px-4 py-3 rounded-2xl border-2 cursor-pointer ${
                            formData.testConfiguration.resultVisibility === option
                              ? "border-yellow-400 bg-yellow-50"
                              : "border-gray-300"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 flex items-center justify-center rounded-full border ${
                              formData.testConfiguration.resultVisibility === option
                                ? "bg-yellow-400"
                                : "border-gray-400"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
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
                          <span className="ml-2 text-indigo-950 font-medium text-sm">
                            {option}
                          </span>
                        </label>
                      ))}
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
              className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md shadow hover:bg-gray-300"
            >
              Previous
            </button>
          )}
          {currentStep < 3 && (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  };

  export default Mcq_Assesment;

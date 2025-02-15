import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SinglePageStepper = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
    const [formData, setFormData] = useState({
        assessmentOverview: {
            name: "",
            description: "",
            registrationStart: "",
            registrationEnd: "",
            guidelines: "",
        },
        testConfiguration: {
            questions: "",
            duration: { hours: "", minutes: "" },
            fullScreenMode: false,
            faceDetection: false,
            deviceRestriction: false,
            noiseDetection: false,
            negativeMarking: false,
            passPercentage: "",
            negativeMarkingType: "",
            resultVisibility: "",
        },
    });

    const validateStep = () => {
        if (currentStep === 1) {
            const { name, description, registrationStart, registrationEnd, guidelines } = formData.assessmentOverview;
            if (!name || !description || !registrationStart || !registrationEnd || !guidelines) {
                alert("Please fill in all required fields in the Assessment Overview section.");
                return false;
            }
            return true;
        }
        if (currentStep === 2) {
            const { questions, duration, passPercentage, negativeMarkingType, resultVisibility } = formData.testConfiguration;
            if (!questions || !duration.hours || !duration.minutes || !passPercentage || !negativeMarkingType || !resultVisibility) {
                alert("Please fill in all required fields in the Test Configuration section.");
                return false;
            }
            return true;
        }
        return true;
    };

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

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form Data Submitted:", formData);
    };

    // const handleInputChange = (e, step) => {
    //     const { name, value, type, checked } = e.target;
    //     setFormData((prevData) => ({
    //         ...prevData,
    //         [step]: {
    //             ...prevData[step],
    //             [name]: type === "checkbox" ? checked : value,
    //         },
    //     }));
    // };

    // const handleTabClick = (tabNumber) => {
    //     setActiveTab(tabNumber);
    // };

    const nextStep = () => {
        if (validateStep()) {
            if (currentStep < 2) setCurrentStep((prev) => prev + 1);
        }
    };

    const previousStep = () => {
        if (currentStep > 1) setCurrentStep((prev) => prev - 1);
    };

    const handleFinalSubmit = async () => {
        if (validateStep()) {
            const payload = {
                assessmentOverview: formData.assessmentOverview,
                testConfiguration: formData.testConfiguration,
            };

            try {
                const response = await fetch(`${API_BASE_URL}/api/create-assessment/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                    credentials: "include", // Required to send cookies
            });

                const data = await response.json();

                if (response.ok && data.assessmentId) {
                    console.log("Data saved successfully with Contest ID:", data);
                    alert("Form Submitted! Check the console for data.");
                    navigate(`/${data.assessmentId}/Questions`, { state: { requiredQuestions: formData.testConfiguration.questions } });
                } else {
                    console.error("Failed to save data");
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
            <div className="flex justify-between items-center w-full max-w-4xl mb-8">
                {["Assessment Overview", "Test Configuration"].map(
                    (step, index) => (
                        <div key={index} className="flex flex-col items-center w-1/3">
                            <div
                                className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${currentStep === index + 1
                                        ? "bg-yellow-500 text-white"
                                        : "bg-gray-300 text-gray-700"
                                    }`}
                            >
                                {index + 1}
                            </div>
                            <p
                                className={`mt-2 text-sm ${currentStep === index + 1
                                        ? "font-bold text-yellow-500"
                                        : "text-gray-500"
                                    }`}
                            >
                                {step}
                            </p>
                        </div>
                    )
                )}
            </div>

            <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
                {currentStep === 1 && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Assessment Overview</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Assessment Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.assessmentOverview.name}
                                    onChange={(e) => handleChange(e, "assessmentOverview")}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Enter the name of the assessment"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.assessmentOverview.description}
                                    onChange={(e) => handleChange(e, "assessmentOverview")}
                                    rows="4"
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Provide a brief overview of the assessment"
                                    required
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Registration Start Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    name="registrationStart"
                                    value={formData.assessmentOverview.registrationStart}
                                    onChange={(e) => {
                                        const currentTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                        const selectedTime = e.target.value;

                                        if (selectedTime <= currentTime) {
                                            alert("The selected date and time must be in the future.");
                                            return;
                                        }

                                        handleChange(e, "assessmentOverview");
                                    }}
                                    min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Registration End Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    name="registrationEnd"
                                    value={formData.assessmentOverview.registrationEnd}
                                    onChange={(e) => {
                                        const currentTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                        const selectedTime = e.target.value;
                                        const startTime = formData.assessmentOverview.registrationStart;

                                        if (selectedTime <= currentTime) {
                                            alert("The selected date and time must be in the future.");
                                            return;
                                        }

                                        if (startTime && selectedTime <= startTime) {
                                            alert("The end time must be after the start time.");
                                            return;
                                        }

                                        handleChange(e, "assessmentOverview");
                                    }}
                                    min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Guidelines and Rules</label>
                                <textarea
                                    name="guidelines"
                                    value={formData.assessmentOverview.guidelines}
                                    onChange={(e) => handleChange(e, "assessmentOverview")}
                                    rows="6"
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Outline the rules students must follow during the test"
                                    required
                                ></textarea>
                            </div>
                        </form>
                    </div>
                )}

                {currentStep === 2 && (
                    <div>
                        <h2 className="text-xl font-bold mb-4">Test Configuration</h2>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Number of Questions
                                </label>
                                <input
                                    type="number"
                                    name="questions"
                                    value={formData.testConfiguration.questions}
                                    onChange={(e) => handleChange(e, "testConfiguration")}
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
                                    placeholder="Enter a brief description of the assessment"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration of the Test
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

                            <div>
                                <h2 className="text-lg font-semibold mb-4">Guidelines and Rules of the Assessment</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    {[
                                        { label: "Full Screen Mode", name: "fullScreenMode" },
                                        { label: "Face Detection", name: "faceDetection" },
                                        { label: "Device Restriction", name: "deviceRestriction" },
                                        { label: "Noise Detection", name: "noiseDetection" },
                                        { label: "Negative Marking", name: "negativeMarking" },
                                    ].map((toggle) => (
                                        <div
                                            key={toggle.name}
                                            className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm"
                                        >
                                            <span className="text-sm font-medium text-gray-700">{toggle.label}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name={toggle.name}
                                                    checked={formData.testConfiguration[toggle.name]}
                                                    onChange={(e) => handleChange(e, "testConfiguration")}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer-checked:bg-yellow-500"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold mb-4">Scoring & Result Preferences</h2>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pass Percentage
                                    </label>
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

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Negative Marking
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="negativeMarkingType"
                                                value="Stay until test ends"
                                                checked={formData.testConfiguration.negativeMarkingType === "Stay until test ends"}
                                                onChange={(e) => handleChange(e, "testConfiguration")}
                                                className="form-radio h-4 w-4 text-yellow-500 focus:ring-yellow-500"
                                            />
                                            <span className="text-sm text-gray-700">Stay until test ends</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="negativeMarkingType"
                                                value="Allow early submission"
                                                checked={formData.testConfiguration.negativeMarkingType === "Allow early submission"}
                                                onChange={(e) => handleChange(e, "testConfiguration")}
                                                className="form-radio h-4 w-4 text-yellow-500 focus:ring-yellow-500"
                                            />
                                            <span className="text-sm text-gray-700">Allow early submission</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Result Visibility
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="resultVisibility"
                                                value="Immediate release"
                                                checked={formData.testConfiguration.resultVisibility === "Immediate release"}
                                                onChange={(e) => handleChange(e, "testConfiguration")}
                                                className="form-radio h-4 w-4 text-yellow-500 focus:ring-yellow-500"
                                            />
                                            <span className="text-sm text-gray-700">Immediate release</span>
                                        </label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="resultVisibility"
                                                value="After test completed"
                                                checked={formData.testConfiguration.resultVisibility === "After test completed"}
                                                onChange={(e) => handleChange(e, "testConfiguration")}
                                                className="form-radio h-4 w-4 text-yellow-500 focus:ring-yellow-500"
                                            />
                                            <span className="text-sm text-gray-700">After test completed</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <div className="flex justify-between w-full max-w-4xl mt-8">
                {currentStep > 1 && (
                    <button
                        onClick={previousStep}
                        className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md shadow hover:bg-gray-300"
                    >
                        Previous
                    </button>
                )}
                {currentStep < 2 && (
                    <button
                        onClick={nextStep}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700"
                    >
                        Next
                    </button>
                )}
                {currentStep === 2 && (
                    <button
                        onClick={handleFinalSubmit}
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700"
                    >
                        Submit
                    </button>
                )}
            </div>
        </div>
    );
};

export default SinglePageStepper;

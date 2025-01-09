import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import QuestionModal from "./QuestionModal";
import GroupImage from "../../../assets/bulk.png"; // Ensure the path to your image is correct

const Mcq_sectionDetails = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionsLocal, setSelectedQuestionsLocal] = useState([]);
  const [activeTab, setActiveTab] = useState("My Device"); // Default tab
  const [highlightStep, setHighlightStep] = useState(1); // Step highlight state
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [questionsPerPage] = useState(5); // Number of questions per page
  const [showImage, setShowImage] = useState(true); // Control visibility of the image
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [students, setStudents] = useState([]); // Define students state
  const [selectedStudents, setSelectedStudents] = useState([]); // Define selectedStudents state
  const [sections, setSections] = useState([{
    sectionName: "",
    numQuestions: 10,
    sectionDuration: 10,
    markAllotment: 1,
    passPercentage: 50,
    timeRestriction: false,
    submitted: false,
    selectedQuestions: [],
    showDropdown: false // Add showDropdown state for each section
  }]);
  const navigate = useNavigate();
  const [activeSectionIndex, setActiveSectionIndex] = useState(null);

  useEffect(() => {
    const storedSections = JSON.parse(sessionStorage.getItem("sections")) || [];
    setSections(storedSections);

    // Clear local storage on page refresh or close
    window.addEventListener('beforeunload', () => {
      sessionStorage.clear();
    });

    return () => {
      window.removeEventListener('beforeunload', () => {
        sessionStorage.clear();
      });
    };
  }, []);

  const handleAddQuestion = (sectionIndex) => {
    setIsModalOpen(true);
    setActiveSectionIndex(sectionIndex); // Set the active section index
    setSelectedQuestionsLocal([]); // Reset selected questions local
    setQuestions([]); // Reset questions
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleOptionSelect = (component, sectionIndex) => {
    setActiveSectionIndex(sectionIndex); // Set the active section index
    setActiveComponent(component);
    handleModalClose(); // Close modal after selecting an option
  };

  const handleInputChange = (e, sectionIndex) => {
    const { name, value, type, checked } = e.target;
    const updatedSections = sections.map((section, index) =>
      index === sectionIndex ? { ...section, [name]: type === "checkbox" ? checked : value } : section
    );
    setSections(updatedSections);
    sessionStorage.setItem("sections", JSON.stringify(updatedSections));
  };

  const handleAddSection = () => {
    setSections([...sections, {
      sectionName: "",
      numQuestions: 10,
      sectionDuration: 10,
      markAllotment: 1,
      passPercentage: 50,
      timeRestriction: false,
      submitted: false,
      selectedQuestions: [],
      showDropdown: false // Add showDropdown state for each section
    }]);
  };

  const handleSaveQuestions = async (sectionIndex) => {
    try {
      const section = sections[sectionIndex];
      const formattedQuestions = section.selectedQuestions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer || q.answer
      }));

      const response = await axios.post(
        "http://127.0.0.1:8000/api/mcq/save-assessment-questions/",  // Make sure this URL matches your backend
        {
          sectionName: section.sectionName,
          numQuestions: section.numQuestions,
          sectionDuration: section.sectionDuration,
          markAllotment: section.markAllotment,
          passPercentage: section.passPercentage,
          timeRestriction: section.timeRestriction,
          questions: formattedQuestions
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert("Questions saved successfully!");
        const updatedSections = sections.map((section, index) =>
          index === sectionIndex ? { ...section, submitted: true } : section
        );
        setSections(updatedSections);
        sessionStorage.setItem("sections", JSON.stringify(updatedSections));
      }
    } catch (error) {
      console.error("Error saving questions:", error);
      alert(error.response?.data?.error || "Failed to save questions. Please try again.");
    }
  };

  const handlePublish = async () => {
    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        alert("Unauthorized access. Please log in again.");
        return;
      }

      const allQuestions = sections.flatMap(section => section.selectedQuestions);
      const uniqueQuestions = Array.from(new Set(allQuestions.map(JSON.stringify))).map(JSON.parse);
      const selectedStudentEmails = students
        .filter((student) => selectedStudents.includes(student.regno))
        .map((student) => student.email);

      const response = await axios.post("http://127.0.0.1:8000/api/mcq/publish-section/", {
        questions: uniqueQuestions,
        students: selectedStudents,
        studentEmails: selectedStudentEmails,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        alert("Questions published successfully!");
        sessionStorage.clear();
        navigate("/staffdashboard");
      } else {
        alert("Failed to publish questions.");
      }
    } catch (error) {
      console.error("Error publishing questions:", error);
      alert("An error occurred while publishing questions.");
    }
    setPublishDialogOpen(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "My Drive") setHighlightStep(1);
    else if (tab === "Dropbox") setHighlightStep(2);
    else if (tab === "My Device") setHighlightStep(3);
  };

  // Handle CSV Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("Please select a valid CSV file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvText = event.target.result;
        const rows = csvText.split("\n").map((row) => row.split(","));
        const headers = rows[0];
        const dataRows = rows.slice(1).filter((row) => row.length > 1);

        const formattedQuestions = dataRows.map((row) => ({
          question: row[0]?.replace(/["]/g, ""),
          options: [
            row[1]?.trim(),
            row[2]?.trim(),
            row[3]?.trim(),
            row[4]?.trim(),
            row[5]?.trim(),
            row[6]?.trim(),
          ].filter(Boolean) || [], // Ensure options is always an array
          correctAnswer: row[7]?.trim(),
          negativeMarking: row[8]?.trim(),
          mark: row[9]?.trim(),
          level: "easy", // Default level if not provided
          tags: [], // Default tags if not provided
        }));

        setQuestions(formattedQuestions);
        setShowImage(false); // Hide the image after upload
        alert("File uploaded successfully! Preview the questions below.");
      } catch (error) {
        console.error("Error processing file:", error);
        alert(`Error processing file: ${error.message}`);
      }
    };

    reader.onerror = (error) => {
      console.error("File reading error:", error);
      alert("Error reading file");
    };

    reader.readAsText(file);
  };

  // Handle Question Selection
  const handleSelectQuestion = (index) => {
    setSelectedQuestionsLocal((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Handle Select All
  const handleSelectAll = () => {
    if (selectedQuestionsLocal.length === questions.length) {
      setSelectedQuestionsLocal([]);
    } else {
      setSelectedQuestionsLocal(questions.map((_, index) => index));
    }
  };

  // Submit Selected Questions
  const handleSubmitBulkUpload = async () => {
    if (activeSectionIndex === null) {
      alert("Please select a section before adding questions.");
      return;
    }

    const section = sections[activeSectionIndex];
    if (selectedQuestionsLocal.length < section.numQuestions) {
      alert(`Please select at least ${section.numQuestions} questions.`);
      return;
    }
    const selected = selectedQuestionsLocal.map((index) => questions[index]);
    const updatedSections = sections.map((section, index) =>
      index === activeSectionIndex ? { ...section, selectedQuestions: selected } : section
    );
    setSections(updatedSections);
    sessionStorage.setItem("sections", JSON.stringify(updatedSections));
    setActiveComponent(null); // Close the bulk upload component after selection
    alert("Questions added successfully!");
  };

  // Pagination Logic
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bg-white p-6 shadow-md rounded-lg custom-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-yellow-500 p-2 rounded-full">
            <img src="/path-to-icon" alt="Icon" className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-medium">Section Name</h2>
        </div>
        <button
          className="bg-yellow-500 text-white p-2 rounded-full"
          onClick={handleAddSection}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>

      {/* Section Cards */}
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="bg-white p-6 shadow-md rounded-lg mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Section {sectionIndex + 1}</h3>
          <form className="space-y-4">
            {/* Section Name, Number of Questions and Duration (Same line in flex row) */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Section Name *</label>
                <input
                  type="text"
                  name="sectionName"
                  value={section.sectionName}
                  onChange={(e) => handleInputChange(e, sectionIndex)}
                  placeholder="Section"
                  className="w-64 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                  disabled={section.submitted}
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Number of Questions *</label>
                <input
                  type="number"
                  name="numQuestions"
                  value={section.numQuestions}
                  onChange={(e) => handleInputChange(e, sectionIndex)}
                  placeholder="10"
                  className="w-40 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                  disabled={section.submitted}
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Section Duration (Min)</label>
                <input
                  type="number"
                  name="sectionDuration"
                  value={section.sectionDuration}
                  onChange={(e) => handleInputChange(e, sectionIndex)}
                  placeholder="10"
                  className="w-40 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                  disabled={section.submitted}
                />
              </div>
            </div>

            {/* Mark Allotment and Pass Percentage */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Mark Allotment *</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    name="markAllotment"
                    value={section.markAllotment}
                    onChange={(e) => handleInputChange(e, sectionIndex)}
                    placeholder="01"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                    disabled={section.submitted}
                  />
                  <span className="ml-2">/ Question</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Pass Percentage</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    name="passPercentage"
                    value={section.passPercentage}
                    onChange={(e) => handleInputChange(e, sectionIndex)}
                    placeholder="50"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                    disabled={section.submitted}
                  />
                  <span className="ml-2">%</span>
                </div>
              </div>
            </div>

            {/* Time Restriction Toggle */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Time Restriction *</label>
              <input
                type="checkbox"
                name="timeRestriction"
                checked={section.timeRestriction}
                onChange={(e) => handleInputChange(e, sectionIndex)}
                className="w-6 h-6 text-yellow-500 border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
                disabled={section.submitted}
              />
            </div>

            {/* Add Questions Button */}
            {/* Set type to "button" to prevent form submission */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleOptionSelect("bulkUpload", sectionIndex)}
                className="bg-indigo-900 text-white w-full py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex-1"
                disabled={section.submitted}
              >
                Add Questions
              </button>
              <button
                type="button"
                onClick={() => handleSaveQuestions(sectionIndex)}
                className="bg-green-500 text-white w-full py-2 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 flex-1"
                disabled={section.submitted}
              >
                Submit
              </button>
            </div>
          </form>

          {/* Display Selected Questions */}
          {section.selectedQuestions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Selected Questions</h3>
              <div className="relative">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mb-2"
                  onClick={() => {
                    const updatedSections = sections.map((s, index) =>
                      index === sectionIndex ? { ...s, showDropdown: !s.showDropdown } : s
                    );
                    setSections(updatedSections);
                  }}
                >
                  {section.showDropdown ? "Hide Questions" : "Show Questions"}
                </button>
                {section.showDropdown && (
                  <div className="bg-white shadow-md rounded-lg p-4 border border-gray-300">
                    <table className="table-auto w-full bg-white shadow-lg rounded-lg overflow-hidden">
                      <thead className="bg-gray-200 text-gray-800">
                        <tr>
                          <th className="px-4 py-2">Question</th>
                          <th className="px-4 py-2">Options</th>
                          <th className="px-4 py-2">Correct Answer</th>
                          <th className="px-4 py-2">Level</th>
                          <th className="px-4 py-2">Tags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.selectedQuestions.map((q, index) => (
                          <tr
                            key={index}
                            className={`${
                              index % 2 === 0 ? "bg-gray-100" : "bg-white"
                            } text-gray-800`}
                          >
                            <td className="px-4 py-2">{q.question}</td>
                            <td className="px-4 py-2">{q.options.join(", ")}</td>
                            <td className="px-4 py-2">{q.correctAnswer}</td>
                            <td className="px-4 py-2 text-center">{q.level}</td>
                            <td className="px-4 py-2 text-center">{q.tags.join(", ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination Controls for Selected Questions */}
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-gray-600">
                        Page {currentPage} of {Math.ceil(section.selectedQuestions.length / questionsPerPage)}
                      </span>
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === Math.ceil(section.selectedQuestions.length / questionsPerPage)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {isModalOpen && (
        <QuestionModal
          onClose={handleModalClose}
          handleCreateManually={() => handleOptionSelect("manual", activeSectionIndex)}
          handleBulkUpload={() => handleOptionSelect("bulkUpload", activeSectionIndex)}
          handleMcqlibrary={() => handleOptionSelect("library", activeSectionIndex)}
          handleAi={() => handleOptionSelect("ai", activeSectionIndex)}
        />
      )}
      {activeComponent === "manual" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl overflow-y-auto max-h-[80vh]">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Manual Creation</h1>
              <p className="text-gray-500 text-sm">
                Create questions manually.
              </p>
            </div>
            <button
              onClick={() => setActiveComponent(null)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition mb-2"
            >
              Back
            </button>
            {/* Add your manual creation component here */}
          </div>
        </div>
      )}
      {activeComponent === "library" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl overflow-y-auto max-h-[80vh]">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Question Library</h1>
              <p className="text-gray-500 text-sm">
                Select questions from the library.
              </p>
            </div>
            <button
              onClick={() => setActiveComponent(null)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition mb-2"
            >
              Back
            </button>
            {/* Add your question library component here */}
          </div>
        </div>
      )}
      {activeComponent === "ai" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl overflow-y-auto max-h-[80vh]">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Generation</h1>
              <p className="text-gray-500 text-sm">
                Generate questions using AI.
              </p>
            </div>
            <button
              onClick={() => setActiveComponent(null)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition mb-2"
            >
              Back
            </button>
            {/* Add your AI generation component here */}
          </div>
        </div>
      )}
      {activeComponent === "bulkUpload" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl overflow-y-auto max-h-[80vh]">
            {/* Title Section */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Files</h1>
              <p className="text-gray-500 text-sm">
                Easily add questions by uploading your prepared files as{" "}
                <span className="font-medium text-gray-600">csv, xlsx etc.</span>
              </p>
            </div>
            <button
              onClick={() => setActiveComponent(null)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition mb-2"
            >
              Back
            </button>

            {/* Main Upload Section */}
            <div className="bg-white shadow-lg rounded-3xl p-8 w-full">
              {/* Tabs Section */}
              <div className="flex space-x-6 mb-6 justify-center">
                <button
                  className={`font-medium ${
                    activeTab === "My Drive"
                      ? "border-b-2 border-black text-black"
                      : "text-gray-500"
                  }`}
                  onClick={() => handleTabChange("My Drive")}
                >
                  My Drive
                </button>
                <button
                  className={`font-medium ${
                    activeTab === "Dropbox"
                      ? "border-b-2 border-black text-black"
                      : "text-gray-500"
                  }`}
                  onClick={() => handleTabChange("Dropbox")}
                >
                  Dropbox
                </button>
                <button
                  className={`font-medium ${
                    activeTab === "My Device"
                      ? "border-b-2 border-black text-black"
                      : "text-gray-500"
                  }`}
                  onClick={() => handleTabChange("My Device")}
                >
                  My Device
                </button>
              </div>

              {/* Upload Section */}
              <div className="flex flex-col items-center justify-center mb-6">
                {showImage && (
                  <img
                    src={GroupImage}
                    alt="Upload Illustration"
                    className="w-48 h-48 object-contain mb-4"
                  />
                )}
                <label
                  htmlFor="fileInput"
                  className="bg-yellow-400 text-black px-6 py-3 rounded-full shadow hover:bg-yellow-500 cursor-pointer transition"
                >
                  {showImage ? "Upload CSV" : "Add Question"}
                </label>
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  accept=".csv"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            {/* Questions Preview Section */}
            {questions.length > 0 && (
              <div className="bg-white shadow-lg rounded-3xl p-6 mt-8 w-full">
                <h2 className="text-2xl font-semibold mb-4">Questions Preview</h2>
                <div className="flex justify-between mb-4">
                  <button
                    onClick={handleSelectAll}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {selectedQuestionsLocal.length === questions.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <table className="table-auto w-full bg-white shadow-lg rounded-lg overflow-hidden">
                  <thead className="bg-gray-200 text-gray-800">
                    <tr>
                      <th className="px-4 py-2">Select</th>
                      <th className="px-4 py-2">Question</th>
                      <th className="px-4 py-2">Options</th>
                      <th className="px-4 py-2">Correct Answer</th>
                      <th className="px-4 py-2">Level</th>
                      <th className="px-4 py-2">Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentQuestions.map((q, index) => (
                      <tr
                        key={index}
                        className={`${
                          index % 2 === 0 ? "bg-gray-100" : "bg-white"
                        } text-gray-800`}
                      >
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedQuestionsLocal.includes(indexOfFirstQuestion + index)}
                            onChange={() => handleSelectQuestion(indexOfFirstQuestion + index)}
                          />
                        </td>
                        <td className="px-4 py-2">{q.question}</td>
                        <td className="px-4 py-2">{q.options.join(", ")}</td>
                        <td className="px-4 py-2">{q.correctAnswer}</td>
                        <td className="px-4 py-2 text-center">{q.level}</td>
                        <td className="px-4 py-2 text-center">{q.tags.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Page {currentPage} of {Math.ceil(questions.length / questionsPerPage)}
                  </span>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === Math.ceil(questions.length / questionsPerPage)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSubmitBulkUpload}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Submit Selected Questions
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Mcq_sectionDetails;

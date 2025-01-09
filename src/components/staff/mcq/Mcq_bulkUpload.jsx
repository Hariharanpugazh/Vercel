import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import GroupImage from "../../../assets/bulk.png";

const Mcq_bulkUpload = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("My Device"); // Default tab
  const [highlightStep, setHighlightStep] = useState(1); // Step highlight state
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [questionsPerPage] = useState(10); // Number of questions per page
  const [showImage, setShowImage] = useState(true); // Control visibility of the image
  const navigate = useNavigate();
  const location = useLocation();
  const requiredQuestions = location.state?.requiredQuestions || 0;
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

  useEffect(() => {
    // Load questions from local storage on component mount
    const storedQuestions = JSON.parse(localStorage.getItem("uploadedQuestions")) || [];
    setQuestions(storedQuestions);
  }, []);

  useEffect(() => {
    // Save questions to local storage whenever questions state changes
    localStorage.setItem("uploadedQuestions", JSON.stringify(questions));
  }, [questions]);

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

        console.log("Headers:", headers); // Debugging statement
        console.log("Data Rows:", dataRows); // Debugging statement

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

        console.log("Formatted Questions:", formattedQuestions); // Debugging statement

        setQuestions((prevQuestions) => [...prevQuestions, ...formattedQuestions]);
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
    setSelectedQuestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Handle Select All
  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(questions.map((_, index) => index));
    }
  };

  // Submit Selected Questions
  const handleSubmit = async () => {
    if (selectedQuestions.length < requiredQuestions) {
      alert(`Please select at least ${requiredQuestions} questions.`);
      return;
    }
    const token = localStorage.getItem("contestToken");
    const selected = selectedQuestions.map((index) => questions[index]);

    try {
      const response = await axios.post(
        `${API_BASE_URL }/api/mcq/save-questions/`,
        { questions: selected },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("API Response:", response.data); // Debugging statement

      alert("Questions added successfully!");
      setQuestions([]);
      setSelectedQuestions([]);
      navigate('/mcq/QuestionsDashboard');
    } catch (error) {
      console.error("Error submitting questions:", error);
      alert("Failed to submit questions. Please try again.");
    }
  };

  // Pagination Logic
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      {/* Title Section */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Files</h1>
        <p className="text-gray-500 text-sm">
          Easily add questions by uploading your prepared files as{" "}
          <span className="font-medium text-gray-600">csv, xlsx etc.</span>
        </p>
      </div>

      {/* Main Upload Section */}
      <div className="bg-white shadow-lg rounded-3xl p-8 w-[90%] max-w-4xl">
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
        <div className="bg-white shadow-lg rounded-3xl p-6 mt-8 w-[90%] max-w-5xl">
          <h2 className="text-2xl font-semibold mb-4">Questions Preview</h2>
          <div className="flex justify-between mb-4">
            <button
              onClick={handleSelectAll}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {selectedQuestions.length === questions.length ? "Deselect All" : "Select All"}
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
                      checked={selectedQuestions.includes(indexOfFirstQuestion + index)}
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
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Submit Selected Questions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mcq_bulkUpload;

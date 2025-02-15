import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse'; // For CSV parsing
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

// Define categories here
const predefinedCategories = ["Math", "Science", "History", "Geography"];

const borderRadius = '5px'; // Define borderRadius

const AddTest = () => {
  const navigate = useNavigate();
  const [testName, setTestName] = useState("");
  const [testLevel, setTestLevel] = useState("");
  const [testTags, setTestTags] = useState([]);
  const [testTagsInput, setTestTagsInput] = useState("");
  const [showDownloadSample, setShowDownloadSample] = useState(false);
  const [questions, setQuestions] = useState([{
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    level: "",
    tags: [],
    tagsInput: "" // Add a new field for managing tags input
  }]);
  const [showPopup, setShowPopup] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [manualCategory, setManualCategory] = useState("");

  const createTest = async () => {
    try {
      // Ensure the first question fields are filled
      const firstQuestion = questions[0];
      if (!firstQuestion.question || !firstQuestion.options[0] || !firstQuestion.options[1] || !firstQuestion.options[2] || !firstQuestion.options[3] || !firstQuestion.correctAnswer || !firstQuestion.level) {
        toast.error("Please fill all fields for the first question.");
        return;
      }

      // Remove tagsInput field before sending to API
      const questionsForApi = questions.map(q => ({
        question_id: uuidv4(),
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        level: q.level,
        tags: q.tags
      }));

      const response = await axios.post(`${API_BASE_URL}/api/create-test/`, {
        test_name: testName,
        level: testLevel,
        tags: testTags,
        category: selectedCategory === "Others" ? manualCategory : selectedCategory, // Include the selected category
        questions: questionsForApi
      });
      toast.success(response.data.message);
      toast.success('Test created successfully'); // Add this line
      navigate(-1);
    } catch (error) {
      console.error("Error creating test:", error);
      toast.error('Error creating test');
    }
  };

  const clearForm = () => {
    setTestName("");
    setTestLevel("");
    setTestTags([]);
    setTestTagsInput("");
    setQuestions([{
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      level: "",
      tags: [],
      tagsInput: ""
    }]);
    setFile(null);
    setParsedQuestions([]);
    setSelectedQuestions([]);
    setSelectedCategory("");
    setManualCategory("");
    toast.info('Form cleared');
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      level: "",
      tags: [],
      tagsInput: ""
    }]);
    toast.success('Question added');
  };

  const deleteQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    toast.success('Question deleted');
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === "tags") {
      newQuestions[index].tagsInput = value;
      // Only update tags array when there's a comma or Enter key press
      if (value.endsWith(',')) {
        const newTag = value.slice(0, -1).trim();
        if (newTag && !newQuestions[index].tags.includes(newTag)) {
          newQuestions[index].tags = [...newQuestions[index].tags, newTag];
        }
        newQuestions[index].tagsInput = '';
      }
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleTagKeyPress = (index, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newQuestions = [...questions];
      const newTag = newQuestions[index].tagsInput.trim();
      if (newTag && !newQuestions[index].tags.includes(newTag)) {
        newQuestions[index].tags = [...newQuestions[index].tags, newTag];
      }
      newQuestions[index].tagsInput = '';
      setQuestions(newQuestions);
    }
  };

  const removeTag = (questionIndex, tagIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].tags = newQuestions[questionIndex].tags.filter((_, i) => i !== tagIndex);
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const levels = ["Easy", "Medium", "Hard"];

  const handleBulkUpload = () => {
    setShowPopup(false);
    setShowBulkUpload(true);
  };

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
    parseFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const parseFile = (file) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const parsedData = results.data
          .filter(row => row.question && row.option1 && row.option2 && row.option3 && row.option4 && row.correctAnswer) // Filter out incomplete questions
          .map(row => ({
            question: row.question || "",
            options: [
              row.option1 || "",
              row.option2 || "",
              row.option3 || "",
              row.option4 || ""
            ],
            correctAnswer: row.correctAnswer || "", // Ensure correctAnswer is set
            level: row.Level || "",
            tags: row.tags ? row.tags.split(',').map(tag => tag.trim()) : []
          }));
        setParsedQuestions(parsedData);
      },
      error: (error) => {
        console.error("Error parsing file:", error);
      }
    });
  };

  const handleBulkUploadSubmit = async () => {
    try {
      const questionsForApi = selectedQuestions.map(q => ({
        question_id: uuidv4(),
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        level: q.level,
        tags: q.tags
      }));

      // Prepare the payload according to the required format
      const payload = {
        test_id: uuidv4(),
        test_name: testName,
        level: testLevel,
        tags: testTags,
        category: selectedCategory === "Others" ? manualCategory : selectedCategory, // Include the selected category
        questions: questionsForApi
      };

      // Directly post the questions to the bulk upload URL
      const uploadResponse = await axios.post(`${API_BASE_URL}/api/bulk-upload-to-test/`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      toast.success(uploadResponse.data.message);
      navigate(-1);
    } catch (error) {
      console.error("Error uploading test:", error);
      toast.error('Error uploading test');
    }
  };

  const handleQuestionSelection = (index, isChecked) => {
    const newSelectedQuestions = [...selectedQuestions];
    if (isChecked) {
      newSelectedQuestions.push(parsedQuestions[index]);
    } else {
      const questionIndex = newSelectedQuestions.findIndex(q => q.question === parsedQuestions[index].question);
      newSelectedQuestions.splice(questionIndex, 1);
    }
    setSelectedQuestions(newSelectedQuestions);
  };

  const handleTestLevelChange = (e) => {
    setTestLevel(e.target.value);
  };

  const handleTestTagsChange = (e) => {
    setTestTagsInput(e.target.value);
    if (e.target.value.endsWith(',')) {
      const newTag = e.target.value.slice(0, -1).trim();
      if (newTag && !testTags.includes(newTag)) {
        setTestTags([...testTags, newTag]);
      }
      setTestTagsInput('');
    }
  };

  const handleTestTagsKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = testTagsInput.trim();
      if (newTag && !testTags.includes(newTag)) {
        setTestTags([...testTags, newTag]);
      }
      setTestTagsInput('');
    }
  };

  const removeTestTag = (tagIndex) => {
    const newTags = testTags.filter((_, i) => i !== tagIndex);
    setTestTags(newTags);
  };

  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/sample_document.csv'; // Update the path to reference the public folder
    link.download = 'sample_document.csv'; // Corrected the file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Sample document downloaded');
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      setSelectedQuestions(parsedQuestions);
      toast.success('All questions selected');
    } else {
      setSelectedQuestions([]);
      toast.success('All questions deselected');
    }
  };

  return (
    <div className="px-24 py-10 rounded shadow-md bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 p-9 bg-opacity-50 popup z-[1000]">
          <div className="bg-white p-6 rounded shadow-md relative w-full max-w-[70%] mt-10">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-gray-500 "
            >
              <FontAwesomeIcon icon={faTimes} className='absolute top-5 right-5 w-6 h-6' />
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-left" style={{ color: '#111933' }}>Enter the Test Name</h2>
            <form className='flex flex-col space-y-4 mt-8'
              onSubmit={(e) => {
                e.preventDefault();
                const buttonType = e.nativeEvent.submitter.getAttribute("data-type");

                if (buttonType === "manual") {
                  setShowPopup(false);
                  setShowManualForm(true);
                } else if (buttonType === "bulkUpload") {
                  handleBulkUpload();
                } else {
                  console.log("Unknown button type");
                }
              }}>
              <div className="">
                <label className="block text-gray-700 text-sm font-semibold mb-1" style={{ color: '#111933' }}>Test Name:</label>
                <input
                  required
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  style={{ width: '100%', color: '#111933' }} // Increase width to 100%
                />
              </div>
              <div className="">
                <label className="block text-gray-700 text-sm font-semibold mb-1" style={{ color: '#111933' }}>Test Level:</label>
                <select
                  required
                  value={testLevel}
                  onChange={handleTestLevelChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  style={{ width: '100%', color: '#111933' }} // Increase width to 100%
                >
                  <option value="">Select Level</option>
                  {levels.map((level, idx) => (
                    <option key={idx} value={level} style={{ color: '#111933' }}>{level}</option>
                  ))}
                </select>
              </div>
              <div className="">
                <label className="block text-gray-700 text-sm font-semibold" style={{ color: '#111933' }}>Test Tags:</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {testTags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="bg-blue-100 text-[#111933] px-2 py-1 rounded-full text-sm flex items-center"
                      style={{ color: '#111933' }}
                    >
                      {tag}
                      <button
                        onClick={() => removeTestTag(tagIndex)}
                        className="ml-2 text-[#111933] hover:text-blue-900"
                        style={{ color: '#111933' }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={testTagsInput}
                  onChange={handleTestTagsChange}
                  onKeyPress={handleTestTagsKeyPress}
                  placeholder="Type and press Enter or comma to add tags"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  style={{ width: '100%', color: '#111933' }} // Increase width to 100%
                />
              </div>
              <div className="">
                <label className="block text-gray-700 text-sm font-semibold mb-2" style={{ color: '#111933' }}>Select Category:</label>
                <select
                  required
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  style={{ width: '100%', color: '#111933' }} // Increase width to 100%
                >
                  <option value="">Select Category</option>
                  {predefinedCategories.map((category, idx) => (
                    <option key={idx} value={category} style={{ color: '#111933' }}>{category}</option>
                  ))}
                  <option value="Others" style={{ color: '#111933' }}>Others</option>
                </select>
                {selectedCategory === "Others" && (
                  <input
                    type="text"
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    placeholder="Enter category manually"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
                    style={{ width: '100%', color: '#111933' }} // Increase width to 100%
                  />
                )}
              </div>

              <div className="flex justify-self-center  pt-12">
                <button
                  type="submit"
                  data-type="manual"
                  className="bg-yellow-500 text-white py-2 px-16  flex items-center hover-button"
                  style={{ backgroundColor: '#111933', borderWidth: '2px', borderRadius: '9px', color: 'white' }}
                >
                  Manual
                </button>
                
                
              <button
                  type="submit"
                  data-type="bulkUpload"
                  className="bg-yellow-500 text-primary py-2 px-6  hover-button "
                  style={{ backgroundColor: '#111933', borderWidth: '2px', borderRadius: '9px', color: 'white', marginLeft:'42rem' }}
                >
                  Bulk Upload
                </button>
             
              </div>
              
            </form>
          </div>
        </div>
      )}
      {showManualForm && (
        <div className=''>
          <div className="mb-8 w-56">
            <label className="block text-gray-700 text-sm font-semibold mb-2" style={{ color: '#111933' }}>Test Name:</label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="shadow appearance-none border rounded  py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              style={{ width: '100%', color: '#111933' }} // Increase width to 100%
            />
          </div>
          <div className='flex flex-1 space-x-4 items-end mb-6'>
            <div className="flex-1">
              <label className="block text-gray-700 text-sm font-semibold mb-2" style={{ color: '#111933' }}>Test Level:</label>
              <select
                value={testLevel}
                onChange={handleTestLevelChange}
                className="shadow appearance-none border rounded w-2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                style={{ width: '100%', color: '#111933' }} // Increase width to 100%
              >
                <option value="">Select Level</option>
                {levels.map((level, idx) => (
                  <option key={idx} value={level} style={{ color: '#111933' }}>{level}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 text-sm font-semibold mb-2" style={{ color: '#111933' }}>Select Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                style={{ width: '100%', color: '#111933' }} // Increase width to 100%
              >
                <option value="">Select Category</option>
                {predefinedCategories.map((category, idx) => (
                  <option key={idx} value={category} style={{ color: '#111933' }}>{category}</option>
                ))}
                <option value="Others" style={{ color: '#111933' }}>Others</option>
              </select>
              {selectedCategory === "Others" && (
                <input
                  type="text"
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  placeholder="Enter category manually"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
                  style={{ width: '100%', color: '#111933' }} // Increase width to 100%
                />
              )}
            </div>
          </div>
          <div className="mb-8 flex-1">
            <label className="block text-gray-700 text-sm font-semibold" style={{ color: '#111933' }}>Test Tags:</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {testTags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="bg-blue-100 text-[#111933] px-2 py-1 rounded-full text-sm flex items-center"
                  style={{ color: '#111933' }}
                >
                  {tag}
                  <button
                    onClick={() => removeTestTag(tagIndex)}
                    className="ml-2 text-[#111933] hover:text-blue-900"
                    style={{ color: '#111933' }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={testTagsInput}
              onChange={handleTestTagsChange}
              onKeyPress={handleTestTagsKeyPress}
              placeholder="Type and press Enter or comma to add tags"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              style={{ width: '100%', color: '#111933' }} // Increase width to 100%
            />
          </div>
          {questions.map((q, index) => (
            <div key={index} className="mb-4  pt-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-800" style={{ color: '#111933' }}>Question {index + 1}</h3>
              <div className="mb-2">
                <label className="block text-gray-700 text-sm mb-2" style={{ color: '#111933' }}>Question:</label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  style={{ width: '100%', color: '#111933' }} // Increase width to 100%
                />
              </div>
              {q.options.map((option, optionIndex) => (
                <div key={optionIndex} className="mb-2">
                  <label className="block text-gray-700 text-sm mb-2" style={{ color: '#111933' }}>Option {optionIndex + 1}:</label>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    style={{ width: '100%', color: '#111933' }} // Increase width to 100%
                  />
                </div>
              ))}
              <div className="mt-12">
                <label className="block text-gray-700 text-sm font-semibold mb-2" style={{ color: '#111933' }}>Correct Answer:</label>
                <select
                  value={q.correctAnswer}
                  onChange={(e) => handleQuestionChange(index, "correctAnswer", e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  style={{ width: '100%', color: '#111933' }} // Increase width to 100%
                >
                  <option value="">Select Correct Answer</option>
                  {q.options.map((option, optionIndex) => (
                    <option key={optionIndex} value={option} style={{ color: '#111933' }}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="mt-4 mb-12">
                <label className="block text-gray-700 text-sm font-semibold mb-2" style={{ color: '#111933' }}>Level:</label>
                <select
                  value={q.level}
                  onChange={(e) => handleQuestionChange(index, "level", e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  style={{ width: '100%', color: '#111933' }} // Increase width to 100%
                >
                  <option value="">Select Level</option>
                  {levels.map((level, idx) => (
                    <option key={idx} value={level} style={{ color: '#111933' }}>{level}</option>
                  ))}
                </select>
              </div>
              <div className="mb-10">
                <label className="block text-gray-700 text-sm font-semibold" style={{ color: '#111933' }}>Tags:</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {q.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="bg-blue-100 text-[#111933] px-2 py-1 rounded-full text-sm flex items-center"
                      style={{ color: '#111933' }}
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(index, tagIndex)}
                        className="ml-2 text-[#111933] hover:text-blue-900"
                        style={{ color: '#111933' }}
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={q.tagsInput}
                  onChange={(e) => handleQuestionChange(index, "tags", e.target.value)}
                  onKeyPress={(e) => handleTagKeyPress(index, e)}
                  placeholder="Type and press Enter or comma to add tags"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  style={{ width: '100%', color: '#111933' }} // Increase width to 100%
                />
              </div>
              <button
                onClick={() => deleteQuestion(index)}
                className=" p-2 rounded-lg bg-[#111933] border-[#111933] border text-[white] px-5"
              >
                Delete Question
              </button>
            </div>
          ))}
          <div className='w-full flex justify-between mt-14'>
            <button
              onClick={addQuestion}
              className=" p-2 rounded-lg bg-[#111933] border-[#111933] border text-[white] px-5"
            >
              Add Question
            </button>

            <div className="flex justify-center space-x-4">
              <button
                onClick={createTest}
                className=" p-2 rounded-lg bg-[#111933] border-[#111933] border text-[white] px-5"
              >
                Create Test
              </button>
              <button
                onClick={() => navigate(-1)}
                className=" p-2 rounded-lg bg-[#111933] border-[#111933] border text-[white] px-5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showBulkUpload && (
        <div>
          <div className='flex justify-between items-center'> <h2 className="text-2xl font-semibold mb-4 text-gray-800" style={{ color: '#111933' }}>Bulk Upload Test</h2> <button
            onClick={() => handleDownloadSample()}
            className=" p-2 rounded-lg bg-[#111933] border-[#111933] border text-white px-5"
          >
            Download Sample
          </button> </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" style={{ color: '#111933' }}>Test Name:</label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              style={{ width: '100%', color: '#111933' }} // Increase width to 100%
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" style={{ color: '#111933' }}>Test Level:</label>
            <select
              value={testLevel}
              onChange={handleTestLevelChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              style={{ width: '100%', color: '#111933' }} // Increase width to 100%
            >
              <option value="">Select Level</option>
              {levels.map((level, idx) => (
                <option key={idx} value={level} style={{ color: '#111933' }}>{level}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold" style={{ color: '#111933' }}>Test Tags:</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {testTags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="bg-blue-100 text-[#111933] px-2 py-1 rounded-full text-sm flex items-center"
                  style={{ color: '#111933' }}
                >
                  {tag}
                  <button
                    onClick={() => removeTestTag(tagIndex)}
                    className="ml-2 text-[#111933] hover:text-blue-900"
                    style={{ color: '#111933' }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={testTagsInput}
              onChange={handleTestTagsChange}
              onKeyPress={handleTestTagsKeyPress}
              placeholder="Type and press Enter or comma to add tags"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              style={{ width: '100%', color: '#111933' }} // Increase width to 100%
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2" style={{ color: '#111933' }}>Select Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              style={{ width: '100%', color: '#111933' }} // Increase width to 100%
            >
              <option value="">Select Category</option>
              {predefinedCategories.map((category, idx) => (
                <option key={idx} value={category} style={{ color: '#111933' }}>{category}</option>
              ))}
              <option value="Others" style={{ color: '#111933' }}>Others</option>
            </select>
            {selectedCategory === "Others" && (
              <input
                type="text"
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
                placeholder="Enter category manually"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
                style={{ width: '100%', color: '#111933' }} // Increase width to 100%
              />
            )}
          </div>
          <div {...getRootProps()} className="border-dashed border-2 border-gray-400 p-4 text-center">
            <input {...getInputProps()} />
            {isDragActive ? <p style={{ color: '#111933' }}>Drop the files here ...</p> : <p style={{ color: '#111933' }}>Drag 'n' drop some files here, or click to select files</p>}
          </div>
          <div className="mt-4">
            <input
              type="file"
              onChange={(e) => {
                setFile(e.target.files[0]);
                parseFile(e.target.files[0]);
              }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              style={{ width: '100%', color: '#111933' }} // Increase width to 100%
            />
          </div>
          {file && (
            <div className="mt-4">
              <p style={{ color: '#111933' }}>Selected file: {file.name}</p>
            </div>
          )}
          {parsedQuestions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-800" style={{ color: '#111933' }}>Preview Questions</h3>
              <div className="mb-4">
                <input
                  type="checkbox"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <label style={{ color: '#111933' }}> Select All</label>
              </div>
              {parsedQuestions.map((q, index) => (
                <div key={index} className="mb-4 border-t pt-4">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.some(sq => sq.question === q.question)}
                    onChange={(e) => handleQuestionSelection(index, e.target.checked)}
                  />
                  <h4 className="text-lg font-semibold mb-2 text-gray-800" style={{ color: '#111933' }}>Question {index + 1}</h4>
                  <p><strong style={{ color: '#111933' }}>Question:</strong> {q.question}</p>
                  <p><strong style={{ color: '#111933' }}>Options:</strong> {q.options.join(', ')}</p>
                  <p><strong style={{ color: '#111933' }}>correctAnswer:</strong> {q.correctAnswer}</p>
                  <p><strong style={{ color: '#111933' }}>Level:</strong> {q.level}</p>
                  <p><strong style={{ color: '#111933' }}>Tags:</strong> {q.tags.join(', ')}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={() => navigate(-1)}
              className=" p-2 rounded-lg bg-[#111933] border-[#111933] border text-white px-5"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkUploadSubmit}
              className=" p-2 rounded-lg bg-[#111933] border-[#111933] border text-white px-5"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTest;

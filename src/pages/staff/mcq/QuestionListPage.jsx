import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import McqTestQuestionList from '../../../components/McqLibrary/McqTestQuestionList';
import TestQuestionDetails from '../../../components/McqLibrary/TestQuestionDetails';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faSave, faPlus, faUpload, faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Papa from 'papaparse';
import { useDropzone } from 'react-dropzone';
import { X, Download } from 'lucide-react';
import Pagination from '@mui/material/Pagination';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import submiticon from '../../../assets/submit.svg';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

const QuestionListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [test, setTest] = useState(location.state['test'] || {});
  const [view, setView] = useState('list'); // 'list', 'details'
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTest, setEditedTest] = useState({ ...test, tags: test?.tags || [] });
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [isManualAddModalOpen, setIsManualAddModalOpen] = useState(false);
  const [testTags, setTestTags] = useState([]);

  const [manualCategory, setManualCategory] = useState("");
  const [testTagsInput, setTestTagsInput] = useState("");
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: '',
    level: '',
    tags: []
  });
  const [currentPreviewPage, setCurrentPreviewPage] = useState(1);
  const questionsPerPage = 3;

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

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    setView('details');
  };

  const handleBack = () => {
    setView('list');
    setSelectedQuestion(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const fetchAllTests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/fetch-all-tests/`);
      const tests = response.data.tests;
      setTest(tests.filter((t) => t._id === test._id)[0]);
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };

  useEffect(() => {
    fetchAllTests();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/update-test/${editedTest.test_id}/`,
        {
          test_name: editedTest.test_name,
          level: editedTest.level,
          tags: editedTest.tags,
          category: editedTest.category === "Others" ? manualCategory : editedTest.category,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        test.test_name = editedTest.test_name;
        test.level = editedTest.level;
        test.tags = editedTest.tags;
        setIsEditing(false);
        setEditedTest({ ...editedTest, ...response.data });
        toast.success('Test details saved successfully');
      } else {
        setError('Failed to update test');
        toast.error('Failed to update test');
      }
    } catch (error) {
      setError('An error occurred while updating the test');
      toast.error('An error occurred while updating the test');
      console.error('Error updating test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = () => {
    setIsManualAddModalOpen(true);
  };

  const handleManualAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/append-question-to-test/`,
        {
          test_id: editedTest.test_id,
          ...newQuestion
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setIsManualAddModalOpen(false);
        setNewQuestion({
          question: '',
          option1: '',
          option2: '',
          option3: '',
          option4: '',
          correctAnswer: '',
          level: '',
          tags: []
        });
        setEditedTest(prevTest => ({
          ...prevTest,
          questions: [...prevTest.questions, response.data.new_question],
        }));
        toast.success('Question added successfully');
      } else {
        setError('Failed to add question');
        toast.error('Failed to add question');
      }
    } catch (error) {
      setError('An error occurred while adding the question');
      toast.error('An error occurred while adding the question');
      console.error('Error adding question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = () => {
    setIsBulkUploadModalOpen(true);
  };

  const handleFileChange = (event) => {
    setUploadFile(event.target.files[0]);
    setPreviewQuestions([]);
    setError(null);

    if (event.target.files[0]) {
      Papa.parse(event.target.files[0], {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const questions = results.data
            .filter(question => question.question && question.correctAnswer)
            .map(question => ({
              ...question,
              level: question.level || question.Level,
              tags: question.tags ? question.tags.split(', ') : []
            }));
          setPreviewQuestions(questions);
        },
        error: (error) => {
          setError('Failed to parse the CSV file');
          console.error('Error parsing CSV file:', error);
        },
      });
    }
  };

  const onDrop = (acceptedFiles) => {
    setUploadFile(acceptedFiles[0]);
    setPreviewQuestions([]);
    setError(null);

    if (acceptedFiles[0]) {
      Papa.parse(acceptedFiles[0], {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const questions = results.data
            .filter(question => question.question && question.correctAnswer)
            .map(question => ({
              ...question,
              level: question.level || question.Level,
              tags: question.tags ? question.tags.split(', ') : []
            }));
          setPreviewQuestions(questions);
        },
        error: (error) => {
          setError('Failed to parse the CSV file');
          console.error('Error parsing CSV file:', error);
        },
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleFileUpload = async () => {
    if (!uploadFile) {
      setError('Please select a file to upload');
      return;
    }

    const payload = {
      test_id: editedTest.test_id,
      questions: previewQuestions,
    };

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/bulk-upload-questions-to-test/`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        const uploadedQuestions = Array.isArray(response.data.questions) ? response.data.questions : [];
        setIsBulkUploadModalOpen(false);
        setUploadFile(null);
        setPreviewQuestions([]);
        setEditedTest(prevTest => ({
          ...prevTest,
          questions: [...prevTest.questions, ...uploadedQuestions],
        }));
        toast.success('Questions uploaded successfully');
      } else {
        setError('Failed to upload questions');
        toast.error('Failed to upload questions');
      }
    } catch (error) {
      setError('An error occurred while uploading the questions');
      toast.error('An error occurred while uploading the questions');
      console.error('Error uploading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsBulkUploadModalOpen(false);
    setUploadFile(null);
    setPreviewQuestions([]);
    setError(null);
  };

  const handleCloseManualAddModal = () => {
    setIsManualAddModalOpen(false);
    setNewQuestion({
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswer: '',
      level: '',
      tags: []
    });
    setError(null);
  };

  const handlePrevPage = () => {
    setCurrentPreviewPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPreviewPage(prevPage => Math.min(prevPage + 1, Math.ceil(previewQuestions.length / questionsPerPage)));
  };

  const getCurrentQuestions = () => {
    const startIndex = (currentPreviewPage - 1) * questionsPerPage;
    const endIndex = startIndex + questionsPerPage;
    return previewQuestions.slice(startIndex, endIndex);
  };

  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/sample_document.csv';
    link.download = 'sample_document.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const inputRef = useRef(null);

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  if (!test) {
    return <div>No test selected</div>;
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col p-4 relative px-12">
      {view === 'details' && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex items-start justify-center pt-4" style={{ zIndex: 1000 }}>
          <TestQuestionDetails
            selectedQuestion={selectedQuestion}
            setSelectedQuestion={setSelectedQuestion}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            testId={test.test_id}
            isLoading={loading}
            setIsLoading={setLoading}
            setView={setView}
          />
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          {isEditing && (
            <button
              onClick={handleSave}
              className="bg-[#111933] text-white p-2 rounded-full flex items-center px-4"
              disabled={loading}
            >
              <FontAwesomeIcon icon={faSave} className='mr-2' /> <p className='text-sm'> Save Test Details </p>
            </button>
          )}
        </div>
      </div>

      <div className="my-8">
        {isEditing ? (
          <div className='flex flex-col'>
            <input
              type="text"
              value={editedTest.test_name}
              onChange={(e) => setEditedTest({ ...editedTest, test_name: e.target.value })}
              className="text-2xl border rounded-lg px-3 mb-2 p-2 bg-transparent outline-blue-400 text-[#111933]"
            />

            {/* new */}
            <div className='flex items-start my-6 space-x-4'>
              <div className="flex-1">
                <label className="block text-gray-700 text-sm font-semibold mb-1" style={{ color: '#111933' }}>Test Level:</label>
                <select
                  required
                  value={editedTest.level}
                  onChange={(e) => setEditedTest({ ...editedTest, level: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  style={{ width: '100%', color: '#111933' }} // Increase width to 100%
                >
                  <option value="">Select Level</option>
                  {["Easy", "Medium", "Hard"].map((level, idx) => (
                    <option key={idx} value={level} style={{ color: '#111933' }}>{level}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 text-sm font-semibold mb-1" style={{ color: '#111933' }}>Select Category:</label>
                <select
                  required
                  value={editedTest.category}
                  onChange={(e) => setEditedTest({ ...editedTest, category: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  style={{ width: '100%', color: '#111933' }} // Increase width to 100%
                >
                  <option value="">Select Category</option>
                  {["Math", "Science", "History", "Geography"].map((category, idx) => (
                    <option key={idx} value={category} style={{ color: '#111933' }}>{category}</option>
                  ))}
                  <option value="Others" style={{ color: '#111933' }}>Others</option>
                </select>
                {editedTest.category === "Others" && (
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
            <div className="">
              <label className="block text-gray-700 text-sm font-semibold" style={{ color: '#111933' }}>Test Tags:</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {testTags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                    style={{ color: '#111933' }}
                  >
                    {tag}
                    <button
                      onClick={() => removeTestTag(tagIndex)}
                      className="ml-2 text-blue-800 hover:text-blue-900"
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
          </div>
        ) : (
          <>
            <div className='flex flex-1 justify-between items-center'>
              <div className='flex flex-col space-y-3'>
                <h1 className="text-3xl font-bold text-[#111933]">{test.test_name}</h1>
                <div className='flex space-x-4'>
                  <p className='text-xl text-[#111933] pr-4 border-r border-r-[#111933]'> Category: {test.category} </p>
                  <p className='text-xl text-[#111933] pr-4 border-r border-r-[#111933]'> Level: {test.level} </p>
                  <p className='text-xl text-[#111933]'> # {test.tags.join(', ')} </p>
                </div>
              </div>
              <div className='flex space-x-2'>
                {!isEditing && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="bg-blue-500 text-white p-2 rounded-lg px-3 flex items-center"
                      style={{ backgroundColor: '#111933' }}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={handleManualAdd}
                      className="bg-blue-500 text-white p-2 rounded-lg px-3 flex items-center"
                      style={{ backgroundColor: '#111933' }}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                    <button
                      onClick={handleBulkUpload}
                      className="bg-blue-500 text-white p-2 rounded-lg px-3 flex items-center"
                      style={{ backgroundColor: '#111933' }}
                    >
                      <FontAwesomeIcon icon={faUpload} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <McqTestQuestionList
        testId={test.test_id}
        questions={editedTest.questions || []}
        setSelectedQuestion={handleQuestionClick}
        currentQuestions={editedTest.questions || []}
        currentPage={currentPage}
        totalPages={1}
        setCurrentPage={setCurrentPage}
        setQuestions={() => { }}
        isEditMode={isEditing}
        deleteSelectedQuestions={() => { }}
      />
      {error && <div className="text-red-500">{error}</div>}
      {isBulkUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ">
          <div className='max-h-full py-4'>
            <div className="bg-white overflow-auto max-h-full rounded-xl shadow-xl max-w-2xl w-full p-6 transform transition-all duration-300 scale-100 opacity-100">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-[#111933]">
                  Bulk Upload
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-[#111933] mb-2">
                Upload a CSV file containing multiple questions. Maximum file size: 5MB
              </p>
              <button
                onClick={handleDownloadSample}
                className="mb-2 w-full bg-[#E3E3E3] bg-opacity-70 text-[#111933] hover:bg-[#E3E3E3] hover:bg-opacity-100 py-2 px-4 rounded-md text-sm font-medium flex justify-between items-center"
              >
                <span>Download Sample</span>
                <Download className="w-5 h-5 text-[#111933]" />
              </button>
              <div
                className={`
                  w-full
                  border-2
                  border-dashed
                  rounded-lg
                  p-6
                  text-center
                  transition-colors
                  duration-300
                  mb-2
                  ${isDragActive
                    ? 'border-[#FDC500] bg-[#FDC500] bg-opacity-10'
                    : 'border-[#111933] border-opacity-20'
                  }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={onDrop}
                onClick={onButtonClick}
              >
                <input
                  ref={inputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <FontAwesomeIcon icon={faUpload} className="w-10 h-10 text-[#111933] opacity-50" />
                  <p className="text-sm text-[#111933]">
                    Drag and drop CSV file here, or{' '}
                    <span
                      onClick={onButtonClick}
                      className="text-[#FDC500] cursor-pointer hover:underline"
                    >
                      browse
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">CSV files only (max 5MB)</p>
                </div>
              </div>

              {uploadFile && (
                <div className="mt-2">
                  <p>Selected file: {uploadFile.name}</p>
                </div>
              )}

              {previewQuestions.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-lg font-bold mb-1">Preview</h3>
                  <div className="flex justify-between mb-1">
                    <button
                      onClick={() => setPreviewQuestions(previewQuestions.map(q => ({ ...q, selected: true })))}
                      className="bg-blue-500 text-white p-2 rounded-full flex items-center"
                      style={{ backgroundColor: '#111933' }}
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setPreviewQuestions(previewQuestions.map(q => ({ ...q, selected: false })))}
                      className="bg-blue-500 text-white p-2 rounded-full flex items-center"
                      style={{ backgroundColor: '#111933' }}
                    >
                      Deselect All
                    </button>
                  </div>
                  <ul className="overflow-x-auto">
                    {getCurrentQuestions().map((question, index) => (
                      <li key={index} className="mb-1 p-2 border-b border-gray-200 flex items-center">
                        <input
                          type="checkbox"
                          checked={question.selected}
                          onChange={() => setPreviewQuestions(prevQuestions =>
                            prevQuestions.map(q => q.question === question.question ? { ...q, selected: !q.selected } : q)
                          )}
                          className="mr-2"
                        />
                        <div>
                          <strong>Question:</strong> {question.question}<br />
                          <strong>Correct Answer:</strong> {question.correctAnswer}<br />
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-center mt-2">
                    <Pagination
                      count={Math.ceil(previewQuestions.length / questionsPerPage)}
                      page={currentPreviewPage}
                      onChange={(event, value) => setCurrentPreviewPage(value)}
                      sx={{
                        '& .MuiPaginationItem-root': {
                          color: '#111933',
                        },
                        '& .MuiPaginationItem-root.Mui-selected': {
                          backgroundColor: '#FDC500',
                          color: '#fff',
                        },
                        '& .MuiPaginationItem-root:hover': {
                          backgroundColor: 'rgba(0, 9, 117, 0.1)',
                        },
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleFileUpload}
                className="bg-blue-500 text-white p-2 flex items-center mt-2"
                style={{ backgroundColor: '#111933', borderRadius: '9px' }}
                disabled={loading}
              >
                Upload
              </button>

              {error && (
                <div className={`mt-2 p-2 rounded-md ${error.startsWith("Success")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
                  }`}>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {isManualAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-4/5 max-w px-16 py-8 overflow-hidden transform transition-all duration-300">
            <div className="flex mb-10">
              <div className='w-full'>
                <h2 className="text-lg font-semibold text-[#111933] pb-2">Add New Question</h2>
                <h2 className="text-sm font-light text-[#111933] pb-4">Choose how you’d like to add questions to your assessment. Select the method that works best for you to quickly build your test.</h2>
                <div className='border-b-2 border-[#111933]'></div>
              </div>
              <button
                onClick={handleCloseManualAddModal}
                className="text-[#111933] hover:text-[#fc2c2c]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleManualAddSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 mr-4">
                  <label className="block text-sm font-medium text-[#111933] mb-1">
                    Question <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="question"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    placeholder="Type your question here"
                    style={{ paddingBottom: '10rem' }}
                    className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                    rows={2}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#111933] mb-1">
                    Choice <span className="text-red-500">*</span>
                  </label>
                  {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
                    <div key={optionKey} className="flex items-center space-x-2 mb-4">
                      <input
                        type="text"
                        name={optionKey}
                        value={newQuestion[optionKey]}
                        placeholder='Type your choice here'
                        onChange={(e) => setNewQuestion({ ...newQuestion, [optionKey]: e.target.value })}
                        className="flex-1 p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 pr-20">
                  <label className="block text-sm font-medium text-[#111933] mb-1">
                    Select correct answer <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="correctAnswer"
                    value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                    className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                    required
                  >
                    <option value="">Select Correct Answer</option>
                    {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
                      newQuestion[optionKey] && (
                        <option key={optionKey} value={newQuestion[optionKey]}>
                          Option {index + 1}: {newQuestion[optionKey]}
                        </option>
                      )
                    ))}
                  </select>
                </div>
                <div className="flex-1 pr-20">
                  <label className="block text-sm font-medium text-[#111933] mb-1">
                    Difficulty Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="level"
                    value={newQuestion.level}
                    onChange={(e) => setNewQuestion({ ...newQuestion, level: e.target.value })}
                    className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                    required
                  >
                    <option value="">Select Level</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#111933] mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={newQuestion.tags.join(', ')}
                    onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value.split(', ') })}
                    className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                    placeholder="e.g., math, algebra, geometry"
                  />
                  <p className="mt-1 text-sm text-[#111933]">Separate tags with commas</p>
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-1 w-144px mt-2 font-medium bg-[#111933] text-[#ffffff] hover:bg-[#111933] focus:outline-none focus:ring-2 focus:ring-offset-2 transform transition-transform duration-300 hover:scale-102 cursor-pointer"
                  style={{ borderRadius: '0.5rem' }}
                >
                  Submit
                  <img src={submiticon} alt="submit" className="w-4 h-4 ml-2" />
                </button>
              </div>
              {error && (
                <div
                  className={`p-2 rounded-lg text-sm font-medium text-center shadow-sm ${error.startsWith("Success")
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    }`}
                >
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default QuestionListPage;

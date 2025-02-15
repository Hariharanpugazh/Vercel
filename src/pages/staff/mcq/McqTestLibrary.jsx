import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faArrowLeft, faPlus, faSearch, faSort } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import AddTest from '../../../components/McqLibrary/AddTest'; // Import AddTest component
import McqTestQuestionList from '../../../components/McqLibrary/McqTestQuestionList'; // Import McqTestQuestionList component
import QuestionDetails from '../../../components/McqLibrary/QuestionDetails';
import { Box } from "@mui/material";
import testicon from "../../../assets/TestLibrary.svg"; // Adjust the path as necessary
import filterIcon from "../../../assets/filter.svg"; // Adjust the path as necessary
import sortIcon from "../../../assets/sort.svg"; // Adjust the path as necessary
import Pagination from '@mui/material/Pagination';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

Modal.setAppElement('#root');

const Mcqtest = () => {
  const [allTests, setAllTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [testName, setTestName] = useState("");
  const [testLevel, setTestLevel] = useState("");
  const [testTags, setTestTags] = useState([]);
  const [testTagsInput, setTestTagsInput] = useState("");
  const [questions, setQuestions] = useState([{ question: "", options: ["", "", "", ""], answer: "", level: "", tags: [] }]);
  const [editingTestId, setEditingTestId] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [isSortPopupOpen, setIsSortPopupOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [testToDelete,setTestToDelete] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();
  const location = useLocation();

  const fetchAllTests = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/fetch-all-tests/`);
      setAllTests(response.data.tests);

      // Extract unique categories from the fetched tests data
      const uniqueCategories = [...new Set(response.data.tests.map(test => test.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching tests:", error);
      toast.error("Error fetching tests."); // Add error toast
    }
  };

  useEffect(() => {
    fetchAllTests();
    // Check if we are in edit mode from navigation state
    if (location.state && location.state.isEditMode) {
      handleEdit(location.state.test);
    }
  }, [location.state]);

  useEffect(() => {
    filterTests();
  }, [searchQuery, selectedLevels, selectedCategories, sortOrder, allTests]);

  const filterTests = () => {
    console.log("Filtering tests with:", { searchQuery, selectedLevels, selectedCategories, sortOrder });

    let filtered = allTests;

    if (searchQuery) {
      filtered = filtered.filter(test =>
        test.test_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLevels.length > 0) {
      filtered = filtered.filter(test =>
        selectedLevels.includes(test.level)
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(test =>
        selectedCategories.includes(test.category)
      );
    }

    if (sortOrder) {
      filtered = filtered.sort((a, b) => {
        if (sortOrder === "name_asc") {
          return a.test_name.localeCompare(b.test_name);
        } else if (sortOrder === "name_desc") {
          return b.test_name.localeCompare(a.test_name);
        } else if (sortOrder === "level_asc") {
          return a.level.localeCompare(b.level);
        } else if (sortOrder === "level_desc") {
          return b.level.localeCompare(a.level);
        }
        return 0;
      });
    }

    console.log("Filtered tests:", filtered);
    setFilteredTests(filtered);
  };

  const updateTest = async (testId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/update-test/${testId}/`, {
        test_name: testName,
        level: testLevel,
        tags: testTags,
        questions: questions.map(q => ({
          question_id: q.question_id || uuidv4(),
          question: q.question,
          options: q.options,
          answer: q.answer,
          level: q.level,
          tags: q.tags
        }))
      });
      toast.success(response.data.message); // Add success toast
      fetchAllTests();
      clearForm();
      setEditingTestId(null);
      setSelectedTest(null);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating test:", error);
      toast.error("Error updating test."); // Add error toast
    }
  };

  const deleteSelectedQuestions = async () => {
    try {
      const updatedQuestions = questions.filter(q => !selectedQuestions.includes(q.question_id));
      setQuestions(updatedQuestions);
      setSelectedQuestions([]);
      toast.success("Selected questions deleted successfully."); // Add success toast
    } catch (error) {
      console.error("Error deleting selected questions:", error);
      toast.error("Error deleting selected questions."); // Add error toast
    }
  };

  const clearForm = () => {
    setTestName("");
    setTestLevel("");
    setTestTags([]);
    setTestTagsInput("");
    setQuestions([{ question: "", options: ["", "", "", ""], answer: "", level: "", tags: [] }]);
  };

  const handleEdit = (test) => {
    setTestName(test.test_name);
    setTestLevel(test.level);
    setTestTags(test.tags);
    setQuestions(test.questions.map(q => ({
      ...q,
      tags: q.tags || []
    })));
    setEditingTestId(test.test_id);
    setSelectedTest(test);
    setIsEditMode(true);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], answer: "", level: "", tags: [] }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === "tags") {
      newQuestions[index][field] = value;
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleUpdate = async (questionId) => {
    setIsLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/update-question/${questionId}/`, selectedQuestion);
      toast.success(response.data.message); // Add success toast
      fetchAllTests();
      setSelectedQuestion(null);
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Error updating question."); // Add error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionSelect = (questionId) => {
    setSelectedQuestions(prevSelected =>
      prevSelected.includes(questionId)
        ? prevSelected.filter(id => id !== questionId)
        : [...prevSelected, questionId]
    );
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

  const openModal = (test) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTest(null);
  };

  const openQuestionModal = (question) => {
    setSelectedQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const closeQuestionModal = () => {
    setIsQuestionModalOpen(false);
    setSelectedQuestion(null);
  };

  const handleTestClick = (test) => {
    navigate('/mcq/TestLibrary/Questionlist', { state: { test } });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterLevelChange = (level) => {
    setSelectedLevels(prevLevels =>
      prevLevels.includes(level)
        ? prevLevels.filter(l => l !== level)
        : [...prevLevels, level]
    );
  };

  const handleFilterCategoryChange = (category) => {
    setSelectedCategories(prevCategories =>
      prevCategories.includes(category)
        ? prevCategories.filter(c => c !== category)
        : [...prevCategories, category]
    );
  };

  const handleSortOrderChange = (order) => {
    setSortOrder(order);
    setIsSortPopupOpen(false);
  };

  const handleClearAll = () => {
    setSelectedLevels([]);
    setSelectedCategories([]);
    setSortOrder("");
    setSearchQuery("");
    setIsFilterPopupOpen(false);
    setIsSortPopupOpen(false);
  };

  const handleApply = () => {
    filterTests();
    setIsFilterPopupOpen(false);
    setIsSortPopupOpen(false);
  };

  const deleteTest = async (testId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/delete-test/${testId}/`);
        toast.success("Test deleted successfully!"); // Add success toast
        fetchAllTests();
        setSelectedTest(null);
    } catch (error) {
      console.error("Error deleting test:", error);
      toast.error("Error deleting test."); // Add error toast
    }
  };

  const handleDeleteClick = (test_id) => {
    setTestToDelete(test_id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (testToDelete) {
      deleteTest(testToDelete);
      setShowConfirmModal(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setTestToDelete(null);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getItemsPerPage = () => itemsPerPage;

  const paginatedTests = filteredTests.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="min-h-screen py-5 px-6 bg-[#f4f6ff86] flex flex-col">
      <ToastContainer /> {/* Add ToastContainer here */}
      <style>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr); // Always show 4 columns
          gap: 1rem;
        }
        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 5px;
          max-width: 600px;
          margin: auto;
          position: relative;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .text-primary {
          color: #000975; // Change text color to #000975
        }
        .hover-button:hover {
          background-color: #FDC500 !important;
        }
        .hover-button2:hover {
          background-color: #D5D5D5 !important;
        }
        .filter-popup {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          background: white;
          border: 1px solid #ccc;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .filter-item {
          background: rgba(182,182,182,0.1);
          border: 1px solid #B6B6B6;
          border-radius: 5px;
          padding: 0.5rem;
          text-align: center;
          cursor: pointer;
          transition: background 0.3s;
          list-style: none;
          margin-bottom: 0.5rem;
          color: #000975;
        }
        .filter-item:hover {
          background: rgba(253,197,0);
        }
        .sort-popup {
          display: block;
          padding-top: 0.3rem;
          padding-left: 0.6rem;
          padding-right: 0.6rem;
          padding-bottom: 0.1rem;
          background: white;
          border: 1px solid #B6B6B6;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .sort-item {
          background: rgba(182,182,182,0.1);
          border: 1px solid #B6B6B6;
          border-radius: 5px;
          padding: 0.5rem;
          text-align: center;
          cursor: pointer;
          transition: background 0.3s;
          list-style: none;
          margin-bottom: 0.5rem;
          color: #000975; /* Changes the text color to #000975 */
        }
        .sort-item:hover {
          background: rgba(253,197,0);
        }
        .popup {
          z-index: 1000; // Ensure the popup appears above the navbar
        }
      `}</style>
      <div className="w-full p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary pt-5 px-14">Test Library</h2>
        </div>
        <div className="mb-4 px-14 rounded-full relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search tests"
              className="shadow appearance-none border rounded w-full py-2 pl-10 pr-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              style={{ borderRadius: '50px' }} // Added border radius
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
          </div>
        </div>

        <div className="flex items-center mb-4 px-14">
          <div className="relative mr-2" onClick={(e) => { e.stopPropagation(); setIsFilterPopupOpen(!isFilterPopupOpen); }}>
            <img src={filterIcon} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" alt="Filter Icon" width="16" height="16" />
            <input
              type="text"
              value={selectedLevels.length > 0 || selectedCategories.length > 0 ? `Filter: ${selectedLevels.join(', ')} ${selectedCategories.join(', ')}` : 'Filter'}
              onChange={() => { }}
              placeholder="Filter"
              className="font-semibold rounded w-24 py-2 pl-10 pr-4 leading-tight focus:outline-none focus:shadow-outline"
              style={{ borderRadius: '50px', backgroundColor:["#111933"], color: 'white' }} // Updated text color
              readOnly
            />
            {isFilterPopupOpen && (
              <div className="filter-popup absolute left-0 mt-2 w-auto bg-white border border-gray-300 rounded shadow-lg z-50" onClick={(e) => e.stopPropagation()}>
                <div className="p-4">
                  <div className="mb-4">
                    <h1 style={{ color: '#000975' }} className="font-bold mb-2">Level</h1>
                    <div className="grid grid-cols-3 gap-4">
                      <div className={`filter-item ${selectedLevels.includes("Easy") ? 'bg-blue-200' : ''}`} onClick={() => handleFilterLevelChange("Easy")}>Easy</div>
                      <div className={`filter-item ${selectedLevels.includes("Medium") ? 'bg-blue-200' : ''}`} onClick={() => handleFilterLevelChange("Medium")}>Medium</div>
                      <div className={`filter-item ${selectedLevels.includes("Hard") ? 'bg-blue-200' : ''}`} onClick={() => handleFilterLevelChange("Hard")}>Hard</div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h1 style={{ color: '#000975' }} className="font-bold mb-2">Category</h1>
                    <div className="grid grid-cols-3 gap-4">
                      {categories.map((category, index) => (
                        <div key={index} className={`filter-item ${selectedCategories.includes(category) ? 'bg-blue-200' : ''}`} onClick={() => handleFilterCategoryChange(category)}>
                          {category}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button className=" text-primary rounded mr-2" onClick={handleClearAll}>Clear All</button>
                    <button className=" text-primary rounded" onClick={handleApply}>Apply</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="border-2 border-gray-300 h-6 mx-2" style={{ borderRadius: "9px" }}></div>
          <div className="relative ml-2" onClick={() => setIsSortPopupOpen(!isSortPopupOpen)}>
            <img src={sortIcon} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" alt="Sort Icon" width="16" height="16" />
            <input
              type="text"
              value={sortOrder}
              onChange={() => { }}
              placeholder="Sort by"
              className="font-semibold rounded w-28 py-2 pl-10 pr-3 leading-tight focus:outline-none focus:shadow-outline"
              style={{ borderRadius: '50px', backgroundColor:["#111933"], color: 'white' }}// Updated text color
              readOnly
            />
            {isSortPopupOpen && (
              <div className="sort-popup absolute left-0 mt-2 w-auto bg-white border border-gray-300 rounded shadow-lg z-50">
                <ul className="py-2">
                  <li className="sort-item" onClick={() => handleSortOrderChange("name_asc")}>Name (A-Z)</li>
                  <li className="sort-item" onClick={() => handleSortOrderChange("name_desc")}>Name (Z-A)</li>
                  <li className="sort-item" onClick={() => handleSortOrderChange("level_asc")}>Level (Asc)</li>
                  <li className="sort-item" onClick={() => handleSortOrderChange("level_desc")}>Level (Desc)</li>
                </ul>
              </div>
            )}
          </div>
          <div className="flex-grow"></div> {/* Flex-grow to push the button to the right */}
          <button
            onClick={() => navigate('/library/mcq/test/addtest')}
            className="bg-#111933 text-white p-2 flex items-center"
            style={{ backgroundColor: "#111933",  borderWidth: '2px', borderRadius: '10px', }}
          >
            Create Library
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4 ml-14 mr-14">
          {selectedLevels.map((level, index) => (
            <span key={index} className="bg-blue-100 text-primary px-2 py-1 rounded-full text-sm flex items-center">
              {level}
              <button onClick={() => handleFilterLevelChange(level)} className="ml-2 text-blue-800 hover:text-blue-900">×</button>
            </span>
          ))}
          {selectedCategories.map((category, index) => (
            <span key={index} className="bg-blue-100 text-primary px-2 py-1 rounded-full text-sm flex items-center">
              {category}
              <button onClick={() => handleFilterCategoryChange(category)} className="ml-2 text-blue-800 hover:text-blue-900">×</button>
            </span>
          ))}
        </div>

        {isAddingTest ? (
          <AddTest fetchAllTests={fetchAllTests} setIsAddingTest={setIsAddingTest} />
        ) : (
          <div className="grid bg-white rounded-2xl grid-cols-4 p-7 ml-14 mr-12 gap-6" style={{ height: 'calc(160px * 2 + 1rem * 2)' }}>
            {paginatedTests.map((test) => (
              <Box
                key={test.test_id}
                sx={{
                  width: '100%',
                  height: 160,
                  background: "linear-gradient(to bottom right, rgba(240, 247, 255, 0.8), white)", // Change to gradient background
                  borderRadius: "15px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "1rem",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div>
                  <div className="flex items-center pl-2">
                    <img src={testicon} alt="Test Icon" className="w-4 h-4 mr-2" />
                    <h3 className="font-bold pl-2 text-xl text-primary">{test.test_name}</h3>
                  </div>
                  <div className="flex items-center space-x-4 px-6 pt-4">
                    <p className="text-sm text-black">Level: <strong>{test.level}</strong></p>
                    <p className="text-sm text-black">Category: <strong>{test.category}</strong></p>
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    className="text-primary px-2 py-1 rounded hover-button2"
                    style={{ backgroundColor: 'rgba(213, 213, 213, 0.4)', borderColor: '#D5D5D5', borderWidth: '2px', borderRadius: '5px', width: '100px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(test.test_id);
                    }}
                  >
                    Delete
                  </button>
                  <button
                    className="text-primary px-2 py-1 rounded hover-button"
                    style={{ backgroundColor: 'rgba(253, 197,0, 0.4)', borderColor: '#FDC500', borderWidth: '2px', borderRadius: '5px', width: '100px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestClick(test);
                    }}
                  >
                    View
                  </button>
                </div>
              </Box>
            ))}
          </div>
        )}

      </div>
      <div className="flex justify-center mt-6">
        <Pagination
          count={Math.ceil(filteredTests.length / getItemsPerPage())}
          page={page}
          onChange={handlePageChange}
          sx={{
            '& .MuiPaginationItem-root': {
              color: '#000975', // Text color for pagination items
            },
            '& .MuiPaginationItem-root.Mui-selected': {
              backgroundColor: '#FDC500', // Background color for selected item
              color: '#fff', // Text color for the selected item
            },
            '& .MuiPaginationItem-root:hover': {
              backgroundColor: 'rgba(0, 9, 117, 0.1)', // Hover effect
            },
          }}
        />
      </div>
      {selectedTest && (
        <div className="w-full p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-primary">{selectedTest.test_name}</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => handleEdit(selectedTest)}
                className="bg-yellow-500 text-white px-2 py-1 rounded-full flex items-center"
                style={{ backgroundColor: '#000975' }}
              >
                <FontAwesomeIcon icon={isEditMode ? faArrowLeft : faEdit} />
              </button>
              <button
                onClick={() => deleteTest(selectedTest.test_id)}
                className="bg-red-500 text-white p-2 rounded-full flex items-center"
                style={{ backgroundColor: '#000975' }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
          {console.log("Selected Test ID:", selectedTest?.test_id)}
          {console.log("Questions:", questions)}
          {isEditMode ? (
            <div>
              <div className="mb-4">
                <label className="block text-primary text-sm font-bold mb-2">Test Name:</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-primary text-sm font-bold mb-2">Test Level:</label>
                <select
                  value={testLevel}
                  onChange={handleTestLevelChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">Select Level</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-primary text-sm font-bold mb-2">Test Tags:</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {testTags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        onClick={() => removeTestTag(tagIndex)}
                        className="ml-2 text-blue-800 hover:text-blue-900"
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
                />
              </div>
              <McqTestQuestionList
                testId={selectedTest.test_id}
                questions={selectedTest.questions || []}
                setSelectedQuestion={setSelectedQuestion}
                currentQuestions={selectedTest.questions || []}
                currentPage={1}
                totalPages={1}
                setCurrentPage={() => { }}
                setQuestions={setQuestions}
                isEditMode={isEditMode}
                deleteSelectedQuestions={deleteSelectedQuestions}
              />
              <button
                onClick={() => updateTest(selectedTest.test_id)}
                className="bg-green-500 text-white p-2 rounded-full"
                style={{ backgroundColor: '#000975' }}
              >
                Save Changes
              </button>
            </div>
          ) : (
            <McqTestQuestionList
              testId={selectedTest.test_id}
              questions={selectedTest.questions || []}
              setSelectedQuestion={openQuestionModal}
              currentQuestions={selectedTest.questions || []}
              currentPage={1}
              totalPages={1}
              setCurrentPage={() => { }}
              setQuestions={setQuestions}
              isEditMode={isEditMode}
              deleteSelectedQuestions={deleteSelectedQuestions}
            />
          )}
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Question List Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2 className="text-2xl font-bold text-primary">{selectedTest?.test_name}</h2>
          <button onClick={closeModal} className="modal-close-button">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <McqTestQuestionList
            testId={selectedTest?.test_id}
            questions={selectedTest?.questions || []}
            setSelectedQuestion={openQuestionModal}
            currentQuestions={selectedTest?.questions || []}
            currentPage={1}
            totalPages={1}
            setCurrentPage={() => { }}
            setQuestions={setQuestions}
            isEditMode={isEditMode}
            deleteSelectedQuestions={deleteSelectedQuestions}
          />
        </div>
      </Modal>
      <Modal
        isOpen={isQuestionModalOpen}
        onRequestClose={closeQuestionModal}
        contentLabel="Question Details Modal"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2 className="text-2xl font-bold text-primary">Question Details</h2>
          <button onClick={closeQuestionModal} className="modal-close-button">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <QuestionDetails
            selectedQuestion={selectedQuestion}
            setSelectedQuestion={setSelectedQuestion}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleUpdate={handleUpdate}
            isLoading={isLoading}
            setShowConfirm={() => { }}
          />
        </div>
      </Modal>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center " style={{ zIndex: 1000 }}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <p className="text-lg font-medium text-gray-900">Are you sure you want to delete this library?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mcqtest;

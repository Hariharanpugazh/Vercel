import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FiltersSidebar from '../../../components/McqLibrary/FiltersSidebar';
import Header from '../../../components/McqLibrary/Header';
import QuestionsList from '../../../components/McqLibrary/QuestionsList';
import QuestionModal from '../../../components/McqLibrary/QuestionModal';
import ImportModal from '../../../components/McqLibrary/ImportModal';
import QuestionDetails from '../../../components/McqLibrary/QuestionDetails';
import ConfirmationModal from '../../../components/McqLibrary/ConfirmationModal';

const Mcq = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSingleQuestionModalOpen, setIsSingleQuestionModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ level: [], tags: [], section: [] });
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';
  const [availableTags, setAvailableTags] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [singleQuestionData, setSingleQuestionData] = useState({
    question: "", option1: "", option2: "", option3: "", option4: "",
    answer: "", level: "easy", tags: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const questionsPerPage = 10;

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async (question_id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/delete_question/${question_id}/`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete question');
      }

      toast.success('Question deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleUpdate = async (question_id) => {
    try {
        setIsLoading(true);

        console.log("Updating question with ID:", question_id);
        console.log("Request body:", JSON.stringify(selectedQuestion, null, 2));

        const response = await fetch(`${API_BASE_URL}/api/update_question/${question_id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: selectedQuestion.question,
                options: selectedQuestion.options,
                correctAnswer: selectedQuestion.correctAnswer,
                level: selectedQuestion.level,
                tags: selectedQuestion.tags,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response from server:", errorData);
            throw new Error(errorData.error || 'Failed to update question');
        }

        setIsEditing(false);
        toast.success('Question Updated Successfully!');

        // Hide the success message after 2 seconds and reload
        setTimeout(() => {
            window.location.reload();  // Reload the page to reflect changes
        }, 1000);

    } catch (error) {
        console.error('Error updating question:', error);
        setError(error.message);
    } finally {
        setIsLoading(false);
    }
};

  useEffect(() => {
    const tags = new Set();
    const sections = new Set();
    questions.forEach(question => {
      if (question.tags) {
        const questionTags = typeof question.tags === 'string'
          ? question.tags.split(',').map(tag => tag.trim())
          : question.tags;
        questionTags.forEach(tag => tags.add(tag));
      }
      if (question.section) {
        sections.add(question.section);
      }
    });
    setAvailableTags(Array.from(tags));
    setAvailableSections(Array.from(sections));
  }, [questions]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/fetch-all-questions/`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data.questions);
      setError(null);
    } catch (err) {
      setError('Failed to load questions. Please try again later.');
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleQuestionInputChange = (e) => {
    const { name, value } = e.target;
    setSingleQuestionData(prev => ({ ...prev, [name]: value }));
  };

  const handleSingleQuestionSubmit = async (e) => {
    e.preventDefault();
    const { question, option1, option2, option3, option4, answer, level } = singleQuestionData;

    if (!question || !option1 || !option2 ||  !answer || !level) {
      setUploadStatus("Error: Please fill in all required fields");
      return;
    }

    const options = [option1, option2, option3, option4];
    if (!options.includes(answer)) {
      setUploadStatus("Error: Answer must be one of the options");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload-single-question/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(singleQuestionData)
      });

      if (response.ok) {
        toast.success('Question uploaded successfully!');
        setSingleQuestionData({
          question: "", option1: "", option2: "", option3: "", option4: "",
          answer: "", level: "easy", tags: ""
        });
        fetchQuestions();
        setTimeout(() => setIsSingleQuestionModalOpen(false), 1500);
      } else {
        const error = await response.json();
        setUploadStatus("Error: " + (error.error || "Unknown error."));
      }
    } catch (err) {
      console.error("Error uploading question:", err);
      setUploadStatus("Error: Unable to upload question.");
    }
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setUploadStatus("Error: Only CSV files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus("Error: File size exceeds 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/mcq-bulk-upload/`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchQuestions();
        setTimeout(() => setIsModalOpen(false), 1500);
      } else {
        const error = await response.json();
        setUploadStatus("Error: " + (error.error || "Unknown error."));
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setUploadStatus("Error: Unable to upload file.");
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.options.some(option => option.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = filters.level.length === 0 || filters.level.includes(question.level);

    const questionTags = typeof question.tags === 'string'
      ? question.tags.split(',').map(tag => tag.trim())
      : question.tags || [];
    const matchesTags = filters.tags.length === 0 ||
      filters.tags.some(tag => questionTags.includes(tag));

    const matchesSection = filters.section.length === 0 || filters.section.includes(question.section);

    return matchesSearch && matchesLevel && matchesTags && matchesSection;
  });

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  console.log("Current Page:", currentPage);
  console.log("Index of First Question:", indexOfFirstQuestion);
  console.log("Index of Last Question:", indexOfLastQuestion);
  console.log("Current Questions:", currentQuestions);

  const toggleFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ level: [], tags: [], section: [] });
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f4f6ff86]">
      <ToastContainer />
      <div className="max-w-full mx-auto px-24 py-12">
      <h3 className="font-semibold text-2xl mb-1.5 text-[#111933]">Question Library</h3>
      <h4 className="font-light text-lg mb-3 text-[#111933]">Select and preview question from your collection</h4>
      <div className="flex  items-center mb-6 border-b-2 border-[#11193380]"></div>
      <div className="">

</div>
        <div className="flex flex-col lg:flex-row gap-6">

        <div>

            <div >
              <FiltersSidebar
                filters={filters}
                toggleFilter={toggleFilter}
                clearFilters={clearFilters}
                availableTags={availableTags}
                availableSections={availableSections}
              />
            </div>
          </div>
          <div className="flex-1">
            <Header
            totalQuestions={filteredQuestions.length}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setIsModalOpen={setIsModalOpen}
              setIsSingleQuestionModalOpen={setIsSingleQuestionModalOpen}
            />
            <QuestionsList
              questions={questions}
              loading={loading}
              error={error}
              currentQuestions={currentQuestions}
              setSelectedQuestion={setSelectedQuestion}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
      </div>
      {selectedQuestion && (
        <QuestionDetails
          selectedQuestion={selectedQuestion}
          setSelectedQuestion={setSelectedQuestion}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleUpdate={handleUpdate}
          isLoading={isLoading}
          setShowConfirm={setShowConfirm}
        />
      )}
      {isModalOpen && (
        <ImportModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          handleBulkUpload={handleBulkUpload}
          uploadStatus={uploadStatus}
        />
      )}
      {isSingleQuestionModalOpen && (
        <QuestionModal
          isSingleQuestionModalOpen={isSingleQuestionModalOpen}
          setIsSingleQuestionModalOpen={setIsSingleQuestionModalOpen}
          singleQuestionData={singleQuestionData}
          handleSingleQuestionInputChange={handleSingleQuestionInputChange}
          handleSingleQuestionSubmit={handleSingleQuestionSubmit}
          uploadStatus={uploadStatus}
        />
      )}
      {showConfirm && (
        <ConfirmationModal
          showConfirm={showConfirm}
          setShowConfirm={setShowConfirm}
          handleDelete={handleDelete}
          selectedQuestion={selectedQuestion}
          setSelectedQuestion={setSelectedQuestion}
          navigate={navigate}
        />
      )}
    </div>
  );
};

export default Mcq;

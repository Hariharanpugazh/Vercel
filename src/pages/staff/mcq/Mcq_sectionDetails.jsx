import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import SectionCard from "../../../components/staff/McqSection/SectionCard";
import QuestionModal from "../../../components/staff/McqSection/QuestionModal";
import BulkUpload from "../../../components/staff/McqSection/BulkUploadModal";
import McqLibrary from "../../../components/staff/McqSection/McqLibraryModal";
import PublishDialog from "../../../components/staff/McqSection/PublishDialog";
import ShareModal from "../../../components/staff/McqSection/ShareModal";
import SelectTestQuestion from "../../../components/staff/McqSection/SelectTestQuestion";
import Modal from "../../../components/staff/McqSection/Modal";
import ManualUpload from "../../../components/staff/McqSection/ManualUpload";

const Mcq_sectionDetails = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState(null);
  const [sections, setSections] = useState([{
    id: Date.now(),
    sectionName: "",
    numQuestions: 10,
    sectionDuration: 10,
    markAllotment: 1,
    passPercentage: 50,
    timeRestriction: false,
    submitted: false,
    selectedQuestions: [],
    showDropdown: false
  }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(5);
  const [showImage, setShowImage] = useState(true);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [filters, setFilters] = useState({ collegename: [], dept: [], year: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sharingLink, setSharingLink] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const navigate = useNavigate();
  const [activeSectionIndex, setActiveSectionIndex] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionsLocal, setSelectedQuestionsLocal] = useState([]);
  const [currentSectionQuestions, setCurrentSectionQuestions] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    const storedSections = JSON.parse(sessionStorage.getItem("sections")) || [];
    const sectionsWithIds = storedSections.map(section => ({
      ...section,
      id: section.id || Date.now(),
      sectionDuration: parseInt(section.sectionDuration, 10) || 10 // Ensure sectionDuration is an integer
    }));
    setSections(sectionsWithIds);

    window.addEventListener('beforeunload', () => {
      sessionStorage.clear();
    });

    return () => {
      window.removeEventListener('beforeunload', () => {
        sessionStorage.clear();
      });
    };
  }, []);

  const handleAddSection = () => {
    setSections([{
      id: Date.now(),
      sectionName: "",
      numQuestions: 10,
      sectionDuration: 10,
      markAllotment: 1,
      passPercentage: 50,
      timeRestriction: false,
      submitted: false,
      selectedQuestions: [],
      showDropdown: false
    }, ...sections]);
  };

  const handleRemoveSection = (sectionIndex) => {
    const updatedSections = sections.filter((_, index) => index !== sectionIndex);
    setSections(updatedSections);
    sessionStorage.setItem("sections", JSON.stringify(updatedSections));
  };

  const handleInputChange = (e, sectionIndex) => {
    const { name, value, type, checked } = e.target;
    const updatedSections = sections.map((section, index) =>
      index === sectionIndex
        ? {
            ...section,
            [name]:
              name === "sectionDuration"
                ? parseInt(value, 10) // Convert to integer
                : type === "checkbox"
                ? checked
                : value,
          }
        : section
    );
    setSections(updatedSections);
    sessionStorage.setItem("sections", JSON.stringify(updatedSections));
  };

  const handleAddQuestion = (sectionIndex) => {
    setIsModalOpen(true);
    setActiveSectionIndex(sectionIndex);
    setSelectedQuestionsLocal([]);
    setCurrentSectionQuestions([]);
    setQuestions([]);
    setShowImage(true);
    setCurrentPage(1);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleOptionSelect = (component, sectionIndex) => {
    setActiveSectionIndex(sectionIndex);
    setActiveComponent(component);
    handleModalClose();
  };

  const handleSaveQuestions = async (sectionIndex) => {
    const section = sections[sectionIndex];
    const selectedQuestionCount = section.selectedQuestions.length;

    if (selectedQuestionCount < section.numQuestions) {
      alert(`You have selected ${selectedQuestionCount} questions, but the limit is ${section.numQuestions}. Please add more questions.`);
      return;
    }

    if (selectedQuestionCount > section.numQuestions) {
      alert(`You have selected ${selectedQuestionCount} questions, but the limit is ${section.numQuestions}. Please reduce the number of selected questions.`);
      return;
    }

    try {
      const formattedQuestions = section.selectedQuestions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer || q.answer,
      }));

      const response = await axios.post(
        `${API_BASE_URL}/api/mcq/save-assessment-questions/`,
        {
          sectionName: section.sectionName,
          numQuestions: section.numQuestions,
          sectionDuration: parseInt(section.sectionDuration, 10), // Ensure it's an integer
          markAllotment: section.markAllotment,
          passPercentage: section.passPercentage,
          timeRestriction: section.timeRestriction,
          questions: formattedQuestions,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("contestToken")}`,
          },
        }
      );

      if (response.data.success) {
        alert("Questions saved successfully!");
        const updatedSections = sections.map((section, index) =>
          index === sectionIndex ? { ...section, submitted: true } : section
        );
        setSections(updatedSections);
        sessionStorage.setItem("sections", JSON.stringify(updatedSections));

        clearLocalStorage();
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Unauthorized access. Please log in again.");
        navigate("/login");
      } else {
        console.error("Error saving questions:", error);
        alert(error.response?.data?.error || "Failed to save questions. Please try again.");
      }
    }
  };

  const handlePublish = async () => {
    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        alert("Unauthorized access. Please log in again.");
        return;
      }

      const decodedToken = jwtDecode(token);
      const contestId = decodedToken?.contestId;
      if (!contestId) {
        alert("Invalid contest token. Please log in again.");
        return;
      }

      const uniqueQuestions = Array.from(new Set(sections.flatMap(section => section.selectedQuestions).map(JSON.stringify))).map(JSON.parse);

      const selectedStudentDetails = students.filter((student) => selectedStudents.includes(student.regno));
      const selectedStudentEmails = selectedStudentDetails.map((student) => student.email);

      const payload = {
        contestId,
        questions: uniqueQuestions,
        students: selectedStudents,
        studentEmails: selectedStudentEmails,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/mcq/publish/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setSharingLink(`${process.env.REACT_APP_FRONTEND_LINK}/testinstructions/${contestId}`);
        setShareModalOpen(true);
        alert("Questions published successfully!");
      } else {
        alert(`Failed to publish questions: ${response.data.message || "Unknown error."}`);
      }
    } catch (error) {
      console.error("Error publishing questions:", error);

      if (error.response) {
        alert(`Error: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        alert("No response from the server. Please try again later.");
      } else {
        alert("An error occurred while publishing questions. Please try again.");
      }
    } finally {
      setPublishDialogOpen(false);
    }
  };

  const handleShareModalClose = () => {
    setShareModalOpen(false);
    navigate(`/staffdashboard`);
  };

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
        const dataRows = rows.slice(1).filter((row) => row.length > 1);

        const formattedQuestions = dataRows.map((row) => ({
          id: Date.now() + Math.random(),
          question: row[0]?.replace(/["]/g, ""),
          options: [
            row[1]?.trim(),
            row[2]?.trim(),
            row[3]?.trim(),
            row[4]?.trim(),
            row[5]?.trim(),
            row[6]?.trim(),
          ].filter(Boolean),
          correctAnswer: row[7]?.trim(),
          negativeMarking: row[8]?.trim(),
          mark: row[9]?.trim(),
          level: "easy",
          tags: [],
        }));

        const usedQuestions = sections[activeSectionIndex].selectedQuestions;

        const availableNewQuestions = formattedQuestions.filter(
          (newQuestion) =>
            !usedQuestions.some(
              (usedQuestion) => usedQuestion.question === newQuestion.question
            )
        );

        setQuestions(availableNewQuestions);
        setShowImage(false);

        if (availableNewQuestions.length === 0) {
          alert("All uploaded questions are already used in this section. Please upload different questions.");
        } else if (availableNewQuestions.length < formattedQuestions.length) {
          alert("Some questions were filtered out as they are already used in this section.");
        }
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

  const handleSelectQuestion = (index) => {
    setSelectedQuestionsLocal((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuestionsLocal.length === questions.length) {
      setSelectedQuestionsLocal([]);
    } else {
      setSelectedQuestionsLocal(questions.map((_, index) => index));
    }
  };

  const handleSubmitBulkUpload = async () => {
    if (activeSectionIndex === null) {
      alert("Please select a section before adding questions.");
      return;
    }

    const selectedQuestions = selectedQuestionsLocal.map(
      (index) => questions[index]
    );

    const updatedSections = sections.map((section, index) =>
      index === activeSectionIndex
        ? { ...section, selectedQuestions: [...section.selectedQuestions, ...selectedQuestions] }
        : section
    );

    setSections(updatedSections);
    sessionStorage.setItem("sections", JSON.stringify(updatedSections));

    setQuestions([]);
    setSelectedQuestionsLocal([]);
    setShowImage(true);
    setActiveComponent(null);

    alert("Questions added successfully!");
  };

  const handleQuestionAdded = (newQuestion) => {
    const updatedSections = sections.map((section, index) =>
      index === activeSectionIndex
        ? { ...section, selectedQuestions: [...section.selectedQuestions, newQuestion] }
        : section
    );
    setSections(updatedSections);
    sessionStorage.setItem("sections", JSON.stringify(updatedSections));
    setActiveComponent(null);
  };

  useEffect(() => {
    return () => {
      setQuestions([]);
      setSelectedQuestionsLocal([]);
      setShowImage(true);
    };
  }, [activeSectionIndex]);

  const clearLocalStorage = () => {
    sessionStorage.removeItem("sections");
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/student/`);
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="bg-white p-6 shadow-md rounded-lg custom-container">
      <div className="flex items-center justify-between mb-4">
        <button
          className="bg-amber-400 hover:bg-amber-200 text-white p-2 rounded-md"
          onClick={handleAddSection}
        >
          Add Section
        </button>
      </div>
      {sections.map((section, sectionIndex) => (
        <SectionCard
          key={section.id}
          section={section}
          sectionIndex={sectionIndex}
          handleInputChange={handleInputChange}
          handleAddQuestion={handleAddQuestion}
          handleSaveQuestions={handleSaveQuestions}
          handleRemoveSection={handleRemoveSection}
          handleToggleDropdown={() => {
            const updatedSections = sections.map((s, index) =>
              index === sectionIndex ? { ...s, showDropdown: !s.showDropdown } : s
            );
            setSections(updatedSections);
          }}
          handleDeleteQuestion={(sectionIndex, questionIndex) => {
            const updatedSections = sections.map((s, index) =>
              index === sectionIndex
                ? { ...s, selectedQuestions: s.selectedQuestions.filter((_, i) => i !== questionIndex) }
                : s
            );
            setSections(updatedSections);
            sessionStorage.setItem("sections", JSON.stringify(updatedSections));
          }}
          currentPage={currentPage}
          questionsPerPage={questionsPerPage}
          paginate={paginate}
        />
      ))}
      {isModalOpen && (
        <QuestionModal
          onClose={handleModalClose}
          handleCreateManually={() => handleOptionSelect("createManually", activeSectionIndex)}
          handleBulkUpload={() => handleOptionSelect("bulkUpload", activeSectionIndex)}
          handleMcqlibrary={() => handleOptionSelect("library", activeSectionIndex)}
          handleAi={() => handleOptionSelect("ai", activeSectionIndex)}
          handleQuestionLibrary={() => handleOptionSelect("questionLibrary", activeSectionIndex)}
          handleTestLibrary={() => handleOptionSelect("testLibrary", activeSectionIndex)}
        />
      )}
      {activeComponent === "bulkUpload" && (
        <BulkUpload
          onClose={() => setActiveComponent(null)}
          handleFileUpload={handleFileUpload}
          questions={questions}
          selectedQuestionsLocal={selectedQuestionsLocal}
          handleSelectQuestion={handleSelectQuestion}
          handleSelectAll={handleSelectAll}
          handleSubmitBulkUpload={handleSubmitBulkUpload}
          currentPage={currentPage}
          questionsPerPage={questionsPerPage}
          paginate={paginate}
          showImage={showImage}
        />
      )}
      {activeComponent === "questionLibrary" && (
        <Modal isOpen={true} onClose={() => setActiveComponent(null)}>
          <McqLibrary
            onClose={() => setActiveComponent(null)}
            onQuestionsSelected={(selected) => {
              const updatedSections = sections.map((section, index) =>
                index === activeSectionIndex
                  ? { ...section, selectedQuestions: [...section.selectedQuestions, ...selected] }
                  : section
              );
              setSections(updatedSections);
              sessionStorage.setItem("sections", JSON.stringify(updatedSections));
              setActiveComponent(null);
            }}
          />
        </Modal>
      )}
      {activeComponent === "testLibrary" && (
        <Modal isOpen={true} onClose={() => setActiveComponent(null)}>
          <SelectTestQuestion
            onClose={() => setActiveComponent(null)}
            onQuestionsSelected={(selected) => {
              const updatedSections = sections.map((section, index) =>
                index === activeSectionIndex
                  ? { ...section, selectedQuestions: [...section.selectedQuestions, ...selected] }
                  : section
              );
              setSections(updatedSections);
              sessionStorage.setItem("sections", JSON.stringify(updatedSections));
              setActiveComponent(null);
            }}
          />
        </Modal>
      )}
      {activeComponent === "createManually" && (
        <Modal isOpen={true} onClose={() => setActiveComponent(null)}>
          <ManualUpload
            onClose={() => setActiveComponent(null)}
            onQuestionAdded={handleQuestionAdded}
          />
        </Modal>
      )}
      <div className="mt-8">
        <button
          onClick={() => setPublishDialogOpen(true)}
          className="px-6 py-2 bg-amber-400 text-white font-semibold rounded-md shadow hover:bg-amber-200"
        >
          Publish
        </button>
      </div>
      <PublishDialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        handlePublish={handlePublish}
        students={students}
        selectedStudents={selectedStudents}
        setSelectedStudents={setSelectedStudents}
        filters={filters}
        setFilters={setFilters}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        page={page}
        setPage={setPage}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        openFilterDialog={openFilterDialog}
        setOpenFilterDialog={setOpenFilterDialog}
      />
      <ShareModal
        open={shareModalOpen}
        onClose={handleShareModalClose}
        shareLink={sharingLink}
      />
    </div>
  );
};

export default Mcq_sectionDetails;
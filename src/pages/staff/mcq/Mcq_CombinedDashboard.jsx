import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { X } from "lucide-react";
import QuestionModal from "../../../components/staff/McqSection/QuestionModal";
import BulkUpload from "../../../components/staff/McqSection/BulkUploadModal";
import McqLibrary from "../../../components/staff/McqSection/McqLibraryModal";
import PublishDialog from "../../../components/staff/McqSection/PublishDialog";
import ShareModal from "../../../components/staff/McqSection/ShareModal";
import SelectTestQuestion from "../../../components/staff/McqSection/SelectTestQuestion";
import Modal from "../../../components/staff/McqSection/Modal";
import ManualUpload from "../../../components/staff/McqSection/ManualUpload";
import { jwtDecode } from "jwt-decode";
import LibraryModal from "../../../components/staff/mcq/McqLibraryModal";
import CreateManuallyIcon from "../../../assets/createmanually.svg";
import BulkUploadIcon from "../../../assets/bulkupload.svg";
import QuestionLibraryIcon from "../../../assets/qlibrary.svg";
import AIGeneratorIcon from "../../../assets/aigenerator.svg";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AIGenerateModal from "../../../components/staff/McqSection/AIGenerateModal";

const Mcq_CombinedDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData } = location.state;
  const [sections, setSections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState(null);
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
  const [activeSectionIndex, setActiveSectionIndex] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionsLocal, setSelectedQuestionsLocal] = useState([]);
  const [currentSectionQuestions, setCurrentSectionQuestions] = useState([]);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isAIGenerateModalOpen, setIsAIGenerateModalOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
  const [allSectionsSubmitted, setAllSectionsSubmitted] = useState(false);

  useEffect(() => {
    const storedSections = JSON.parse(sessionStorage.getItem("sections")) || [];
    const storedStudents = JSON.parse(sessionStorage.getItem("students")) || [];
    const storedSelectedStudents = JSON.parse(sessionStorage.getItem("selectedStudents")) || [];

if (formData.assessmentOverview.sectionDetails === "Yes" && storedSections.length === 0) {
      const defaultSection = {
        id: 1,
        sectionName: "Section 1",
        numQuestions: 10,
        durationHours: 0,   // New field
        durationMinutes: 10, // New field
        sectionDuration: 10, // Keep this for backward compatibility
        markAllotment: 1,
        passPercentage: 50,
        timeRestriction: false,
        submitted: false,
        selectedQuestions: [],
        showDropdown: false,
      };
      setSections([defaultSection]);
      sessionStorage.setItem("sections", JSON.stringify([defaultSection]));
    } else {
      setSections(storedSections);
      // Initialize allSectionsSubmitted based on stored sections
      const allSubmitted = storedSections.every((section) => section.submitted);
      setAllSectionsSubmitted(allSubmitted);
      const sectionsWithTimeFormat = storedSections.map(section => ({
        ...section,
        durationHours: Math.floor(section.sectionDuration / 60) || 0,
        durationMinutes: section.sectionDuration % 60 || 0,
      }));
      setSections(sectionsWithTimeFormat);
    }
  
    setStudents(storedStudents);
    setSelectedStudents(storedSelectedStudents);
  }, [formData.assessmentOverview.sectionDetails]);
  

  useEffect(() => {
    sessionStorage.setItem("sections", JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    sessionStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    const allSubmitted = sections.every((section) => section.submitted);
    setAllSectionsSubmitted(allSubmitted);
  }, [sections]);
  

  useEffect(() => {
    sessionStorage.setItem("selectedStudents", JSON.stringify(selectedStudents));
  }, [selectedStudents]);

  const handleAddSection = () => {
    const newSection = {
      id: Date.now(),
      sectionName: `Section ${sections.length + 1}`,
      numQuestions: 10,
      sectionDuration: 10,
      markAllotment: 1,
      passPercentage: 50,
      timeRestriction: false,
      submitted: false,
      selectedQuestions: [],
      showDropdown: false,
    };
    setSections([newSection, ...sections]);
  };

  const handleQuestionsGenerated = (questions) => {
    const updatedSections = sections.map((section, index) =>
      index === activeSectionIndex
        ? { ...section, selectedQuestions: [...section.selectedQuestions, ...questions] }
        : section
    );
    setSections(updatedSections);
    sessionStorage.setItem("sections", JSON.stringify(updatedSections));
  };


  const handleInputChange = (e, sectionIndex) => {
    const { name, value, type, checked } = e.target;
    const updatedSections = sections.map((section, index) => {
      if (index === sectionIndex) {
        if (name === "durationHours" || name === "durationMinutes") {
          // Convert empty string to 0 for internal processing
          const numValue = value.trim() === '' ? 0 : parseInt(value) || 0;
          const isHours = name === "durationHours";
          const maxValue = isHours ? 23 : 59;
  
          const validValue = Math.max(0, Math.min(numValue, maxValue));
  
          // Calculate total minutes
          const hours = isHours ? validValue : section.durationHours;
          const minutes = isHours ? section.durationMinutes : validValue;
          const totalMinutes = (hours * 60) + minutes;
  
          return {
            ...section,
            [name]: value, // Keep the display value as is
            sectionDuration: totalMinutes
          };
        }
  
        return {
          ...section,
          [name]: type === "checkbox" ? checked : value,
        };
      }
      return section;
    });
  
    setSections(updatedSections);
  };

  const handleDeleteSection = (sectionIndex) => {
    const updatedSections = sections.filter((_, index) => index !== sectionIndex);
    setSections(updatedSections);
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
  
    // Check if the section is already submitted
    if (section.submitted) {
      toast.error("This section has already been submitted.");
      return;
    }
  
    const selectedQuestionCount = section.selectedQuestions.length;
  
    if (selectedQuestionCount < section.numQuestions) {
      toast.error(`You have selected ${selectedQuestionCount} questions, but the limit is ${section.numQuestions}. Please add more questions.`);
      return;
    }
  
    if (selectedQuestionCount > section.numQuestions) {
      toast.error(`You have selected ${selectedQuestionCount} questions, but the limit is ${section.numQuestions}. Please reduce the number of selected questions.`);
      return;
    }
  
    try {
      const formattedQuestions = section.selectedQuestions.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer || q.answer,
      }));
  
      const response = await axios.post(
        `${API_BASE_URL}/api/mcq/save-assessment-questions/`,
        {
          sectionName: section.sectionName,
          numQuestions: section.numQuestions,
          sectionDuration: Number.parseInt(section.sectionDuration, 10),
          markAllotment: section.markAllotment,
          passPercentage: section.passPercentage,
          timeRestriction: section.timeRestriction,
          questions: formattedQuestions,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("contestToken")}`,
          },
        },
      );
  
      if (response.data.success) {
        toast.success("Section submitted successfully!");
        const updatedSections = sections.map((section, index) =>
          index === sectionIndex ? { ...section, submitted: true } : section
        );
        setSections(updatedSections);
  
        // Check if all sections are submitted
        const allSubmitted = updatedSections.every((section) => section.submitted);
        setAllSectionsSubmitted(allSubmitted);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Unauthorized access. Please log in again.");
        navigate("/login");
      } else {
        console.error("Error saving questions:", error);
        toast.error(error.response?.data?.error || "Failed to save questions. Please try again.");
      }
    }
  };
  

  const handlePublish = async () => {
    const unsubmittedSections = sections.filter(section => !section.submitted);
    if (unsubmittedSections.length > 0) {
      toast.error(`Please submit all sections before publishing. Sections ${unsubmittedSections.map(s => s.sectionName).join(', ')} are not submitted.`);
      return;
    }
    try {
      const token = localStorage.getItem("contestToken");
      if (!token) {
        toast.error("Unauthorized access. Please log in again.");
        return;
      }

      const decodedToken = jwtDecode(token);
      const contestId = decodedToken?.contestId;
      if (!contestId) {
        toast.error("Invalid contest token. Please log in again.");
        return;
      }
      if (!selectedStudents.length) {
        toast.error("Please select at least one student before publishing.");
        return;
      }
  
      const uniqueQuestions = Array.from(
        new Set(sections.flatMap((section) => section.selectedQuestions).map(JSON.stringify)),
      ).map(JSON.parse);
      const selectedStudentDetails = students.filter((student) => selectedStudents.includes(student.regno));
      const selectedStudentEmails = selectedStudentDetails.map((student) => student.email);
      const payload = {
        contestId,
        questions: uniqueQuestions,
        students: selectedStudents,
        studentEmails: selectedStudentEmails,
      };
      const response = await axios.post(`${API_BASE_URL}/api/mcq/publish/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        setSharingLink(`${process.env.REACT_APP_FRONTEND_LINK}/testinstructions/${contestId}`);
        setShareModalOpen(true);
        toast.success("Questions published successfully!");

        // Clear session storage after successful publish
        sessionStorage.clear();
      } else {
        toast.error(`Failed to publish questions: ${response.data.message || "Unknown error."}`);
      }
    } catch (error) {
      console.error("Error publishing questions:", error);

      if (error.response) {
        toast.error(`Error: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        toast.error("No response from the server. Please try again later.");
      } else {
        toast.error("An error occurred while publishing questions. Please try again.");
      }
    } finally {
      setPublishDialogOpen(false);
    }
  };

  const toggleQuestionsVisibility = (sectionIndex) => {
    setVisibleSections((prev) =>
      prev.includes(sectionIndex)
        ? prev.filter((index) => index !== sectionIndex)
        : [...prev, sectionIndex]
    );
  };

  const handleShareModalClose = () => {
    setShareModalOpen(false);
    navigate(`/staffdashboard`);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Please select a valid CSV file.");
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
          (newQuestion) => !usedQuestions.some((usedQuestion) => usedQuestion.question === newQuestion.question),
        );

        setQuestions(availableNewQuestions);
        setShowImage(false);

        if (availableNewQuestions.length === 0) {
          toast.error("All uploaded questions are already used in this section. Please upload different questions.");
        } else if (availableNewQuestions.length < formattedQuestions.length) {
          toast.error("Some questions were filtered out as they are already used in this section.");
        }
      } catch (error) {
        console.error("Error processing file:", error);
        toast.error(`Error processing file: ${error.message}`);
      }
    };

    reader.onerror = (error) => {
      console.error("File reading error:", error);
      toast.error("Error reading file");
    };

    reader.readAsText(file);
  };

  const handleSelectQuestion = (index) => {
    setSelectedQuestionsLocal((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
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
      toast.error("Please select a section before adding questions.");
      return;
    }

    const selectedQuestions = selectedQuestionsLocal.map((index) => questions[index]);

    const updatedSections = sections.map((section, index) =>
      index === activeSectionIndex
        ? { ...section, selectedQuestions: [...section.selectedQuestions, ...selectedQuestions] }
        : section,
    );

    setSections(updatedSections);

    setQuestions([]);
    setSelectedQuestionsLocal([]);
    setShowImage(true);
    setActiveComponent(null);

    toast.success("Questions added successfully!");
  };

  const handleQuestionAdded = (newQuestion) => {
    const updatedSections = sections.map((section, index) =>
      index === activeSectionIndex
        ? { ...section, selectedQuestions: [...section.selectedQuestions, newQuestion] }
        : section,
    );
    setSections(updatedSections);
    setActiveComponent(null);
  };

  const handleRemoveQuestion = (sectionIndex, questionIndex) => {
    const updatedSections = sections.map((section, index) =>
      index === sectionIndex
        ? {
            ...section,
            selectedQuestions: section.selectedQuestions.filter((_, qIndex) => qIndex !== questionIndex),
          }
        : section,
    );
    setSections(updatedSections);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/student/`);
        setStudents(response.data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };

    fetchStudents();
  }, [API_BASE_URL]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleLibraryButtonClick = () => {
    setIsLibraryModalOpen(true);
  };

  const handleLibraryModalClose = () => {
    setIsLibraryModalOpen(false);
  };

  const updateSection = (id, updatedSection) => {
    const updatedSections = sections.map((section) => (section.id === id ? updatedSection : section));
    setSections(updatedSections);
  };

  return (
    <div className="min-h-[calc(100vh-95px)] bg-[#ECF2FE] p-6">
      <div className="max-w-[1500px] mx-auto">
        <div className="space-y-6">
          {formData.assessmentOverview.sectionDetails === "Yes" ? (
            <div>
              {/* Breadcrumb */}
              <div className="h-14 py-4">
                <div className="flex items-center gap-2 text-[#111933]">
                  <span className="opacity-60">Home</span>
                  <span>{">"}</span>
                  <span className="opacity-60">Assessment Overview</span>
                  <span>{">"}</span>
                  <span  onClick={() => window.history.back()} className="cursor-pointer opacity-60 hover:underline">Test Configuration</span>
                  <span>{">"}</span>
                  <span>Add Sections</span>
                </div>
              </div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleAddSection}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Add Section +
                </button>
              </div>

              {sections.map((section, sectionIndex) => (
                <div key={section.id} className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold text-[#111933]">
                      Section {sections.length - sectionIndex}
                    </h2>
                    {section.selectedQuestions.length > 0 && (
                      <button
                        onClick={() => toggleQuestionsVisibility(sectionIndex)}
                        className="text-blue-500 underline"
                      >
                        {visibleSections.includes(sectionIndex) ? "Hide Questions" : "Show Questions"}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    This section allows you to configure the structure and conditions of the test
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Section Name*</label>
                        <input
                          type="text"
                          name="sectionName"
                          value={section.sectionName}
                          onChange={(e) => handleInputChange(e, sectionIndex)}
                          placeholder="Enter the section name"
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Number of Questions*</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          name="numQuestions"
                          value={section.numQuestions}
                          onChange={(e) => handleInputChange(e, sectionIndex)}
                          placeholder="Enter the total number of questions"
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      {/* <div>
                        <label className="block text-sm font-medium mb-1">Pass Percentage</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          name="passPercentage"
                          value={section.passPercentage}
                          onChange={(e) => handleInputChange(e, sectionIndex)}
                          placeholder="Enter Pass Percentage"
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div> */}
                    </div>
                    <div className="space-y-4">
                    <div>
  <label className="block text-sm font-medium mb-1">Section Duration</label>
  <div className="flex gap-4">
    <div className="flex-1">
      <input
        type="number"
        name="durationHours"
        min="0"
        max="23"
        value={section.durationHours || ''}
        onChange={(e) => handleInputChange(e, sectionIndex)}
        placeholder="Hours"
        className="w-full px-3 py-2 border rounded-md"
      />
    </div>
    <div className="flex-1">
      <input
        type="number"
        name="durationMinutes"
        min="0"
        max="59"
        value={section.durationMinutes || ''}
        onChange={(e) => handleInputChange(e, sectionIndex)}
        placeholder="Minutes"
        className="w-full px-3 py-2 border rounded-md"
      />
    </div>
  </div>
</div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Marks/Question*</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          name="markAllotment"
                          value={section.markAllotment}
                          onChange={(e) => handleInputChange(e, sectionIndex)}
                          placeholder="Enter Marks"
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                  {visibleSections.includes(sectionIndex) && (
                    <div className="mt-4">
                      <h3 className="text-md font-semibold text-[#111933] mb-2">Questions:</h3>
                      <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                          <tr>
                            <th className="py-2 px-4 border-b text-left">Question</th>
                            <th className="py-2 px-4 border-b text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.selectedQuestions.map((question, qIndex) => (
                            <tr key={qIndex}>
                              <td className="py-2 px-4 border-b">{question.question}</td>
                              <td className="py-2 px-4 border-b">
                                <button
                                  onClick={() => handleRemoveQuestion(sectionIndex, qIndex)}
                                  className="text-red-500"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="flex mt-6">
                    {sectionIndex !== sections.length - 1 && (
                      <button
                        onClick={() => handleDeleteSection(sectionIndex)}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                      >
                        Delete Section
                      </button>
                    )}
                    <div className="ml-auto space-x-4">
                      <button
                        onClick={() => handleAddQuestion(sectionIndex)}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Add Questions +
                      </button>
                      <button
                      onClick={() => handleSaveQuestions(sectionIndex)}
                      className={`px-4 py-2 bg-[#111933] text-white rounded-md hover:bg-[#2a3958] ${
                        section.submitted ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                      disabled={section.submitted}
                    >
                      Submit
                    </button>

                    </div>
                  </div>
                </div>
              ))}

              {sections.length > 0 && (
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setPublishDialogOpen(true)}
                    className={`px-4 py-2 ${
                      allSectionsSubmitted
                        ? 'bg-[#111933] hover:bg-[#2a3958]'
                        : 'bg-gray-400 cursor-not-allowed'
                    } text-white rounded-md`}
                    disabled={!allSectionsSubmitted}
                  >
                    Publish
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Breadcrumb */}
              <div className="h-14 py-4">
                <div className="flex items-center gap-2 text-[#111933]">
                  <span className="opacity-60">Home</span>
                  <span>{">"}</span>
                  <span className="opacity-60">Assessment Overview</span>
                  <span>{">"}</span>
                  <span  onClick={() => window.history.back()} className="cursor-pointer opacity-60 hover:underline">Test Configuration</span>
                  <span>{">"}</span>
                  <span>Add Questions</span>
                </div>
              </div>
              <h3 className="text-2xl mx-10 text-[#111933] font-bold mb-2 text-left">
                Add and manage your questions
              </h3>
              <p className="text-sm mx-10 text-[#111933] mb-6 text-left">
                Choose how you'd like to add questions to your assessment. Select the method that works best for you to quickly build your test.
              </p>
              <hr className="mb-6 mx-10 border-gray-200" />
              <div className="grid grid-cols-1 md:grid-cols-2 mx-40 gap-6">
                <button
                  onClick={() => navigate("/mcq/CreateQuestion")}
                  className="p-10 bg-white border border-[#111933] rounded-lg cursor-pointer flex flex-col items-center"
                >
                  <img src={CreateManuallyIcon || "/placeholder.svg"} alt="" className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-semibold text-[#111933] mb-2">Create Manually</h3>
                  <p className="text-sm text-[#111933]">Enter each question and its options directly.</p>
                </button>

                <button
                  onClick={() => navigate("/mcq/bulkUpload")}
                  className="p-10 bg-white border border-[#111933] rounded-lg cursor-pointer flex flex-col items-center"
                >
                  <img src={BulkUploadIcon || "/placeholder.svg"} alt="" className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-semibold text-[#111933] mb-2">Bulk Upload</h3>
                  <p className="text-sm text-[#111933]">Upload questions via CSV or Excel file.</p>
                </button>

                <button
                  onClick={() => setIsLibraryModalOpen(true)}
                  className="p-10 bg-white border border-[#111933] rounded-lg cursor-pointer flex flex-col items-center"
                >
                  <img src={QuestionLibraryIcon || "/placeholder.svg"} alt="" className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-semibold text-[#111933] mb-2">Question Library</h3>
                  <p className="text-sm text-[#111933]">Choose from your saved question library.</p>
                </button>

                <button
                  onClick={() => navigate("/mcq/aigenerator")}
                  className="p-10 bg-white border border-[#111933] rounded-lg cursor-pointer flex flex-col items-center"
                >
                  <img src={AIGeneratorIcon || "/placeholder.svg"} alt="" className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-semibold text-[#111933] mb-2">AI Generator</h3>
                  <p className="text-sm text-[#111933]">Generate questions using AI.</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
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
                  : section,
              );
              setSections(updatedSections);
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
                  : section,
              );
              setSections(updatedSections);
              setActiveComponent(null);
            }}
          />
        </Modal>
      )}

      {activeComponent === "createManually" && (
        <Modal isOpen={true} onClose={() => setActiveComponent(null)}>
          <ManualUpload onClose={() => setActiveComponent(null)} onQuestionAdded={handleQuestionAdded} />
        </Modal>
      )}

      {activeComponent === "ai" && (
        <Modal isOpen={true} onClose={() => setActiveComponent(null)}>
          <AIGenerateModal
            isOpen={true}
            onClose={() => setActiveComponent(null)}
            onQuestionsGenerated={handleQuestionsGenerated}
          />
        </Modal>
      )}


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

      <ShareModal open={shareModalOpen} onClose={handleShareModalClose} shareLink={sharingLink} />

      {isLibraryModalOpen && (
        <LibraryModal onClose={handleLibraryModalClose} />
      )}
    </div>
  );
};

export default Mcq_CombinedDashboard;
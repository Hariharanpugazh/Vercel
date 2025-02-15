import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import GroupImage from "../../../assets/bulk.png"
import SampleCSV from "../../../assets/csv file/bulk_upload_questions.csv"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Upload } from "lucide-react";
import { Download } from "lucide-react"
import PreviewTable from "../previewtable";
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-7xl relative">
      <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="absolute top-5 right-5 w-6 h-6" />
          </button>
        {children}
      </div>
    </div>
  );
};
const Mcq_bulkUpload = () => {
  const [questions, setQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [activeTab, setActiveTab] = useState("My Device")
  const [setHighlightStep] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [questionsPerPage] = useState(10)
  const [showImage, setShowImage] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const requiredQuestions = location.state?.requiredQuestions || 0
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://render-frontend-f05v.onrender.com"

  useEffect(() => {
    const storedQuestions = JSON.parse(localStorage.getItem("uploadedQuestions")) || []
    setQuestions(storedQuestions)
  }, [])

  useEffect(() => {
    localStorage.setItem("uploadedQuestions", JSON.stringify(questions))
  }, [questions])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === "My Drive") setHighlightStep(1)
    else if (tab === "Dropbox") setHighlightStep(2)
    else if (tab === "My Device") setHighlightStep(3)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) {
      toast.error("Please select a valid CSV file.", {
        position: "top-center",
        autoClose: 3000,
      })
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const csvText = event.target.result
        const rows = csvText.split("\n").map((row) => row.split(","))
        const headers = rows[0]
        const dataRows = rows.slice(1).filter((row) => row.length > 1)

        console.log("Headers:", headers)
        console.log("Data Rows:", dataRows)

        const formattedQuestions = dataRows.map((row) => ({
          question: row[0]?.replace(/["]/g, ""),
          options:
            [row[1]?.trim(), row[2]?.trim(), row[3]?.trim(), row[4]?.trim(), row[5]?.trim(), row[6]?.trim()].filter(
              Boolean,
            ) || [],
          correctAnswer: row[7]?.trim(),
          negativeMarking: row[8]?.trim(),
          mark: row[9]?.trim(),
          level: "easy",
          tags: [],
        }))

        console.log("Formatted Questions:", formattedQuestions)

        setQuestions((prevQuestions) => [...prevQuestions, ...formattedQuestions])
        setShowImage(false)
        setShowPreview(true)
        toast.success("File uploaded successfully! Preview the questions below.", {
          position: "top-center",
          autoClose: 3000,
        })
      } catch (error) {
        console.error("Error processing file:", error)
        toast.error(`Error processing file: ${error.message}`, {
          position: "top-center",
          autoClose: 3000,
        })
      }
    }

    reader.onerror = (error) => {
      console.error("File reading error:", error)
      toast.error("Error reading file", {
        position: "top-center",
        autoClose: 3000,
      })
    }

    reader.readAsText(file)
  }

  const handleSelectQuestion = (index) => {
    setSelectedQuestions((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const handleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([])
    } else {
      setSelectedQuestions(questions.map((_, index) => index))
    }
  }

  const handleSubmit = async () => {
    if (selectedQuestions.length < requiredQuestions) {
      toast.warn(`Please select at least ${requiredQuestions} questions.`, {
        position: "top-center",
        autoClose: 3000,
      })
      return
    }

    const token = localStorage.getItem("contestToken")
    const selected = selectedQuestions.map((index) => questions[index])

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/mcq/save-questions/`,
        { questions: selected },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      )

      console.log("API Response:", response.data)

      toast.success("Questions added successfully!", {
        position: "top-center",
        autoClose: 3000,
      })
      setQuestions([])
      setSelectedQuestions([])
      navigate("/mcq/QuestionsDashboard")
    } catch (error) {
      console.error("Error submitting questions:", error)
      toast.error("Failed to submit questions. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      })
    }
  }

  const indexOfLastQuestion = currentPage * questionsPerPage
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion)
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div className="h-[calc(100vh-95px)] overflow-hidden bg-[#f4f6ff86]">
      <div className="w-full max-w-[1500px] mx-auto px-12 h-full">
        <div className="h-14 py-10">
          <div className="flex items-center gap-2 text-[#111933]">
            <span className="opacity-60">Home</span>
            <span>{">"}</span>
            <span className="opacity-60">Assessment Overview</span>
            <span>{">"}</span>
            <span className="opacity-60">Test Configuration</span>
            <span>{">"}</span>
            <span onClick={() => window.history.back()} className="cursor-pointer opacity-60 hover:underline">
              Add Questions
            </span>
            <span>{">"}</span>
            <span >
              Upload Questions
            </span>
          </div>
        </div>
        <div>
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
        {!showPreview && (
          <div className="bg-white shadow-lg rounded-xl px-8 py-14">
            <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-[#111933] mb-2">Upload Files</h1>
            <p className="text-[#A0A0A0] text-sm">
              Easily add questions by uploading your prepared files as{" "}
              <span className="font-medium text-[#111933] opacity-60">csv, xlsx etc.</span>
            </p>
          </div>
          <div className="flex flex-col items-center justify-center mb-6">
            {showImage && (
              <img
                src={GroupImage }
                alt="Upload Illustration"
                className="w-56 h-56 object-contain mb-8"
              />
            )}
            <div className="flex gap-4">
              <a
                href={SampleCSV}
                download="bulk_upload_questions.csv"
                className="flex items-center gap-2 bg-[#A0A0A0] text-white px-6 py-2 rounded-md  cursor-pointer"
              >
                Sample Document <Download size={20} />
              </a>
              <label
                htmlFor="fileInput"
                className="flex items-center gap-2 bg-[#111933] text-white px-6 py-2 rounded-md cursor-pointer "
              >
                {showImage ? "Upload" : "Add Question"} <Upload size={20} />
              </label>
              <input type="file" id="fileInput" className="hidden" accept=".csv" onChange={handleFileUpload} />
            </div>
          </div>
          </div>
        )}
         {showPreview && (
        <div className="mt-1">
          <label
            htmlFor="fileInput"
            className="bg-yellow-400 mt-1 text-black px-6 py-4 rounded-full shadow hover:bg-yellow-500 cursor-pointer transition"
          >
            Add Question
          </label>
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            accept=".csv"
            onChange={handleFileUpload}
          />
        </div>
      )}

      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)}>
        {questions.length > 0 && (
          <PreviewTable
            questions={currentQuestions}
            selectedQuestions={selectedQuestions}
            currentPage={currentPage}
            questionsPerPage={questionsPerPage}
            onSelectQuestion={handleSelectQuestion}
            onSelectAll={handleSelectAll}
            onPageChange={paginate}
            onSubmit={handleSubmit}
            indexOfFirstQuestion={indexOfFirstQuestion}
            totalPages={totalPages}
          />
        )}
      </Modal>
      </div>
    </div>
  )
}

export default Mcq_bulkUpload

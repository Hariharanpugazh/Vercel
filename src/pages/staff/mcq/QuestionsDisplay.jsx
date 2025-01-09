// import React, { useState } from "react";
// import { useLocation } from "react-router-dom";
// import axios from "axios";

// const QuestionsDisplay = () => {
//   const { state } = useLocation();
//   const { questions, contestId, staffId } = state || {}; // Extract questions, contestId, and staffId from the location state

//   const [selectedQuestions, setSelectedQuestions] = useState([]);

//   const handleSelectQuestion = (question) => {
//     setSelectedQuestions((prevSelected) =>
//       prevSelected.includes(question)
//         ? prevSelected.filter((q) => q !== question)
//         : [...prevSelected, question]
//     );
//   };

//   const handleSaveQuestions = async () => {
//     try {
//       const response = await axios.post("${API_BASE_URL }/api/mcq/api/save-questions/", {
//         contestId,
//         staffId,
//         questions: selectedQuestions,
//       });
//       console.log("Questions saved:", response.data);
//       alert("Questions saved successfully!");
//     } catch (error) {
//       console.error("Error saving questions:", error);
//       alert("Failed to save questions.");
//     }
//   };

//   if (!questions || questions.length === 0) {
//     return <p>No questions to display.</p>;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
//       <div className="max-w-7xl mx-auto bg-white p-8 shadow-lg rounded-lg">
//         <h1 className="text-4xl font-bold mb-6 text-center">Generated Questions</h1>

//         <table className="w-full table-auto border-collapse">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="px-4 py-3 border text-left">S.No</th>
//               <th className="px-4 py-3 border text-left">Select</th>
//               <th className="px-4 py-3 border text-left">Topic</th>
//               <th className="px-4 py-3 border text-left">Subtopic</th>
//               <th className="px-4 py-3 border text-left">Level</th>
//               <th className="px-4 py-3 border text-left">Question Type</th>
//               <th className="px-4 py-3 border text-left">Question</th>
//               <th className="px-4 py-3 border text-left">Options</th>
//               <th className="px-4 py-3 border text-left">Answer</th>
//             </tr>
//           </thead>
//           <tbody>
//             {questions.map((question, index) => (
//               <tr key={index} className="hover:bg-gray-50">
//                 <td className="px-4 py-3 border text-center">{index + 1}</td>
//                 <td className="px-4 py-3 border text-center">
//                   <input
//                     type="checkbox"
//                     onChange={() => handleSelectQuestion(question)}
//                   />
//                 </td>
//                 <td className="px-4 py-3 border whitespace-normal break-words">
//                   {question.topic}
//                 </td>
//                 <td className="px-4 py-3 border whitespace-normal break-words">
//                   {question.subtopic}
//                 </td>
//                 <td className="px-4 py-3 border text-center">{question.level}</td>
//                 <td className="px-4 py-3 border text-center">{question.question_type}</td>
//                 <td className="px-4 py-3 border whitespace-normal break-words max-w-xl">
//                   {question.question}
//                 </td>
//                 <td className="px-4 py-3 border whitespace-normal break-words max-w-lg">
//                   <ul className="list-disc pl-5">
//                     {question.options.map((option, idx) => (
//                       <li key={idx} className="text-gray-700 text-sm">
//                         {option}
//                       </li>
//                     ))}
//                   </ul>
//                 </td>
//                 <td className="px-4 py-3 border whitespace-normal break-words text-gray-700 text-base font-medium max-w-lg">
//                   {question.answer}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <button
//           className="mt-8 px-8 py-3 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
//           onClick={handleSaveQuestions}
//         >
//           Save Selected Questions
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuestionsDisplay;

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const QuestionsDisplay = () => {
  const { state } = useLocation();
  const { questions, contestId, staffId } = state || {};
  const navigate = useNavigate();

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [editedQuestions, setEditedQuestions] = useState(questions || []);
  const [isEditing, setIsEditing] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

  const handleSelectQuestion = (index) => {
    setSelectedQuestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleEditQuestion = (index, field, value) => {
    const updatedQuestions = editedQuestions.map((question, i) =>
      i === index ? { ...question, [field]: value } : question
    );
    setEditedQuestions(updatedQuestions);
  };

  const handleSaveQuestions = async () => {
    try {
      const token = localStorage.getItem("contestToken");
      const selected = selectedQuestions.map((index) => editedQuestions[index]);

      const response = await axios.post(`${API_BASE_URL }/api/mcq/save-questions/`, {
        questions: selected,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert("Questions saved successfully!");
      navigate('/mcq/QuestionsDashboard');
    } catch (error) {
      console.error("Error saving questions:", error);
      alert("Failed to save questions.");
    }
  };

  if (!questions || questions.length === 0) {
    return <p>No questions to display.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white shadow-lg rounded-3xl p-8 w-[90%] max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Generated Questions</h1>

        <table className="table-auto w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-gray-200 text-gray-800">
            <tr>
              <th className="px-4 py-2">Select</th>
              <th className="px-4 py-2">Question</th>
              <th className="px-4 py-2">Options</th>
              <th className="px-4 py-2">Correct Answer</th>
              <th className="px-4 py-2">Level</th>
              <th className="px-4 py-2">Tags</th>
              <th className="px-4 py-2">Edit</th>
            </tr>
          </thead>
          <tbody>
            {editedQuestions.map((question, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} text-gray-800`}
              >
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(index)}
                    onChange={() => handleSelectQuestion(index)}
                  />
                </td>
                <td className="px-4 py-2">
                  {isEditing === index ? (
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => handleEditQuestion(index, 'question', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    question.question
                  )}
                </td>
                <td className="px-4 py-2">
                  {isEditing === index ? (
                    question.options.map((option, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const updatedOptions = [...question.options];
                          updatedOptions[idx] = e.target.value;
                          handleEditQuestion(index, 'options', updatedOptions);
                        }}
                        className="w-full px-2 py-1 border rounded mb-1"
                      />
                    ))
                  ) : (
                    question.options.map((option, idx) => (
                      <div key={idx} className="text-gray-700 text-sm">
                        {option}
                      </div>
                    ))
                  )}
                </td>
                <td className="px-4 py-2">
                  {isEditing === index ? (
                    <input
                      type="text"
                      value={question.correctAnswer}
                      onChange={(e) => handleEditQuestion(index, 'correctAnswer', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    question.correctAnswer
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {isEditing === index ? (
                    <input
                      type="text"
                      value={question.level}
                      onChange={(e) => handleEditQuestion(index, 'level', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    question.level
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {isEditing === index ? (
                    <input
                      type="text"
                      value={question.tags.join(", ")}
                      onChange={(e) => handleEditQuestion(index, 'tags', e.target.value.split(","))}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    question.tags.join(", ")
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  {isEditing === index ? (
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      onClick={() => setIsEditing(null)}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      onClick={() => setIsEditing(index)}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          className="mt-8 px-8 py-3 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
          onClick={handleSaveQuestions}
        >
          Save Selected Questions
        </button>
      </div>
    </div>
  );
};

export default QuestionsDisplay;

import {React,useState} from 'react';
import { X, CheckCircleIcon } from 'lucide-react';
import { getLevelBadgeColor, renderTags } from '../../lib/utils';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const QuestionDetails = ({ selectedQuestion, setSelectedQuestion, isEditing, setIsEditing, testId, isLoading, setIsLoading ,setView}) => {
  const handleChange = (field, value) => setSelectedQuestion({ ...selectedQuestion, [field]: value });
  const [showConfirm,setShowConfirm] = useState(false);

  const handleUpdate = async (questionId) => {
    setIsLoading(true);
    try {
      console.log(selectedQuestion);
      const response = await axios.put(
        `${API_BASE_URL}/api/edit_question_in_test/${testId}/${questionId}/`,
        selectedQuestion,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        toast.success('Question updated successfully!');
        setSelectedQuestion(null);
        setIsEditing(false);
        setView('list'); // Navigate back to the list view
      } else {
        toast.error('Failed to update the question.');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('An error occurred while updating the question.');
    } finally {
      setIsLoading(false);
    }
  };


  

  return (
    <div className="fixed inset-0 z-1000">
      <div className="fixed inset-0 bg-black/40 opacity-70" onClick={() => setSelectedQuestion(null)} />
      <div className={`fixed inset-y-0 right-0 w-full md:w-[80%] lg:w-[70%] xl:w-[60%] 2xl:w-[50%] bg-white shadow-2xl rounded-l-3xl transform transition-all duration-500 ease-out ${selectedQuestion ? "translate-x-0 scale-100" : "translate-x-full scale-95"}`}>
        <div className="h-full overflow-y-auto p-16">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setSelectedQuestion(null)} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all shadow-md">
              <X className="w-6 h-6 text-[#111933] hover:text-[#001f4d]" />
            </button>
            <div className="mt-4 w-full max-w-2xl mx-auto">
              {isEditing ? (
                <>
                  <textarea
                    value={selectedQuestion.question}
                    onChange={(e) => handleChange('question', e.target.value)}
                    className="text-lg font-bold text-[#111933] mb-4 w-full p-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Type your question here..."
                    rows={2}
                  />
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="font-medium text-lg text-[#111933]">Tags:</span>
                    <input
                      type="text"
                      value={selectedQuestion.tags}
                      onChange={(e) => handleChange('tags', e.target.value.split(",").map((tag) => tag.trim()))}
                      className="flex-1 border-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Add tags..."
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <label htmlFor="level" className="block font-medium text-[#111933]">Level:</label>
                    <select
                      id="level"
                      value={selectedQuestion.level}
                      onChange={(e) => handleChange('level', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-[#111933] mb-2">{selectedQuestion.question}</h2>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium border ${getLevelBadgeColor(selectedQuestion.level)}`}>
                      {selectedQuestion.level || "Not specified"}
                    </span>
                    {renderTags(selectedQuestion.tags)}
                  </div>
                </>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 w-full max-w-2xl mx-auto">
              {selectedQuestion.options.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className={`p-2 rounded-lg border-2 transition-all duration-300 flex items-center gap-8 ${!isEditing && option === selectedQuestion.correctAnswer ? "bg-green-50 border-green-300 shadow-md" : "bg-gray-50 border-gray-200"}`}
                >
                  <span className={`font-medium text-lg ${!isEditing && option === selectedQuestion.correctAnswer ? "text-green-700" : "text-[#111933]"}`}>
                    {String.fromCharCode(65 + optIndex)}.
                  </span>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...selectedQuestion.options];
                          newOptions[optIndex] = e.target.value;
                          handleChange('options', newOptions);
                        }}
                        className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                      />
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={selectedQuestion.correctAnswer === option}
                        onChange={() => handleChange('correctAnswer', option)}
                        className="ml-2 w-4 h-4 accent-green-600 transition-transform"
                      />
                    </>
                  ) : (
                    <span className="flex-1">{option}</span>
                  )}
                  {!isEditing && option === selectedQuestion.correctAnswer && (
                    <span className="ml-auto px-2 py-1 text-sm font-semibold text-green-800 bg-green-200 rounded-full">
                      Correct
                    </span>
                  )}
                </div>
              ))}
            </div>
            {!isEditing && (
              <div className="mt-4 p-2 rounded-lg bg-green-50 border-2 border-green-200 shadow-sm max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Correct Answer
                </h3>
                <p className="text-gray-800 font-medium">{selectedQuestion.correctAnswer}</p>
              </div>
            )}
            <div className="flex justify-start space-x-2 mt-4 max-w-2xl mx-auto">
              {isEditing ? (
                <>
                  <button
                    onClick={async () => {
                      await handleUpdate(selectedQuestion.question_id);
                      setSelectedQuestion(null);
                      window.location.reload();
                    }}
                    disabled={isLoading}
                    className="flex-1 text-[#111933] bg-[#fdc600ca] hover:bg-[#FDC500] px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      toast.info('Edit cancelled.');
                    }}
                    className="flex-1 text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      toast.info('Edit mode enabled.');
                    }}
                    className="flex-1 text-[#111933] bg-[#fdc600ca] hover:bg-[#FDC500] px-4 py-2 rounded-lg transition"
                  >
                    Edit
                  </button>
                  {/* <button
                    onClick={() => {setShowConfirm(true); window.location.reload();} }
                    className="flex-1 text-red-600 bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg transition"
                  >
                    Delete
                  </button> */}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetails;
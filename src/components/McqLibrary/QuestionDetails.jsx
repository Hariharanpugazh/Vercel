import React from "react";
import { X, CheckCircleIcon } from "lucide-react";
import { getLevelBadgeColor, renderTags } from "../../lib/utils";
import { toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

const QuestionDetails = ({
  selectedQuestion,
  setSelectedQuestion,
  isEditing,
  setIsEditing,
  handleUpdate,
  isLoading,
  setShowConfirm,
}) => {
  const handleChange = (field, value) =>
    setSelectedQuestion({ ...selectedQuestion, [field]: value });

  // Helper function to convert a lowercase string to camel case
  const toCamelCase = (str) => {
    return str.replace(/(^|\s)\S/g, (t) => t.toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-1000" style={{ zIndex: 1000 }}>
      <div
        className="fixed inset-0 bg-black/40 opacity-70"
        onClick={() => setSelectedQuestion(null)}
      />
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-[80%] lg:w-[70%] xl:w-[60%] 2xl:w-[50%] bg-white shadow-2xl  transform transition-all duration-500 ease-out ${
          selectedQuestion
            ? "translate-x-0 scale-100"
            : "translate-x-full scale-95"
        }`}
      >
        <div className="h-full overflow-y-auto py-16 px-8 ">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedQuestion(null)}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all shadow-md"
            >
              <X className="w-6 h-6 text-[#111933]" />
            </button>
            <div className="mt-4 w-full max-w-2xl mx-auto">
              {isEditing ? (
                <>
                  <textarea
                    value={selectedQuestion.question}
                    onChange={(e) => handleChange("question", e.target.value)}
                    className="text-lg font-medium text-[#111933] mb-4 w-full p-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Type your question here..."
                    rows={2}
                  />
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="font-medium text-lg text-[#111933]">
                      Tags:
                    </span>
                    <input
                      type="text"
                      value={selectedQuestion.tags}
                      onChange={(e) =>
                        handleChange(
                          "tags",
                          e.target.value.split(",").map((tag) => tag.trim())
                        )
                      }
                      className="flex-1 border-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Add tags..."
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <label
                      htmlFor="level"
                      className="block font-medium text-[#111933]"
                    >
                      Level:
                    </label>
                    <select
                      id="level"
                      value={selectedQuestion.level}
                      onChange={(e) => handleChange("level", e.target.value)}
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
                  <h2 className="text-lg font-medium text-[#111933] mb-3">
                    {selectedQuestion.question}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium border ${getLevelBadgeColor(
                        selectedQuestion.level
                      )}`}
                    >
                      {toCamelCase(selectedQuestion.level) || "Not specified"}
                    </span>
                    {renderTags(selectedQuestion.tags.map(toCamelCase))}
                  </div>
                </>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 w-full max-w-2xl mx-auto">
              {selectedQuestion.options.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className={`p-2 rounded-lg flex items-center gap-8  ${
                    !isEditing && option === selectedQuestion.correctAnswer
                      ? "bg-[#32AB24]/50 border border-gray-500 shadow-md"
                      : "bg-white border-2 border-[#111933]/30"
                  }`}
                >
                  <span
                    className={`font-medium text-lg ${
                      !isEditing && option === selectedQuestion.correctAnswer
                        ? "text-[#111933]"
                        : "text-[#111933]"
                    }`}
                  >
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
                          handleChange("options", newOptions);
                        }}
                        className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder={`Option ${String.fromCharCode(
                          65 + optIndex
                        )}`}
                      />
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={selectedQuestion.correctAnswer === option}
                        onChange={() => handleChange("correctAnswer", option)}
                        className="ml-2 w-4 h-4 bg-[#32AB24]/50transition-transform"
                      />
                    </>
                  ) : (
                    <span className="flex-1">{option}</span>
                  )}
                  {!isEditing && option === selectedQuestion.correctAnswer && (
                    <span className="ml-auto px-2 py-1 text-sm font-semibold text-[#111933] bg-[#32AB24]/50 border border-gray-500 rounded-full">
                      Correct
                    </span>
                  )}
                </div>
              ))}
            </div>
            {!isEditing && (
              <div className="mt-4 p-3 rounded-lg bg-[#32AB24]/50 border border-gray-500 shadow-sm max-w-2xl mx-auto flex items-center">
                {/* <CheckCircleIcon className="w-5 h-5 text-green-700 mr-2" /> */}
                <span className="text-lg font-medium text-[#111933]">
                  Correct Answer :
                </span>
                <span className="ml-2 text-lg font-medium text-[#111933]">
                  {selectedQuestion.correctAnswer}
                </span>
              </div>
            )}
            <div className="flex justify-start space-x-10 mt-4 max-w-2xl mx-auto px-4">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 text-[#111933] bg-white border border-[#111933] px-4 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleUpdate(selectedQuestion.question_id);
                      setSelectedQuestion(null);
                      toast.success("Question updated successfully!"); // Add success toast
                    }}
                    disabled={isLoading}
                    className="flex-1 text-[white] bg-[#111933] px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 text-[#111933] bg-[white] border  border-[#111933] border-collapse  px-4 py-2 rounded-lg "
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="flex-1 text-white bg-[#111933]  px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
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

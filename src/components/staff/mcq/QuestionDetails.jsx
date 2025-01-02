import { X, CheckCircleIcon } from 'lucide-react';

const QuestionDetails = ({
  question,
  isEditing,
  onClose,
  onEdit,
  onUpdate,
  onDelete,
  isLoading,
  getLevelBadgeColor,
  renderTags,
  setQuestion
}) => {
  if (!question) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/40 opacity-70 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full md:w-[80%] lg:w-[70%] xl:w-[60%] 2xl:w-[50%] bg-white shadow-2xl rounded-l-3xl transform transition-all duration-500 ease-out">
        <div className="h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all shadow-md"
            >
              <X className="w-6 h-6 text-gray-600 hover:text-gray-800" />
            </button>

            <div className="mt-6 w-full max-w-2xl mx-auto">
              {isEditing ? (
                <>
                  <textarea
                    className="text-2xl font-bold text-gray-900 mb-6 w-full p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={question.question}
                    onChange={(e) =>
                      setQuestion({
                        ...question,
                        question: e.target.value,
                      })
                    }
                    placeholder="Type your question here..."
                    rows={2}
                  />

                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="font-medium text-lg text-gray-700">Tags:</span>
                    <input
                      type="text"
                      value={question.tags.join(", ")}
                      onChange={(e) => {
                        const updatedTags = e.target.value.split(",").map((tag) => tag.trim());
                        setQuestion({
                          ...question,
                          tags: updatedTags,
                        });
                      }}
                      className="flex-1 border-2 border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Add tags..."
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="level" className="block font-medium text-gray-700 mb-2">Level:</label>
                    <select
                      id="level"
                      value={question.level}
                      onChange={(e) =>
                        setQuestion({
                          ...question,
                          level: e.target.value,
                        })
                      }
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{question.question}</h2>
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getLevelBadgeColor(question.level)}`}>
                      {question.level || "Not specified"}
                    </span>
                    {renderTags(question.tags)}
                  </div>
                </>
              )}
            </div>

            {/* Options Section */}
            <div className="grid grid-cols-1 gap-4 w-full max-w-2xl mx-auto">
              {question.options.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 flex items-center gap-4 ${
                    !isEditing && option === question.answer
                      ? "bg-green-50 border-green-300 shadow-md"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <span className={`font-medium text-lg ${
                    !isEditing && option === question.answer ? "text-green-700" : "text-gray-600"
                  }`}>
                    {String.fromCharCode(65 + optIndex)}.
                  </span>

                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...question.options];
                          newOptions[optIndex] = e.target.value;
                          setQuestion({
                            ...question,
                            options: newOptions,
                          });
                        }}
                        className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                      />
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={question.answer === option}
                        onChange={() =>
                          setQuestion({
                            ...question,
                            answer: option,
                          })
                        }
                        className="ml-4 w-5 h-5 accent-green-600 transition-transform"
                      />
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{option}</span>
                      {option === question.answer && (
                        <span className="ml-auto px-3 py-1 text-sm font-semibold text-green-800 bg-green-200 rounded-full">
                          Correct
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {!isEditing && (
              <div className="mt-6 p-4 rounded-lg bg-green-50 border-2 border-green-200 shadow-sm max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
                  <CheckCircleIcon className="w-6 h-6 mr-2" />
                  Correct Answer
                </h3>
                <p className="text-gray-800 font-medium">{question.answer}</p>
              </div>
            )}

            <div className="flex justify-start space-x-4 mt-6 max-w-2xl mx-auto">
              {isEditing ? (
                <>
                  <button
                    onClick={onUpdate}
                    disabled={isLoading}
                    className="flex-1 text-blue-600 bg-blue-100 hover:bg-blue-200 px-6 py-3 rounded-lg transition disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => onEdit(false)}
                    className="flex-1 text-gray-600 bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onEdit(true)}
                    className="flex-1 text-blue-600 bg-blue-100 hover:bg-blue-200 px-6 py-3 rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={onDelete}
                    className="flex-1 text-red-600 bg-red-100 hover:bg-red-200 px-6 py-3 rounded-lg transition"
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
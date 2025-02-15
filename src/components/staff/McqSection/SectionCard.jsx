import React from 'react';

const SectionCard = ({
  section,
  sectionIndex,
  handleInputChange,
  handleAddQuestion,
  handleSaveQuestions,
  handleRemoveSection,
  handleToggleDropdown,
  handleDeleteQuestion,
  currentPage,
  questionsPerPage,
  paginate,
}) => {
  return (
    <div key={section.id} className="bg-white p-6 shadow-md rounded-lg mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-800">Section {sectionIndex + 1}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleRemoveSection(sectionIndex)}
            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
      <form className="space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Section Name *</label>
            <input
              type="text"
              name="sectionName"
              value={section.sectionName}
              onChange={(e) => handleInputChange(e, sectionIndex)}
              placeholder="Section"
              className="w-64 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
              disabled={section.submitted}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Number of Questions *</label>
            <input
              type="number"
              name="numQuestions"
              value={section.numQuestions}
              onChange={(e) => handleInputChange(e, sectionIndex)}
              placeholder="10"
              className="w-40 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
              disabled={section.submitted}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Section Duration (Min)</label>
            <input
              type="number"
              name="sectionDuration"
              value={section.sectionDuration}
              onChange={(e) => handleInputChange(e, sectionIndex)}
              placeholder="10"
              className="w-40 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
              disabled={section.submitted}
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Mark Allotment *</label>
            <div className="flex items-center">
              <input
                type="number"
                name="markAllotment"
                value={section.markAllotment}
                onChange={(e) => handleInputChange(e, sectionIndex)}
                placeholder="01"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                disabled={section.submitted}
              />
              <span className="ml-2">/ Question</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Pass Percentage</label>
            <div className="flex items-center">
              <input
                type="number"
                name="passPercentage"
                value={section.passPercentage}
                onChange={(e) => handleInputChange(e, sectionIndex)}
                placeholder="50"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                disabled={section.submitted}
              />
              <span className="ml-2">%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Time Restriction *</label>
          <input
            type="checkbox"
            name="timeRestriction"
            checked={section.timeRestriction}
            onChange={(e) => handleInputChange(e, sectionIndex)}
            className="w-6 h-6 text-yellow-500 border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
            disabled={section.submitted}
          />
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => handleAddQuestion(sectionIndex)}
            className="bg-amber-400 text-white w-full py-2 rounded-md hover:bg-amber-200 focus:ring-2 focus:ring-blue-500 flex-1"
            disabled={section.submitted}
          >
            Add Questions
          </button>
          <button
            type="button"
            onClick={() => handleSaveQuestions(sectionIndex)}
            className="bg-amber-400 text-white w-full py-2 rounded-md hover:bg-amber-200 focus:ring-2 focus:ring-green-500 flex-1"
            disabled={section.submitted}
          >
            Submit
          </button>
        </div>
      </form>
      {section.selectedQuestions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Selected Questions</h3>
          <div className="relative">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mb-2"
              onClick={() => handleToggleDropdown(sectionIndex)}
            >
              {section.showDropdown ? "Hide Questions" : "Show Questions"}
            </button>
            {section.showDropdown && (
              <div className="bg-white shadow-md rounded-lg p-4 border border-gray-300">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">
                    {section.selectedQuestions.length} questions selected
                  </span>
                </div>
                <table className="table-auto w-full bg-white shadow-lg rounded-lg overflow-hidden">
                  <thead className="bg-gray-200 text-gray-800">
                    <tr>
                      <th className="px-4 py-2">Question</th>
                      <th className="px-4 py-2">Options</th>
                      <th className="px-4 py-2">Correct Answer</th>
                      <th className="px-4 py-2">Level</th>
                      <th className="px-4 py-2">Tags</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.selectedQuestions.slice((currentPage - 1) * questionsPerPage, currentPage * questionsPerPage).map((q, index) => (
                      <tr
                        key={index}
                        className={`${
                          index % 2 === 0 ? "bg-gray-100" : "bg-white"
                        } text-gray-800`}
                      >
                        <td className="px-4 py-2">{q.question}</td>
                        <td className="px-4 py-2">{q.options.join(", ")}</td>
                        <td className="px-4 py-2">{q.correctAnswer}</td>
                        <td className="px-4 py-2 text-center">{q.level}</td>
                        <td className="px-4 py-2 text-center">{q.tags.join(", ")}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleDeleteQuestion(sectionIndex, index)}
                            className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Page {currentPage} of {Math.ceil(section.selectedQuestions.length / questionsPerPage)}
                  </span>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === Math.ceil(section.selectedQuestions.length / questionsPerPage)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionCard;

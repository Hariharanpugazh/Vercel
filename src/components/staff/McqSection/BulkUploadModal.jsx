import React, { useState } from 'react';
import GroupImage from "../../../assets/bulk.png";

const BulkUpload = ({ onClose, handleFileUpload, questions, selectedQuestionsLocal, handleSelectQuestion, handleSelectAll, handleSubmitBulkUpload, currentPage, questionsPerPage, paginate, showImage }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl overflow-y-auto max-h-[80vh]">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Files</h1>
          <p className="text-gray-500 text-sm">
            Easily add questions by uploading your prepared files as{" "}
            <span className="font-medium text-gray-600">csv, xlsx etc.</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition mb-2 float-right"
        >
          Back
        </button>
        <div className="bg-white shadow-lg rounded-3xl p-8 w-full">
          <div className="flex flex-col items-center justify-center mb-6">
            {showImage && (
              <img
                src={GroupImage}
                alt="Upload Illustration"
                className="w-48 h-48 object-contain mb-4"
              />
            )}
            <label
              htmlFor="fileInput"
              className="bg-yellow-400 text-black px-6 py-3 rounded-full shadow hover:bg-yellow-500 cursor-pointer transition"
            >
              {showImage ? "Upload CSV" : "Add Question"}
            </label>
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              accept=".csv"
              onChange={handleFileUpload}
            />
          </div>
        </div>
        {questions.length > 0 && (
          <div className="bg-white shadow-lg rounded-3xl p-6 mt-8 w-full">
            <h2 className="text-2xl font-semibold mb-4">
              Questions Preview (Available: {questions.length})
            </h2>
            <div className="flex justify-between mb-4">
              <button
                onClick={handleSelectAll}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {selectedQuestionsLocal.length === questions.length ? "Deselect All" : "Select All"}
              </button>
              <span className="text-gray-600">
                {selectedQuestionsLocal.length} questions selected
              </span>
            </div>
            <table className="table-auto w-full bg-white shadow-lg rounded-lg overflow-hidden">
              <thead className="bg-gray-200 text-gray-800">
                <tr>
                  <th className="px-4 py-2">Select</th>
                  <th className="px-4 py-2">Question</th>
                  <th className="px-4 py-2">Options</th>
                  <th className="px-4 py-2">Correct Answer</th>
                  <th className="px-4 py-2">Level</th>
                  <th className="px-4 py-2">Tags</th>
                </tr>
              </thead>
              <tbody>
                {questions.slice((currentPage - 1) * questionsPerPage, currentPage * questionsPerPage).map((q, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    } text-gray-800 ${selectedQuestionsLocal.includes(index) ? 'bg-blue-100' : ''}`}
                  >
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedQuestionsLocal.includes(index)}
                        onChange={() => handleSelectQuestion(index)}
                      />
                    </td>
                    <td className="px-4 py-2">{q.question}</td>
                    <td className="px-4 py-2">{q.options.join(", ")}</td>
                    <td className="px-4 py-2">{q.correctAnswer}</td>
                    <td className="px-4 py-2 text-center">{q.level}</td>
                    <td className="px-4 py-2 text-center">{q.tags.join(", ")}</td>
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
                Page {currentPage} of {Math.ceil(questions.length / questionsPerPage)}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(questions.length / questionsPerPage)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSubmitBulkUpload}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Submit Selected Questions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;

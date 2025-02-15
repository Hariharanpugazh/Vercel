import React, { useState } from 'react';
import { X } from 'lucide-react';
import submiticon from '../../assets/submit.svg';

const QuestionModal = ({ isSingleQuestionModalOpen, setIsSingleQuestionModalOpen, singleQuestionData, handleSingleQuestionInputChange, handleSingleQuestionSubmit, uploadStatus }) => {
  const [error, setError] = useState('');

  const validateOptions = () => {
    const options = ['option1', 'option2', 'option3', 'option4'];
    const filledOptions = options.filter(option => singleQuestionData[option].trim() !== '');
    return filledOptions.length >= 2;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateOptions()) {
      setError('At least two choices are required.');
    } else {
      setError('');
      handleSingleQuestionSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-4/5 max-w px-16 py-8 overflow-hidden transform transition-all duration-300">
        <div className="flex mb-10">
          <div className='w-full'>
            <h2 className="text-lg font-semibold text-[#111933] pb-2">Add New Question</h2>
            <h2 className="text-sm font-light text-[#111933] pb-4">Choose how you’d like to add questions to your assessment. Select the method that works best for you to quickly build your test.</h2>
            <div className='border-b-2 border-[#111933]'></div>
          </div>
          <button
            onClick={() => setIsSingleQuestionModalOpen(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="absolute top-5 right-5 w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 mr-4">
              <label className="block text-sm font-medium text-[#111933] mb-1">
                Question <span className="text-red-500">*</span>
              </label>
              <textarea
                name="question"
                value={singleQuestionData.question}
                onChange={handleSingleQuestionInputChange}
                placeholder="Type your question here"
                style={{ paddingBottom: '10rem' }}
                className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                rows={2}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#111933] mb-1">
                Choice <span className="text-red-500">*</span>
              </label>
              {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
                <div key={optionKey} className="flex items-center space-x-2 mb-4">
                  <input
                    type="text"
                    name={optionKey}
                    value={singleQuestionData[optionKey]}
                    placeholder='Type your choice here'
                    onChange={handleSingleQuestionInputChange}
                    className="flex-1 p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 pr-20">
              <label className="block text-sm font-medium text-[#111933] mb-1">
                Select correct answer <span className="text-red-500">*</span>
              </label>
              <select
                name="answer"
                value={singleQuestionData.answer}
                onChange={handleSingleQuestionInputChange}
                className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                required
              >
                <option value="">Select Correct Answer</option>
                {['option1', 'option2', 'option3', 'option4'].map((optionKey, index) => (
                  singleQuestionData[optionKey] && (
                    <option key={optionKey} value={singleQuestionData[optionKey]}>
                      Option {index + 1}: {singleQuestionData[optionKey]}
                    </option>
                  )
                ))}
              </select>
            </div>
            <div className="flex-1 pr-20">
              <label className="block text-sm font-medium text-[#111933] mb-1">
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <select
                name="level"
                value={singleQuestionData.level}
                onChange={handleSingleQuestionInputChange}
                className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                required
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#111933] mb-1">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={singleQuestionData.tags}
                onChange={handleSingleQuestionInputChange}
                className="w-full p-2 rounded-lg border-2 border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-300"
                placeholder="e.g., math, algebra, geometry"
              />
              <p className="mt-1 text-sm text-[#111933]">Separate tags with commas</p>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <button
              type='submit'
              className="inline-flex items-center px-4 py-1 w-144px mt-2 font-medium bg-[#111933] text-[#ffffff] hover:bg-[#111933] focus:outline-none focus:ring-2 focus:ring-offset-2 transform transition-transform duration-300 hover:scale-102 cursor-pointer"
              style={{ borderRadius: '0.5rem' }}
            >
              Submit
              <img src={submiticon} alt="submit" className="w-4 h-4 ml-2" />
            </button>
          </div>
          {error && (
            <div className="p-2 rounded-lg text-sm font-medium text-center shadow-sm bg-red-100 text-red-800">
              {error}
            </div>
          )}
          {uploadStatus && (
            <div
              className={`p-2 rounded-lg text-sm font-medium text-center shadow-sm ${
                uploadStatus.startsWith("Success")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {uploadStatus}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;

// Questions.js
import React from 'react';

const Questions = () => {
    return (
        <div className="questions-page max-w-10xl mx-auto p-10 bg-white shadow-md rounded-md">
            <div className="steps flex justify-between mb-6">
                <span className="text-gray-400">1. Create Contest</span>
                <span className="font-bold text-blue-600">2. File Upload</span>
            </div>

            <h2 className="text-3xl font-semibold mb-6">Our Services</h2>
            <p className="mb-8 text-gray-600">Please select which service you are interested in.</p>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-8">
                    <div className="service-box flex flex-col items-center p-8 bg-gray-100 rounded-lg shadow hover:shadow-lg hover:bg-gray-200">
                        <span className="text-4xl text-blue-600 mb-4">+</span>
                        <h3 className="text-lg font-semibold mb-2">Create Questions</h3>
                        <p className="text-gray-600 text-center">From here you can add questions of multiple types like MCQs, subjective (text or paragraph).</p>
                    </div>
                    <div className="service-box flex flex-col items-center p-8 bg-gray-100 rounded-lg shadow hover:shadow-lg hover:bg-gray-200">
                        <span className="text-4xl text-green-600 mb-4">&uarr;</span>
                        <h3 className="text-lg font-semibold mb-2">Bulk Upload</h3>
                        <p className="text-gray-600 text-center">From here you can easily add multiple questions by uploading a CSV sheet!</p>
                    </div>
                </div>
                <div className="space-y-8">
                    <div className="service-box flex flex-col items-center p-8 bg-gray-100 rounded-lg shadow hover:shadow-lg hover:bg-gray-200">
                        <span className="text-4xl text-yellow-600 mb-4">&#128218;</span>
                        <h3 className="text-lg font-semibold mb-2">Question Library</h3>
                        <p className="text-gray-600 text-center">From here you can add questions of multiple types like MCQs, subjective (text or paragraph).</p>
                    </div>
                    <div className="service-box flex flex-col items-center p-8 bg-gray-100 rounded-lg shadow hover:shadow-lg hover:bg-gray-200">
                        <span className="text-4xl text-purple-600 mb-4">&uarr;</span>
                        <h3 className="text-lg font-semibold mb-2">AI Question Generator</h3>
                        <p className="text-gray-600 text-center">From here you can easily add multiple questions by uploading a CSV sheet!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Questions;
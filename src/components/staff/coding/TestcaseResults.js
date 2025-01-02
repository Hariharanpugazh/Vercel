import React, { useState } from 'react';

function TestcaseResults({ results }) {
  const [activeTab, setActiveTab] = useState(0);

  // If results is empty or undefined, display a message and do not render test case data
  if (!results || results.length === 0) {
    return <div className="mt-6">No results to display.</div>;
  }

  // Get the active test case based on the active tab
  const activeTestCase = results[activeTab];

  // Compare outputs to determine status dynamically
  const isSuccess =
    String(activeTestCase.expected_output || '').trim() ===
    String(activeTestCase.stdout || '').trim();

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold">Testcase Results</h2>
      <div className="border-b border-gray-300 mt-4">
        {results.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`p-2 ${
              activeTab === index ? 'text-blue-500 font-semibold' : ''
            }`}
          >
            Case {index + 1}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Input</h3>
        <p>{JSON.stringify(activeTestCase.input)}</p>

        <h3 className="text-lg font-semibold mt-2">Expected Output</h3>
        <p>{activeTestCase.expected_output}</p>

        <h3 className="text-lg font-semibold mt-2">Your Output</h3>
        <p>{activeTestCase.stdout ? activeTestCase.stdout.trim() : 'No output available'}</p>

        <h3 className="text-lg font-semibold mt-2">Status</h3>
        <p
          className={`font-bold ${
            isSuccess ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {isSuccess ? 'Success' : 'Failure'}
        </p>

        <h3 className="text-lg font-semibold mt-2">Execution Time</h3>
        <p>{activeTestCase.time ? `${activeTestCase.time} seconds` : 'N/A'}</p>

        <h3 className="text-lg font-semibold mt-2">Memory Usage</h3>
        <p>{activeTestCase.memory ? `${activeTestCase.memory} KB` : 'N/A'}</p>
      </div>
    </div>
  );
}

export default TestcaseResults;

// src/components/TestCaseSelection.js
import React, { useEffect, useState } from 'react';

function TestCaseSelection({ selectedProblem, onSelectProblem }) {
  const [problems, setProblems] = useState([]);

  // Load JSON data
  useEffect(() => {
    fetch('/json/questions.json')
      .then((response) => response.json())
      .then((data) => setProblems(data.problems))
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  return (
    <div className="mb-4">
      <label className="text-lg font-semibold">Select a problem to solve:</label>
      <select
        value={selectedProblem}
        onChange={(e) => {
          const selectedId = parseInt(e.target.value, 10); // Convert to integer
          console.log("Selected Problem ID:", selectedId);
          onSelectProblem(selectedId);
        }}
        className="w-full mt-2 p-2 border rounded"
      >
        {problems.map((problem) => (
          <option key={problem.id} value={problem.id}>
            {problem.title}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TestCaseSelection;

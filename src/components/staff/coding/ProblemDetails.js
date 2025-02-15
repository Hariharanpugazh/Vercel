import React, { useEffect, useState } from 'react';

function ProblemDetails({ selectedProblemId }) {
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    fetch('/json/questions.json')
      .then((response) => response.json())
      .then((data) => {
        console.log("Data fetched:", data);
        
        const idToFind = parseInt(selectedProblemId, 10);
        const selectedProblem = data.problems.find(
          (problem) => problem.id === idToFind
        );

        if (selectedProblem) {
          setProblem(selectedProblem);
        } else {
          console.warn(`Problem with ID ${idToFind} not found. Defaulting to first problem.`);
          setProblem(data.problems[0]); // Default to the first problem
        }
      })
      .catch((error) => console.error("Error loading JSON:", error));
  }, [selectedProblemId]);

  if (!problem) return <div>Loading...</div>;

  return (
    <div className="mb-4">
      <h2 className="text-2xl font-semibold">{problem.title}</h2>
      <p className="mt-2 p-4 border rounded bg-gray-100">{problem.problem_statement}</p>

      <h3 className="text-lg font-semibold mt-4">Example Test Cases</h3>
      <ul className="list-disc ml-6">
        {problem.samples.map((sample, index) => (
          <li key={index}>
            <p>Input: {JSON.stringify(sample.input)}</p>
            <p>Expected Output: {sample.output}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProblemDetails;

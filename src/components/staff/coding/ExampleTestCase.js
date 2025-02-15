// src/components/ExampleTestCase.js
import React from 'react';

function ExampleTestCase() {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-semibold">Example Test Case</h2>
      <div className="mt-2">
        <h3 className="text-lg font-semibold">Input</h3>
        <p>a = 5</p>
        <p>b = 3</p>
        <h3 className="text-lg font-semibold mt-2">Expected Output</h3>
        <p>8</p>
      </div>
    </div>
  );
}

export default ExampleTestCase;

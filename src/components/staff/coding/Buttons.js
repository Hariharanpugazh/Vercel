// src/components/Buttons.js
import React from 'react';

function Buttons({ onCompile, onSubmit }) {
  return (
    <div className="flex space-x-4 mt-4">
      <button
        onClick={onCompile}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Compile & Run
      </button>
      <button
        onClick={onSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </div>
  );
}

export default Buttons;



    
// src/components/CodeEditor.js
import React from 'react';
import MonacoEditor from '@monaco-editor/react';

// src/components/CodeEditor.js
function CodeEditor({ language, code, setCode, setLanguage }) {
  return (
    <div>
      <label className="text-lg font-semibold">Select Programming Language</label>
      <select
        className="w-full mt-2 mb-4 p-2 border rounded"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="python">Python</option>
        <option value="javascript">JavaScript</option>
        {/* Add more languages as needed */}
      </select>
      <MonacoEditor
        height="400px"
        language={language}
        theme="vs-dark"
        value={code}
        // value="print('Hello, World!')"
        onChange={setCode}
      />
    </div>
  );
}


export default CodeEditor;



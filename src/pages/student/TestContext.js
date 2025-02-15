import React, { createContext, useState, useContext } from 'react';

const TestContext = createContext();

export const TestProvider = ({ children }) => {
  const [testDetails, setTestDetails] = useState({}); // Initialize as an empty object
  const [currentTest, setCurrentTest] = useState(null); // Stores the currently selected test

  return (
    <TestContext.Provider value={{ testDetails, setTestDetails, currentTest, setCurrentTest }}>
      {children}
    </TestContext.Provider>
  );
};

export const useTestContext = () => useContext(TestContext);

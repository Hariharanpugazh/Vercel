import React, { useState } from 'react';
import axios from 'axios';

const CertificateVerification = () => {
  const [uniqueId, setUniqueId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  const handleVerify = async (event) => {
    event.preventDefault();
    setResult(null);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/mcq/verify-certificate/`, { unique_id: uniqueId });
      if (response.data.status === 'success') {
        setResult(response.data.certificate);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('An error occurred while verifying the certificate.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Verify Certificate</h1>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="unique_id" className="block text-gray-700">Unique ID:</label>
            <input
              type="text"
              id="unique_id"
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              required
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Verify
          </button>
        </form>
        {result && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Certificate Details</h2>
            <p className="text-gray-700">Student Name: {result.studentName}</p>
            <p className="text-gray-700">Contest Name: {result.contestName}</p>
          </div>
        )}
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default CertificateVerification;

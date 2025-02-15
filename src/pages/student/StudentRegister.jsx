import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    collegename: '',
    dept: '',
    regno: '',
    year: '', // Added year field
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_BASE_URL}/api/student/signup/`, formData);

      if (response.status === 201) {
        alert('Registration successful! Please log in.');
        navigate('/StudentLogin');
      }
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        alert('Cannot connect to server. Please make sure the server is running.');
      } else {
        console.error('Registration error:', error);
        const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
        setError(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">Student Register</h1>
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="name" className="mb-1 text-sm font-medium text-gray-600">
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="collegename" className="mb-1 text-sm font-medium text-gray-600">
              College:
            </label>
            <input
              type="text"
              id="collegename"
              name="collegename"
              value={formData.collegename}
              onChange={handleChange}
              required
              className="px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="dept" className="mb-1 text-sm font-medium text-gray-600">
              Department:
            </label>
            <input
              type="text"
              id="dept"
              name="dept"
              value={formData.dept}
              onChange={handleChange}
              required
              className="px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="regno" className="mb-1 text-sm font-medium text-gray-600">
              Register No:
            </label>
            <input
              type="text"
              id="regno"
              name="regno"
              value={formData.regno}
              onChange={handleChange}
              required
              className="px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="year" className="mb-1 text-sm font-medium text-gray-600">
              Year:
            </label>
            <input
              type="text"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              className="px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-1 text-sm font-medium text-gray-600">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="password" className="mb-1 text-sm font-medium text-gray-600">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 text-white bg-yellow-600 hover:bg-yellow-700 rounded-md text-lg font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            Register
          </button>
          <div className="mt-4 text-sm text-gray-600 text-center">
            Already Registered? <Link to="/StudentLogin" className="text-yellow-600 hover:text-yellow-700">Login..</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegister;
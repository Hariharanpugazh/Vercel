import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Loader from '../../layout/Loader'; // Import the Loader component

const StudentLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // Manage loading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader during the API call
    setErrorMessage(''); // Reset error message

    try {
      const response = await axios.post('https://vercel-1bge.onrender.com/api/student/login/', formData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      const { studentId } = response.data;

      localStorage.setItem('studentId', studentId);

      if (response.status === 200) {
        onLogin(studentId);
        navigate('/studentdashboard'); // Redirect to the student dashboard
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'An error occurred during login.');
    } finally {
      setLoading(false); // Hide loader after the API call
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {loading && <Loader message="Logging you in..." />} {/* Show loader if loading */}
      <div className={`bg-white shadow-xl rounded-2xl p-8 max-w-md w-full ${loading ? 'opacity-50' : ''}`}>
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">Student Login</h1>
        {errorMessage && (
          <div className="mb-4 text-red-600 text-center">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
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
            className={`w-full py-3 text-white bg-yellow-600 hover:bg-yellow-700 rounded-md text-lg font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2`}
            disabled={loading} // Disable the button while loading
          >
            Login
          </button>

          <div className="mt-4 text-sm text-gray-600 text-center">
            New student? <Link to="/StudentRegister" className="text-yellow-600 hover:text-yellow-700">Register here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function Login() {
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState({
    full_name: "",
    email: "",
    department: "",
    collegename: "",
  });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(true);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post(
        'https://render-frontend-f05v.onrender.com//api/staff/login/',
        {
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true, // Allow sending and storing cookies if needed for server
        }
      );
  
      // Store response in cookies
      Cookies.set('staffToken', response.data.tokens.access_token, { expires: 7 }); // Expires in 7 days
      Cookies.set('username', response.data.name, { expires: 7 });
  
      navigate('/staffdashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  const fetchStaffData = async () => {
    try {
      // Retrieve the JWT token from cookies
      const token = Cookies.get('staffToken'); 
  
      // Check if the token exists
      if (!token) {
        console.error("No token found! Please login again.");
        return;
      }

      // API call to fetch staff data
      const response = await axios.get('https://render-frontend-f05v.onrender.com//api/staff/profile/', {
        withCredentials: true, // Include cookies if needed
        headers: {
          Authorization: `Bearer ${token}`, // Add JWT token to headers
        },
        
      });

      // Set the staff data
      const { full_name, email, department, collegename } = response.data;
      setStaffData({
        full_name,
        email,
        department,
        collegename,
      });
    } catch (err) {
      console.error('Error fetching staff data:', err.response?.data || err.message);
    }
  };

  // Fetch staff data on component mount
  useEffect(() => {
    fetchStaffData();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl border border-yellow-200">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Staff Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/staffsignup" className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors duration-200">
              Sign up here
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "password" : "text"}
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center top-7"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

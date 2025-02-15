
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Loader from '../../layout/Loader';
import { Mail, Lock } from 'lucide-react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//img imports
import snsLogo from '../../assets/SNS-DT Logo.png';
import loginScattered11 from "../../assets/LoginImg1.png";
import loginScattered22 from "../../assets/LoginImg2.png";
import loginScattered33 from "../../assets/LoginImg3.png";

const StudentLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://render-frontend-f05v.onrender.com';

  const images = [loginScattered11, loginScattered22, loginScattered33];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      if (!isTransitioning) {
        setIsTransitioning(true);
        setCurrentImageIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
        setTimeout(() => {
          setIsTransitioning(false);
        }, 1000);
      }
    }, 4000);

    return () => clearInterval(slideInterval);
  }, [isTransitioning, images.length]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/student/login/`,
        formData,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      const { studentId } = response.data;
      localStorage.setItem('studentId', studentId);

      if (response.status === 200) {
        onLogin(studentId);
        navigate('/studentdashboard');
        toast.success('Login successful!');
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error || 'An error occurred during login.'
      );
      toast.error('Wrong username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {loading && <Loader message="Logging you in..." />}
      <ToastContainer />
      {/* <h1 className='justify-start'>SNS ASSESSMENT PORTAL</h1> */}
      <div className="relative bg-white shadow-lg rounded-2xl flex max-w-6xl w-full">
        {/* Form Section */}
        <form
          onSubmit={handleLogin}
          onKeyDown={handleKeyDown}
          className="flex flex-1 flex-col justify-center mt-10 p-20"
        >
          <img
            src={snsLogo}
            className="w-[200px] absolute top-10 left-56"
            alt="SNS Institutions Logo"
          />

          <h1 className="text-3xl font-medium text-center mb-2 ml-5 mt-5 text-[#111933]">
            Student Assessment Portal
          </h1>
          <p className="text-md text-center ml-5 text-gray-500">
            Please enter your details
          </p>

          <div className="relative mb-4 mt-10">
            <label className="text-sm font-Urbanist mb-1">Email address</label>
            <div className="flex items-center border rounded-lg p-3 shadow-sm">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="flex-1 focus:outline-none text-sm placeholder-gray-400"
                placeholder="test@example.com"
                required
              />
              <Mail className="w-5 h-5 text-white fill-slate-400" />
            </div>
          </div>

          <div className="relative mb-4">
            <label className="text-sm font-Urbanist mb-1">Password</label>
            <div className="flex items-center border rounded-lg p-3 shadow-sm">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="flex-1 focus:outline-none text-sm placeholder-gray-400"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <FaEye className="h-5 w-5" />
                ) : (
                  <FaEyeSlash className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-[70%] mx-auto bg-[#111933] text-white font-Urbanist py-2 rounded-lg shadow hover:shadow-md transition-all mt-5"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Image Slideshow Section */}
        <div className="flex flex-1 justify-center items-center flex-col p-8 overflow-hidden">
          <div className="relative w-full h-full">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Slide ${index + 1}`}
                className="absolute w-full h-full object-cover transition-all duration-1000 ease-in-out"
                style={{
                  opacity: currentImageIndex === index ? 1 : 0,
                  transform: `scale(${currentImageIndex === index ? 1 : 0.95})`,
                  zIndex: currentImageIndex === index ? 1 : 0
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
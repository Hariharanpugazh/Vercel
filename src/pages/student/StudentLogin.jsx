import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Loader from '../../layout/Loader';
import { motion } from 'framer-motion';
import Button from './Button.jsx';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const StudentLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://vercel-sandy-xi-12.vercel.app';

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
        `${API_BASE_URL }/api/student/login/`,
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
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error || 'An error occurred during login.'
      );
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-16">
      <style>
        {`
          @keyframes pulse-slow {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.85;  /* Slight dimming, always visible */
            }
          }
          .animate-pulse-slow {
            animation: pulse-slow 5s linear infinite;  /* Linear for constant presence */
          }
        `}
      </style>

      {loading && <Loader message="Logging you in..." />}
      
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -bottom-32 -left-32 h-[450px] w-[450px] animate-pulse-slow rounded-full bg-blue-100 blur-3xl" />
      <div className="absolute top-0 right-0 h-[500px] w-[500px] animate-pulse-slow rounded-full bg-gradient-to-tr from-blue-100 to-blue-150 blur-3xl" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 mx-auto w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="w-full p-12">
          <motion.div variants={itemVariants} className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-800">
          SNS INSTITUTION
          ASSESMENT-PORTAL
            </h1>
            <p className="text-xl font-sm text-gray-800">
              Login to Your Account
            </p>
            {/* <p className="mt-3 text-sm text-gray-600">
              Don’t have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-amber-600 transition-colors hover:text-amber-500"
              >
                Sign up
              </Link>
            </p> */}
          </motion.div>

          <motion.form
            variants={itemVariants}
            onSubmit={handleLogin}
            className="space-y-8"
          >
            {errorMessage && (
              <div className="mb-6 text-red-600 text-center">
                {errorMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-10 pr-3 text-gray-800 placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  placeholder="test@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-10 pr-12 text-gray-800 placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <motion.div variants={itemVariants} className="pt-6">
            <motion.div variants={itemVariants} className="pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                <span className="flex items-center justify-center gap-2">
                  Login
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </motion.div>
              {/* Optional Terms & Conditions (could be removed for login) */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-center text-xs text-gray-500"
          >
            By logging in, you agree to our{' '}
            <Link
              to="/terms"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Privacy Policy
            </Link>
          </motion.p>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentLogin;

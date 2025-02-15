import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../../layout/Loader'; // Import the Loader component

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // Manage loading state
  const [step, setStep] = useState(1); // Manage the step of the process
  const [otpSent, setOtpSent] = useState(false); // Track if OTP has been sent
  const [otpTimer, setOtpTimer] = useState(60); // OTP timer in seconds (60 seconds)
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  const otpInputs = useRef([]);

  useEffect(() => {
    let timer;
    if (otpSent && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [otpSent, otpTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOtpChange = (e, index) => {
    const { value } = e.target;
    if (value.length === 1 && index < 5) {
      otpInputs.current[index + 1].focus();
    }
    const otpArray = formData.otp.split('');
    otpArray[index] = value;
    setFormData({ ...formData, otp: otpArray.join('') });
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader during the API call
    setErrorMessage(''); // Reset error message
    setSuccessMessage(''); // Reset success message

    try {
      const response = await axios.post(`${API_BASE_URL}/api/student/request-otp/`, {
        email: formData.email,
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      if (response.status === 200) {
        setSuccessMessage('OTP sent to your email');
        setOtpSent(true);
        setOtpTimer(60); // Reset OTP timer to 60 seconds
        setStep(2); // Move to the next step
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'An error occurred while requesting OTP.');
    } finally {
      setLoading(false); // Hide loader after the API call
    }
  };

  const handleResendOTP = async () => {
    setLoading(true); // Show loader during the API call
    setErrorMessage(''); // Reset error message
    setSuccessMessage(''); // Reset success message

    try {
      const response = await axios.post(`${API_BASE_URL}/api/student/request-otp/`, {
        email: formData.email,
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      if (response.status === 200) {
        setSuccessMessage('OTP resent to your email');
        setOtpTimer(60); // Reset OTP timer to 60 seconds
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'An error occurred while resending OTP.');
    } finally {
      setLoading(false); // Hide loader after the API call
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader during the API call
    setErrorMessage(''); // Reset error message
    setSuccessMessage(''); // Reset success message

    try {
      const response = await axios.post(`${API_BASE_URL}/api/student/verify-otp/`, {
        email: formData.email,
        otp: formData.otp,
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      if (response.status === 200) {
        setSuccessMessage('OTP verified successfully');
        setStep(3); // Move to the next step
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'An error occurred while verifying OTP.');
    } finally {
      setLoading(false); // Hide loader after the API call
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader during the API call
    setErrorMessage(''); // Reset error message
    setSuccessMessage(''); // Reset success message

    try {
      const response = await axios.post(`${API_BASE_URL}/api/student/student-reset-password/`, {
        email: formData.email,
        new_password: formData.newPassword
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      if (response.status === 200) {
        setSuccessMessage('Password reset successful');
        navigate('/studentlogin'); // Redirect to the student login page
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'An error occurred during password reset.');
    } finally {
      setLoading(false); // Hide loader after the API call
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {loading && <Loader message="Processing..." />} {/* Show loader if loading */}
      <div className={`bg-white shadow-xl rounded-2xl p-8 max-w-md w-full transform transition-transform duration-300 ${loading ? 'opacity-50' : ''}`}>
        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">Request OTP</h1>
            {errorMessage && (
              <div className="mb-4 text-red-600 text-center">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 text-green-600 text-center">
                {successMessage}
              </div>
            )}
            <form onSubmit={handleRequestOTP} className="space-y-4">
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
                  className="px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-300"
                />
              </div>
              <button
                type="submit"
                className={`w-full py-3 text-white bg-yellow-600 hover:bg-yellow-700 rounded-md text-lg font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-300 ${loading ? 'cursor-not-allowed' : ''}`}
                disabled={loading} // Disable the button while loading
              >
                Request OTP
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">Verify OTP</h1>
            {errorMessage && (
              <div className="mb-4 text-red-600 text-center">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 text-green-600 text-center">
                {successMessage}
              </div>
            )}
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="otp" className="mb-1 text-sm font-medium text-gray-600">
                  OTP:
                </label>
                <div className="flex justify-between">
                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      pattern="\d"
                      value={formData.otp[index] || ''}
                      onChange={(e) => handleOtpChange(e, index)}
                      ref={(el) => (otpInputs.current[index] = el)}
                      className="w-12 h-12 mx-1 text-center border rounded-md shadow-sm border-gray-300 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-300"
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className={`w-full py-3 text-white bg-yellow-600 hover:bg-yellow-700 rounded-md text-lg font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-300 ${loading ? 'cursor-not-allowed' : ''}`}
                disabled={loading} // Disable the button while loading
              >
                Verify OTP
              </button>
              {otpSent && otpTimer > 0 && (
                <div className="text-center mt-4">
                  Resend OTP in {otpTimer} seconds
                </div>
              )}
              {otpSent && otpTimer === 0 && (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-yellow-600 hover:text-yellow-700 transition-colors duration-300 text-center mt-4 block mx-auto"
                >
                  Resend OTP
                </button>
              )}
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">Reset Password</h1>
            {errorMessage && (
              <div className="mb-4 text-red-600 text-center">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 text-green-600 text-center">
                {successMessage}
              </div>
            )}
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="newPassword" className="mb-1 text-sm font-medium text-gray-600">
                  New Password:
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-300"
                />
              </div>
              <button
                type="submit"
                className={`w-full py-3 text-white bg-yellow-600 hover:bg-yellow-700 rounded-md text-lg font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-300 ${loading ? 'cursor-not-allowed' : ''}`}
                disabled={loading} // Disable the button while loading
              >
                Reset Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

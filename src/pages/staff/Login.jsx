
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import Cookies from "js-cookie";
import { Mail } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import loginScattered from "../../assets/LoginImg1.png";
import loginScattered2 from "../../assets/LoginImg2.png";
import loginScattered3 from "../../assets/LoginImg3.png";
import DTimg from "../../assets/SNS-DT Logo.png";

const StaffLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://render-frontend-f05v.onrender.com";

  const images = [loginScattered, loginScattered2, loginScattered3];

  // Updated Image slideshow effect with pause
  useEffect(() => {
    const slideInterval = setInterval(() => {
      if (!isTransitioning) {
        setIsTransitioning(true);
        
        // Move to next image
        setCurrentImageIndex((prevIndex) => {
          if (prevIndex === images.length - 1) {
            return 0;
          }
          return prevIndex + 1;
        });

        // Reset transition flag after animation completes
        setTimeout(() => {
          setIsTransitioning(false);
        }, 1000); // Match this with transition duration
      }
    }, 4000); // Total time for each slide (including transition)

    return () => clearInterval(slideInterval);
  }, [isTransitioning, images.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/staff/login/`,
        { email: formData.email, password: formData.password },
        { withCredentials: true }
      );

      Cookies.set("staffToken", response.data.tokens.access_token, {
        expires: 7,
      });
      Cookies.set("username", response.data.name, { expires: 7 });

      toast.success("Login successful!");
      navigate("/staffdashboard");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Invalid email or password";
      setErrorMessage(errorMessage);
      toast.error(errorMessage);
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
      <ToastContainer />

      <div className="relative bg-white shadow-lg rounded-2xl flex max-w-6xl w-full">
        <form
          onKeyDown={handleKeyDown}
          className="flex flex-1 flex-col justify-center mt-10 p-20"
        >
          <img
            src={DTimg}
            className="w-[200px] absolute top-10 left-56"
            alt="SNS Institutions Logo"
          />

          <h1 className="text-3xl font-medium text-center mb-2 ml-5 mt-5 text-[#111933]">
            Staff Portal
          </h1>
          <p className="text-md ml-4 text-center text-gray-500 ">
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
            {/* <div className="text-right mt-2">
              <Link
                to="/forgotpassword"
                className="text-sm text-blue-600 underline"
              >
                Forgot Password?
              </Link>
            </div> */}
          </div>

          <button
            type="submit"
            disabled={loading}
            onClick={handleLogin}
            className="w-[70%] mx-auto bg-[#111933] text-white font-Urbanist py-2 rounded-lg shadow hover:shadow-md transition-all mt-5"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Updated Image Slideshow */}
        <div className="flex flex-1 justify-center items-center flex-col p-10 overflow-hidden">
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

export default StaffLogin;
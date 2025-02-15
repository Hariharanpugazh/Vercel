import React from 'react';
import { Link } from 'react-router-dom';

const GeneralHome = () => {
  return (
    <div className="min-h-screen bg-[#111933] text-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 animate-fade-in">
          Discover Endless Possibilities
        </h1>
        <p className="text-lg sm:text-xl text-gray-100 mb-8 max-w-2xl animate-fade-in">
          Unlock the potential to achieve your dreams. Whether you're a student or staff, our platform offers tools and resources to help you succeed.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md animate-fade-in-up">
          <Link
            to="/StudentLogin"
            className="w-full py-3 px-6 text-center text-[#111933] bg-white hover:bg-gray-100 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
          >
            Student Portal
          </Link>
          <Link
            to="/stafflogin"
            className="w-full py-3 px-6 text-center text-[#111933] bg-white hover:bg-gray-100 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
          >
            Staff Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GeneralHome;
import React from 'react';
import { Link } from 'react-router-dom';

const GeneralHome = () => {
  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Welcome to Our Portal</h1>
        <p className="text-gray-600 mb-8 text-center">
          Select your role to access the services tailored for you.
        </p>
        <div className="grid grid-cols-1 gap-4">
          <Link
            to="/StudentLogin"
            className="w-full py-3 text-center text-white bg-yellow-600 hover:bg-yellow-700 rounded-md text-lg font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            I am a Student
          </Link>
          <Link
            to="/stafflogin"
            className="w-full py-3 text-center text-white bg-yellow-600 hover:bg-yellow-700 rounded-md text-lg font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            I am a Staff
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GeneralHome;
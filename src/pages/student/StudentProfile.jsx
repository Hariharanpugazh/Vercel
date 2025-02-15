import React, { useState, useEffect } from "react";
import axios from "axios";
import profileImagePlaceholder from "../../assets/profile.svg";
import ProfileBackImg from "../../assets/profilebg.svg";

const StudentProfile = () => {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    password: "",
    collegename: "",
    dept: "",
    regno: "",
    profileImage: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "https://render-frontend-f05v.onrender.com";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/student/profile/`,
          {
            withCredentials: true,
          }
        );
        setProfileData(response.data);
      } catch (err) {
        setError("Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12">
          Fetching Your Profile...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-14 py-4 pl-4 items-start bg-blue-50">
        <div className="flex items-start gap-2 text-[#111933]">
          <span
            className="opacity-60 cursor-pointer"
            onClick={() => window.history.back()}
          >
            Home
          </span>
          <span>{">"}</span>
          <span className="opacity-60">Student Profile</span>
        </div>
      </div>
      <div className="min-h-screen bg-blue-50 flex flex-col items-center">
        {/* Profile Card */}
        <div className="bg-white max-w-2xl w-full rounded-lg shadow-lg mt-2">
          {/* Profile Image */}
          <div className="flex justify-center mb-4 relative mt-7">
            {/* Background Image */}
            <img
              src={ProfileBackImg}
              alt="Profile Background"
              className="absolute w-auto max-h-56 top-0 left-0 right-0 bottom-0 mx-auto z-0"
              style={{ opacity: 0.5 }}
            />

            {/* Profile Image with Border */}
            <div className="w-48 h-48 rounded-full mt-6 border-4 border-yellow-500 overflow-hidden relative">
              <img
                src={profileData.profileImage || profileImagePlaceholder}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Profile Details */}

          <div className="p-6 space-y-4 ml-24">
            <div>
              <h1 className="text-[#111933] font-medium text-2xl">Profile</h1>
            </div>
            <hr className="my-4 border-t border-gray-400" />
            {[
              { label: "Name", value: profileData.name },
              { label: "Register Number", value: profileData.regno },
              { label: "College", value: profileData.collegename },
              { label: "Department", value: profileData.dept },
              { label: "Email", value: profileData.email },
              // { label: "Password", value: "12345678" }, // Assuming placeholder for password
            ].map((field, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-4 items-center mr-24"
              >
                <span className="font-semibold text-[#111933]">
                  {field.label}
                </span>
                <input
                  type={field.label === "Password" ? "password" : "text"}
                  value={field.value}
                  disabled
                  className="w-full px-3 py-2  text-[#111933] bg-white focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentProfile;

"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import ProfileIcon from "../../assets/Dashboard icon.png";
import ProfileBackIcon from "../../assets/Iconbackground.png";

const StaffProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    department: "",
    collegename: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "https://render-frontend-f05v.onrender.com";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/staff/profile/`, {
          withCredentials: true,
        });
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch staff profile data.");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen ">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111933]"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f4f6ff86] p-9 max-h-screen ">
      <div className="bg-white m-auto max-w-2xl rounded-lg shadow-lg overflow-hidden">
        {/* Header Bar */}

        <div className="px-8 pb-8">
          {/* Profile Image Section */}
          <div className="flex justify-center mt-4 relative">
            {/* Background Icon */}
            <img
              src={ProfileBackIcon || "/placeholder-bg.svg"}
              alt="Background"
              className="absolute w-auto h-60 top-0 left-0 right-0 bottom-0 mx-auto z-0"
            />

            {/* Profile Image */}
            <img
              src={ProfileIcon || "/placeholder.svg"}
              alt="Profile"
              className="relative w-60 h-58 rounded-full z-10 mt-5 "
            />
          </div>

          {/* Alerts */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md">
              {successMessage}
            </div>
          )}

          {/* Profile Details */}
          <div>
            <h1 className="text-[#111933] font-medium text-2xl">Profile</h1>
          </div>
          <hr className="my-4 border-t border-gray-400" />
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-[#111933] font-semibold">Name</label>
              <input
                type="text"
                disabled
                name="name"
                value={profile.name}
                className="col-span-2 px-3 py-2  focus:outline-none focus:ring-1 focus:ring-[#111933] text-[#111933] bg-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-[#111933] font-semibold">College</label>
              <input
                type="text"
                disabled
                name="collegename"
                value={profile.collegename}
                className="col-span-2 px-3 py-2  focus:outline-none focus:ring-1 focus:ring-[#111933] text-[#111933] bg-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-[#111933] font-semibold">Department</label>
              <input
                type="text"
                disabled
                name="department"
                value={profile.department}
                className="col-span-2 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#111933] text-[#111933] bg-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-[#111933] font-semibold">Email</label>
              <input
                type="email"
                disabled
                name="email"
                value={profile.email}
                className="col-span-2 px-3 py-2  focus:outline-none focus:ring-1 text-[#111933] bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;

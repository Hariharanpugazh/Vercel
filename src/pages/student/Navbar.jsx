import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Menu, MenuItem, Avatar } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

// Import your logo
import logo from "../../assets/SNS-DT Logo.png"; // Update the path to your logo
import avatarImage from "../../assets/Dashboard icon.png";

const Navbar = () => {
  const [username, setUsername] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("studentName");
    if (storedUsername) {
      setUsername(decodeURIComponent(storedUsername));
    }
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    try {
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=;expires=${new Date(0).toUTCString()};path=/`;
      });

      localStorage.clear();
      sessionStorage.clear();

      navigate("/studentlogin");
      handleMenuClose();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleSettingsClick = () => {
    navigate('/studentprofile');
    handleMenuClose();
  };

  return (
    <div className={`flex bg-white ${window.location.pathname === '/student/dashboard' ? 'rounded-t-2xl' : 'rounded-2xl'} p-2 mt-2 mx-3 justify-between items-center`}>
      {/* Left section - Logo */}
      <div className="flex items-center gap-8">
        <img src={logo} alt="Logo" className="h-16 cursor-pointer" onClick={() => navigate('/studentdashboard')} />
      </div>
      <div className="flex items-center gap-4 text-[#111933]">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{username || "Student"}</span>
          <button onClick={handleMenuOpen} className="">
            <img src={avatarImage} alt="Avatar" className="rounded-full h-16 w-16" />
          </button>
        </div>
      </div>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleSettingsClick}>
          <SettingsIcon className="mr-2" /> Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon className="mr-2" /> Logout
        </MenuItem>
      </Menu>
    </div>
  );
};

export default Navbar;

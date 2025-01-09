import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  MenuItem,
  Avatar,
  Box,
  InputBase,
} from "@mui/material";
import { styled, alpha } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import EmailIcon from '@mui/icons-material/Email';
import Cookies from "js-cookie"; // Add this import

// Import your logo
import logo from "../../assets/snsihub.png"; // Update the path to your logo

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha("#F3F4F6", 1),
  "&:hover": {
    backgroundColor: alpha("#E5E7EB", 1),
  },
  marginLeft: theme.spacing(1),
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "250px",
  },
}));

const Navbar = () => {
  const [username, setUsername] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get username from cookies or localStorage
    const storedUsername = Cookies.get("username");
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
      // Clear cookies
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=;expires=${new Date(0).toUTCString()};path=/`;
      });
      
      // Clear all localStorage keys
      localStorage.clear();

      // Clear all sessionStorage keys
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
    <>
      <div className={`flex bg-gradient-to-r from-[#00296B] to-[#0077B6] ${
        window.location.pathname === '/student/dashboard' ? 'rounded-t-2xl' : 'rounded-2xl'
      } p-4 mt-3 mx-3 justify-between items-center`}>
        {/* Left section - Logo */}
        <div className="flex items-center gap-8">
          <img src={logo} alt="Logo" className="h-10" />
        </div>

        {/* Middle section - Navigation */}
        {/* <div className="flex ml-40 items-center gap-8">
          <nav className="flex gap-6 text-white">
            <Link to="/student/dashboard" className="font-medium text-white hover:text-yellow-500">
              Home
            </Link>
            <Link to="/student/profile" className="font-medium text-white hover:text-yellow-500">
              Profile
            </Link>
            <Link to="/student/library" className="font-medium text-white hover:text-yellow-500">
              Library
            </Link>
          </nav>
        </div> */}

        {/* Right section - Actions and Profile */}
        <div className="flex items-center gap-4 text-white">
          {/* <button className="p-2">
            <SearchIcon />
          </button>
          <button className="p-2">
            <EmailIcon />
          </button> */}
          <div className="flex items-center mr-2 gap-2">
            <span>{username || "Student"}</span>
            <button onClick={handleMenuOpen} className="p-2">
              <Avatar>
                {username ? username[0].toUpperCase() : "S"}
              </Avatar>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleSettingsClick}>
          <SettingsIcon className="mr-2" /> Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon className="mr-2" /> Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default Navbar;
'use client'

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, MenuItem, Avatar, Tooltip } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import Cookies from 'js-cookie';
import logo from '../../assets/Institution.png';
import { motion } from 'framer-motion';

const StaffNavbar = () => {
  const [username, setUsername] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleLinkClick = (index) => {
    setActiveIndex(index);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    Cookies.remove('username');
    Cookies.remove('staffToken');
    navigate('/stafflogin');
    handleMenuClose();
  };

  const handleSettings = () => {
    navigate('/staffprofile');
    handleMenuClose();
  };

  useEffect(() => {
    const storedUsername = Cookies.get('username');
    if (storedUsername) {
      setUsername(decodeURIComponent(storedUsername));
    }
  }, []);

  const navLinks = [
    { name: 'Home', path: '/staffdashboard' },
    { name: 'Students', path: '/staffstudentprofile' },
    { name: 'Library', path: '/library' },
  ];

  return (
    <>
      <div className="flex bg-transparent rounded p-4 mt-3 mx-3 justify-between items-center">
        <div className="flex items-center gap-8">
          <img src={logo} alt="Logo" className="h-12" />
        </div>
        <div className="flex justify-center w-1/2 mx-auto bg-transparent ml-96 rounded-full items-center gap-8 py-2 overflow-hidden ">
          <div className="flex gap-6 text-black">
            {navLinks.map((link, index) => (
            <Tooltip key={index} title={link.name}>
            <Link
              to={link.path}
              onClick={() => handleLinkClick(index)}
              className={`relative font-medium transition-all duration-300 px-6 py-3 rounded-full flex-shrink-0 text-lg ${
                location.pathname === link.path ? 'text-gray-800' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {link.name}
              {location.pathname === link.path && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full animate-blink"></span>
              )}
            </Link>
          </Tooltip>
          
           
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-black">
          <div className="flex items-center mr-2 gap-2">
            <span>{username || 'User'}</span>
            <button onClick={handleMenuOpen} className="p-2">
              <Avatar className="bg-gradient-to-r from-blue-300 to-blue-600 text-white">
                {username ? username[0].toUpperCase() : 'U'}
              </Avatar>
            </button>
          </div>
        </div>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleSettings}>
          <SettingsIcon className="mr-2" /> Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon className="mr-2" /> Logout
        </MenuItem>
      </Menu>
      </div>

      
    </>
  );
};

export default StaffNavbar;

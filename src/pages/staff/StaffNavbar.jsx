import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, MenuItem, Tooltip } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import Cookies from "js-cookie";
import { Dialog, DialogTitle, DialogContent, IconButton, DialogActions, Typography, Grid, Box } from '@mui/material';
import mcq from '../../assets/mcq.png';
import code from '../../assets/code.png';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from "framer-motion";

import logo from "../../assets/SNS-DT Logo.png";
import avatarImage from "../../assets/Dashboard icon.png"; // Import the image
import { FaPlus, FaPlusCircle } from "react-icons/fa";
import CenteredModal from "../../components/staff/mcq/ConfirmModal";

const StaffNavbar = () => {
  const [username, setUsername] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(null);
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [targetPath, setTargetPath] = useState('');

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    if (window.location.pathname.includes('mcq/combinedDashboard')) {
      setIsConfirmModalOpen(true);
      setTargetPath("/stafflogin");
      return;
    }

    // Clear all cookies, including JWT tokens
    document.cookie.split(";").forEach(cookie => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/;secure;samesite=strict`);
    });

    // Clear local storage and session storage
    localStorage.clear();
    sessionStorage.clear();

    // Proceed with logout after clearing
    navigate("/stafflogin");
    handleMenuClose();
  };

  const handleSettings = async () => {
    if (window.location.pathname.includes('mcq/combinedDashboard')) {
      setIsConfirmModalOpen(true);
      setTargetPath("/staffprofile"); // Set the target path you want to navigate to
      return;
    }
    navigate("/staffprofile");
    handleMenuClose();
  };

  useEffect(() => {
    const storedUsername = Cookies.get("username");
    if (storedUsername) {
      setUsername(decodeURIComponent(storedUsername));
    }

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  const handleLinkClick = async (path) => {
    if (window.location.pathname.includes('mcq/combinedDashboard')) {
      setIsConfirmModalOpen(true);
      setTargetPath(path); // Set the target path you want to navigate to
      setActiveLink(path);
      return;
    }
    setActiveLink(path);
    navigate(path);
  };

  return (
    <>
      <div
        className={`flex sticky top-0 z-20 bg-white ${isScrolled ? "rounded-b-2xl" : "rounded-2xl"
          } p-1 mt-3 mx-3 justify-between items-center transition-all duration-300`}
      >
        {isConfirmModalOpen &&
          <CenteredModal
            isConfirmModalOpen={isConfirmModalOpen}
            setIsConfirmModalOpen={setIsConfirmModalOpen}
            targetPath={targetPath}
          />
        }
        <div className="flex items-center ml-9 gap-8">
          <Tooltip title="SNS Institutions">
            <span className="cursor-pointer" 
            onClick={() => handleLinkClick("/staffdashboard")}>
              <img src={logo} alt="Logo" className="h-14 mb-4" />
            </span>
          </Tooltip>
        </div>

        <div className="flex ml-32 items-center gap-8">
          <nav className="flex gap-6 text-black mb-2">
            <Tooltip title="Home Dashboard">
              <span // Use <span> instead of <Link> to prevent direct navigation
                className={`font-medium font-sans transition-all duration-300 relative cursor-pointer
      ${activeLink === "/staffdashboard" ? "text-yellow-500 font-bold" : "text-[#111933]"}`}
                onClick={() => handleLinkClick("/staffdashboard")}
              >
                HOME
                {activeLink === "/staffdashboard" && <span className="blinking-dot"></span>}
              </span>
            </Tooltip>

            <Tooltip title="View and Manage Students">
              <span
                to="/staffstudentprofile"
                className={`font-medium font-sans transition-all duration-300 relative cursor-pointer
                  ${activeLink === "/staffstudentprofile" ? "text-yellow-500 font-bold" : "text-[#111933]"}`}
                onClick={() => handleLinkClick("/staffstudentprofile")}
              >
                STUDENT
                {activeLink === "/staffstudentprofile" && (
                  <span className="blinking-dot"></span>
                )}
              </span>
            </Tooltip>
            <Tooltip title="Access Library Resources">
              <span
                to="/library"
                className={`font-medium font-sans transition-all duration-300 relative cursor-pointer
      ${activeLink === "/library" ? "text-yellow-500 font-bold" : "text-[#111933]"}`}
                onClick={() => handleLinkClick("/library")}
              >
                LIBRARY
                {activeLink === "/library" && (
                  <span className="blinking-dot"></span>
                )}
              </span>
            </Tooltip>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-[#000975]">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2"
          >

            <button
              className="py-1 px-7 mb-2 bg-white border-2 border-[#efeeee] shadow-md shadow-blue-100 font-semibold text-[#111933] rounded-full hover:bg-white w-full h-full flex items-center justify-center gap-2"
              onClick={() => {
                if (window.location.pathname.includes('mcq/combinedDashboard')) {
                  setIsConfirmModalOpen(true);
                  setTargetPath("/mcq/details"); // Set the target path you want to navigate to
                  handleModalClose();
                  return;
                }
                navigate('/mcq/details');
                handleModalClose();
              }}
            >
              Create Test <span><FaPlusCircle /></span>
            </button>

          </motion.div>

          <div className="flex items-center mr-2 gap-1"> {/* Reduced gap */}
            <span className="mb-2 text-xl text-[#111933]">{username || "User"}</span> {/* Reduced margin */}
            <button onClick={handleMenuOpen} className="p-1"> {/* Reduced padding */}
              <img src={avatarImage} alt="Avatar" className="mb-2 rounded-full h-12 w-12" /> {/* Adjusted size */}
            </button>
          </div>
        </div>
      </div>
      {/* Modal for Create Test */}
      {/* <Dialog
        open={isModalOpen}
        onClose={handleModalClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px', // Smooth curved corners for the modal
            padding: '16px',
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" align="center" fontWeight="bold">
            Select Test Type
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleModalClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '250px', // Increased height for better spacing
                  border: '1px solid #E0E0E0',
                  borderRadius: '24px', // Smooth curved corners for boxes
                  cursor: 'pointer',
                  transition: 'transform 0.3s, box-shadow 0.3s', // Smooth hover animations
                  '&:hover': {
                    backgroundColor: '#f9faff',
                    transform: 'scale(1.05)', // Slight zoom effect
                    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)', // Add shadow on hover
                  },
                }}
                onClick={() => {
                  if (window.location.pathname.includes('mcq/combinedDashboard')) {
                    setIsConfirmModalOpen(true);
                    setTargetPath("/mcq/details"); // Set the target path you want to navigate to
                    handleModalClose();
                    return;
                  }
                  navigate('/mcq/details');
                  handleModalClose();
                }}
              >
                <img src={mcq} alt="Skill Assessment" style={{ maxWidth: '80px', margin: '0 auto' }} />
                <Typography variant="h6" mt={3}>
                  Skill Assessment
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Evaluations to test knowledge and skills across different topics
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '250px', // Increased height for better spacing
                  border: '1px solid #E0E0E0',
                  borderRadius: '24px', // Smooth curved corners for boxes
                  cursor: 'pointer',
                  transition: 'transform 0.3s, box-shadow 0.3s', // Smooth hover animations
                  '&:hover': {
                    backgroundColor: '#f9faff',
                    transform: 'scale(1.05)', // Slight zoom effect
                    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)', // Add shadow on hover
                  },
                }}
                onClick={() => {
                  if (window.location.pathname.includes('mcq/combinedDashboard')) {
                    setIsConfirmModalOpen(true);
                    setTargetPath("/coding/details"); // Set the target path you want to navigate to
                    handleModalClose();
                    return;
                  }
                  navigate('/coding/details');
                  handleModalClose();
                }}
              >
                <img src={code} alt="Code Contest" style={{ maxWidth: '80px', margin: '0 auto' }} />
                <Typography variant="h6" mt={3}>
                  Code Contest
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Challenges to assess programming and problem-solving skills
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mt: 3 }}>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ textAlign: 'center', width: '100%', marginBottom: '16px' }}
          >
            You can select a test type to proceed or close the dialog.
          </Typography>
        </DialogActions>
      </Dialog> */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleSettings}>
          <SettingsIcon className="mr-2" /> Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon className="mr-2" /> Logout
        </MenuItem>
      </Menu>
      <style jsx>{`
        .blinking-dot {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          background-color: #fdc500;
          border-radius: 50%;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default StaffNavbar;

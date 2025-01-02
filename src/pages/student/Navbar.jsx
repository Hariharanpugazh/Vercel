import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
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
import { useNavigate, Link } from 'react-router-dom';

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha("#F3F4F6", 1), // Light gray background for search
  "&:hover": {
    backgroundColor: alpha("#E5E7EB", 1), // Slightly darker on hover
  },
  marginLeft: theme.spacing(1),
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "250px",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#6B7280", // Neutral gray for search icon
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "#1F2937", // Dark gray text
  padding: theme.spacing(1, 1, 1, 0),
  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  width: "100%",
}));

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    try {
      // Clear all cookies by setting their expiry date to the past
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=;expires=${new Date(0).toUTCString()};path=/`;
      });
  
      // Clear all tokens from localStorage and sessionStorage
      localStorage.removeItem("accessToken"); // JWT access token
      localStorage.removeItem("refreshToken"); // JWT refresh token
      sessionStorage.clear(); // Clear all session data
  
      // Navigate to login page
      navigate("/studentlogin");
  
      console.log("User successfully logged out");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  

  const handleSettingsClick = () => {
    navigate('/studentprofile');
    handleMenuClose();
  };

  return (
    <AppBar position="static" className="bg-yellow-50" color="" elevation={0}>
      <Toolbar className="flex justify-between px-6 bg-yellow-50 shadow-md">
        {/* Left: Logo and Title */}
        <Box className="flex items-center">
          <Typography
            variant="h6"
            fontWeight="bold"
            className="text-yellow-600 mr-4 cursor-pointer"
          >
            <Link to="/" className="text-yellow-600">
              SNS Groups
            </Link>
          </Typography>
         
        </Box>

        {/* Center: Search */}
        

        {/* Right: Profile Menu */}
        <Box display="flex" alignItems="center">
          <IconButton>
            <EmailIcon fontSize="medium" className="text-gray-700" />
          </IconButton>

          <IconButton onClick={handleMenuOpen}>
            <Avatar
              sx={{ bgcolor: "#F59E0B", width: 40, height: 40 }}
              alt="Profile"
              className="cursor-pointer"
            >
              P
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleSettingsClick}>
              <SettingsIcon fontSize="small" className="mr-2 text-gray-700" />
              <Typography className="text-gray-900">Settings</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" className="mr-2 text-red-500" />
              <Typography color="error">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

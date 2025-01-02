// import React, { useState, useEffect } from "react";
// import Cookies from "js-cookie"; // Import js-cookie for handling cookies
// import { Link, useNavigate } from "react-router-dom";
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   IconButton,
//   Menu,
//   MenuItem,
//   Avatar,
//   Box,
//   InputBase,
// } from "@mui/material";
// import { styled, alpha } from "@mui/system";
// import SearchIcon from "@mui/icons-material/Search";
// import SettingsIcon from "@mui/icons-material/Settings";
// import LogoutIcon from "@mui/icons-material/Logout";
// import EmailIcon from "@mui/icons-material/Email";

// import logo from "../../assets/snsihub.png";

// const Search = styled("div")(({ theme }) => ({
//   position: "relative",
//   borderRadius: theme.shape.borderRadius,
//   backgroundColor: alpha("#F3F4F6", 1), // Light gray background for search
//   "&:hover": {
//     backgroundColor: alpha("#E5E7EB", 1), // Slightly darker on hover
//   },
//   marginLeft: theme.spacing(1),
//   width: "100%",
//   [theme.breakpoints.up("sm")]: {
//     width: "250px",
//   },
// }));

// const SearchIconWrapper = styled("div")(({ theme }) => ({
//   padding: theme.spacing(0, 2),
//   height: "100%",
//   position: "absolute",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   color: "#6B7280", // Neutral gray for search icon
// }));

// const StyledInputBase = styled(InputBase)(({ theme }) => ({
//   color: "#1F2937", // Dark gray text
//   padding: theme.spacing(1, 1, 1, 0),
//   paddingLeft: `calc(1em + ${theme.spacing(4)})`,
//   width: "100%",
// }));

// const StaffNavbar = () => {
//   const [username, setUsername] = useState("");
//   const [anchorEl, setAnchorEl] = useState(null);
//   const navigate = useNavigate();

//   const handleMenuOpen = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };

//   const handleLogout = () => {
//     console.log("Logout clicked");
//     handleMenuClose();
//   };

//   useEffect(() => {
//     // Retrieve the 'username' cookie and decode it
//     const storedUsername = Cookies.get("username");

//     // Replace URL encoded characters like "%20" with spaces
//     if (storedUsername) {
//       setUsername(decodeURIComponent(storedUsername));
//     }
//   }, []);

//   return (
//     <>
//       <div
//         className={`flex bg-gradient-to-r from-[#00296B] to-[#0077B6] ${
//           window.location.pathname === "/staff/students" ||
//           window.location.pathname === "/staffdashboard"
//             ? "rounded-t-2xl"
//             : "rounded-2xl"
//         } p-4 mt-3 mx-3 justify-between items-center`}
//       >
//         <div className="flex items-center gap-8">
//           <img src={logo} alt="Logo" className="h-10" />
//         </div>
//         <div className="flex ml-40 items-center gap-8">
//           <nav className="flex gap-6 text-white">
//             <Link
//               to="/staffdashboard"
//               className="font-medium text-white hover:text-yellow-500"
//             >
//               Home
//             </Link>
//             <Link
//               to="/staffstudentprofile"
//               className="font-medium text-white hover:text-yellow-500"
//             >
//               Student
//             </Link>
//             <Link
//               to="/library"
//               className="font-medium text-white hover:text-yellow-500"
//             >
//               Library
//             </Link>
//           </nav>
//         </div>
//         <div className="flex items-center gap-4 text-white">
//           <button className="p-2">
//             <SearchIcon />
//           </button>
//           <button className="p-2">
//             <EmailIcon />
//           </button>
//           <div className="flex items-center mr-2 gap-2">
//             {/* Dynamically display the username */}
//             <span>{username || "User"}</span>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default StaffNavbar;

// update 2

// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from 'react-router-dom';
// import Cookies from 'js-cookie'; // Import the js-cookie library
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   IconButton,
//   Menu,
//   MenuItem,
//   Avatar,
//   Box,
//   InputBase,
// } from "@mui/material";
// import { styled, alpha } from "@mui/system";
// import SearchIcon from "@mui/icons-material/Search";
// import SettingsIcon from "@mui/icons-material/Settings";
// import LogoutIcon from "@mui/icons-material/Logout";
// import EmailIcon from '@mui/icons-material/Email';

// import logo from "../../assets/snsihub.png";

// const Search = styled("div")(({ theme }) => ({
//   position: "relative",
//   borderRadius: theme.shape.borderRadius,
//   backgroundColor: alpha("#F3F4F6", 1), // Light gray background for search
//   "&:hover": {
//     backgroundColor: alpha("#E5E7EB", 1), // Slightly darker on hover
//   },
//   marginLeft: theme.spacing(1),
//   width: "100%",
//   [theme.breakpoints.up("sm")]: {
//     width: "250px",
//   },
// }));

// const SearchIconWrapper = styled("div")(({ theme }) => ({
//   padding: theme.spacing(0, 2),
//   height: "100%",
//   position: "absolute",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   color: "#6B7280", // Neutral gray for search icon
// }));

// const StyledInputBase = styled(InputBase)(({ theme }) => ({
//   color: "#1F2937", // Dark gray text
//   padding: theme.spacing(1, 1, 1, 0),
//   paddingLeft: `calc(1em + ${theme.spacing(4)})`,
//   width: "100%",
// }));

// const StaffNavbar = () => {
//   const [username, setUsername] = useState("");
//   const [anchorEl, setAnchorEl] = useState(null);
//   const navigate = useNavigate();

//   const handleMenuOpen = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };

//   const handleLogout = () => {
//     // Remove the username cookie
//     Cookies.remove("username");

//     // Optionally remove other cookies or tokens if needed
//     Cookies.remove("staffToken");

//     // Clear the username state
//     setUsername("");

//     // Redirect to the login page
//     navigate("/stafflogin");
//   };

//   useEffect(() => {
//     // Retrieve the 'username' cookie and decode it
//     const storedUsername = Cookies.get("username");

//     // Replace URL encoded characters like "%20" with spaces
//     if (storedUsername) {
//       setUsername(decodeURIComponent(storedUsername));
//     }
//   }, []);

//   return (
//     <>
//       <div className={`flex bg-gradient-to-r from-[#00296B] to-[#0077B6] ${window.location.pathname === '/staff/students' || window.location.pathname === '/staffdashboard' ? 'rounded-t-2xl' : 'rounded-2xl'} p-4 mt-3 mx-3 justify-between items-center`}>
//         <div className="flex items-center gap-8">
//           <img src={logo} alt="Logo" className="h-10" />
//         </div>
//         <div className="flex ml-40 items-center gap-8">
//           <nav className="flex gap-6 text-white">
//             <Link to="/staffdashboard" className="font-medium text-white hover:text-yellow-500">Home</Link>
//             <Link to="/staffstudentprofile" className="font-medium text-white hover:text-yellow-500">Student</Link>
//             <Link to="/library" className="font-medium text-white hover:text-yellow-500">Library</Link>
//           </nav>
//         </div>
//         <div className="flex items-center gap-4 text-white">
//           <button className="p-2"><SearchIcon /></button>
//           <button className="p-2"><EmailIcon /></button>
//           <div className="flex items-center mr-2 gap-2">
//             {/* User info section */}
//             <span onClick={handleMenuOpen} style={{ cursor: 'pointer' }}>
//               {username || "User"}
//             </span>

//             {/* Dropdown Menu for user options */}
//             <Menu
//               anchorEl={anchorEl}
//               open={Boolean(anchorEl)}
//               onClose={handleMenuClose}
//             >
//               <MenuItem onClick={handleLogout}>
//                 <LogoutIcon className="mr-2" /> Logout
//               </MenuItem>
//             </Menu>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default StaffNavbar;


import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
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
import Cookies from "js-cookie"; // Don't forget to import Cookies

import logo from "../../assets/snsihub.png"

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

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#6B7280",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "#1F2937",
  padding: theme.spacing(1, 1, 1, 0),
  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  width: "100%",
}));

const StaffNavbar = () => {
  const [username, setUsername] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    Cookies.remove("username"); // Remove the username cookie
    Cookies.remove("staffToken"); // Optionally remove other cookies
    navigate("/stafflogin"); // Navigate to login page after logout
    handleMenuClose();
  };

  const handleSettings = () => {
    navigate("/staffprofile"); // Navigate to the StaffProfile page
    handleMenuClose();
  };

  useEffect(() => {
    const storedUsername = Cookies.get("username");
    if (storedUsername) {
      setUsername(decodeURIComponent(storedUsername));
    }
  }, []);

  return (
    <>
      <div className={`flex bg-gradient-to-r from-[#00296B] to-[#0077B6] ${window.location.pathname === '/staff/students' || window.location.pathname === '/staffdashboard' ? 'rounded-t-2xl' : 'rounded-2xl'} p-4 mt-3 mx-3 justify-between items-center`}>
        <div className="flex items-center gap-8">
          <img src={logo} alt="Logo" className="h-10" />
        </div>
        <div className="flex ml-40 items-center gap-8">
          <nav className="flex gap-6 text-white">
            <Link to="/staffdashboard" className="font-medium text-white hover:text-yellow-500">
              Home
            </Link>
            <Link to="/staffstudentprofile" className="font-medium text-white hover:text-yellow-500">
              Student
            </Link>
            <Link to="/library" className="font-medium  text-white hover:text-yellow-500">
              Library
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-white">
          <button className="p-2"><SearchIcon /></button>
          <button className="p-2"><EmailIcon /></button>
          <div className="flex items-center mr-2 gap-2">
            <span>{username || "User"}</span>
            <button onClick={handleMenuOpen} className="p-2">
              <Avatar>{username ? username[0].toUpperCase() : "U"}</Avatar>
            </button>
          </div>
        </div>
      </div>
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
    </>
  );
};

export default StaffNavbar;


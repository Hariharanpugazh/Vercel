import React, { useState, useEffect } from "react";
import { Pagination } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from "@mui/material";
import Loader from "../../../layout/Loader";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { IoCloseCircleOutline } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
} from "@mui/material";

const normalizeString = (str) => {
  return str.replace(/[&]/g, '').toLowerCase();
};

const StaffStudentProfile = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState([]);
  const [collegeFilter, setCollegeFilter] = useState([]);
  const [yearFilter, setYearFilter] = useState([]);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://render-frontend-f05v.onrender.com";

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/studentprofile/`)
      .then((response) => response.json())
      .then((data) => {
        setStudents(data.students);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, [API_BASE_URL]);

  const filteredStudents = students
    .filter((student) => {
      const matchesSearch = Object.entries(student).some(([key, value]) =>
        key !== 'year' && normalizeString(value).includes(normalizeString(searchTerm))
      );
      const matchesDepartment =
        departmentFilter.length === 0 || departmentFilter.some((filter) => normalizeString(student.dept).includes(normalizeString(filter)));
      const matchesCollege =
        collegeFilter.length === 0 || collegeFilter.some((filter) => normalizeString(student.collegename).includes(normalizeString(filter)));
      const matchesYear = yearFilter.length === 0 || yearFilter.includes(student.year);
      return matchesSearch && matchesDepartment && matchesCollege && matchesYear;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const isAsc = sortConfig.direction === "ascending" ? 1 : -1;
      return isAsc * (a[sortConfig.key] < b[sortConfig.key] ? -1 : 1);
    });


  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const yearCounts = ["I", "II", "III", "IV"].reduce((acc, year) => {
    acc[year] = students.filter((student) => student.year === year).length;
    return acc;
  }, {});

  const handleFilterDialogOpen = () => {
    setOpenFilterDialog(true);
  };

  const applyFilters = () => {
    setOpenFilterDialog(false);
  };

  const clearFilters = () => {
    setDepartmentFilter([]);
    setCollegeFilter([]);
    setYearFilter([]);
    setOpenFilterDialog(false);
  };

  const handleFilterDialogClose = () => {
    setOpenFilterDialog(false);
  };

  const toggleFilter = (filterType, value) => {
    if (filterType === "dept") {
      setDepartmentFilter((prevFilters) =>
        prevFilters.includes(value)
          ? prevFilters.filter((filter) => filter !== value)
          : [...prevFilters, value]
      );
    } else if (filterType === "collegename") {
      setCollegeFilter((prevFilters) =>
        prevFilters.includes(value)
          ? prevFilters.filter((filter) => filter !== value)
          : [...prevFilters, value]
      );
    } else if (filterType === "year") {
      setYearFilter((prevFilters) =>
        prevFilters.includes(value)
          ? prevFilters.filter((filter) => filter !== value)
          : [...prevFilters, value]
      );
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const areFiltersApplied = () => {
    return departmentFilter.length > 0 || collegeFilter.length > 0 || yearFilter.length > 0;
  };

  if (isLoading) {
    return <Loader />; // Render the Loader component while loading
  }

  return (
    <div className="bg-[#f4f6ff86] py-10 px-2 rounded-lg shadow-md">
      <div className="p-6 ml-16 mr-14 min-h-screen">
        <h1 className="text-2xl font-bold text-[#111933] mb-4">Academic Profile Management</h1>
        <p className="text-[#111933] mb-6">
          A comprehensive platform for analyzing and overseeing profiles across academic cohorts.
        </p>
        {/* Year Count Cards */}
        <div className="grid grid-cols-1 mb-11 mt-11 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {Object.entries(yearCounts).map(([year, count]) => (
            <div
              key={year}
              className="relative bg-white rounded-lg mb-4 shadow-lg p-6 max-w-[250px] mx-auto w-full flex flex-col items-center hover:shadow-xl transition duration-300"
            >
              {/* Circular Year Badge */}
              <div className="absolute -top-5 flex items-center justify-center ml-60 w-14 h-14 bg-white rounded-full shadow-md">
                <div className="flex items-center justify-center w-11 h-11 bg-yellow-500 rounded-full">
                  <span className="text-[#111933] text-lg font-bold">{year}</span>
                </div>
              </div>

              <p className="text-gray-700 text-lg font-medium mt-2">{year} Year Students</p>
              <p className="text-3xl font-bold text-[#111933]">{count}</p>
            </div>
          ))}
        </div>



        <div className="bg-white p-6 rounded-xl shadow-lg ">
          {/* Search and Filter Section */}
          <div className="flex justify-between items-center mb-4">
            <div className="relative border border-gray-300 rounded-3xl">
              <input
                type="text"
                placeholder="Search students..."
                className="focus:outline-none focus:ring-1 focus:ring-[#111933] w-full ring-1 ring-[#111933] rounded-3xl pl-10 pr-4 py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleFilterDialogOpen}
                variant="contained"
                sx={{
                  backgroundColor: "#111933",
                  color: "#fff",
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span style={{ marginRight: '8px' }}>Filter</span>
                <FilterListIcon />
              </Button>
              {areFiltersApplied() && (
                <Button
                  onClick={clearFilters}
                  variant="contained"
                  sx={{
                    backgroundColor: "#111933",
                    color: "#fff",
                    borderRadius: '10px',
                    "&:hover": {
                      backgroundColor: "#fff",
                      color: "#111933",
                    },
                  }}
                >
                  <ClearIcon className="mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="grid grid-cols-5 gap-4 p-4 bg-[#111933] text-white font-medium">
              <p onClick={() => requestSort("name")} className="flex items-center cursor-pointer">
                Name
                {sortConfig.key === "name" && (
                  sortConfig.direction === "ascending" ? (
                    <FontAwesomeIcon icon={faSortUp} className="ml-3" />
                  ) : (
                    <FontAwesomeIcon icon={faSortDown} className="ml-3" />
                  )
                )}
                {sortConfig.key !== "name" && <FontAwesomeIcon icon={faSort} className="ml-3" />}
              </p>
              <p className="flex justify-center">Department</p>
              <p onClick={() => requestSort("collegename")} className="flex items-center justify-center cursor-pointer">
                College
                {sortConfig.key === "collegename" && (
                  sortConfig.direction === "ascending" ? (
                    <FontAwesomeIcon icon={faSortUp} className="ml-3" />
                  ) : (
                    <FontAwesomeIcon icon={faSortDown} className="ml-3" />
                  )
                )}
                {sortConfig.key !== "collegename" && <FontAwesomeIcon icon={faSort} className="ml-3" />}
              </p>
              <p className="flex justify-center">Year</p>
              <p className="flex justify-center">Report</p>
            </div>
            {filteredStudents
              .slice(indexOfFirstStudent, indexOfLastStudent)
              .map((student) => (
                <div
                  key={student.regno}
                  className="grid grid-cols-5 gap-4 p-4 border-t bg-white hover:bg-[#ECF2FE]"
                >
                  <p>{student.name}</p>
                  <p className="flex justify-center">{student.dept}</p>
                  <p className="flex justify-center">{student.collegename}</p>
                  <p className="flex justify-center">{student.year}</p>
                  <p className="flex justify-center">
                    <Button
                      className="text-[#111933]"
                      onClick={() => navigate(`/studentstats/${student.regno}`)}
                    >
                      <VisibilityIcon sx={{ color: "#111933" }} />
                    </Button>
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Filter Dialog */}
        <Dialog
          open={openFilterDialog}
          onClose={handleFilterDialogClose}
          fullWidth
          maxWidth="md"
          PaperProps={{
            style: {
              width: '800px', // Increased width
              height: '530px', // Reduced height
              borderRadius: 15, // Rounded edges for the filter dialog
              backgroundColor: '#fff', // White background for the dialog
            },
          }}
          BackdropProps={{
            className: "fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm",
          }}
          TransitionProps={{ unmountOnExit: true }} // Remove sliding effect
        >
          <DialogTitle sx={{ fontWeight: "bold", mb: 1, color: "#111933", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Filter Options
            <IconButton onClick={handleFilterDialogClose} sx={{ color: "#111933" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ paddingTop: 0 }}>
            <Typography
              variant="h6"
              sx={{ mb: 1, fontWeight: "bold", color: "#111933" }}
            >
              Department
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {["AI&ML", "IT", "CSE", "AI&DS", "Mech", "EEE", "ECE", "CSD", "CST", "AERO", "MCT", "CIVIL", "Others"].map(
                (dept) => (
                  <Chip
                    key={dept}
                    label={dept}
                    clickable
                    onClick={() => toggleFilter("dept", dept)}
                    sx={{
                      cursor: "pointer",
                      backgroundColor: departmentFilter.includes(dept)
                        ? "#111933"
                        : "rgba(225, 235, 255, 0.8)", // Light blue with low opacity
                      color: departmentFilter.includes(dept) ? "#fff" : "#111933",
                      width: 'auto', // Allow width to adjust based on content
                      height: '35px', // Adjusted height
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center', // Center the text
                      borderRadius: '15px', // Rounded corners
                      whiteSpace: 'nowrap', // Prevent text wrapping
                      overflow: 'hidden', // Hide overflow text
                      textOverflow: 'ellipsis', // Show ellipsis for overflow text
                      "&:hover": {
                        backgroundColor: "#111933", // Change to #111933 on hover
                        color: "#fff", // Change text color to white on hover
                      },
                    }}
                  />
                )
              )}
            </Box>

            <Typography
              variant="h6"
              sx={{ mt: 2, mb: 1, fontWeight: "bold", color: "#111933" }}
            >
              Institution
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {["SNSCT", "SNSCE", "SNS Spine", "SNS Nursing", "SNS Pharmacy", "SNS Health Science", "SNS Academy", "SNS Physiotherapy"].map(
                (college) => (
                  <Chip
                    key={college}
                    label={college}
                    clickable
                    onClick={() => toggleFilter("collegename", college)}
                    sx={{
                      cursor: "pointer",
                      backgroundColor: collegeFilter.includes(college)
                        ? "#111933"
                        : "rgba(225, 235, 255, 0.8)", // Light blue with low opacity
                      color: collegeFilter.includes(college) ? "#fff" : "#111933",
                      width: 'auto', // Allow width to adjust based on content
                      height: '40px', // Adjusted height
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center', // Center the text
                      borderRadius: '15px', // Rounded corners
                      whiteSpace: 'nowrap', // Prevent text wrapping
                      overflow: 'hidden', // Hide overflow text
                      textOverflow: 'ellipsis', // Show ellipsis for overflow text
                      "&:hover": {
                        backgroundColor: "#111933", // Change to #111933 on hover
                        color: "#fff", // Change text color to white on hover
                      },
                    }}
                  />
                )
              )}
            </Box>

            <Typography
              variant="h6"
              sx={{ mt: 2, mb: 1, fontWeight: "bold", color: "#111933" }}
            >
              Year
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {["I", "II", "III", "IV"].map((year) => (
                <Chip
                  key={year}
                  label={year}
                  clickable
                  onClick={() => toggleFilter("year", year)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: yearFilter.includes(year)
                      ? "#111933"
                      : "rgba(225, 235, 255, 0.8)", // Light blue with low opacity
                    color: yearFilter.includes(year) ? "#fff" : "#111933",
                    width: 'auto', // Allow width to adjust based on content
                    height: '35px', // Adjusted height
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center', // Center the text
                    borderRadius: '15px', // Rounded corners
                    whiteSpace: 'nowrap', // Prevent text wrapping
                    overflow: 'hidden', // Hide overflow text
                    textOverflow: 'ellipsis', // Show ellipsis for overflow text
                    "&:hover": {
                      backgroundColor: "#111933", // Change to #111933 on hover
                      color: "#fff", // Change text color to white on hover
                    },
                  }}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={clearFilters}
              variant="outlined"
              sx={{
                color: "#111933",
                borderColor: "#111933",
                borderRadius: '10px', // Slightly curved
                width: '150px', // Adjusted width
                height: '40px', // Adjusted height
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: "nowrap",
                gap: '8px',
                "&:hover": {
                  backgroundColor: "#fff",
                  color: "#111933",
                },
              }}
            >
              <div className="rounded-full border border-[#111933] p-[2px]">
                <IoCloseCircleOutline className="text-[#111933]" />
              </div>

              Clear Filter
            </Button>
            <Button
              onClick={applyFilters}
              variant="contained"
              sx={{
                backgroundColor: "#111933",
                color: "#fff",
                borderRadius: '10px', // Slightly curved
                width: '150px', // Adjusted width
                height: '40px', // Adjusted height
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
                gap: '8px',
                "&:hover": {

                },
              }}
            >
              <div className="rounded-full border border-white ">
                <FaCheckCircle className="text-white" />
              </div>
              Apply Filters
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default StaffStudentProfile;

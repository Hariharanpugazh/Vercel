import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Pagination,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const StudentTable = ({
  students,
  selectedStudents,
  setSelectedStudents,
  filters,
  setFilters,
  sortConfig,
  setSortConfig,
  page,
  setPage,
  rowsPerPage,
  openFilterDialog,
  setOpenFilterDialog,
  testDetails = {} // Provide a default empty object
}) => {
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const applyFilters = () => {
      let filtered = students.filter(
        (student) =>
          (filters.collegename.length === 0 ||
            filters.collegename.includes(student.collegename)) &&
          (filters.dept.length === 0 || filters.dept.includes(student.dept)) &&
          (filters.year === "" || student.year === filters.year)
      );

      if (searchQuery.trim() !== "") {
        const lowerQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (student) =>
            student.name.toLowerCase().includes(lowerQuery) ||
            student.regno.toLowerCase().includes(lowerQuery)
        );
      }

      setFilteredStudents(filtered);
      setPage(0);
    };

    applyFilters();
  }, [filters, students, searchQuery, setPage]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map((student) => student.regno));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleStudentSelect = (regno) => {
    setSelectedStudents((prev) =>
      prev.includes(regno)
        ? prev.filter((id) => id !== regno)
        : [...prev, regno]
    );
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedStudents = useMemo(() => {
    let sortableStudents = [...filteredStudents];
    if (sortConfig.key) {
      sortableStudents.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableStudents;
  }, [filteredStudents, sortConfig]);

  const handleFilterDialogOpen = () => {
    setOpenFilterDialog(true);
  };

  const handleFilterDialogClose = () => {
    setOpenFilterDialog(false);
  };

  const applyFilters = () => {
    setOpenFilterDialog(false);
  };

  const clearFilters = () => {
    setFilters({ collegename: [], dept: [], year: "" });
    setOpenFilterDialog(false);
  };

  const toggleFilter = (filterType, value) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      if (!Array.isArray(updatedFilters[filterType])) {
        updatedFilters[filterType] = [];
      }
      if (updatedFilters[filterType].includes(value)) {
        updatedFilters[filterType] = updatedFilters[filterType].filter(
          (item) => item !== value
        );
      } else {
        updatedFilters[filterType].push(value);
      }
      return updatedFilters;
    });
  };

  const handlePageChange = (event, value) => {
    setPage(value - 1);
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <TextField
          placeholder="Search students..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "50px",
              height: "40px",
              padding: "0 16px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "gray",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "darkgray",
            },
            "& .MuiInputLabel-root": {
              top: "-5px",
              fontSize: "0.9rem",
              color: "gray",
            },
            "& .MuiInputLabel-shrink": {
              top: "0px",
            },
          }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={handleFilterDialogOpen}
          sx={{
            borderColor: "#111933",
            backgroundColor: "#111933",
            color: "#fff",
            "&:hover": {
              color: "#111933",
              borderColor: "#111933",
              backgroundColor: "#fff",
            },
          }}
        >
          Filter
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ border: "1px solid #003366" }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#111933", color: "white" }}>
            <TableRow>
              <TableCell padding="checkbox" sx={{ width: 40 }}>
                <Checkbox
                  indeterminate={
                    selectedStudents.length > 0 &&
                    selectedStudents.length < filteredStudents.length
                  }
                  checked={
                    filteredStudents.length > 0 &&
                    selectedStudents.length === filteredStudents.length
                  }
                  onChange={handleSelectAll}
                  sx={{
                    color: "white",
                    '&.Mui-checked': {},
                    '&.MuiCheckbox-indeterminate': {
                      color: "white",
                    },
                  }}
                />
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", cursor: "pointer", color: "white", width: 150 }}
                onClick={() => requestSort("name")}
              >
                Name{" "}
                {sortConfig.key === "name" && (
                  sortConfig.direction === "asc" ? (
                    <FontAwesomeIcon icon={faSortUp} className="ml-3" />
                  ) : (
                    <FontAwesomeIcon icon={faSortDown} className="ml-3" />
                  )
                )}
                {sortConfig.key !== "name" && <FontAwesomeIcon icon={faSort} className="ml-3" />}
              </TableCell>
              <TableCell sx={{ color: "white", width: 180 }}>
                Registration Number
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", cursor: "pointer", color: "white", width: 150 }}
                onClick={() => requestSort("dept")}
              >
                Department{" "}
                {sortConfig.key === "dept" && (
                  sortConfig.direction === "asc" ? (
                    <FontAwesomeIcon icon={faSortUp} className="ml-3" />
                  ) : (
                    <FontAwesomeIcon icon={faSortDown} className="ml-3" />
                  )
                )}
                {sortConfig.key !== "dept" && <FontAwesomeIcon icon={faSort} className="ml-3" />}
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", cursor: "pointer", color: "white", width: 150 }}
                onClick={() => requestSort("collegename")}
              >
                College Name{" "}
                {sortConfig.key === "collegename" && (
                  sortConfig.direction === "asc" ? (
                    <FontAwesomeIcon icon={faSortUp} className="ml-3" />
                  ) : (
                    <FontAwesomeIcon icon={faSortDown} className="ml-3" />
                  )
                )}
                {sortConfig.key !== "collegename" && <FontAwesomeIcon icon={faSort} className="ml-3" />}
              </TableCell>
              <TableCell sx={{ cursor: "pointer", color: "white", width: 80 }}>
                Year
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedStudents
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((student) => (
                <TableRow key={student.regno} hover>
                  <TableCell padding="checkbox" sx={{ width: 40 }}>
                    <Checkbox
                      checked={selectedStudents.includes(student.regno)}
                      onChange={() => handleStudentSelect(student.regno)}
                      disabled={testDetails?.visible_to?.includes(student.regno) || false} // Safely access visible_to
                    />
                  </TableCell>
                  <TableCell sx={{ width: 150 }}>{student.name}</TableCell>
                  <TableCell sx={{ width: 180 }}>{student.regno}</TableCell>
                  <TableCell sx={{ width: 150 }}>{student.dept}</TableCell>
                  <TableCell sx={{ width: 150 }}>{student.collegename}</TableCell>
                  <TableCell sx={{ width: 80 }}>{student.year}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="flex justify-center mt-6">
        <Pagination
          count={Math.ceil(filteredStudents.length / rowsPerPage)}
          page={page + 1}
          onChange={handlePageChange}
          sx={{
            '& .MuiPaginationItem-root': {
              color: '#000975',
            },
            '& .MuiPaginationItem-root.Mui-selected': {
              backgroundColor: '#111933',
              color: '#fff',
            },
            '& .MuiPaginationItem-root:hover': {
              backgroundColor: 'rgba(0, 9, 117, 0.4)',
              color:'#fff'
            },
          }}
        />
      </div>
      <Dialog
        open={openFilterDialog}
        onClose={handleFilterDialogClose}
        fullWidth
        maxWidth="sm"
        BackdropProps={{
          className: "fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm",
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", mb: 2, color: "#003366" }}>
          Filter Options
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#003366" }}>
            DEPARTMENT
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {[
              "AIML",
              "IT",
              "CSE",
              "AIDS",
              "Mech",
              "EEE",
              "ECE",
              "CSD",
              "CST",
              "AREO",
              "Mechatronics",
              "CIVIL",
              "PF1",
              "Others",
            ].map((dept) => (
              <Chip
                key={dept}
                label={dept}
                clickable
                onClick={() => toggleFilter("dept", dept)}
                color={filters.dept.includes(dept) ? "primary" : "default"}
                sx={{
                  cursor: "pointer",
                  backgroundColor: filters.dept.includes(dept) ? "rgba(0, 9, 117, 0.5)" : "rgba(0, 9, 117, 0.95)",
                  color: filters.dept.includes(dept) ? "#000" : "#fff",
                }}
              />
            ))}
          </Box>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#003366" }}>
            INSTITUTION
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {[
              "SNSCT",
              "SNSCE",
              "SNS Spine",
              "SNS Nursing",
              "SNS Pharmacy",
              "SNS Health Science",
              "SNS Academy",
              "iHub",
              "SNS Physiotherapy",
            ].map((college) => (
              <Chip
                key={college}
                label={college}
                clickable
                onClick={() => toggleFilter("collegename", college)}
                color={filters.collegename.includes(college) ? "primary" : "default"}
                sx={{
                  cursor: "pointer",
                  backgroundColor: filters.collegename.includes(college) ? "rgba(0, 9, 117, 0.5)" : "rgba(0, 9, 117, 0.95)",
                  color: filters.collegename.includes(college) ? "#000" : "#fff",
                }}
              />
            ))}
          </Box>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#003366" }}>
            YEAR
          </Typography>
          <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
            <InputLabel sx={{ color: "#003366" }}>Year</InputLabel>
            <Select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              label="Year"
              name="year"
              sx={{ color: "#003366" }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="I">I</MenuItem>
              <MenuItem value="II">II</MenuItem>
              <MenuItem value="III">III</MenuItem>
              <MenuItem value="IV">IV</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={clearFilters}
            color="primary"
            sx={{ color: "#003366", borderColor: "#003366" }}
          >
            Clear All Filters
          </Button>
          <Button
            onClick={applyFilters}
            color="primary"
            sx={{ color: "#003366", borderColor: "#003366" }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentTable;

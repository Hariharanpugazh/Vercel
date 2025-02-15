import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Dialog, DialogTitle, DialogContent, IconButton, DialogActions, Typography, Grid, Box, Pagination, Skeleton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TestCard from '../../components/staff/TestCard';
import CreateTestCard from '../../components/staff/CreaTestCard';
import api from '../../axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns-tz';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import notest from '../../assets/testno.png'; // Import the image
import dashboard1 from '../../assets/dashboard1.svg';
import dashboard2 from '../../assets/dashboard2.svg';
import dashboard3 from '../../assets/dashboard3.svg';
import dashboard4 from '../../assets/dashboard4.svg';
import graph from '../../assets/graph.svg';
import { formatInTimeZone } from 'date-fns-tz';
import mcq from '../../assets/mcq.png'; // Adjust the path as necessary
import code from '../../assets/code.png'; // Adjust the path as necessary

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    totalTests: 0,
    students: 0,
    liveTests: 0,
    completedTests: 0,
    upcomingTest: 0,
  });

  const [tests, setTests] = useState([]);
  const [mcqTests, setMcqTests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [clickCount, setClickCount] = useState(0);
  const [showToggle, setShowToggle] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [contestResponse, studentStatsResponse, mcqResponse] = await Promise.all([
        api.get('/contests', { withCredentials: true }),
        api.get('/students/stats', { withCredentials: true }),
        api.get('/mcq', { withCredentials: true }),
      ]);

      const codingTests = contestResponse?.data?.contests || [];
      const mcqAssessments = mcqResponse?.data?.assessments || [];

      const reversedCodingTests = [...codingTests].reverse();
      const reversedMcqTests = [...mcqAssessments].reverse();

      const totalTests = codingTests.length + mcqAssessments.length;
      const liveTests = [...codingTests, ...mcqAssessments].filter((test) => test.status === 'Live').length;
      const completedTests = [...codingTests, ...mcqAssessments].filter(
        (test) => test.status === 'Completed' ||
                  test.status === 'Closed' ||
                  test.overall_status === 'closed' ||
                  (test.testEndDate && new Date(test.testEndDate) < new Date())
      ).length;
      const upcomingTests = [...codingTests, ...mcqAssessments].filter(
        (test) => test.status === 'Upcoming'
      ).length;

      setStats({
        totalTests,
        students: studentStatsResponse?.data?.total_students || 0,
        liveTests,
        completedTests,
        upcomingTest: upcomingTests,
      });

      setTests(reversedCodingTests);
      setMcqTests(reversedMcqTests);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch test data. Please try again later.');
      toast.error('Failed to fetch test data. Please try again later.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate('/stafflogin');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const state = location.state;
    if (state && state.testStatus === 'closed') {
      fetchData(); // Re-fetch data when closed assessment is detected
    }
  }, [location, fetchData]);

  // Replace the existing filteredTests useMemo in your Dashboard component with this:
  const filteredTests = useMemo(() => {
    const allTests = [...tests, ...mcqTests].map(test => {
      const currentUTC = new Date(
        formatInTimeZone(new Date(), 'Asia/Kolkata', "yyyy-MM-dd'T'HH:mm:ss'Z'")
      ).getTime();
      const startUTC = new Date(test.registrationStart).getTime();
      const endUTC = new Date(test.endDate).getTime();
  
      let status;
      if (currentUTC < startUTC) {
        status = "Upcoming";
      } else if (currentUTC >= startUTC && currentUTC <= endUTC) {
        status = "Live";
      } else {
        status = "Completed";
      }
  
      return { ...test, currentStatus: status };
    });
  
    if (activeFilter === 'All') {
      return allTests.filter((test) =>
        (test.assessmentName || test.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  
    return allTests.filter(
      (test) =>
        test.currentStatus === activeFilter &&
        (test.assessmentName || test.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tests, mcqTests, activeFilter, searchQuery]);

  useEffect(() => {
    const liveTests = filteredTests.filter(test => test.currentStatus === 'Live').length;
    const completedTests = filteredTests.filter(test => test.currentStatus === 'Completed').length;
    const upcomingTests = filteredTests.filter(test => test.currentStatus === 'Upcoming').length;
  
    setStats(prevStats => ({
      ...prevStats,
      liveTests,
      completedTests,
      upcomingTest: upcomingTests,
    }));
  }, [filteredTests]);

  const getItemsPerPage = useCallback(() => {
    return activeFilter === 'All' ? 8 : 9;
  }, [activeFilter]);

  const paginatedTests = useMemo(() => {
    const currentItemsPerPage = getItemsPerPage();
    return filteredTests.slice((page - 1) * currentItemsPerPage, page * currentItemsPerPage);
  }, [filteredTests, page, getItemsPerPage]);

  const filterTests = useCallback((status) => {
    setActiveFilter(status);
    setPage(1); // Reset to the first page when filter changes
  }, []);

  const handleModalClose = () => setIsModalOpen(false);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to the first page when search query changes
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  useEffect(() => {
    const state = location.state;
    if (state && state.toastMessage) {
      toast.success(state.toastMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleOverallStatsClick = () => {
    setClickCount((prevCount) => {
      const newCount = prevCount + 1;
      if (newCount === 15) {
        setShowToggle(true);
      }
      return newCount;
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <div className={`min-h-screen py-10 px-5 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#f4f6ff86]'}`}>
      <ToastContainer />

      <div className="bg-transparent mx-5 ml-16 mr-14 rounded-b-2xl p-6 ">
        <h2 className="text-3xl text-[#111933] mb-6 font-medium cursor-text">
          Overall Stats
        </h2>

        <div className="grid grid-cols-1 mt-11 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { title: "Test Created", value: stats.totalTests, icon: dashboard1 },
            { title: "No of Students", value: stats.students, icon: dashboard2 },
            { title: "Live Test", value: stats.liveTests, icon: dashboard3 },
            { title: "Completed Test", value: stats.completedTests, icon: dashboard4 },
            { title: "Upcoming Test", value: stats.upcomingTest, icon: dashboard1 }
          ].map(({ title, value, icon }, index) => (
            <div
              key={index}
              className="relative bg-white rounded-lg shadow-lg p-4 max-w-[250px] w-full hover:shadow-xl transition duration-300"
            >
              <div className="absolute -top-5 -right-4 flex items-center justify-center w-14 h-14 bg-white rounded-full shadow-md">
                <div className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden">
                  <img src={icon} alt={title} />
                </div>
              </div>

              <div className="flex flex-col items-start justify-between h-full">
                <div>
                  {isLoading ? (
                    <Skeleton variant="text" width={35} height={30} />
                  ) : (
                    <p className="text-2xl font-medium text-[#111933]">{value}</p>
                  )}
                  {isLoading ? (
                    <Skeleton variant="text" width={100} height={30} />
                  ) : (
                    <p className="text-[#111933] text-md font-medium mt-1 whitespace-nowrap">{title}</p>
                  )}
                </div>

                <div className="h-16 -mt-8">
                  <img src={graph} alt="Graph" className="w-full h-36 ml-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`max-w-8xl mx-auto px-4 py-8 ${isDarkMode ? 'text-white' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex text-sm gap-4 ml-20">
            {['All', 'Live', 'Completed', 'Upcoming'].map((status) => (
              <button
                key={status}
                className={`px-4 rounded-[10000px] py-1 ${
                  activeFilter === status ? 'bg-[#111933] text-white font-bold' : 'text-gray-600 hover:text-gray-900'
                } ${isDarkMode ? 'text-white' : ''}`}
                onClick={() => filterTests(status)}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative mr-16">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              className={`px-10 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-[#111933] w-full ring-1 ring-[#111933] ${isDarkMode ? 'bg-gray-800 text-white' : ''}`}
            />
          </div>
        </div>

        <div className={`grid rounded-2xl grid-cols-1 md:grid-cols-3 p-7 ml-14 mr-12 gap-5 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
          {activeFilter === 'All' && searchQuery === '' && <CreateTestCard />}
          {isLoading ? (
            // Render skeleton TestCards while loading
            Array.from({ length: getItemsPerPage() }).map((_, index) => (
              <TestCard key={index} isLoading={true} />
            ))
          ) : (
            paginatedTests.length > 0 ? (
              paginatedTests.map((test) => (
                <TestCard
                  key={test._id}
                  contestId={test.contestId}
                  title={test.name}
                  type={test.type}
                  date={format(new Date(test.endDate), 'MM/dd/yyyy')}
                  time={formatInTimeZone(new Date(test.endDate), 'UTC', 'hh:mm a')}
                  stats={{
                    Assigned: test.assignedCount || 0,
                    'Yet to Complete': Math.max((test.assignedCount || 0) - (test.completedCount || 0), 0), // Ensuring non-negative
                    Completed: test.completedCount || 0,
                  }}
                  registrationStart={test.registrationStart}
                  endDate={test.endDate}
                  isDarkMode={isDarkMode}
                />

              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center">
                <img src={notest} alt="No tests found" className="h-64 object-contain" />
                <p className="text-gray-600 text-lg mt-4">No tests found</p>
              </div>
            )
          )}
        </div>

        <div className="flex justify-center mt-6">
          <Pagination
            count={Math.ceil(filteredTests.length / getItemsPerPage())}
            page={page}
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
      </div>

      <Dialog
        open={isModalOpen}
        onClose={handleModalClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            padding: '16px',
            backgroundColor: isDarkMode ? 'gray-800' : 'white',
            color: isDarkMode ? 'white' : 'black',
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
                  height: '250px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    backgroundColor: '#f9faff',
                    transform: 'scale(1.05)',
                    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)',
                  },
                  backgroundColor: isDarkMode ? 'gray-800' : 'white',
                  color: isDarkMode ? 'white' : 'black',
                }}
                onClick={() => {
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
                  height: '250px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '24px',
                  cursor: 'pointer',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    backgroundColor: '#f9faff',
                    transform: 'scale(1.05)',
                    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)',
                  },
                  backgroundColor: isDarkMode ? 'gray-800' : 'white',
                  color: isDarkMode ? 'white' : 'black',
                }}
                onClick={() => {
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
      </Dialog>

      {showToggle && (
        <button
          className="fixed bottom-4 right-4 bg-[#000a7500] text-transparent p-2 rounded-full"
          onClick={toggleDarkMode}
        >
          Toggle
        </button>
      )}
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaChartBar, FaUsers, FaClipboardList, FaCheckCircle } from 'react-icons/fa';
import { Dialog, DialogTitle, DialogContent, IconButton, DialogActions, Typography, Grid, Box, Tooltip, Pagination } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StatsCard from '../../components/staff/StatsCard';
import TestCard from '../../components/staff/TestCard';
import CreateTestCard from '../../components/staff/CreaTestCard';
import Loader from '../../layout/Loader';
import mcq from '../../assets/mcq.png';
import code from '../../assets/code.png';
import api from '../../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalTests: 0,
    students: 0,
    liveTests: 0,
    completedTests: 0,
  });

  const [tests, setTests] = useState([]);
  const [mcqTests, setMcqTests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 9; // Show 9 test cards per page

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [contestResponse, studentStatsResponse, mcqResponse] = await Promise.all([
          api.get('/contests', { withCredentials: true }),
          api.get('/students/stats', { withCredentials: true }),
          api.get('/mcq', { withCredentials: true }),
        ]);

        const codingTests = contestResponse?.data?.contests || [];
        const mcqAssessments = mcqResponse?.data?.assessments || [];

        const totalTests = codingTests.length + mcqAssessments.length;
        const liveTests = [...codingTests, ...mcqAssessments].filter((test) => test.status === 'Live').length;
        const completedTests = [...codingTests, ...mcqAssessments].filter(
          (test) => test.status === 'Completed' || (test.testEndDate && new Date(test.testEndDate) < new Date())
        ).length;

        setStats({
          totalTests,
          students: studentStatsResponse?.data?.total_students || 0,
          liveTests,
          completedTests,
        });

        setTests(codingTests);
        setMcqTests(mcqAssessments);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter tests based on status and search query
  const filteredTests = useMemo(() => {
    const allTests = [...tests, ...mcqTests];
    if (activeFilter === 'All') {
      return allTests.filter((test) =>
        (test.assessmentName || test.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return allTests.filter(
      (test) => test.status === activeFilter && (test.assessmentName || test.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tests, mcqTests, activeFilter, searchQuery]);

  // Paginated tests
  const paginatedTests = useMemo(() => {
    return filteredTests.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [filteredTests, page]);

  // Handle filter change
  const filterTests = useCallback((status) => {
    setActiveFilter(status);
    setPage(1); // Reset to the first page when filter changes
  }, []);

  // Handle modal open/close
  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to the first page when search query changes
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <div className="min-h-screen p-5 bg-white">
      {/* Toast Container */}
      <ToastContainer />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#000975] to-[#000a75] mx-3 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-2">
          <h2 className="text-6xl text-white/95 mb-8 ml-3 font-bold border-white pb-2 font-sans">Overall Stats</h2>
          <Tooltip title="Total Tests">
            <StatsCard icon={<FaChartBar />} title="Total Tests" value={stats.totalTests} />
          </Tooltip>
          <Tooltip title="Number of Students">
            <StatsCard icon={<FaUsers />} title="No of Students" value={stats.students} />
          </Tooltip>
          <Tooltip title="Live Tests">
            <StatsCard icon={<FaClipboardList />} title="Live Tests" value={stats.liveTests} />
          </Tooltip>
          <Tooltip title="Completed Tests">
  <StatsCard icon={<FaCheckCircle />} title="Completed Tests" value={stats.completedTests} />
</Tooltip>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-8xl mx-auto px-4 py-8">
        {/* Tabs, Search, and Create Test Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex text-xl gap-4">
            {['All', 'Live', 'Completed', 'Upcoming'].map((status) => (
              <button
                key={status}
                className={`px-4 rounded-[10000px] py-1 ${
                  activeFilter === status ? 'bg-[#000975] text-white font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => filterTests(status)}
              >
                {status}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000975]"
          />
        </div>

        {/* Tests Section */}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <div className="grid grid-cols-1 p-5 md:grid-cols-3 gap-6">
              {activeFilter === 'All' && <CreateTestCard />}
              {paginatedTests.length > 0 ? (
                paginatedTests.map((test) => (
                  <TestCard
                    key={test._id}
                    contestId={test.contestId || test._id}
                    title={test.assessmentName || test.name || 'Unnamed Test'}
                    type={test.type || 'General'}
                    date={test.endDate ? format(new Date(test.endDate), 'MM/dd/yyyy') : 'Date Unavailable'}
                    category={test.category || 'Uncategorized'}
                    stats={{
                      Assigned: test.assignedCount || 0,
                      Register: test.register || 0,
                      Completed: test.complete || 0,
                    }}
                    status={test.status || 'Upcoming'}
                  />
                ))
              ) : (
                <Typography className="col-span-full text-center">No tests found for the selected filter.</Typography>
              )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6">
              <Pagination
                count={Math.ceil(filteredTests.length / itemsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </div>
          </>
        )}
      </div>

      {/* Modal for Create Test */}
      <Dialog open={isModalOpen} onClose={handleModalClose} maxWidth="sm" fullWidth>
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
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '230px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                  '&:hover': { backgroundColor: '#F5F5F5' },
                }}
                onClick={() => {
                  navigate('/mcq/details');
                  handleModalClose();
                }}
              >
                <img src={mcq} alt="Skill Assessment" style={{ maxWidth: '80px', margin: '0 auto' }} />
                <Typography variant="h6" mt={2}>
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
                  p: 3,
                  textAlign: 'center',
                  height: '230px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                  '&:hover': { backgroundColor: '#F5F5F5' },
                }}
                onClick={() => {
                  navigate('/coding/details');
                  handleModalClose();
                }}
              >
                <img src={code} alt="Code Contest" style={{ maxWidth: '80px', margin: '0 auto' }} />
                <Typography variant="h6" mt={2}>
                  Code Contest
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Challenges to assess programming and problem-solving skills
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mt: 2 }}>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ textAlign: 'center', width: '100%', marginBottom: '16px' }}
          >
            You can select a test type to proceed or close the dialog.
          </Typography>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;
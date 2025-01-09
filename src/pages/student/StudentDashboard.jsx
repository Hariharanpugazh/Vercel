import React, { useState, useEffect } from "react";
import { Tabs, Tab, AppBar, Typography, Box, Container, Grid } from "@mui/material";
import { styled } from "@mui/system";
import TestCard from "./TestCard";
import axios from "axios";
import NoExams from "../../assets/happy.png";
import { Clock, BookOpen, Award } from 'lucide-react';

const StyledTabs = styled(Tabs)({
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  '& .MuiTabs-indicator': {
    backgroundColor: '#2563eb',
    height: '3px',
    borderRadius: '3px',
  },
});

const StyledTab = styled(Tab)({
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: '600',
  color: '#64748b',
  padding: '12px 24px',
  '&.Mui-selected': {
    color: '#2563eb',
  },
  '&:hover': {
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
  },
});

const DashboardHeader = styled(Box)({
  background: 'linear-gradient(135deg, #rgb(139, 135, 251),rgb(95, 121, 214) 100%)',
  borderRadius: '16px',
  padding: '32px',
  marginBottom: '32px',
  color: 'blue',
});


const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openTests, setOpenTests] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [mcqTests, setMcqTests] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://vercel-sandy-xi-12.vercel.app';
  const [studentData, setStudentData] = useState({
    name: "",
    regno: "",
  });

  const fetchStudentData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL }/api/student/profile/`, {
        withCredentials: true,
      });
      const { name, regno, studentId, email } = response.data;
      setStudentData({ name, regno, studentId, email});
      localStorage.setItem("name", name);
      localStorage.setItem("studentEmail", email);

      const [openTestsData, mcqTestsData, codingReportsData, mcqReportsData] = await Promise.all([
        fetchOpenTests(regno),
        fetchMcqTests(regno),
        fetchCodingReports(),
        fetchMcqReports(),
      ]);

      const completedContestIds = new Set(codingReportsData.filter(report => report.status === "Completed").map(report => report.contest_id));
      const completedMcqTestIds = new Set(mcqReportsData.filter(report => report.status === "Completed").map(report => report.contest_id));
      const now = new Date();

      // Handle MCQ tests with "closed" Overall_Status
      const closedMcqTests = mcqTestsData.filter(test => test.Overall_Status === "closed");
      closedMcqTests.forEach(test => {
        if (!completedMcqTestIds.has(test.testId)) {
          completedMcqTestIds.add(test.testId);
        }
      });

      const allCompletedTests = [
        ...openTestsData.filter(test => completedContestIds.has(test.contestId) || now > new Date(test.endtime)),
        ...mcqTestsData.filter(test => 
          completedMcqTestIds.has(test.testId) || 
          now > new Date(test.endtime) ||
          test.Overall_Status === "closed"
        )
      ];

      const completedTestsWithPublishStatus = await Promise.all(
        allCompletedTests.map(async (test) => {
          const response = await axios.get(
            `${API_BASE_URL }/api/student/check-publish-status/${test?.contestId || test?.testId || "unknown"}/`
          );
          return { ...test, ispublish: response.data.ispublish || false };
        })
      );

      const ongoingCodingTests = openTestsData.filter(test => 
        !completedContestIds.has(test.contestId) && 
        now <= new Date(test.endtime)
      );

      const ongoingMcqTests = mcqTestsData.filter(test => 
        !completedMcqTestIds.has(test.testId) && 
        now <= new Date(test.endtime) && 
        test.Overall_Status !== "closed"
      );

      setOpenTests(ongoingCodingTests);
      setMcqTests(ongoingMcqTests);
      setCompletedTests(completedTestsWithPublishStatus);
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };


  const fetchOpenTests = async (regno) => {
    try {
      const response = await axios.get(`${API_BASE_URL }/api/student/tests?regno=${regno}`, {
        withCredentials: true,
      });

      const formattedTests = response.data.map((test) => {
        const { hours, minutes } = test.testConfiguration.duration;
        const duration = (parseInt(hours) * 3600) + (parseInt(minutes) * 60);
        const fullScreenMode = test.testConfiguration.fullScreenMode;
        const faceDetection = test.testConfiguration.faceDetection;

        localStorage.setItem(`testDuration_${test.contestId}`, duration);
        localStorage.setItem(`fullScreenMode_${test.contestId}`, fullScreenMode);
        localStorage.setItem(`faceDetection_${test.contestId}`, faceDetection);

        return {
          contestId: test.contestId,
          name: test.assessmentOverview?.name || "Unknown Test",
          description: test.assessmentOverview?.description || "No description available.",
          starttime: test.assessmentOverview?.registrationStart || "No Time",
          endtime: test.assessmentOverview?.registrationEnd || "No Time",
          problems: parseInt(test.testConfiguration?.questions, 10) || 0,
          assessment_type: "coding",
        };
      });

      return formattedTests;
    } catch (error) {
      console.error("Error fetching open tests:", error);
      return [];
    }
  };

  const fetchMcqTests = async (regno) => {
    try {
      const response = await axios.get(`${API_BASE_URL }/api/student/mcq-tests?regno=${regno}`, {
        withCredentials: true,
      });

      const formattedTests = response.data.map((test) => {
        const durationConfig = test.testConfiguration?.duration;
        const hours = parseInt(durationConfig?.hours || "0", 10);
        const minutes = parseInt(durationConfig?.minutes || "0", 10);
        const duration = (hours * 3600) + (minutes * 60);

        const fullScreenMode = test.testConfiguration?.fullScreenMode || false;
        const faceDetection = test.testConfiguration?.faceDetection || false;

        if (test.testConfiguration) {
          localStorage.setItem(`testDuration_${test._id}`, duration);
          localStorage.setItem(`fullScreenMode_${test._id}`, fullScreenMode);
          localStorage.setItem(`faceDetection_${test._id}`, faceDetection);
        }

        return {
          testId: test._id,
          name: test.assessmentOverview?.name || "Unknown Test",
          description: test.assessmentOverview?.description || "No description available.",
          starttime: test.assessmentOverview?.registrationStart || "No Time",
          endtime: test.assessmentOverview?.registrationEnd || "No Time",
          questions: parseInt(test.testConfiguration?.questions || "0", 10),
          assessment_type: "mcq",
          status: test.status || "Unknown",
          Overall_Status: test.Overall_Status || "open"
        };
      });

      return formattedTests;
    } catch (error) {
      console.error("Error fetching MCQ tests:", error);
      return [];
    }
  };

  // ... [rest of the component remains the same]

  const fetchCodingReports = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL }/api/student/coding-reports/`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching coding reports:", error);
      return [];
    }
  };

  const fetchMcqReports = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL }/api/student/mcq-reports/`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching MCQ reports:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Container maxWidth="xl" className="py-8 px-4 sm:px-8">
        <DashboardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-blue p-4 rounded-full">
              <Award className="h-14 w-14 bg-blue" />
            </div>
            <div>
              <Typography variant="h4" className="font-bold text-sky-600">
                Welcome back, {studentData.name}!
              </Typography>
              <Typography variant="subtitle1" className="text-blue-950 px-1">
                Registration Number: {studentData.regno}
              </Typography>
            </div>
          </div>
        </DashboardHeader>

        <Box className="bg-white rounded-xl shadow-sm p-6">
          <StyledTabs value={activeTab} onChange={handleTabChange}>
            <StyledTab label="Assigned to you" />
            <StyledTab label="Completed/Closed" />
          </StyledTabs>

          <Box className="mt-8">
            {activeTab === 0 && (
              <>
                <Typography variant="h6" className="font-bold text-gray-900 mb-6">
                  Active Assessments
                </Typography>
                <Grid container spacing={4}>
                  {openTests.length > 0 &&
                    openTests.map((test) => (
                      <Grid item xs={12} sm={6} md={4} key={test.contestId}>
                        <TestCard
                          test={test}
                          assessment_type={test.assessment_type}
                          isCompleted={false}
                        />
                      </Grid>
                    ))}
                  {mcqTests.length > 0 &&
                    mcqTests.map((test) => (
                      <Grid item xs={12} sm={6} md={4} key={test.testId}>
                        <TestCard
                          test={test}
                          assessment_type={test.assessment_type}
                          isCompleted={false}
                        />
                      </Grid>
                    ))}
                  {openTests.length === 0 && mcqTests.length === 0 && (
                    <Box className="col-span-3 text-center py-12">
                      <img
                        src={NoExams}
                        alt="No Exams"
                        className="mx-auto mb-6 w-64 h-64"
                      />
                      <Typography variant="h6" className="font-medium text-gray-900">
                        Enjoy your free time!
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </>
            )}
            {activeTab === 1 && (
              <>
                <Typography variant="h6" className="font-bold text-gray-900 mb-6">
                  Completed Assessments
                </Typography>
                <Grid container spacing={4}>
                  {completedTests.length > 0 ? (
                    completedTests.map((test) => (
                      <Grid item xs={12} sm={6} md={4} key={test.contestId || test.testId}>
                        <TestCard
                          test={test}
                          assessment_type={test.assessment_type}
                          isCompleted={true}
                          studentId={studentData.studentId}
                          isPublished={test.ispublish}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Box className="col-span-3 text-center py-12">
                      <img
                        src={NoExams}
                        alt="No Exams"
                        className="mx-auto mb-6 w-64 h-64"
                      />
                      <Typography variant="h6" className="font-medium text-gray-900">
                        No completed assessments yet
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </>
            )}
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default StudentDashboard;

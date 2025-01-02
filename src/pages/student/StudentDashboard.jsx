import React, { useState, useEffect } from "react";
import { Tabs, Tab, AppBar, Typography, Box, Container, Grid } from "@mui/material";
import { styled } from "@mui/system";
import TestCard from "./TestCard";
import axios from "axios";
import NoExams from "../../assets/happy.png";

const StyledTabs = styled(Tabs)({
  "& .MuiTabs-indicator": {
    backgroundColor: "#D97706",
  },
});

const StyledTab = styled(Tab)({
  textTransform: "none",
  fontSize: "16px",
  fontWeight: "bold",
  color: "#1E293B",
  "&.Mui-selected": {
    color: "#D97706",
  },
});

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openTests, setOpenTests] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [mcqTests, setMcqTests] = useState([]);
  const [studentData, setStudentData] = useState({
    name: "",
    regno: "",
  });

  const fetchStudentData = async () => {
    try {
      const response = await axios.get("https://vercel-1bge.onrender.com/api/student/profile/", {
        withCredentials: true,
      });
      const { name, regno, studentId } = response.data;
      setStudentData({ name, regno, studentId });

      const [openTestsData, mcqTestsData, codingReportsData, mcqReportsData] = await Promise.all([
        fetchOpenTests(regno),
        fetchMcqTests(regno),
        fetchCodingReports(),
        fetchMcqReports(),
      ]);

      const completedContestIds = new Set(codingReportsData.filter(report => report.status === "Completed").map(report => report.contest_id));
      const completedMcqTestIds = new Set(mcqReportsData.filter(report => report.status === "Completed").map(report => report.contest_id));
      const now = new Date();

      const allCompletedTests = [
        ...openTestsData.filter(test => completedContestIds.has(test.contestId) || now > new Date(test.endtime)),
        ...mcqTestsData.filter(test => completedMcqTestIds.has(test.testId) || now > new Date(test.endtime))
      ];

      const completedTestsWithPublishStatus = await Promise.all(
        allCompletedTests.map(async (test) => {
          const response = await axios.get(
            `https://vercel-1bge.onrender.com/api/student/check-publish-status/${test?.contestId || test?.testId || "unknown"}/`
          );
          return { ...test, ispublish: response.data.ispublish || false };
        })
      );
      const ongoingCodingTests = openTestsData.filter(test => !completedContestIds.has(test.contestId) && now <= new Date(test.endtime));
      const ongoingMcqTests = mcqTestsData.filter(test => !completedMcqTestIds.has(test.testId) && now <= new Date(test.endtime));

      setOpenTests(ongoingCodingTests);
      setMcqTests(ongoingMcqTests);
      setCompletedTests(completedTestsWithPublishStatus);
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  const fetchOpenTests = async (regno) => {
    try {
      const response = await axios.get(`https://vercel-1bge.onrender.com/api/student/tests?regno=${regno}`, {
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
          problems: parseInt(test.testConfiguration?.questions, 10) || 0, // Parse questions as a number
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
      const response = await axios.get(`https://vercel-1bge.onrender.com/api/student/mcq-tests?regno=${regno}`, {
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
          questions: parseInt(test.testConfiguration?.questions || "0", 10), // Parse questions as a number
          assessment_type: "mcq",
          status: test.status || "Unknown", // Add status field
        };
      });
  
      return formattedTests;
    } catch (error) {
      console.error("Error fetching MCQ tests:", error);
      return [];
    }
  };
  
  const fetchCodingReports = async () => {
    try {
      const response = await axios.get(`https://vercel-1bge.onrender.com/api/student/coding-reports/`, {
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
      const response = await axios.get(`https://vercel-1bge.onrender.com/api/student/mcq-reports/`, {
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <Container maxWidth="8xl">
        <AppBar position="static" color="transparent" elevation={0} className="mb-8">
          <Typography variant="h4" className="font-bold text-gray-900">
            Hi! {studentData.name}
          </Typography>
          <Typography variant="subtitle1" className="text-gray-600">
            Registration Number: {studentData.regno}
          </Typography>
        </AppBar>

        <Box className="bg-white p-6">
          <StyledTabs value={activeTab} onChange={handleTabChange}>
            <StyledTab label="Assigned to you" />
            <StyledTab label="Completed/Closed" />
          </StyledTabs>

          <Box className="mt-8">
            {activeTab === 0 && (
              <>
                <Typography variant="h6" className="font-bold text-gray-900 mb-4">
                  Assessments
                </Typography>
                <Grid container spacing={3}>
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
                    <Box className="text-center" gridColumn="span 3">
                      <img
                        src={NoExams}
                        alt="No Exams"
                        className="mx-auto mb-4"
                        style={{ width: "300px", height: "300px" }}
                      />
                      <Typography variant="h6" className="font-medium text-gray-900">
                        Any day is a good day when <br /> there are no exams!
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </>
            )}
            {activeTab === 1 && (
              <>
                <Typography variant="h6" className="font-bold text-gray-900 mb-4">
                  Completed Assessments
                </Typography>
                <Grid container spacing={3}>
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
                    <Box className="text-center" gridColumn="span 3">
                      <img
                        src={NoExams}
                        alt="No Exams"
                        className="mx-auto mb-4"
                        style={{ width: "300px", height: "300px" }}
                      />
                      <Typography variant="h6" className="font-medium text-gray-900">
                        Any day is a good day when <br /> there are no exams!
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

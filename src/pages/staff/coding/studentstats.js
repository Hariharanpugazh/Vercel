import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart } from '@mui/x-charts/PieChart';
import { BookOpen, CheckCircle, Clock, Trophy } from 'lucide-react';
import { useParams } from 'react-router-dom';

const EnhancedStudentDashboard = () => {
  const { regno } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  // State to manage expanded/collapsed state for assessments and problems
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [expandedProblems, setExpandedProblems] = useState({});

  // State to manage pagination
  const [currentPage, setCurrentPage] = useState(1);
  const assessmentsPerPage = 3;

  const toggleDescription = (index) => {
    setExpandedDescriptions((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const toggleProblems = (index) => {
    setExpandedProblems((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const codingResponse = await axios.get(
          `http://127.0.0.1:8000/staff/studentstats/${regno}/`
        );

        const mcqResponse = await axios.get(
          `http://127.0.0.1:8000/staff/mcq_stats/${regno}/`
        );

        if (codingResponse.status === 200 && mcqResponse.status === 200) {
          setStudentData({
            coding: codingResponse.data,
            mcq: mcqResponse.data
          });
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [regno]);

  if (loading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  if (!studentData) {
    return (
      <div className="text-center text-xl text-red-500">
        Error: Unable to load student data.
      </div>
    );
  }

  const { coding, mcq } = studentData;

  const { student, performance: codingPerformance, assessments: codingAssessments } = coding || {};
  const { performance: mcqPerformance, assessments: mcqAssessments } = mcq || {};

  // Add checks to ensure data is available before performing calculations
  const totalTests = (codingPerformance?.total_tests || 0) + (mcqPerformance?.total_tests || 0);
  const completedTests = (codingPerformance?.completed_tests || 0) + (mcqPerformance?.completed_tests || 0);
  const inProgressTests = (codingPerformance?.in_progress_tests || 0) + (mcqPerformance?.in_progress_tests || 0);

  const allAssessments = [...(codingAssessments || []), ...(mcqAssessments || [])];

  const completionData = [
    { id: 'Completed', value: completedTests, label: 'Completed' },
    { id: 'In Progress', value: inProgressTests, label: 'In Progress' },
  ];

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className={`bg-white rounded-lg shadow-lg p-6 transition duration-300 ease-in-out transform hover:scale-105 ${bgColor}`}>
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-700">{label}</h3>
          <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  );

  // Get current assessments
  const indexOfLastAssessment = currentPage * assessmentsPerPage;
  const indexOfFirstAssessment = indexOfLastAssessment - assessmentsPerPage;
  const currentAssessments = allAssessments.slice(indexOfFirstAssessment, indexOfLastAssessment);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Student Overview */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{student?.name}'s Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
          <p className="text-1xl font-bold text-gray-600">{student?.year} Year </p> {student?.dept} Department, {student?.collegename}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            label="Total Tests"
            value={totalTests}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={completedTests}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            icon={Clock}
            label="In Progress"
            value={inProgressTests}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
          />
          <StatCard
            icon={Trophy}
            label="Average Score"
            value={`${codingPerformance?.average_score || 0}%`}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
        </div>

        {/* Completion Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Completion Status</h2>
          <div className="h-64">
            <PieChart
              series={[
                {
                  data: completionData,
                  highlightScope: { fade: 'global', highlight: 'item' },
                  faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                },
              ]}
              height={200}
            />
          </div>
        </div>

        {/* Assessments Section */}
        <div className="mt-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6">Assessments</h2>
          {currentAssessments.length === 0 ? (
            <p className="text-gray-500 text-lg">No assessments available at the moment.</p>
          ) : (
            <div className="space-y-6">
              {currentAssessments.map((assessment, index) => {
                const MAX_LENGTH = 200;
                const isExpanded = expandedDescriptions[index];
                const showMoreButton = assessment.description.length > MAX_LENGTH;
                const displayedDescription = isExpanded
                  ? assessment.description
                  : `${assessment.description.substring(0, MAX_LENGTH)}...`;

                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-lg p-6 transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    {/* Assessment Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{assessment.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          <strong>Registration Start:</strong>{' '}
                          {new Date(assessment.registrationStart).toLocaleString()}
                          <br />
                          <strong>Registration End:</strong>{' '}
                          {new Date(assessment.registrationEnd).toLocaleString()}
                        </p>
                      </div>
                      <p
                        onClick={() => toggleProblems(index)}
                        className="text-blue-600 text-md font-medium cursor-pointer"
                      >
                        {assessment.contestStatus === 'Yet to Start' ? (
                          <span className="text-violet-600 font-bold">Yet to Start</span>
                        ) : assessment.contestStatus === 'Pending' ? (
                          <span className="text-yellow-600 font-bold">Pending</span>
                        ) : (
                          `Problems: ${assessment.problems.length} ${expandedProblems[index] ? '▲' : '▼'}`
                        )}
                      </p>
                    </div>

                    {/* Description */}
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-1">Description</h4>
                      <p className="text-gray-600 leading-relaxed text-md">
                        {displayedDescription}
                        {showMoreButton && (
                          <button
                            onClick={() => toggleDescription(index)}
                            className="text-blue-600 font-medium ml-2"
                          >
                            {isExpanded ? 'Show Less' : 'More'}
                          </button>
                        )}
                      </p>
                    </div>

                    {/* Problems List */}
                    {expandedProblems[index] && (
                      <ul className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
                        {assessment.problems.map((problem, i) => {
                          const problemStatusClass =
                            problem.result === 'Correct'
                              ? 'text-green-600' // Correct result - Green color
                              : 'text-red-600'; // Wrong result - Red color

                          return (
                            <li
                              key={i}
                              className={`p-4 rounded-lg shadow-sm bg-white flex justify-between items-start`}
                            >
                              <div>
                                <strong className="text-gray-900 text-md">{problem.title}</strong>{' '}
                                <span className="text-sm text-gray-500">({problem.level})</span>
                                {problem.problem_statement && (
                                  <p className="text-gray-600 text-sm mt-1 italic">
                                    {problem.problem_statement}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className={`font-semibold ${problemStatusClass}`}>{problem.result}</p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            {Array.from({ length: Math.ceil(allAssessments.length / assessmentsPerPage) }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStudentDashboard;
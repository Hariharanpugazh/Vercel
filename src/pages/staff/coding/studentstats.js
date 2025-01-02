import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { BookOpen, CheckCircle, Clock, Trophy } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useParams } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const EnhancedStudentDashboard = () => {
  const { regno } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  // State to manage expanded/collapsed state for assessments and problems
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [expandedProblems, setExpandedProblems] = useState({});

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
        const response = await axios.get(
          `http://127.0.0.1:8000/staff/studentstats/${regno}/`
        );
        if (response.status === 200) {
          setStudentData(response.data);
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

  const { student, performance, assessments } = studentData;
  const { total_tests, completed_tests, in_progress_tests, average_score } = performance;

  const completionData = {
    labels: ['Completed', 'In Progress', 'Remaining'],
    datasets: [
      {
        data: [
          completed_tests,
          in_progress_tests,
          total_tests - (completed_tests + in_progress_tests),
        ],
        backgroundColor: ['#22C55E', '#EAB308', '#E5E7EB'],
        borderWidth: 0,
      },
    ],
  };

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-medium text-gray-500">{label}</h3>
        <p className={`mt-1 text-xl font-semibold ${color}`}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      {/* Student Overview */}
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{student.name}'s Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          {student.dept} Department, {student.collegename}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={BookOpen}
          label="Total Tests"
          value={total_tests}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={completed_tests}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={in_progress_tests}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatCard
          icon={Trophy}
          label="Average Score"
          value={`${average_score}%`}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>

      {/* Completion Status */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Completion Status</h2>
        <div className="h-[240px]">
          <Doughnut data={completionData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Assessments Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Assessments</h2>
        {assessments.length === 0 ? (
          <p className="text-gray-500 text-lg">No assessments available at the moment.</p>
        ) : (
          <div className="space-y-6">
            {assessments.map((assessment, index) => {
              const MAX_LENGTH = 200;
              const isExpanded = expandedDescriptions[index];
              const showMoreButton = assessment.description.length > MAX_LENGTH;
              const displayedDescription = isExpanded
                ? assessment.description
                : `${assessment.description.substring(0, MAX_LENGTH)}...`;

              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 ease-in-out"
                >
                  {/* Assessment Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{assessment.name}</h3>
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
                              <strong className="text-gray-800 text-md">{problem.title}</strong>{' '}
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
      </div>
    </div>
  );
};

export default EnhancedStudentDashboard;

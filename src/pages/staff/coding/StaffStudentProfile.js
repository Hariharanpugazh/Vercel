import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Loader from '../../../layout/Loader';

const App = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Fetch student data (replace with your API endpoint)
    fetch("http://127.0.0.1:8000/studentprofile/")
      .then((response) => response.json())
      .then((data) => {
        setStudents(data.students);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, []);

  // Get current students for pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const viewStudent = (student) => {
    setSelectedStudent(student);
  };

  const closeDetails = () => {
    setSelectedStudent(null);
  };

  // New function to handle redirecting to student stats
  const viewStudentStats = (regno) => {
    navigate(`/studentstats/${regno}`); // Navigate to student stats page
  };

  const styles = {
    container: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      margin: "20px auto",
      maxWidth: "90%",
    },
    header: {
      textAlign: "center",
      fontSize: "2rem",
      marginBottom: "20px",
      color: "#333",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "20px",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    },
    tableHeader: {
      backgroundColor: "#4CAF50",
      color: "white",
      padding: "15px",
      textAlign: "center",
      borderBottom: "2px solid #ddd",
      fontSize: "1.1rem",
    },
    tableCell: {
      padding: "12px 15px",
      textAlign: "center",
      borderBottom: "1px solid #ddd",
    },
    row: {
      backgroundColor: "#f9f9f9",
    },
    pagination: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "20px",
      gap: "10px",
    },
    pageButton: {
      padding: "10px 15px",
      backgroundColor: "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
    pageInfo: {
      fontSize: "1rem",
      fontWeight: "bold",
    },
    viewButton: {
      backgroundColor: "#4CAF50",
      color: "white",
      padding: "5px 15px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      textAlign: "center",
    },
    detailView: {
      border: "1px solid #ddd",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      marginTop: "20px",
    },
    closeButton: {
      padding: "10px 15px",
      backgroundColor: "#f44336",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      marginTop: "20px",
    },
  };

  return (
    <div style={styles.container}>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <h1 style={styles.header}>Student Profile Management</h1>

          {selectedStudent ? (
            <div style={styles.detailView}>
              <h2>Student Details</h2>
              <p>
                <strong>Name:</strong> {selectedStudent.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedStudent.email}
              </p>
              <p>
                <strong>College:</strong> {selectedStudent.collegename}
              </p>
              <p>
                <strong>Department:</strong> {selectedStudent.dept}
              </p>
              <p>
                <strong>Register Number:</strong> {selectedStudent.regno}
              </p>
              <button style={styles.closeButton} onClick={closeDetails}>
                Close
              </button>
            </div>
          ) : (
            <>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Name</th>
                    <th style={styles.tableHeader}>Department</th>
                    <th style={styles.tableHeader}>College</th>
                    <th style={styles.tableHeader}>Register Number</th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map((student, index) => (
                    <tr
                      key={index}
                      style={styles.row}
                    >
                      <td style={styles.tableCell}>{student.name}</td>
                      <td style={styles.tableCell}>{student.dept}</td>
                      <td style={styles.tableCell}>{student.collegename}</td>
                      <td style={styles.tableCell}>{student.regno}</td>
                      <td style={styles.tableCell}>
                        <button
                          style={styles.viewButton}
                          onClick={() => viewStudentStats(student.regno)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={styles.pagination}>
                {[...Array(Math.ceil(students.length / studentsPerPage)).keys()].map(
                  (number) => (
                    <button
                      key={number}
                      style={styles.pageButton}
                      onClick={() => paginate(number + 1)}
                    >
                      {number + 1}
                    </button>
                  )
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default App;
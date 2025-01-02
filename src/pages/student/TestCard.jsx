import React, { useState } from "react";
import { Card, CardContent, Typography, Box, Button, Avatar } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import codingIcon from "../../assets/coding.png"; // Replace with the actual path
import aptitudeIcon from "../../assets/Skillimage.png"; // Replace with the actual path

const TestCard = ({ test, assessment_type, isCompleted, studentId, isPublished }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleCardClick = () => {
    if (!isCompleted) {
      navigate(`/testinstructions/${test?.contestId || test?.testId || "unknown"}`, {
        state: { test, assessment_type },
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const icon = assessment_type === "coding" ? codingIcon : aptitudeIcon;
  const statusColor = isCompleted ? "green" : "red";
  const statusText = isCompleted ? "Completed" : "Ongoing";
  const buttonText = isCompleted ? "View Test" : "Take Test";

  return (
    <Card
      variant="outlined"
      style={{
        height: "200px",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        marginBottom: "16px",
        cursor: isCompleted ? "not-allowed" : "pointer",
        backgroundColor: "white",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.02)",
        },
      }}
      onClick={handleCardClick}
    >
      <CardContent style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
        <Box>
          <Box display="flex" alignItems="center" mb={1}>
            <Avatar src={icon} alt={assessment_type} style={{ marginRight: "16px", backgroundColor: "#f0f0f0" }} />
            <Box flexGrow={1}>
              <Typography variant="h5" style={{ fontWeight: "bold", color: "#1E293B" }}>
                {test?.name || "Unknown Test"}
              </Typography>
              <Typography variant="body2" style={{ color: "#6B7280" }}>
                {test?.assessment_type?.toUpperCase() || "Unknown Type"}
              </Typography>
            </Box>
            <Box>
              
              <Typography variant="body2" style={{ color: statusColor }}>
                {statusText}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Typography variant="body2" style={{ color: "#6B7280" }}>
              Take this test with proper preparation.... All The Best !
            </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Box>
            <Typography variant="body2" style={{ color: "#374151" }}>
              <strong>Start Time:</strong> {formatDate(test?.starttime)}
            </Typography>
            <Typography variant="body2" style={{ color: "#374151" }}>
              <strong>End Time:</strong> {formatDate(test?.endtime)}
            </Typography>
          </Box>
          <Box>
            {isCompleted && isPublished && (
              <Link to={`/result/${test?.contestId || test?.testId || "unknown"}/${studentId}`} style={{ textDecoration: "none" }}>
                <Button variant="contained" color="primary">
                  View Result
                </Button>
              </Link>
            )}
            {!isCompleted && (
              <Button variant="contained" color="primary" onClick={handleCardClick}>
                {buttonText}
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TestCard;

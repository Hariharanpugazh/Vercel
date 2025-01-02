import React from "react";
import { Box, Grid, Typography, Card, CardContent, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CodeIcon from "@mui/icons-material/Code";
import QuizIcon from "@mui/icons-material/Quiz";

const Library = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ padding: "2rem", minHeight: "100vh", bgcolor: "#F8FAFC" }}>
      <Typography
        variant="h4"
        align="center"
        sx={{ fontWeight: "bold", mb: 4, color: "#00296B" }}
      >
        Library
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {/* Coding Library Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
                height:'280px',
              borderRadius: "16px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              "&:hover": { transform: "scale(1.02)", transition: "0.3s" },
            }}
          >
            <CardContent
              sx={{
                textAlign: "center",
                padding: "2rem",
              }}
            >
              <CodeIcon sx={{ fontSize: 64, color: "#FDC500" }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mt: 2, color: "#00296B" }}
              >
                Coding Library
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 1, mb: 2 }}
              >
                Explore and access coding challenges, solutions, and tutorials.
              </Typography>
              <button
                variant="contained"
                onClick={() => navigate("/library/coding")}
                className="px-4 py-2 bg-[#00296B] text-white rounded-lg hover:bg-yellow-500 transition-colors"

              >
                Go to Coding Library
              </button>
            </CardContent>
          </Card>
        </Grid>

        {/* MCQ Library Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
                height:'280px',
              borderRadius: "16px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              "&:hover": { transform: "scale(1.02)", transition: "0.3s" },
            }}
          >
            <CardContent
              sx={{
                textAlign: "center",
                padding: "2rem",
              }}
            >
              <QuizIcon sx={{ fontSize: 64, color: "#FDC500" }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mt: 2, color: "#00296B" }}
              >
                MCQ Library
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 1, mb: 2 }}
              >
                Access multiple-choice questions for practice and assessment.
              </Typography>
              <button
                variant="contained"
                onClick={() => navigate("/library/mcq")}
                
                className="px-4 py-2 bg-[#00296B] text-white rounded-lg hover:bg-blue-900 transition-colors"

              >
                Go to MCQ Library
              </button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Library;

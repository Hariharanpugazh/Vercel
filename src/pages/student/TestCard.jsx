import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  useTheme,
  useMediaQuery,
  styled
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import codingIcon from "../../assets/coding.png";
import aptitudeIcon from "../../assets/Skillimage.png";

// Styled components for better organization and reusability
const StyledCard = styled(Card)(({ theme, iscompleted }) => ({
  width: '100%',
  height: 'auto',
  minHeight: '200px',
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(2),
  cursor: iscompleted === 'true' ? 'not-allowed' : 'pointer',
  backgroundColor: theme.palette.background.paper,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
  },
  [theme.breakpoints.down('sm')]: {
    minHeight: '250px',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(6),
  height: theme.spacing(6),
  marginRight: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  [theme.breakpoints.down('sm')]: {
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
}));

const TestCard = ({
  test = {},
  assessment_type = 'unknown',
  isCompleted = false,
  studentId = '',
  isPublished = false,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const icon = useMemo(() =>
    assessment_type === 'coding' ? codingIcon : aptitudeIcon,
  [assessment_type]);

  const statusConfig = useMemo(() => ({
    color: isCompleted ? theme.palette.success.main : theme.palette.error.main,
    text: isCompleted ? 'Completed' : 'Ongoing',
    buttonText: isCompleted ? 'View Test' : 'Take Test',
  }), [isCompleted]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const handleCardClick = (e) => {
    e.preventDefault();
    if (!isCompleted) {
      const testId = test?.contestId || test?.testId || 'unknown';
      navigate(`/testinstructions/${testId}`, {
        state: { test, assessment_type },
      });
    }
  };

  const registrationStartTime = new Date(test?.starttime);
  const currentTime = new Date();
  const isRegistrationStarted = currentTime >= registrationStartTime;

  return (
    <StyledCard
      variant="outlined"
      iscompleted={isCompleted.toString()}
      onClick={isRegistrationStarted && !isCompleted ? handleCardClick : undefined}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          height: '100%',
          padding: isMobile ? theme.spacing(2) : theme.spacing(3),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: 2,
          }}
        >
          <StyledAvatar src={icon} alt={assessment_type} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 0.5,
                fontSize: isMobile ? '1.2rem' : '1.5rem',
              }}
            >
              {test?.name || 'Unknown Test'}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, fontSize: isMobile ? '0.875rem' : '1rem' }}
            >
              {assessment_type?.toUpperCase() || 'Unknown Type'}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: statusConfig.color,
              fontWeight: 500,
              fontSize: isMobile ? '0.875rem' : '1rem',
            }}
          >
            {isRegistrationStarted ? statusConfig.text : 'Not Yet Started'}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontStyle: 'italic',
            fontSize: isMobile ? '0.875rem' : '1rem',
          }}
        >
          Take this test with proper preparation. All The Best!
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: 2,
            mt: 'auto',
          }}
        >
          <Box>
            {['starttime', 'endtime'].map((timeType) => (
              <Typography
                key={timeType}
                variant="body2"
                sx={{
                  color: theme.palette.text.primary,
                  mb: 0.5,
                  fontSize: isMobile ? '0.875rem' : '1rem',
                }}
              >
                <strong>{timeType === 'starttime' ? 'Start' : 'End'} Time:</strong>{' '}
                {formatDate(test?.[timeType])}
              </Typography>
            ))}
          </Box>

          <Box>
            {isCompleted && isPublished ? (
              <Link
                to={`/result/${test?.contestId || test?.testId || 'unknown'}/${studentId}`}
                style={{ textDecoration: 'none' }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth={isMobile}
                  sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
                >
                  View Result
                </Button>
              </Link>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={isRegistrationStarted ? handleCardClick : undefined}
                disabled={!isRegistrationStarted}
                fullWidth={isMobile}
                sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}
              >
                {isRegistrationStarted ? statusConfig.buttonText : 'Yet to Start'}
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
};


TestCard.propTypes = {
  test: PropTypes.shape({
    name: PropTypes.string,
    contestId: PropTypes.string,
    testId: PropTypes.string,
    starttime: PropTypes.string,
    endtime: PropTypes.string,
    assessment_type: PropTypes.string,
  }),
  assessment_type: PropTypes.string,
  isCompleted: PropTypes.bool,
  studentId: PropTypes.string,
  isPublished: PropTypes.bool,
};

export default React.memo(TestCard);

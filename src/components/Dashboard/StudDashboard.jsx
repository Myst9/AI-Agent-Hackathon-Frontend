import React, { useContext } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Chip,
  Box,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../contexts/AppContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { assignments, classes, isLoading } = useContext(AppContext);

  const getClassName = (classId) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : 'Unknown Class';
  };

  const handleViewAssignment = (assignmentId) => {
    navigate(`/answer/${assignmentId}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Student Dashboard</Typography>
      </Box>

      <div className="dashboard-grid">
        {assignments.length === 0 ? (
          <Typography variant="body1" sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 5 }}>
            No assignments available.
          </Typography>
        ) : (
          assignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="dashboard-card"
              onClick={() => handleViewAssignment(assignment.id)}
              sx={{ cursor: 'pointer' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" component="div" noWrap>
                    {assignment.title}
                  </Typography>
                  <Chip
                    label={assignment.status === 'posted' ? 'Completed' : 'Pending'}
                    color={assignment.status === 'posted' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>

                <Typography color="text.secondary" gutterBottom>
                  {getClassName(assignment.class_id)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {assignment.status === 'posted'
                    ? `Completed on: ${new Date(assignment.postedAt).toLocaleDateString()}`
                    : `Last updated: ${new Date(assignment.updatedAt).toLocaleDateString()}`}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;

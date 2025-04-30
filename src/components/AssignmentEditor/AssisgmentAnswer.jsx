import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import AppContext from '../../contexts/AppContext';

const AnswerAssignment = () => {
  const { id } = useParams();
  const { assignments, classes } = useContext(AppContext);

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = assignments.find((a) => a.id === id || a.id === parseInt(id));
    if (found) {
      setAssignment(found);
    }
    setLoading(false);
  }, [assignments, id]);

  const getClassName = (classId) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : 'Unknown Class';
  };

  const handleSubmit = () => {
    // Placeholder: implement real submission logic here
    alert('Assignment submitted!');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!assignment) {
    return (
      <Typography variant="h6" sx={{ textAlign: 'center', mt: 5 }}>
        Assignment not found.
      </Typography>
    );
  }

  return (
    <Card sx={{ maxWidth: 800, margin: '0 auto', mt: 4, p: 2 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>{assignment.title}</Typography>

        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Class: {getClassName(assignment.class_id)}
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Deadline: {assignment.dueDate
            ? new Date(assignment.dueDate).toLocaleDateString()
            : 'No deadline set'}
        </Typography>

        <Box sx={{ my: 3 }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {assignment.content}
          </Typography>
        </Box>

        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnswerAssignment;

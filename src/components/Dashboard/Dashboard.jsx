import React, { useContext } from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip, 
  Box, 
  Fab, 
  CircularProgress 
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../contexts/AppContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { assignments, classes, isLoading, setCurrentAssignment } = useContext(AppContext);
  
  const getClassName = (classId) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? `${cls.name} (${cls.period})` : 'No Class Assigned'; // Provide a default display
  };
  
  const handleEditAssignment = (assignment) => {
    // Setting currentAssignment in context before navigating ensures the editor
    // is initialized with the correct data immediately.
    setCurrentAssignment(assignment);
    navigate(`/edit/${assignment.id}`);
  };
  
  const handleCreateNew = () => {
    // Reset currentAssignment to a clean slate for a new assignment
    setCurrentAssignment({
      id: null,
      title: '',
      content: '',
      class_id: '', // Ensure class_id is reset
      status: 'draft',
      createdAt: null,
      updatedAt: null,
      postedAt: null
    });
    navigate('/create');
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
        <Typography variant="h4">
          Your Assignments
        </Typography>
        <Fab 
          color="primary" 
          aria-label="add" 
          onClick={handleCreateNew}
        >
          <AddIcon />
        </Fab>
      </Box>
      
      <div className="dashboard-grid">
        {assignments.length === 0 ? (
          <Typography variant="body1" sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 5 }}>
            No assignments yet. Create your first assignment using the AI!
          </Typography>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id} className="dashboard-card">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" component="div" noWrap sx={{ mr: 1 }}> {/* Added mr */}
                    {assignment.title || 'Untitled Assignment'}
                  </Typography>
                  <Chip 
                    label={assignment.status === 'posted' ? 'Posted' : 'Draft'} 
                    color={assignment.status === 'posted' ? 'success' : 'default'}
                    size="small" 
                  />
                </Box>
                
                <Typography color="text.secondary" gutterBottom>
                  {getClassName(assignment.class_id)}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {assignment.status === 'posted' && assignment.postedAt
                    ? `Posted: ${new Date(assignment.postedAt).toLocaleDateString()}`
                    : assignment.updatedAt 
                         ? `Last modified: ${new Date(assignment.updatedAt).toLocaleDateString()}`
                         : `Created: ${assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : 'N/A'}`
                  }
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={() => handleEditAssignment(assignment)}
                >
                  Edit
                </Button>
              </CardActions>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import AppContext from '../../contexts/AppContext';

const AssignmentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    assignments,
    classes,
    currentAssignment,
    updateCurrentAssignment,
    setCurrentAssignment
  } = useContext(AppContext);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (id) {
      const assignmentToEdit = assignments.find(a => a.id === id);
      if (assignmentToEdit) {
        setCurrentAssignment(assignmentToEdit);
      } else {
        navigate('/create');
      }
    }
  }, [id, assignments, setCurrentAssignment, navigate]);

  const handleTitleChange = (e) => {
    updateCurrentAssignment({ title: e.target.value });
  };

  const handleContentChange = (e) => {
    updateCurrentAssignment({ content: e.target.value });
  };

  const handleClassChange = (e) => {
    updateCurrentAssignment({ class_id: e.target.value });
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Box className="assignment-editor-container" sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        {id ? 'Edit Assignment' : 'Create New Assignment'}
      </Typography>

      <TextField
        label="Assignment Title"
        variant="outlined"
        fullWidth
        value={currentAssignment.title}
        onChange={handleTitleChange}
        margin="normal"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel id="class-select-label">Class</InputLabel>
        <Select
          labelId="class-select-label"
          value={currentAssignment.class_id}
          onChange={handleClassChange}
          label="Class"
        >
          {classes.map((cls) => (
            <MenuItem key={cls.id} value={cls.id}>
              {cls.name} ({cls.period})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
        <Tabs value={tab} onChange={handleTabChange} aria-label="editor tabs">
          <Tab label="Edit" />
          <Tab label="Preview" />
        </Tabs>
      </Box>

      <Box sx={{ py: 2 }}>
        {tab === 0 ? (
          <div
            contentEditable
            style={{ minHeight: '200px', border: '1px solid #ccc', padding: '10px' }}
            onInput={(e) => handleContentChange(e)}
            dangerouslySetInnerHTML={{ __html: currentAssignment.content }}
          />
        ) : (
          <Paper elevation={0} className="assignment-preview" sx={{ p: 2 }}>
            <div dangerouslySetInnerHTML={{ __html: currentAssignment.content }} />
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default AssignmentEditor;

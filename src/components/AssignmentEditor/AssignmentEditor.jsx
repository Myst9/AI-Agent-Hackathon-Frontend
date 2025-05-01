// src/components/AssignmentEditor/AssignmentEditor.jsx
import React, { useContext, useEffect, useState, useRef } from 'react'; // Import useRef
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
  Tab,
  CircularProgress // Add CircularProgress for loading state
} from '@mui/material';

// Import marked for parsing Markdown
import { marked } from 'marked'; 
// Import DOMPurify for sanitizing HTML before rendering
import DOMPurify from 'dompurify';

// Remove ReactMarkdown import as we are replacing it
// import ReactMarkdown from 'react-markdown'; 

import AppContext from '../../contexts/AppContext';

const AssignmentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    assignments, // We still need the full list to find an assignment by ID on direct navigation
    classes,
    currentAssignment, // Use currentAssignment which is updated by Chat/Context
    updateCurrentAssignment, // Use the context function to update the main assignment object
    setCurrentAssignment, // Use the context function to set the entire assignment object
    isLoading // Use global loading state from context
  } = useContext(AppContext);

  const [tab, setTab] = useState(0);
  const [editorLoading, setEditorLoading] = useState(true); // Local loading for editor data fetch
  
  // Local state to manage the content in the contentEditable div
  // This helps decouple the DOM input from the main context state immediately
  const [localContent, setLocalContent] = useState('');
  const editorRef = useRef(null); // Ref to the contentEditable div

  // Effect to initialize localContent when the assignment from context changes
  useEffect(() => {
    setEditorLoading(true); // Assume loading starts when ID or assignments change

    if (id) {
      // Try to find the assignment in the context's assignments list
      // The assignments list is populated on initial load and updated on save/post.
      const assignmentToEdit = assignments.find(a => a.id === id);
      if (assignmentToEdit) {
        // Set the main context assignment
        setCurrentAssignment(assignmentToEdit);
        // Also set the local state content for the editor
        // Use nullish coalescing for safety
        setLocalContent(assignmentToEdit.content ?? ''); 
        setEditorLoading(false);
      } else {
        // If not found (e.g., invalid ID or data not loaded yet), navigate away
        console.warn(`Assignment with ID ${id} not found in context. Navigating to create.`);
        navigate('/create'); // Redirect to create
        setEditorLoading(false);
      }
    } else {
      // On /create route, ensure currentAssignment is a clean slate in context
      // Only reset if it's not already clean
      if (currentAssignment?.id !== null || currentAssignment?.title !== '' || currentAssignment?.content !== '') {
        setCurrentAssignment({
          id: null, title: '', content: '', class_id: '', status: 'draft',
          createdAt: null, updatedAt: null, postedAt: null
        });
      }
      // Ensure local content is also cleared for a new assignment
      setLocalContent('');
      setEditorLoading(false);
    }
    // This effect should re-run if the ID changes (navigating to edit a different assignment)
    // or if the assignments list updates (e.g., AI generates and saves a new one)
    // Added currentAssignment to dependencies to resync local state if context state is changed externally
  }, [id, assignments, setCurrentAssignment, navigate, currentAssignment]);

  // Effect to sync localContent changes back to the context's currentAssignment content
  // This runs whenever the user types in the editor (via handleInput -> setLocalContent)
  useEffect(() => {
      // Only update context if localContent has changed from the current context content
      // and if currentAssignment is loaded (not null or initial state)
      // Added a check to prevent infinite loops if context state updates trigger local state sync triggering context update etc.
      if (currentAssignment && currentAssignment.content !== localContent) {
          updateCurrentAssignment({ content: localContent });
      }
      // Depend on localContent and the update function from context
  }, [localContent, updateCurrentAssignment, currentAssignment]);


  // Show loading spinner while initial data or editor assignment is loading
  if (isLoading || editorLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If, despite loading being false, currentAssignment is somehow null, handle gracefully
  if (!currentAssignment) {
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
              <Typography>Error loading assignment. Please try again.</Typography>
          </Box>
      );
  }


  const handleTitleChange = e => {
    updateCurrentAssignment({ title: e.target.value });
  };

  const handleClassChange = e => {
    updateCurrentAssignment({ class_id: e.target.value });
  };

  // Handler for input in the contentEditable div
  const handleInput = () => {
    // Capture the plain text content from the contentEditable div using the ref
    // Using textContent to get pure text for Markdown parsing
    if (editorRef.current) {
        setLocalContent(editorRef.current.textContent ?? ''); // Update local state
    }
  };

  // Function to render Markdown using marked and sanitize the output
  const renderMarkdown = (markdown) => {
      if (!markdown) return { __html: '' };
      // Parse markdown to HTML
      const rawHtml = marked.parse(markdown, { breaks: true, gfm: true }); // added breaks and gfm options for better compatibility
      // Sanitize the HTML
      const safeHtml = DOMPurify.sanitize(rawHtml);
      return { __html: safeHtml };
  };

  // Safely access currentAssignment properties (already checked for null above)
  const { title, class_id } = currentAssignment; // Destructure directly now


  return (
    <Box className="assignment-editor-container" sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        {id ? 'Edit Assignment' : 'Create New Assignment'}
      </Typography>

      <TextField
        label="Assignment Title"
        variant="outlined"
        fullWidth
        margin="normal"
        value={title ?? ''} // Use ?? '' for null/undefined safety
        onChange={handleTitleChange}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel id="class-select-label">Class</InputLabel>
        <Select
          labelId="class-select-label"
          label="Class"
          value={class_id ?? ''} // Use ?? ''
          onChange={handleClassChange}
        >
          {/* Add an option for no class selected */}
          <MenuItem value="">
            <em>Select a Class</em>
          </MenuItem>
          {classes.map(cls => (
            <MenuItem key={cls.id} value={cls.id}>
              {cls.name} ({cls.period})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          aria-label="editor tabs"
        >
          <Tab label="Edit" />
          <Tab label="Preview" />
        </Tabs>
      </Box>

      <Box sx={{ py: 2 }}>
        {tab === 0 ? (
          // Edit Tab: Using contentEditable
          <div
              ref={editorRef} // Attach ref to the div
            contentEditable
              suppressContentEditableWarning={true} // Avoid React warning for contentEditable
            style={{
              minHeight: '200px', border: '1px solid #ccc', padding: '10px',
              outline: 'none', fontSize: '1rem', lineHeight: 1.5, overflowY: 'auto'
            }}
            // Set initial content using dangerouslySetInnerHTML from local state
              // This is only for rendering the initial content received.
              // User input is captured by onInput and updates local state via textContent.
            dangerouslySetInnerHTML={{ __html: localContent ?? '' }}
            // Use onInput to capture changes and update local state with textContent
            onInput={handleInput}
          />
        ) : (
          // Preview Tab: Render Markdown using marked and dangerouslySetInnerHTML
          <Paper
            elevation={0} className="assignment-preview"
            sx={{ p: 2, minHeight: '200px', border: '1px solid #eee', overflowY: 'auto' }}
          >
              {/* Render markdown using marked and sanitize the output */}
            <div dangerouslySetInnerHTML={renderMarkdown(localContent)} />
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default AssignmentEditor;
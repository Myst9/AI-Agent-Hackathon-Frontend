// src/components/Layout/Navbar.jsx
import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AppContext from '../../contexts/AppContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    currentAssignment, 
    handleSaveAssignment, // Use the new save handler
    handlePostAssignment, // Use the new post handler
    isSaving // Use the saving/posting loading state from context
} = useContext(AppContext);

  const handleSave = async () => {
    // Ensure currentAssignment exists and has a title before attempting save
    if (currentAssignment?.title && !isSaving) {
      try {
          console.log("Navbar: Attempting to save assignment...");
        const saved = await handleSaveAssignment(currentAssignment);
          console.log("Navbar: Assignment saved:", saved);
          // If we were on the '/create' page and it was a new assignment (had no ID),
          // navigate to the edit page using the new ID returned by the save handler.
          // Check if the assignment was newly created (id was null before save)
        if (!currentAssignment.id && saved && saved.id && location.pathname === '/create') {
          navigate(`/edit/${saved.id}`);
        }
      } catch (error) {
          console.error("Navbar: Error during save:", error);
          // TODO: Show save error message to user (e.g., Snackbar)
      }
    } else if (!currentAssignment?.title) {
        console.warn("Navbar: Cannot save - Assignment title is empty.");
        // TODO: Show a warning to the user (e.g., Snackbar)
    }
  };

  const handlePost = async () => {
    // Ensure currentAssignment has an ID and class_id before attempting post
    if (currentAssignment?.id && currentAssignment?.class_id && !isSaving) {
      try {
          console.log("Navbar: Attempting to post assignment...");
        await handlePostAssignment(currentAssignment.id);
          console.log("Navbar: Assignment posted.");
          // TODO: Show success message (e.g., Snackbar)
      } catch (error) {
          console.error("Navbar: Error during post:", error);
          // TODO: Show post error message to user (e.g., Snackbar)
      }
    } else {
        let warning = "Navbar: Cannot post:";
        if (!currentAssignment?.id) warning += " Assignment not saved.";
        if (!currentAssignment?.class_id) warning += " Class not selected.";
        console.warn(warning);
        // TODO: Show a warning to the user (e.g., Snackbar)
    }
  };

  // Check if we are on the create or edit page
  const isEditorPage = location.pathname === '/create' || location.pathname.startsWith('/edit/');
  
  // Check if save is disabled (no title or currently saving)
  const isSaveDisabled = isSaving || !currentAssignment?.title;
  // Check if post is disabled (no ID, no class selected, or currently saving)
  const isPostDisabled = isSaving || !currentAssignment?.id || !currentAssignment?.class_id;


  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Teacher Assignment Creator
        </Typography>
        
        {isEditorPage && (
          <>
            <Button 
              color="inherit" 
              onClick={handleSave}
              disabled={isSaveDisabled}
              sx={{ mx: 1 }}
            >
              {/* Show loading indicator if currently saving */}
              {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save'}
            </Button>
            
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handlePost}
              disabled={isPostDisabled}
              sx={{ mx: 1 }}
            >
              {/* Show loading indicator if currently saving/posting */}
              {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Post to Class'} 
            </Button>
          </>
        )}
        
        <Button color="inherit" onClick={() => navigate('/')}>
          Dashboard
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
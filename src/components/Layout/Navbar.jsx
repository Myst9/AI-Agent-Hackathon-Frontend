import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AppContext from '../../contexts/AppContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentAssignment, saveAssignment, postAssignment, isLoading } = useContext(AppContext);

  const handleSave = async () => {
    if (currentAssignment.title) {
      const saved = saveAssignment(currentAssignment);
      if (saved && location.pathname === '/create') {
        navigate(`/edit/${saved.id}`);
      }
    }
  };

  const handlePost = async () => {
    if (currentAssignment.id) {
      postAssignment(currentAssignment.id);
    }
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Teacher Assignment Creator
        </Typography>
        
        {(location.pathname === '/create' || location.pathname.startsWith('/edit/')) && (
          <>
            <Button 
              color="inherit" 
              onClick={handleSave}
              disabled={isLoading || !currentAssignment.title}
              sx={{ mx: 1 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Save'}
            </Button>
            
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handlePost}
              disabled={isLoading || !currentAssignment.id}
              sx={{ mx: 1 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Post to Class'}
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
import React, { useContext } from 'react';
import { 
  Drawer, 
  Toolbar, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Typography,
  Box
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Add as AddIcon, 
  School as SchoolIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppContext from '../../contexts/AppContext';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const { classes } = useContext(AppContext);
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem button onClick={() => navigate('/student')}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          
        </List>
        
        <Divider />
        
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, opacity: 0.7 }}>
          Classes
        </Typography>
        
        <List>
          {classes.map((cls) => (
            <ListItem button key={cls.id}>
              <ListItemIcon>
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText primary={cls.name} secondary={cls.period} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import StudNavbar from './components/Layout/StudNavbar';
import StudSidebar from './components/Layout/StudSidebar';
import Dashboard from './components/Dashboard/Dashboard';
import AssignmentEditor from './components/AssignmentEditor/AssignmentEditor';
import Chat from './components/Chat/Chat';
import StudDashboard from './components/Dashboard/StudDashboard';
import AnswerAssignment from './components/AssignmentEditor/AssisgmentAnswer';

// Import CSS files
import './styles/Chat.css';

function App() {
  const location = useLocation();
  const isStudentRoute = location.pathname.startsWith('/student') || location.pathname.startsWith('/answer');

  return (
    <div className="app-container">
      <Box className="main-content">
        {!isStudentRoute ? (
          <>
            <Navbar />
            <Sidebar />
          </>
        ) : (
          <>
            <StudNavbar />
            <StudSidebar />
          </>
        )}

        <Routes>
          {/* Teacher routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', p: 2 }}>
              <Box sx={{ flex: '1', display: 'flex', gap: 3 }}>
                <Box sx={{ flex: '1', maxWidth: '50%' }}>
                  <Chat />
                </Box>
                <Box sx={{ flex: '1' }}>
                  <AssignmentEditor />
                </Box>
              </Box>
            </Box>
          } />
          <Route path="/edit/:id" element={<AssignmentEditor />} />

          {/* Student routes */}
          <Route path="/student" element={<StudDashboard />} />
          <Route path="/answer/:id" element={<AnswerAssignment />} />
        </Routes>
      </Box>
    </div>
  );
}

export default App;
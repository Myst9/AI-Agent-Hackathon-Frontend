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
            <>
              <Chat />
              <AssignmentEditor />
            </>
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

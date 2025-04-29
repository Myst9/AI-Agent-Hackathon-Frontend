import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import AssignmentEditor from './components/AssignmentEditor/AssignmentEditor';
import Chat from './components/Chat/Chat';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Sidebar />
      <Box className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={
            <>
              <Chat />
              <AssignmentEditor />
            </>
          } />
          <Route path="/edit/:id" element={<AssignmentEditor />} />
        </Routes>
      </Box>
    </div>
  );
}

export default App;
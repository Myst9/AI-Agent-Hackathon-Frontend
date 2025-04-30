import React, { createContext, useState, useEffect } from 'react';
import { fetchAssignments, fetchClasses } from '../services/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [currentAssignment, setCurrentAssignment] = useState({
    id: null,
    title: '',
    content: '',
    class_id: '',
    status: 'draft'
  });
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'agent', content: 'Hello! I\'m your AI teaching assistant. I can help you create assignments based on your materials and requirements. What would you like to work on today?' }
  ]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const assignmentsData = await fetchAssignments();
        const classesData = await fetchClasses();
        
        setAssignments(assignmentsData);
        setClasses(classesData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const addChatMessage = (message) => {
    setChatMessages((prevMessages) => {
      // If this message is meant to replace another one, filter out the one being replaced
      if (message.replaces) {
        return [...prevMessages.filter(msg => msg.id !== message.replaces), message];
      }
      return [...prevMessages, message];
    });
  };

  const addUploadedFile = (file) => {
    setUploadedFiles((prevFiles) => [...prevFiles, file]);
  };

  const updateCurrentAssignment = (updates) => {
    setCurrentAssignment((prev) => ({ ...prev, ...updates }));
  };

  const saveAssignment = (assignment) => {
    // If it's a new assignment, add it to the list
    if (!assignment.id) {
      const newAssignment = {
        ...assignment,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setAssignments([...assignments, newAssignment]);
      return newAssignment;
    } 
    // Otherwise update the existing one
    else {
      const updatedAssignments = assignments.map(a => 
        a.id === assignment.id ? { ...a, ...assignment, updatedAt: new Date().toISOString() } : a
      );
      setAssignments(updatedAssignments);
      return assignment;
    }
  };

  const postAssignment = (assignmentId) => {
    const updatedAssignments = assignments.map(a => 
      a.id === assignmentId ? { ...a, status: 'posted', postedAt: new Date().toISOString() } : a
    );
    setAssignments(updatedAssignments);
  };

  // Clear chat history
  const clearChat = () => {
    setChatMessages([
      { id: Date.now(), sender: 'agent', content: 'Let\'s start fresh! How can I help you create an assignment today?' }
    ]);
  };

  // Remove file from uploaded files
  const removeUploadedFile = (fileId) => {
    setUploadedFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  return (
    <AppContext.Provider
      value={{
        assignments,
        classes,
        currentAssignment,
        chatMessages,
        uploadedFiles,
        isLoading,
        addChatMessage,
        addUploadedFile,
        removeUploadedFile,
        updateCurrentAssignment,
        saveAssignment,
        postAssignment,
        setCurrentAssignment,
        setUploadedFiles,
        clearChat
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
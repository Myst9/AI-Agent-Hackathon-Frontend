import React, { createContext, useState, useEffect, useCallback } from 'react';
// Import the API functions
import { 
  fetchAssignments, 
  fetchClasses, 
  saveAssignmentToApi, // Now imports the mock API function
  postAssignmentToApi // Now imports the mock API function
} from '../services/api';

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
  const [isLoading, setIsLoading] = useState(false); // For general app loading (initial data fetch)
  const [isSaving, setIsSaving] = useState(false); // For specific save/post actions

  // Load initial data on app start
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
        // TODO: Display error to user
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []); // Empty dependency array means this runs once on mount

  // Handle adding messages, potentially replacing a processing message
  const addChatMessage = useCallback((message) => {
    setChatMessages((prevMessages) => {
      // If this message is meant to replace another one, filter out the one being replaced
      if (message.replaces) {
        // Keep messages that are not the one being replaced
        const filteredMessages = prevMessages.filter(msg => msg.id !== message.replaces);
        // Add the new message
        return [...filteredMessages, message];
      }
      // Otherwise, just add the new message
      return [...prevMessages, message];
    });
  }, []); // addChatMessage is stable

  // Add a file to the uploaded files list
  const addUploadedFile = useCallback((file) => {
    // Add a unique temporary ID for easy removal later
    setUploadedFiles((prevFiles) => [...prevFiles, { ...file, id: Date.now() }]);
  }, []); // addUploadedFile is stable

  // Remove a file from the uploaded files list by its temporary ID
  const removeUploadedFile = useCallback((fileId) => {
    setUploadedFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  }, []); // removeUploadedFile is stable


  // Update fields of the current assignment in the editor
  const updateCurrentAssignment = useCallback((updates) => {
    setCurrentAssignment((prev) => ({ ...prev, ...updates }));
  }, []); // updateCurrentAssignment is stable

  /**
   * Saves the current assignment to the backend (mock or real).
   * Handles both creating new assignments and updating existing ones.
   * Updates local state based on the API response.
   * @param {object} assignmentData - The assignment object to save.
   * @returns {Promise<object>} The saved assignment object from the API response.
   */
  const handleSaveAssignment = useCallback(async (assignmentData) => {
    setIsSaving(true); // Set loading for save/post buttons
    try {
      console.log("AppContext: Saving assignment:", assignmentData);
      const savedAssignment = await saveAssignmentToApi(assignmentData);
      console.log("AppContext: Received saved assignment:", savedAssignment);

      // Update the assignments list with the saved assignment
      setAssignments(prev => {
        const index = prev.findIndex(a => a.id === savedAssignment.id);
        if (index !== -1) {
          // Update existing assignment
          const newAssignments = [...prev];
          newAssignments[index] = savedAssignment;
          return newAssignments;
        } else {
          // Add new assignment
          return [...prev, savedAssignment];
        }
      });

      // Update currentAssignment state with the response (includes ID, timestamps)
      setCurrentAssignment(savedAssignment);

      return savedAssignment; // Return the updated/created assignment
    } catch (error) {
      console.error('AppContext: Error saving assignment:', error);
      // TODO: Display error to user
      throw error; // Re-throw to be caught by component calling this
    } finally {
      setIsSaving(false);
    }
  }, [setAssignments, setCurrentAssignment]); // Depend on state setters

  /**
   * Posts an assignment to a class via the backend (mock or real).
   * Updates local state based on the API response.
   * @param {string} assignmentId - The ID of the assignment to post.
   * @returns {Promise<object>} The posted assignment object from the API response, or null if failed.
   */
  const handlePostAssignment = useCallback(async (assignmentId) => {
    setIsSaving(true); // Set loading for save/post buttons
    try {
      console.log("AppContext: Posting assignment with ID:", assignmentId);
      const postedAssignment = await postAssignmentToApi(assignmentId);
      console.log("AppContext: Received posted assignment:", postedAssignment);

      if (postedAssignment) {
        // Update the assignments list with the posted assignment
        setAssignments(prev => prev.map(a => 
          a.id === postedAssignment.id ? postedAssignment : a
        ));
        
        // If the posted assignment was the one currently being edited, update currentAssignment
        setCurrentAssignment(prev => 
          prev.id === postedAssignment.id ? postedAssignment : prev
        );
        // TODO: Show success message (e.g., Snackbar)
      } else {
        console.warn(`AppContext: Assignment with ID ${assignmentId} not found or failed to post.`);
        // TODO: Display error to user
      }

      return postedAssignment;
    } catch (error) {
      console.error('AppContext: Error posting assignment:', error);
      // TODO: Display error to user
      throw error; // Re-throw
    } finally {
      setIsSaving(false);
    }
  }, [setAssignments, setCurrentAssignment]); // Depend on state setters


  // Clear chat history
  const clearChat = useCallback(() => {
    setChatMessages([
      { id: Date.now(), sender: 'agent', content: 'Let\'s start fresh! How can I help you create an assignment today?' }
    ]);
  }, [setChatMessages]); // Depend on state setter

  // Clear uploaded files
  const clearUploadedFiles = useCallback(() => {
    setUploadedFiles([]);
  }, [setUploadedFiles]); // Depend on state setter


  return (
    <AppContext.Provider
      value={{
        assignments,
        classes,
        currentAssignment,
        chatMessages,
        uploadedFiles,
        isLoading, // Initial data loading
        isSaving, // Saving/Posting loading state
        addChatMessage,
        addUploadedFile,
        removeUploadedFile,
        updateCurrentAssignment,
        handleSaveAssignment, // Use the new async save handler
        handlePostAssignment, // Use the new async post handler
        setCurrentAssignment,
        setUploadedFiles, // Keep setUploadedFiles if needed elsewhere
        clearChat,
        clearUploadedFiles // Add a clear files function
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
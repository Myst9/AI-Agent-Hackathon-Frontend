// src/services/api.js
import { mockAssignments, mockClasses } from './mockData'; // Assuming mockData.js exists
import axios from 'axios';

// API Base URL - adjust if needed
// NOTE: Ensure this points to your actual backend when deployed
const API_BASE_URL = 'http://localhost:8080/teacher/v1';

// Simulating API delay for mock functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- Mock Data Simulation (Modify directly for persistence simulation) ---
// Using let allows us to reassign the array when adding/updating items
let currentMockAssignments = [...mockAssignments];
let currentMockClasses = [...mockClasses];

// Mock fetch assignments
export const fetchAssignments = async () => {
  await delay(800);
  return [...currentMockAssignments]; // Return a copy
};

// Mock fetch classes
export const fetchClasses = async () => {
  await delay(600);
  return [...currentMockClasses]; // Return a copy
};

/**
 * Mock save assignment API call
 * Simulates saving/updating an assignment in the backend.
 * If assignment has no ID, assigns a new one and adds it.
 * If assignment has an ID, updates the existing one.
 */
export const saveAssignmentToApi = async (assignment) => {
  await delay(1000); // Simulate network delay
  
  const timestamp = new Date().toISOString();
  let savedAssignment;

  if (!assignment.id) {
    // New assignment - assign a unique mock ID (using timestamp for simplicity)
    savedAssignment = {
      ...assignment,
      id: Date.now().toString(), // Use Date.now as a simple unique ID
      status: assignment.status || 'draft', // Use status from input or default to draft
      createdAt: timestamp,
      updatedAt: timestamp
    };
    currentMockAssignments.push(savedAssignment);
  } else {
    // Existing assignment - find and update
    const index = currentMockAssignments.findIndex(a => a.id === assignment.id);
    if (index !== -1) {
      savedAssignment = {
        ...currentMockAssignments[index], // Keep existing fields like createdAt, postedAt etc.
        ...assignment, // Apply updates (title, content, class_id, status etc.)
        updatedAt: timestamp
      };
      currentMockAssignments[index] = savedAssignment;
    } else {
      // This case indicates a potential data sync issue, but for the mock, 
      // let's just log a warning and return the assignment we were given.
      console.warn(`Mock saveAssignmentToApi: Attempted to save non-existent assignment with ID: ${assignment.id}`);
      return assignment; 
    }
  }

  console.log('Mock saved assignment:', savedAssignment);
  return savedAssignment;
};

/**
 * Mock post assignment API call
 * Simulates changing assignment status to 'posted' and setting postedAt.
 */
export const postAssignmentToApi = async (assignmentId) => {
  await delay(1200); // Simulate network delay

  const postedAtTimestamp = new Date().toISOString();
  let postedAssignment = null;

  currentMockAssignments = currentMockAssignments.map(a => {
    if (a.id === assignmentId) {
      postedAssignment = { 
        ...a, 
        status: 'posted', 
        postedAt: postedAtTimestamp,
        updatedAt: new Date().toISOString() // Also update updatedAt
      };
      return postedAssignment;
    }
    return a;
  });

  console.log('Mock posted assignment with ID:', assignmentId, postedAssignment);
  // Return the updated assignment object, or null if the ID wasn't found
  return postedAssignment || currentMockAssignments.find(a => a.id === assignmentId) || null;
};


/**
 * Send message and files to the AI agent to create an assignment.
 * Calls the backend API with available inputs (message, PDF, or both).
 */
export const sendMessageToAgent = async (message, uploadedFiles) => {
  // Check if we have PDF files to send
  const pdfFile = uploadedFiles.find(file => file.type.includes('pdf'));
  
  // If neither message nor PDF, don't call the API (handled in Chat component)
  if (!message.trim() && !pdfFile) {
      // This case should theoretically not be reached if Chat's validation works,
      // but including a defensive check.
    console.warn("sendMessageToAgent called with empty message and no PDF.");
      // Return a dummy response or throw an error as appropriate
      return {
          id: Date.now(),
          sender: 'agent',
          content: 'Please provide a message or upload a PDF to create an assignment.'
      };
  }

  try {
    const formData = new FormData();
    
    // TODO: Replace '12345' with the actual student ID from app state/auth
    // Ensure your backend uses 'studentId' or change this field name accordingly
    formData.append('studentId', '12345'); 
    
    // Add the message as instructions if provided
    // Ensure your backend expects 'instructions' or change this field name (e.g., 'topic')
    if (message && message.trim()) {
      formData.append('topic', message.trim());
    }

    // Add the PDF file if present (ensure it's the actual File object)
    // Ensure your backend expects the file under the name 'pdf'
    if (pdfFile) {
      formData.append('pdf', pdfFile.file); 
    }

    console.log("Sending request to backend for assignment creation...");
    // The Chat component is expecting an 'assignment' property in the response
    // if an assignment was successfully created.
    const response = await axios.post(
      `${API_BASE_URL}/create/solo`,
      formData, // Send the formData which contains message, PDF, or both
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    // Process backend response
    console.log("Backend response:", response);
    
    // Assuming backend responds with JSON containing assignment details OR just a message
    const backendData = response.data;

    // Determine the content to display in the chat
    const chatContent = backendData.description || backendData.message || 'Processing complete.';

    // If the backend returned assignment details, include them in the response for the frontend
    // Assuming backend sends back an object with 'id', 'description', 'code', etc.
    if (backendData && backendData.id) { 
      return {
        id: Date.now(),
        sender: 'agent',
        content: chatContent, // Message to display in chat
        assignment: {
          id: backendData.id, // Use the ID from the backend response
          title: backendData.title || 'Generated Assignment', // Use title from backend if available, or a default
          content: formatAssignmentContent(backendData), // Format content from backend data
          class_id: '', // Class needs to be selected by user later
          status: 'draft', 
          // createdAt and updatedAt will be set during the save process in AppContext
        }
      };
    } else {
        // If backend didn't return a structured assignment object, just return the message
        // This happens for text-only inputs that might trigger a conversational response
        // or if the backend API has different response structures.
        console.log("Backend did not return a full assignment object.");
        return {
            id: Date.now(),
            sender: 'agent',
            content: chatContent
        };
    }

  } catch (error) {
    console.error('Error sending message to agent:', error);
    
    // Log more details about the error
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      // Extract a more specific error message from the response if available
      const backendErrorMessage = typeof error.response.data === 'object' 
        ? error.response.data.message || JSON.stringify(error.response.data)
        : error.response.data;
      throw new Error(`API Error: ${backendErrorMessage || `Status ${error.response.status}`}`);
    } else if (error.request) {
      console.error('Error request:', error.request);
      throw new Error('Network Error: No response from server.');
    } else {
      console.error('Error message:', error.message);
      throw new Error(`Request setup Error: ${error.message}`);
    }
  }
};

/**
 * Format the assignment content based on the API response structure.
 * Assumes responseData is an object potentially containing description, code, testCases, sources, title.
 */
function formatAssignmentContent(responseData) {
  const { description, code, testCases, sources, title } = responseData || {}; // Destructure safely

  // Build the content string using Markdown
  let content = `# ${title || description || 'Generated Assignment'}\n\n`;

  if (description && title !== description) { // Avoid repeating description if it's the same as title
    content += `## Description\n${description}\n\n`;
  }

  if (code) {
    content += `## Coding Task\n\`\`\`python\n${code}\n\`\`\`\n\n`;
  }

  if (testCases) {
    // Assuming testCases is a string representation of code/data
    content += `## Test Cases\n\`\`\`python\n${testCases}\n\`\`\`\n\n`;
  }

  if (sources) {
    // Assuming sources is a string or array joined by newlines
    content += `## Sources\n${Array.isArray(sources) ? sources.join('\n') : sources}\n\n`;
  }

  // Add a placeholder if nothing specific was generated but an ID was returned
  if (!description && !code && !testCases && !sources && !title) {
    content += 'The AI generated an assignment structure but did not return specific content details.';
  }
  
  // Clean up extra newlines at the end
  content = content.trim();

 return content;
}

// Note: The mock save/post functions (saveAssignmentToApi, postAssignmentToApi) are defined above
// and modify the currentMockAssignments array directly to simulate persistence.
// When you integrate a real backend, you will replace these functions with
// actual API calls using axios, and they will update the backend database instead.
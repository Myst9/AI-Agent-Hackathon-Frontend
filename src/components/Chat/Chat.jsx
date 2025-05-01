// src/components/Chat/Chat.jsx
import React, { useState, useContext, useRef, useEffect } from 'react';
import { Box, TextField, Button, CircularProgress, Alert, Typography, Chip } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import ChatMessage from './ChatMessage';
import FileUpload from '../FileUpload/FileUpload';
import AppContext from '../../contexts/AppContext';
import { sendMessageToAgent } from '../../services/api';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Chat = () => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { 
    chatMessages, 
    addChatMessage, 
    uploadedFiles, 
    setCurrentAssignment,
    handleSaveAssignment, // Use the new save handler
    removeUploadedFile, // Use removeUploadedFile from context for chip delete
    clearUploadedFiles // Use the clear files function
  } = useContext(AppContext);
  const chatEndRef = useRef(null);
  const navigate = useNavigate(); // Hook for navigation

  // Auto-scroll to the most recent message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Allow sending with just files, but not with empty message and no files
    const hasMessage = message.trim().length > 0;
    const hasFiles = uploadedFiles && uploadedFiles.length > 0;

    if (!hasMessage && !hasFiles) {
        setError('Please enter a message or upload a file.');
        return;
    }

    // Clear any previous errors
    setError('');
    setSending(true); // Start sending state

    // Generate unique IDs for messages. Using Date.now() + index/fraction
    // helps ensure order even if messages are added rapidly.
    const userMessageId = hasMessage ? Date.now() : null;
    const filesMessageId = hasMessage && hasFiles ? Date.now() + 0.5 : (hasFiles ? Date.now() : null);
    const processingMsgId = Date.now() + 0.7;

    try {
      // Add user message to chat if there's a message
      if (hasMessage) {
        const userMessage = {
          id: userMessageId,
          sender: 'user',
          content: message.trim()
        };
        addChatMessage(userMessage);
      }
      
      // Add file indication message if files are present
      if (hasFiles) {
        const filesMessage = {
          id: filesMessageId, 
          sender: 'user',
          content: `Uploaded ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''}: ${uploadedFiles.map(f => f.name).join(', ')}`,
          isFileMessage: true // Custom flag to style this message differently if needed
        };
        addChatMessage(filesMessage);
      }
      
      // Clear input and uploaded files *after* adding user messages to chat
      setMessage('');
      clearUploadedFiles(); // Clear files from state

      // Display processing message
      addChatMessage({
        id: processingMsgId, 
        sender: 'agent',
        content: 'Processing your request...',
        isProcessing: true // Custom flag
      });

      // Send to agent and get response
      // This call now attempts to send message, PDF, or both to the backend
      const agentResponse = await sendMessageToAgent(message, uploadedFiles);
      
      // Remove processing message and add real response message
      // The agentResponse content is the message displayed in chat
      addChatMessage({
        ...agentResponse, // Should contain id, sender, content, and optionally assignment
        replaces: processingMsgId // Indicate this should replace the processing message
      });

      // If the agent returned an assignment object, save it and navigate
      if (agentResponse.assignment) {
        console.log("Received assignment from agent, saving:", agentResponse.assignment);
        // Use the save handler from context, which saves to API and updates state
        const savedAssignment = await handleSaveAssignment(agentResponse.assignment);
        console.log("Assignment saved, navigating to editor:", savedAssignment);
        // Navigate to the edit page for the newly saved assignment
        navigate(`/edit/${savedAssignment.id}`); 
      } else {
          console.log("Agent response did not contain an assignment object.");
          // If no assignment was returned, the chat just shows the agent's message.
      }

    } catch (error) {
      console.error('Error handling message:', error);
      // Replace processing message or add new error message
      addChatMessage({
        id: Date.now(), // New ID for the error message
        sender: 'agent',
        content: `Sorry, I encountered an error processing your request. ${error.message || 'Please try again.'}`,
        // If there was a processing message, replace it with this error
        replaces: processingMsgId // Use the ID of the processing message
      });
      setError(`Failed to get a response from the AI. ${error.message || ''}`);
    } finally {
      setSending(false);
    }
  };

  // Check if PDF is uploaded for the info alert
  const hasPdf = uploadedFiles.some(file => file.type.includes('pdf'));

  return (
    <div className="chat-container">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <h2>AI Assignment Creator</h2>
        {/* FileUpload component should ideally interact directly with AppContext */}
        <FileUpload /> 
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Display uploaded files below the FileUpload button */}
      {uploadedFiles && uploadedFiles.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Uploaded Files:</Typography>
          {uploadedFiles.map(file => (
            <Chip
              key={file.id} // Use the temporary ID from AppContext
              label={file.name}
              onDelete={() => removeUploadedFile(file.id)} // Use removeUploadedFile from context
              sx={{ mr: 1, mb: 0.5 }}
            />
          ))}
        </Box>
      )}

      {!hasPdf && (
        <Alert severity="info" sx={{ mb: 2 }}>
          For best results in generating an assignment based on material, upload a PDF before sending your request. You can also send text instructions alone.
        </Alert>
      )}

      <div className="chat-messages-container">
        <div className="chat-messages">
          {chatMessages.map((msg) => (
              // Only render messages that don't replace another
            !msg.replaces && <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-container">
          <TextField
            className="chat-input"
            placeholder="Describe the assignment you want to create..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sending}
            fullWidth
            variant="outlined"
            size="small"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={((!message.trim() && (!uploadedFiles || uploadedFiles.length === 0)) || sending)}
            endIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
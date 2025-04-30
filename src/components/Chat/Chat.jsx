import React, { useState, useContext, useRef, useEffect } from 'react';
import { Box, TextField, Button, CircularProgress, Alert, Typography } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import ChatMessage from './ChatMessage';
import FileUpload from '../FileUpload/FileUpload';
import AppContext from '../../contexts/AppContext';
import { sendMessageToAgent } from '../../services/api';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { 
    chatMessages, 
    addChatMessage, 
    uploadedFiles, 
    setCurrentAssignment 
  } = useContext(AppContext);
  const chatEndRef = useRef(null);

  // Auto-scroll to the most recent message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Allow sending with just files, but not with empty message and no files
    if (!message.trim() && (!uploadedFiles || uploadedFiles.length === 0)) return;

    // Clear any previous errors
    setError('');

    try {
      // Add user message to chat if there's a message
      if (message.trim()) {
        const userMessage = {
          id: Date.now(),
          sender: 'user',
          content: message
        };
        addChatMessage(userMessage);
      }
      
      // Add file indication message if files are present
      if (uploadedFiles && uploadedFiles.length > 0) {
        const filesMessage = {
          id: Date.now() + 1,
          sender: 'user',
          content: `Uploaded ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''}: ${uploadedFiles.map(f => f.name).join(', ')}`,
          isFileMessage: true
        };
        addChatMessage(filesMessage);
      }
      
      // Clear input and set sending state
      setMessage('');
      setSending(true);

      // Display processing message
      const processingMsgId = Date.now() + 2;
      addChatMessage({
        id: processingMsgId,
        sender: 'agent',
        content: 'Processing your request...',
        isProcessing: true
      });

      // Send to agent and get response
      const agentResponse = await sendMessageToAgent(message, uploadedFiles);
      
      // Remove processing message and add real response
      addChatMessage({
        ...agentResponse,
        replaces: processingMsgId // Indicate this should replace the processing message
      });

      // If the agent returned an assignment, update the current assignment
      if (agentResponse.assignment) {
        setCurrentAssignment(agentResponse.assignment);
      }
    } catch (error) {
      console.error('Error sending message to agent:', error);
      setError('Failed to get a response from the AI. Please try again.');
      addChatMessage({
        id: Date.now(),
        sender: 'agent',
        content: 'Sorry, I encountered an error processing your request. Please try again.'
      });
    } finally {
      setSending(false);
    }
  };

  // Check if PDF is uploaded
  const hasPdf = uploadedFiles.some(file => file.type.includes('pdf'));

  return (
    <div className="chat-container">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <h2>AI Assignment Creator</h2>
        <FileUpload />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!hasPdf && (
        <Alert severity="info" sx={{ mb: 2 }}>
          For best results, upload a PDF teaching material before creating an assignment.
        </Alert>
      )}

      <div className="chat-messages-container">
        <div className="chat-messages">
          {chatMessages.map((msg) => (
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
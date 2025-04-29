import React, { useState, useContext, useRef, useEffect } from 'react';
import { Box, TextField, Button, CircularProgress } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import ChatMessage from './ChatMessage';
import FileUpload from '../FileUpload/FileUpload';
import AppContext from '../../contexts/AppContext';
import { sendMessageToAgent } from '../../services/api';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { chatMessages, addChatMessage, uploadedFiles, updateCurrentAssignment } = useContext(AppContext);
  const chatEndRef = useRef(null);

  // Auto-scroll to the most recent message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: message
    };
    addChatMessage(userMessage);
    setMessage('');
    setSending(true);

    try {
      // Send to agent and get response
      const agentResponse = await sendMessageToAgent(message, uploadedFiles);
      addChatMessage(agentResponse);

      // If the agent returned an assignment, update the current assignment
      if (agentResponse.assignment) {
        updateCurrentAssignment({
          title: agentResponse.assignment.title,
          content: agentResponse.assignment.content
        });
      }
    } catch (error) {
      console.error('Error sending message to agent:', error);
      addChatMessage({
        id: Date.now(),
        sender: 'agent',
        content: 'Sorry, I encountered an error processing your request. Please try again.'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <h2>AI Assistant</h2>
        <FileUpload />
      </Box>

      <div className="chat-container">
        <div className="chat-messages">
          {chatMessages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-container">
          <TextField
            className="chat-input"
            placeholder="Ask the AI assistant to help create an assignment..."
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
            disabled={!message.trim() || sending}
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
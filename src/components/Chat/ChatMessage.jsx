import React from 'react';
import { Box, Avatar, Typography, CircularProgress } from '@mui/material';
import { SmartToy as BotIcon, Person as PersonIcon, Info as InfoIcon } from '@mui/icons-material';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import '../../styles/Chat.css'; // Make sure to import the CSS

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';
  const isProcessing = message.isProcessing;

  const getSanitizedHtml = (markdown) => {
    try {
      const dirtyHtml = marked.parse(markdown);
      return DOMPurify.sanitize(dirtyHtml);
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return message.content;
    }
  };

  // For processing messages, show a loader
  if (isProcessing) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Avatar
          sx={{
            bgcolor: 'secondary.main',
            width: 32,
            height: 32,
            mx: 1,
          }}
        >
          <BotIcon fontSize="small" />
        </Avatar>
        <Box
          className="message agent-message processing"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <CircularProgress size={16} thickness={4} />
          <Typography variant="body1">{message.content || 'Processing your request...'}</Typography>
        </Box>
      </Box>
    );
  }

  // For system messages, return a simplified view
  if (isSystem) {
    return (
      <Box className="system-message">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
          <InfoIcon fontSize="small" color="info" />
          <Typography variant="body2">
            {message.content}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        mb: 2,
      }}
    >
      <Avatar
        sx={{
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          width: 32,
          height: 32,
          mx: 1,
        }}
      >
        {isUser ? <PersonIcon fontSize="small" /> : <BotIcon fontSize="small" />}
      </Avatar>

      <Box
        className={`message ${isUser ? 'user-message' : 'agent-message'}`}
      >
        {isUser ? (
          <Typography variant="body1">{message.content}</Typography>
        ) : (
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{
              __html: getSanitizedHtml(message.content),
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default ChatMessage;
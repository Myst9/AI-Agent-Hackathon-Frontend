import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import { SmartToy as BotIcon, Person as PersonIcon } from '@mui/icons-material';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';

  const getSanitizedHtml = (markdown) => {
    const dirtyHtml = marked(markdown);
    return DOMPurify.sanitize(dirtyHtml);
  };

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
        sx={{
          maxWidth: '70%',
          p: 1.5,
          borderRadius: 2,
          bgcolor: isUser ? 'primary.light' : 'grey.100',
          wordBreak: 'break-word',
        }}
      >
        {isUser ? (
          <Typography variant="body1">{message.content}</Typography>
        ) : (
          <div
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

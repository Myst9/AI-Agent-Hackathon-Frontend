import React, { useState, useContext } from 'react';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  IconButton,
  Box,
  Chip
} from '@mui/material';
import { 
  Upload as UploadIcon, 
  Delete as DeleteIcon,
  FileCopy as FileIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  InsertDriveFile as GenericFileIcon
} from '@mui/icons-material';
import AppContext from '../../contexts/AppContext';

const FileUpload = () => {
  const [open, setOpen] = useState(false);
  const { uploadedFiles, addUploadedFile, addChatMessage } = useContext(AppContext);
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      // Create a new file object with additional metadata
      const fileObject = {
        id: Date.now() + Math.random().toString(36).substring(2, 10),
        name: file.name,
        type: file.type,
        size: file.size,
        file,
        uploadedAt: new Date().toISOString()
      };
      
      addUploadedFile(fileObject);
    });
    
    // If files were uploaded, add a system message
    if (files.length > 0) {
      addChatMessage({
        id: Date.now(),
        sender: 'system',
        content: `You uploaded ${files.length} file${files.length > 1 ? 's' : ''}.`
      });
    }
    
    handleClose();
  };
  
  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) {
      return <PdfIcon />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <DocIcon />;
    } else if (fileType.includes('image')) {
      return <FileIcon />;
    } else {
      return <GenericFileIcon />;
    }
  };
  
  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<UploadIcon />}
        onClick={handleOpen}
      >
        Upload Materials
      </Button>
      
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload Teaching Materials</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Upload lesson plans, readings, or other materials to help the AI create relevant assignments.
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <input
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/*"
              style={{ display: 'none' }}
              id="file-upload-button"
              type="file"
              multiple
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload-button">
              <Button variant="contained" component="span">
                Choose Files
              </Button>
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      
      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Uploaded Materials:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {uploadedFiles.map((file) => (
              <Chip
                key={file.id}
                icon={getFileIcon(file.type)}
                label={file.name}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}
    </>
  );
};

export default FileUpload;
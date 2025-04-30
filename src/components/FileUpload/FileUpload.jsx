import React, { useState, useContext } from 'react';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Typography,
  Box,
  Chip,
  Alert
} from '@mui/material';
import { 
  Upload as UploadIcon, 
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  InsertDriveFile as GenericFileIcon
} from '@mui/icons-material';
import AppContext from '../../contexts/AppContext';

const FileUpload = () => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const { uploadedFiles, addChatMessage, addUploadedFile, setUploadedFiles } = useContext(AppContext);

  // Local wrapper function to validate and add the file
  const handleAddUploadedFile = (file) => {
    const fileExists = uploadedFiles.some(f => f.name === file.name);
    if (fileExists) {
      setError(`File ${file.name} already exists.`);
      return;
    }

    // If a function exists in context, use it, otherwise fallback to direct state update
    if (addUploadedFile) {
      addUploadedFile(file);
    } else {
      setUploadedFiles([...uploadedFiles, file]);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setError('');

    if (files.length === 0) {
      return;
    }

    // Check if there's at least one PDF file
    const pdfFiles = files.filter(file => file.type === 'application/pdf');

    if (pdfFiles.length === 0) {
      setError('Please upload at least one PDF file. The backend requires PDF format.');
      return;
    }

    // Only use the first PDF file
    const selectedPdf = pdfFiles[0];

    const fileObject = {
      id: Date.now() + Math.random().toString(36).substring(2, 10),
      name: selectedPdf.name,
      type: selectedPdf.type,
      size: selectedPdf.size,
      file: selectedPdf,
      uploadedAt: new Date().toISOString()
    };

    // Clear any previous PDFs since we only want one at a time for the API
    const nonPdfFiles = uploadedFiles.filter(file => !file.type.includes('pdf'));
    if (setUploadedFiles) {
      setUploadedFiles([...nonPdfFiles, fileObject]);
    } else {
      handleAddUploadedFile(fileObject);
    }

    addChatMessage({
      id: Date.now(),
      sender: 'system',
      content: `You uploaded ${selectedPdf.name}. I'll use this material to create an assignment.`
    });

    handleClose();
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) {
      return <PdfIcon />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <DocIcon />;
    } else {
      return <GenericFileIcon />;
    }
  };

  const hasPdf = uploadedFiles.some(file => file.type.includes('pdf'));

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<UploadIcon />}
        onClick={handleOpen}
      >
        {hasPdf ? 'Change PDF' : 'Upload PDF'}
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload Teaching Material</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Upload a PDF of your teaching material to help the AI create relevant assignments.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id="file-upload-button"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload-button">
              <Button variant="contained" component="span">
                Choose PDF File
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
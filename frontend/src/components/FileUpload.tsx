import React, { useState, useCallback } from 'react';
import {
  Box, Button, Typography, List, ListItem, ListItemText, ListItemIcon,
  IconButton, Alert, CircularProgress, LinearProgress
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon, AttachFile as AttachFileIcon,
  Delete as DeleteIcon, GetApp as DownloadIcon
} from '@mui/icons-material';
import axios from 'axios';

interface UploadedFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
}

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
}

export default function FileUpload({ 
  onFilesUploaded, 
  multiple = false, 
  maxFiles = 5,
  accept = ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // Validate file count
    if (!multiple && files.length > 1) {
      setError('Only one file is allowed');
      return;
    }

    if (files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      if (multiple) {
        files.forEach(file => {
          formData.append('files', file);
        });
      } else {
        formData.append('file', files[0]);
      }

      const endpoint = multiple ? '/files/upload-multiple' : '/files/upload';
      
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(progress);
        },
      });

      const newFiles = multiple ? response.data.files : [response.data.file];
      setUploadedFiles(prev => [...prev, ...newFiles]);
      onFilesUploaded(newFiles);
      
    } catch (error: any) {
      setError(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (filename: string) => {
    setUploadedFiles(prev => prev.filter(f => f.filename !== filename));
  };

  const downloadFile = (file: UploadedFile) => {
    window.open(`http://localhost:5000${file.path}`, '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* Upload Area */}
      <Box
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          border: `2px dashed ${dragActive ? '#1976d2' : '#ccc'}`,
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: dragActive ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': { 
            borderColor: 'primary.main',
            backgroundColor: 'rgba(25, 118, 210, 0.04)'
          }
        }}
      >
        <CloudUploadIcon sx={{ 
          fontSize: 48, 
          color: dragActive ? 'primary.main' : 'text.secondary', 
          mb: 1 
        }} />
        <Typography variant="h6" gutterBottom>
          {multiple ? 'Upload Files' : 'Upload File'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Drag and drop files here or click to browse
        </Typography>
        
        <input
          type="file"
          multiple={multiple}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="file-upload"
          accept={accept}
        />
        <label htmlFor="file-upload">
          <Button variant="outlined" component="span" disabled={uploading}>
            Choose Files
          </Button>
        </label>
        
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, ZIP (Max 10MB each)
        </Typography>
      </Box>

      {/* Upload Progress */}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Uploading... {uploadProgress}%
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Uploaded Files ({uploadedFiles.length}):
          </Typography>
          <List dense>
            {uploadedFiles.map((file, index) => (
              <ListItem
                key={index}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: 'grey.50'
                }}
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      aria-label="download"
                      onClick={() => downloadFile(file)}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => removeFile(file.filename)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemIcon>
                  <AttachFileIcon />
                </ListItemIcon>
                <ListItemText
                  primary={file.originalname}
                  secondary={`${formatFileSize(file.size)} • ${file.mimetype}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}
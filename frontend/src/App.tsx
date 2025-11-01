import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Container, AppBar, Toolbar, Typography, Box, Button, Card, CardContent,
  CardActions, Fab, Badge, IconButton, Menu, MenuItem, Chip, Avatar, Divider,
  List, ListItem, ListItemText, ListItemIcon, Paper, Tab, Tabs, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem as SelectMenuItem, Alert, Snackbar, useMediaQuery,
  useTheme, Drawer, ListItemButton, Stack
} from '@mui/material';
import {
  Add as AddIcon, Assignment as AssignmentIcon, Dashboard as DashboardIcon,
  Notifications as NotificationsIcon, Person as PersonIcon, Settings as SettingsIcon,
  CalendarToday as CalendarIcon, Upload as UploadIcon, Grade as GradeIcon,
  School as SchoolIcon, Book as BookIcon, Timer as TimerIcon, CheckCircle as CheckCircleIcon,
  Menu as MenuIcon, Close as CloseIcon, CloudUpload as CloudUploadIcon,
  Edit as EditIcon, Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          },
        },
      },
    },
  },
});

// Form validation schemas
const assignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  course: z.string().min(1, 'Course is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  priority: z.string(),
});

const submissionSchema = z.object({
  assignmentId: z.number(),
  comments: z.string().max(300, 'Comments must be less than 300 characters'),
  file: z.any().optional(),
});

// Types
interface Assignment {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  description: string;
  priority: string;
  grade?: number;
  submittedAt?: string;
  feedback?: string;
}

interface Course {
  id: number;
  name: string;
  instructor: string;
  code: string;
}

// Login validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;
type SubmissionFormData = z.infer<typeof submissionSchema>;
type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

// Mock data for demonstration
const mockCourses: Course[] = [
  { id: 1, name: 'Web Development', instructor: 'Dr. Smith', code: 'CS301' },
  { id: 2, name: 'Database Systems', instructor: 'Prof. Johnson', code: 'CS302' },
  { id: 3, name: 'Data Structures', instructor: 'Dr. Williams', code: 'CS201' },
  { id: 4, name: 'Software Engineering', instructor: 'Prof. Brown', code: 'CS401' },
];

const mockAssignments: Assignment[] = [
  {
    id: 1,
    title: 'React Components Assignment',
    course: 'Web Development',
    dueDate: '2024-11-05',
    status: 'pending',
    description: 'Create a React component library with proper documentation and unit tests',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Database Design Project',
    course: 'Database Systems',
    dueDate: '2024-11-10',
    status: 'submitted',
    description: 'Design and implement a normalized database schema for an e-commerce platform',
    priority: 'medium',
    submittedAt: '2024-11-08'
  },
  {
    id: 3,
    title: 'Algorithm Analysis Report',
    course: 'Data Structures',
    dueDate: '2024-11-15',
    status: 'graded',
    description: 'Analyze time complexity of sorting algorithms and provide performance comparisons',
    priority: 'low',
    grade: 85,
    feedback: 'Good analysis, but could use more detailed explanations for the merge sort implementation.'
  },
  {
    id: 4,
    title: 'Mobile App Prototype',
    course: 'Software Engineering',
    dueDate: '2024-11-20',
    status: 'pending',
    description: 'Create a mobile app prototype using React Native with user authentication',
    priority: 'high'
  }
];

// Assignment Creation Dialog
function AssignmentDialog({ 
  open, 
  onClose, 
  onSubmit, 
  assignment 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSubmit: (data: AssignmentFormData) => void;
  assignment?: Assignment;
}) {
  const { control, handleSubmit, formState: { errors }, reset } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: assignment ? {
      title: assignment.title,
      course: assignment.course,
      dueDate: assignment.dueDate,
      description: assignment.description,
      priority: assignment.priority,
    } : {
      title: '',
      course: '',
      dueDate: '',
      description: '',
      priority: 'medium' as const,
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: AssignmentFormData) => {
    onSubmit(data);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {assignment ? 'Edit Assignment' : 'Create New Assignment'}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Stack spacing={3}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Assignment Title"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  variant="outlined"
                />
              )}
            />
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Controller
                name="course"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.course}>
                    <InputLabel>Course</InputLabel>
                    <Select {...field} label="Course">
                      {mockCourses.map((course) => (
                        <SelectMenuItem key={course.id} value={course.name}>
                          {course.name} ({course.code})
                        </SelectMenuItem>
                      ))}
                    </Select>
                    {errors.course && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {errors.course.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select {...field} label="Priority">
                      <SelectMenuItem value="low">Low</SelectMenuItem>
                      <SelectMenuItem value="medium">Medium</SelectMenuItem>
                      <SelectMenuItem value="high">High</SelectMenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Box>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Due Date"
                  type="datetime-local"
                  error={!!errors.dueDate}
                  helperText={errors.dueDate?.message}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  variant="outlined"
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {assignment ? 'Update' : 'Create'} Assignment
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// Submission Dialog
function SubmissionDialog({ 
  open, 
  onClose, 
  assignment,
  onSubmit 
}: { 
  open: boolean; 
  onClose: () => void; 
  assignment: Assignment;
  onSubmit: (data: SubmissionFormData) => void;
}) {
  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      assignmentId: assignment.id,
      comments: '',
    }
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleClose = () => {
    reset();
    setSelectedFiles([]);
    onClose();
  };

  const handleFormSubmit = (data: SubmissionFormData) => {
    onSubmit({ ...data, file: selectedFiles });
    handleClose();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...files]);
      setValue('file', files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      setValue('file', files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setValue('file', newFiles);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Submit Assignment: {assignment.title}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Stack spacing={3}>
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
                Upload Files
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Drag and drop files here or click to browse
              </Typography>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
              />
              <label htmlFor="file-upload">
                <Button variant="outlined" component="span">
                  Choose Files
                </Button>
              </label>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, ZIP
              </Typography>
            </Box>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Files ({selectedFiles.length}):
                </Typography>
                <List dense>
                  {selectedFiles.map((file, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        mb: 1,
                        backgroundColor: 'grey.50'
                      }}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => removeFile(index)}
                          size="small"
                        >
                          <CloseIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <AssignmentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <Controller
              name="comments"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Comments (Optional)"
                  multiline
                  rows={3}
                  error={!!errors.comments}
                  helperText={errors.comments?.message}
                  placeholder="Add any comments about your submission..."
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            startIcon={<UploadIcon />}
            disabled={selectedFiles.length === 0}
          >
            Submit Assignment
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// Login Dialog
function LoginDialog({ 
  open, 
  onClose, 
  onSwitchToSignup 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSwitchToSignup: () => void;
}) {
  const { control, handleSubmit, formState: { errors }, reset } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: LoginFormData) => {
    console.log('Login data:', data);
    // In a real app, this would make an API call
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="h5" component="div">
          Welcome Back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to your account
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Stack spacing={3}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email Address"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  variant="outlined"
                  autoComplete="email"
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  variant="outlined"
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityIcon /> : <EditIcon />}
                      </IconButton>
                    ),
                  }}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 2, p: 3 }}>
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            size="large"
          >
            Sign In
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Button 
                variant="text" 
                onClick={onSwitchToSignup}
                sx={{ textTransform: 'none' }}
              >
                Sign up here
              </Button>
            </Typography>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
}

// Signup Dialog
function SignupDialog({ 
  open, 
  onClose, 
  onSwitchToLogin 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSwitchToLogin: () => void;
}) {
  const { control, handleSubmit, formState: { errors }, reset } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
    }
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: SignupFormData) => {
    console.log('Signup data:', data);
    // In a real app, this would make an API call
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="h5" component="div">
          Join Our Platform
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your account to get started
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="First Name"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    variant="outlined"
                    autoComplete="given-name"
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Last Name"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    variant="outlined"
                    autoComplete="family-name"
                  />
                )}
              />
            </Box>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email Address"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  variant="outlined"
                  autoComplete="email"
                />
              )}
            />
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>I am a</InputLabel>
                  <Select {...field} label="I am a">
                    <SelectMenuItem value="student">Student</SelectMenuItem>
                    <SelectMenuItem value="teacher">Teacher</SelectMenuItem>
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  variant="outlined"
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityIcon /> : <EditIcon />}
                      </IconButton>
                    ),
                  }}
                />
              )}
            />
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  variant="outlined"
                  autoComplete="new-password"
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 2, p: 3 }}>
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            size="large"
          >
            Create Account
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Button 
                variant="text" 
                onClick={onSwitchToLogin}
                sx={{ textTransform: 'none' }}
              >
                Sign in here
              </Button>
            </Typography>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function AssignmentCard({ 
  assignment, 
  onEdit, 
  onSubmit, 
  onViewDetails 
}: { 
  assignment: Assignment;
  onEdit?: (assignment: Assignment) => void;
  onSubmit?: (assignment: Assignment) => void;
  onViewDetails?: (assignment: Assignment) => void;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'submitted': return 'info';
      case 'graded': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: Assignment['status']) => {
    switch (status) {
      case 'pending': return <TimerIcon />;
      case 'submitted': return <UploadIcon />;
      case 'graded': return <CheckCircleIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const getPriorityColor = (priority: Assignment['priority']) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getDaysUntilDue = () => {
    const dueDate = new Date(assignment.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="h3" gutterBottom sx={{ pr: 1 }}>
            {assignment.title}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Chip
              icon={getStatusIcon(assignment.status)}
              label={assignment.status.toUpperCase()}
              color={getStatusColor(assignment.status) as any}
              size="small"
            />
            <Chip
              label={assignment.priority.toUpperCase()}
              color={getPriorityColor(assignment.priority) as any}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {assignment.course}
        </Typography>
        
        <Typography variant="body2" paragraph sx={{ 
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {assignment.description}
        </Typography>
        
        <Box sx={{ mt: 'auto' }}>
          <Typography variant="body2" color="primary" gutterBottom>
            Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </Typography>
          
          {assignment.status === 'pending' && (
            <Typography 
              variant="caption" 
              color={daysUntilDue <= 1 ? 'error' : daysUntilDue <= 3 ? 'warning.main' : 'text.secondary'}
            >
              {daysUntilDue < 0 ? `Overdue by ${Math.abs(daysUntilDue)} days` :
               daysUntilDue === 0 ? 'Due today' :
               `${daysUntilDue} days remaining`}
            </Typography>
          )}
          
          {assignment.status === 'graded' && assignment.grade && (
            <Typography variant="body2" color="success.main">
              Grade: {assignment.grade}/100
            </Typography>
          )}
        </Box>
      </CardContent>
      
      <CardActions sx={{ pt: 0, flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 0.5 }}>
        <Button 
          size="small" 
          startIcon={<VisibilityIcon />}
          onClick={() => onViewDetails?.(assignment)}
          sx={{ minWidth: isMobile ? '100%' : 'auto' }}
        >
          View Details
        </Button>
        
        {assignment.status === 'pending' && (
          <>
            <Button 
              size="small" 
              variant="contained" 
              startIcon={<UploadIcon />}
              onClick={() => onSubmit?.(assignment)}
              sx={{ minWidth: isMobile ? '100%' : 'auto' }}
            >
              Submit
            </Button>
            {onEdit && (
              <IconButton size="small" onClick={() => onEdit(assignment)}>
                <EditIcon />
              </IconButton>
            )}
          </>
        )}
        
        {assignment.status === 'graded' && (
          <Button size="small" startIcon={<GradeIcon />}>
            View Feedback
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

function Dashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | undefined>();
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | undefined>();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [filterStatus, setFilterStatus] = useState<Assignment['status'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateAssignment = (data: AssignmentFormData) => {
    const newAssignment: Assignment = {
      id: Math.max(...assignments.map(a => a.id)) + 1,
      ...data,
      status: 'pending'
    };
    setAssignments([...assignments, newAssignment]);
    setSnackbar({ open: true, message: 'Assignment created successfully!', severity: 'success' });
  };

  const handleEditAssignment = (data: AssignmentFormData) => {
    if (!editingAssignment) return;
    
    const updatedAssignments = assignments.map(a => 
      a.id === editingAssignment.id ? { ...a, ...data } : a
    );
    setAssignments(updatedAssignments);
    setEditingAssignment(undefined);
    setSnackbar({ open: true, message: 'Assignment updated successfully!', severity: 'success' });
  };

  const handleSubmitAssignment = (data: SubmissionFormData) => {
    if (!submittingAssignment) return;
    
    const updatedAssignments = assignments.map(a => 
      a.id === submittingAssignment.id 
        ? { ...a, status: 'submitted' as const, submittedAt: new Date().toISOString() }
        : a
    );
    setAssignments(updatedAssignments);
    setSubmittingAssignment(undefined);
    setSnackbar({ open: true, message: 'Assignment submitted successfully!', severity: 'success' });
  };

  const handleEditClick = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setAssignmentDialogOpen(true);
  };

  const handleSubmitClick = (assignment: Assignment) => {
    setSubmittingAssignment(assignment);
    setSubmissionDialogOpen(true);
  };

  const handleViewDetails = (assignment: Assignment) => {
    // In a real app, this would navigate to a detailed view
    setSnackbar({ open: true, message: `Viewing details for: ${assignment.title}`, severity: 'success' });
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    graded: assignments.filter(a => a.status === 'graded').length,
  };

  const upcomingDeadlines = assignments
    .filter(a => a.status === 'pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header with Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
          Assignment Dashboard
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: '1fr 1fr', 
            md: '2fr 1.5fr 2.5fr' 
          }, 
          gap: 2, 
          alignItems: 'center' 
        }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
          />
          <FormControl fullWidth size="small">
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={filterStatus}
              label="Filter by Status"
              onChange={(e) => setFilterStatus(e.target.value as Assignment['status'] | 'all')}
            >
              <SelectMenuItem value="all">All</SelectMenuItem>
              <SelectMenuItem value="pending">Pending</SelectMenuItem>
              <SelectMenuItem value="submitted">Submitted</SelectMenuItem>
              <SelectMenuItem value="graded">Graded</SelectMenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'center', md: 'flex-end' } }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAssignmentDialogOpen(true)}
              size={isMobile ? "small" : "medium"}
            >
              New Assignment
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: 'repeat(2, 1fr)', 
          sm: 'repeat(4, 1fr)' 
        }, 
        gap: 2, 
        mb: 4 
      }}>
        {[
          { label: 'Total', value: stats.total, icon: AssignmentIcon, color: 'primary.main' },
          { label: 'Pending', value: stats.pending, icon: TimerIcon, color: 'warning.main' },
          { label: 'Submitted', value: stats.submitted, icon: UploadIcon, color: 'info.main' },
          { label: 'Graded', value: stats.graded, icon: GradeIcon, color: 'success.main' },
        ].map((stat, index) => (
          <Paper key={index} sx={{ p: 2, display: 'flex', alignItems: 'center', minHeight: 80 }}>
            <Avatar sx={{ bgcolor: stat.color, mr: 2, width: 40, height: 40 }}>
              <stat.icon />
            </Avatar>
            <Box>
              <Typography variant={isMobile ? "h5" : "h4"}>{stat.value}</Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Tabs for different views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
        >
          <Tab 
            label={isMobile ? "All" : "All Assignments"} 
            icon={<AssignmentIcon />} 
            iconPosition={isMobile ? "top" : "start"}
          />
          <Tab 
            label={isMobile ? "Deadlines" : "Upcoming Deadlines"} 
            icon={<CalendarIcon />}
            iconPosition={isMobile ? "top" : "start"}
          />
          <Tab 
            label={isMobile ? "Activity" : "Recent Activity"} 
            icon={<NotificationsIcon />}
            iconPosition={isMobile ? "top" : "start"}
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Box>
          {filteredAssignments.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No assignments found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first assignment to get started'
                }
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                lg: 'repeat(3, 1fr)' 
              }, 
              gap: 3 
            }}>
              {filteredAssignments.map((assignment) => (
                <AssignmentCard 
                  key={assignment.id}
                  assignment={assignment}
                  onEdit={handleEditClick}
                  onSubmit={handleSubmitClick}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </Box>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Upcoming Deadlines
          </Typography>
          {upcomingDeadlines.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                No upcoming deadlines
              </Typography>
            </Box>
          ) : (
            <List>
              {upcomingDeadlines.map((assignment) => {
                const daysUntilDue = Math.ceil(
                  (new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <ListItem key={assignment.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <TimerIcon color={daysUntilDue <= 1 ? "error" : daysUntilDue <= 3 ? "warning" : "primary"} />
                    </ListItemIcon>
                    <ListItemText
                      primary={assignment.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" component="span">
                            {assignment.course} • Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </Typography>
                          <br />
                          <Typography 
                            variant="caption" 
                            color={daysUntilDue <= 1 ? 'error' : daysUntilDue <= 3 ? 'warning.main' : 'text.secondary'}
                          >
                            {daysUntilDue < 0 ? `Overdue by ${Math.abs(daysUntilDue)} days` :
                             daysUntilDue === 0 ? 'Due today' :
                             `${daysUntilDue} days remaining`}
                          </Typography>
                        </Box>
                      }
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleSubmitClick(assignment)}
                    >
                      Submit
                    </Button>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List>
            {assignments
              .filter(a => a.status === 'graded' || a.submittedAt)
              .slice(0, 10)
              .map((assignment, index) => (
                <ListItem key={`${assignment.id}-${index}`} sx={{ px: 0 }}>
                  <ListItemIcon>
                    {assignment.status === 'graded' ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <UploadIcon color="info" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      assignment.status === 'graded' 
                        ? `${assignment.title} graded (${assignment.grade}/100)`
                        : `${assignment.title} submitted`
                    }
                    secondary={
                      assignment.status === 'graded' 
                        ? "Recently graded"
                        : assignment.submittedAt 
                          ? `Submitted ${new Date(assignment.submittedAt).toLocaleDateString()}`
                          : "Recently submitted"
                    }
                  />
                </ListItem>
              ))}
          </List>
        </Paper>
      )}

      {/* Dialogs */}
      <AssignmentDialog
        open={assignmentDialogOpen}
        onClose={() => {
          setAssignmentDialogOpen(false);
          setEditingAssignment(undefined);
        }}
        onSubmit={editingAssignment ? handleEditAssignment : handleCreateAssignment}
        assignment={editingAssignment}
      />

      {submittingAssignment && (
        <SubmissionDialog
          open={submissionDialogOpen}
          onClose={() => {
            setSubmissionDialogOpen(false);
            setSubmittingAssignment(undefined);
          }}
          assignment={submittingAssignment}
          onSubmit={handleSubmitAssignment}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button - only on mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setAssignmentDialogOpen(true)}
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' });

  const handleFeatureClick = (feature: any) => {
    setSelectedFeature(feature);
    setFeatureDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box sx={{ my: { xs: 4, sm: 6 }, textAlign: 'center' }}>
        <SchoolIcon sx={{ 
          fontSize: { xs: 60, sm: 80 }, 
          color: 'primary.main', 
          mb: 2 
        }} />
        <Typography 
          variant={isMobile ? "h3" : "h2"} 
          component="h1" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '2rem', sm: '3rem', md: '3.75rem' },
            fontWeight: 'bold'
          }}
        >
          Classroom Assignment Portal
        </Typography>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          component="h2" 
          gutterBottom 
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Streamline your educational assignment management
        </Typography>
        <Typography 
          variant="body1" 
          paragraph 
          sx={{ 
            maxWidth: { xs: '100%', sm: 600 }, 
            mx: 'auto', 
            mb: 4,
            fontSize: { xs: '1rem', sm: '1.125rem' },
            lineHeight: 1.6
          }}
        >
          A comprehensive platform for teachers to create and manage assignments, 
          and for students to submit work, track deadlines, and collaborate effectively.
        </Typography>

        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          justifyContent="center"
          sx={{ mb: 6 }}
        >
          <Button
            variant="contained"
            size={isMobile ? "medium" : "large"}
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ 
              minWidth: { xs: '100%', sm: 'auto' },
              py: { xs: 1.5, sm: 2 }
            }}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outlined"
            size={isMobile ? "medium" : "large"}
            startIcon={<PersonIcon />}
            onClick={() => setLoginDialogOpen(true)}
            sx={{ 
              minWidth: { xs: '100%', sm: 'auto' },
              py: { xs: 1.5, sm: 2 }
            }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            size={isMobile ? "medium" : "large"}
            startIcon={<SchoolIcon />}
            onClick={() => setSignupDialogOpen(true)}
            sx={{ 
              minWidth: { xs: '100%', sm: 'auto' },
              py: { xs: 1.5, sm: 2 }
            }}
          >
            Sign Up
          </Button>
        </Stack>

        {/* Feature Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)' 
          }, 
          gap: 4, 
          mt: 2 
        }}>
          {[
            {
              icon: AssignmentIcon,
              color: 'primary.main',
              title: 'Assignment Management',
              description: 'Create, organize, and track assignments with ease. Set deadlines, requirements, and grading criteria.',
              action: () => navigate('/dashboard'),
              actionText: 'Go to Dashboard'
            },
            {
              icon: UploadIcon,
              color: 'secondary.main',
              title: 'File Submissions',
              description: 'Secure file upload system with support for multiple formats. Track submission history and versions.',
              action: () => handleFeatureClick({
                title: 'File Submissions',
                content: 'Our secure file upload system supports multiple formats including PDF, DOC, DOCX, images, and archives. Features include drag-and-drop upload, file versioning, automatic virus scanning, and submission history tracking.',
                features: ['Drag & Drop Upload', 'Multiple File Formats', 'Version Control', 'Virus Scanning', 'Submission History']
              }),
              actionText: 'Learn More'
            },
            {
              icon: CalendarIcon,
              color: 'success.main',
              title: 'Calendar Integration',
              description: 'Visual calendar with deadline tracking, notifications, and export to external calendar apps.',
              action: () => handleFeatureClick({
                title: 'Calendar Integration',
                content: 'Stay organized with our integrated calendar system. View all assignment deadlines, get reminders, and sync with your favorite calendar apps like Google Calendar, Outlook, and Apple Calendar.',
                features: ['Visual Calendar View', 'Deadline Tracking', 'Smart Reminders', 'External Calendar Sync', 'Mobile Notifications']
              }),
              actionText: 'View Calendar'
            },
            {
              icon: GradeIcon,
              color: 'info.main',
              title: 'Grading System',
              description: 'Comprehensive grading tools with rubrics, feedback, and grade analytics for better assessment.',
              action: () => handleFeatureClick({
                title: 'Grading System',
                content: 'Streamline your grading process with our comprehensive tools. Create custom rubrics, provide detailed feedback, track grade analytics, and generate reports for better assessment insights.',
                features: ['Custom Rubrics', 'Detailed Feedback', 'Grade Analytics', 'Progress Reports', 'Bulk Grading']
              }),
              actionText: 'Explore Grading'
            },
            {
              icon: NotificationsIcon,
              color: 'warning.main',
              title: 'Smart Notifications',
              description: 'Get timely reminders for deadlines, new assignments, and important updates via email or in-app.',
              action: () => handleFeatureClick({
                title: 'Smart Notifications',
                content: 'Never miss important deadlines with our intelligent notification system. Get customizable reminders via email, in-app notifications, and mobile push notifications.',
                features: ['Email Notifications', 'In-App Alerts', 'Mobile Push', 'Custom Reminders', 'Notification Preferences']
              }),
              actionText: 'Setup Notifications'
            },
            {
              icon: PersonIcon,
              color: 'error.main',
              title: 'User Management',
              description: 'Manage students, teachers, and classes with role-based permissions and easy enrollment.',
              action: () => handleFeatureClick({
                title: 'User Management',
                content: 'Efficiently manage your educational community with role-based access control. Handle student enrollment, teacher assignments, class organization, and permission management.',
                features: ['Role-Based Access', 'Student Enrollment', 'Class Organization', 'Permission Management', 'Bulk User Import']
              }),
              actionText: 'Manage Users'
            }
          ].map((feature, index) => (
            <Card 
              key={index}
              sx={{ 
                height: '100%', 
                textAlign: 'center', 
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                }
              }}
              onClick={feature.action}
            >
              <feature.icon sx={{ 
                fontSize: { xs: 40, sm: 48 }, 
                color: feature.color, 
                mb: 2 
              }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                {feature.title}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  flexGrow: 1,
                  lineHeight: 1.6,
                  mb: 2
                }}
              >
                {feature.description}
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                sx={{ mt: 'auto' }}
              >
                {feature.actionText}
              </Button>
            </Card>
          ))}
        </Box>

        {/* Statistics Section */}
        <Box sx={{ mt: 8, mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Trusted by Educators Worldwide
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            {[
              { 
                number: '10,000+', 
                label: 'Active Users',
                icon: PersonIcon,
                color: 'primary.main',
                description: 'Students and teachers using our platform daily'
              },
              { 
                number: '50,000+', 
                label: 'Assignments Created',
                icon: AssignmentIcon,
                color: 'secondary.main',
                description: 'Assignments successfully managed and submitted'
              },
              { 
                number: '500+', 
                label: 'Schools & Universities',
                icon: SchoolIcon,
                color: 'success.main',
                description: 'Educational institutions worldwide'
              },
              { 
                number: '99.9%', 
                label: 'Uptime',
                icon: CheckCircleIcon,
                color: 'info.main',
                description: 'Reliable service you can count on'
              }
            ].map((stat, index) => (
              <Card 
                key={index} 
                sx={{ 
                  flex: '1 1 200px', 
                  minWidth: 200,
                  maxWidth: 250,
                  textAlign: 'center',
                  p: 3,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                  }
                }}
                onClick={() => setSnackbar({ 
                  open: true, 
                  message: stat.description, 
                  severity: 'info' 
                })}
              >
                <stat.icon sx={{ 
                  fontSize: 40, 
                  color: stat.color, 
                  mb: 2 
                }} />
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: stat.color,
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    mb: 1
                  }}
                >
                  {stat.number}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stat.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click to learn more
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Testimonials Section */}
        <Box sx={{ mt: 8, mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
            What Educators Say
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
            gap: 4 
          }}>
            {[
              {
                quote: "Success is not final, failure is not fatal: it is the courage to continue that counts. Every line of code we write is a step towards building something extraordinary.",
                author: "Dr. Ritesh Patidar",
                role: "Web Developer",
                avatar: "RP"
              },
              {
                quote: "Practice like you never won, Perform like you never lost",
                author: "Dr. Dibyojyoti Bal",
                role: "Assistant Web Developer",
                avatar: "DB"
              }
            ].map((testimonial, index) => (
              <Card 
                key={index}
                className="testimonial-card"
                sx={{ 
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <Typography 
                  variant="h1" 
                  sx={{ 
                    position: 'absolute',
                    top: 10,
                    left: 20,
                    fontSize: '4rem',
                    color: 'primary.main',
                    opacity: 0.2,
                    fontFamily: 'serif'
                  }}
                >
                  "
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontStyle: 'italic',
                    lineHeight: 1.7,
                    mb: 3,
                    mt: 2
                  }}
                >
                  {testimonial.quote}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {testimonial.avatar}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {testimonial.author}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.role}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Call to Action Section */}
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            bgcolor: 'primary.main', 
            color: 'white',
            borderRadius: 3,
            mb: 4
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to Transform Your Classroom?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of educators who have streamlined their assignment management
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => setSignupDialogOpen(true)}
              sx={{ 
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' },
                minWidth: { xs: '100%', sm: 200 }
              }}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{ 
                borderColor: 'white',
                color: 'white',
                '&:hover': { 
                  borderColor: 'white', 
                  bgcolor: 'rgba(255,255,255,0.1)' 
                },
                minWidth: { xs: '100%', sm: 200 }
              }}
            >
              View Demo
            </Button>
          </Stack>
        </Paper>

        {/* Login and Signup Dialogs */}
        <LoginDialog
          open={loginDialogOpen}
          onClose={() => setLoginDialogOpen(false)}
          onSwitchToSignup={() => {
            setLoginDialogOpen(false);
            setSignupDialogOpen(true);
          }}
        />
        
        <SignupDialog
          open={signupDialogOpen}
          onClose={() => setSignupDialogOpen(false)}
          onSwitchToLogin={() => {
            setSignupDialogOpen(false);
            setLoginDialogOpen(true);
          }}
        />

        {/* Feature Detail Dialog */}
        <Dialog 
          open={featureDialogOpen} 
          onClose={() => setFeatureDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
        >
          {selectedFeature && (
            <>
              <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {selectedFeature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Discover the power of our {selectedFeature.title.toLowerCase()}
                </Typography>
              </DialogTitle>
              <DialogContent>
                <Stack spacing={3}>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {selectedFeature.content}
                  </Typography>
                  
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Key Features:
                    </Typography>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
                      gap: 1 
                    }}>
                      {selectedFeature.features?.map((feature: string, index: number) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Paper sx={{ p: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      🚀 Coming Soon!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This feature is currently in development. Sign up to be notified when it becomes available!
                    </Typography>
                  </Paper>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button onClick={() => setFeatureDialogOpen(false)}>
                  Close
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    setFeatureDialogOpen(false);
                    setSignupDialogOpen(true);
                    setSnackbar({ 
                      open: true, 
                      message: `Interest in ${selectedFeature.title} noted! Sign up to get updates.`, 
                      severity: 'info' 
                    });
                  }}
                >
                  Get Notified
                </Button>
                <Button 
                  variant="outlined"
                  onClick={() => {
                    setFeatureDialogOpen(false);
                    navigate('/dashboard');
                  }}
                >
                  Try Dashboard
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

function App() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Assignment Created', message: 'React Components Assignment is now available', time: '2 minutes ago', read: false, type: 'assignment' },
    { id: 2, title: 'Assignment Due Soon', message: 'Database Design Project due in 2 days', time: '1 hour ago', read: false, type: 'deadline' },
    { id: 3, title: 'Grade Posted', message: 'Your Algorithm Analysis Report has been graded', time: '3 hours ago', read: true, type: 'grade' },
    { id: 4, title: 'New Course Material', message: 'Lecture slides uploaded for Web Development', time: '1 day ago', read: true, type: 'material' }
  ]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <AssignmentIcon sx={{ fontSize: 20 }} />;
      case 'deadline': return <TimerIcon sx={{ fontSize: 20 }} />;
      case 'grade': return <GradeIcon sx={{ fontSize: 20 }} />;
      case 'material': return <BookIcon sx={{ fontSize: 20 }} />;
      default: return <NotificationsIcon sx={{ fontSize: 20 }} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Simulate new notifications (for demo purposes)
  React.useEffect(() => {
    const interval = setInterval(() => {
      const randomNotifications = [
        { title: 'New Assignment Available', message: 'JavaScript Fundamentals assignment has been posted', type: 'assignment' },
        { title: 'Deadline Reminder', message: 'React Project due tomorrow', type: 'deadline' },
        { title: 'Grade Updated', message: 'Your CSS Assignment has been graded', type: 'grade' },
        { title: 'Course Update', message: 'New lecture materials uploaded', type: 'material' }
      ];
      
      if (Math.random() > 0.7) { // 30% chance every 30 seconds
        const randomNotif = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        const newNotification = {
          id: Date.now(),
          title: randomNotif.title,
          message: randomNotif.message,
          time: 'Just now',
          read: false,
          type: randomNotif.type
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only 10 notifications
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const navigationItems = [
    { label: 'Home', path: '/', icon: <DashboardIcon /> },
    { label: 'Dashboard', path: '/dashboard', icon: <AssignmentIcon /> },
    { label: 'Calendar', path: '/calendar', icon: <CalendarIcon /> },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static" elevation={2}>
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleMobileMenuToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <BookIcon sx={{ mr: 2 }} />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Classroom Assignment Portal
            </Typography>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontSize: '1rem',
                display: { xs: 'block', sm: 'none' }
              }}
            >
              CAP
            </Typography>
            
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {navigationItems.map((item) => (
                  <Button 
                    key={item.path}
                    color="inherit" 
                    component={Link} 
                    to={item.path} 
                    startIcon={item.icon}
                    sx={{ minWidth: 'auto' }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}
            
            {/* Bell Icon - Always Visible on All Screen Sizes */}
            <IconButton 
              color="inherit" 
              onClick={handleNotificationMenuOpen}
              sx={{ 
                ml: 1,
                position: 'relative',
                display: 'flex', // Ensure it's always displayed
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <Badge 
                badgeContent={unreadCount} 
                color="error"
                className="notification-badge"
                sx={{
                  '& .MuiBadge-badge': {
                    animation: unreadCount > 0 ? 'notificationPulse 2s infinite' : 'none',
                    fontSize: { xs: '0.5rem', sm: '0.6rem' },
                    minWidth: { xs: 12, sm: 14 },
                    height: { xs: 12, sm: 14 },
                    top: { xs: -2, sm: 0 },
                    right: { xs: -2, sm: 0 },
                    transform: 'scale(0.75)',
                    transformOrigin: 'center',
                    border: '1px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    zIndex: 1,
                  }
                }}
              >
                <NotificationsIcon sx={{ 
                  fontSize: { xs: 24, sm: 26 },
                  transition: 'all 0.2s ease',
                  color: 'inherit',
                }} />
              </Badge>
            </IconButton>
            
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                S
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { handleMenuClose(); setLoginDialogOpen(true); }}>
                <PersonIcon sx={{ mr: 1 }} /> Login
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); setSignupDialogOpen(true); }}>
                <SchoolIcon sx={{ mr: 1 }} /> Sign Up
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleMenuClose}>
                <SettingsIcon sx={{ mr: 1 }} /> Settings
              </MenuItem>
            </Menu>

            {/* Notifications Menu */}
            <Menu
              anchorEl={notificationAnchorEl}
              open={Boolean(notificationAnchorEl)}
              onClose={handleNotificationMenuClose}
              PaperProps={{
                sx: {
                  width: { xs: '95vw', sm: 400 },
                  maxWidth: { xs: '95vw', sm: 400 },
                  maxHeight: { xs: '70vh', sm: 500 },
                  mt: 1,
                  ml: { xs: 1, sm: 0 },
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Notifications
                  </Typography>
                  {unreadCount > 0 && (
                    <Button 
                      size="small" 
                      onClick={markAllAsRead}
                      sx={{ textTransform: 'none' }}
                    >
                      Mark all read
                    </Button>
                  )}
                </Box>
                {unreadCount > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
                {notifications.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No notifications yet
                    </Typography>
                  </Box>
                ) : (
                  notifications.map((notification) => (
                    <MenuItem
                      key={notification.id}
                      onClick={() => {
                        markNotificationAsRead(notification.id);
                        handleNotificationMenuClose();
                      }}
                      sx={{
                        py: 2,
                        px: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: notification.read ? 'transparent' : 'action.hover',
                        '&:hover': {
                          backgroundColor: 'action.selected',
                        },
                        display: 'block',
                        whiteSpace: 'normal',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ 
                          color: notification.read ? 'text.secondary' : 'primary.main',
                          mt: 0.5 
                        }}>
                          {getNotificationIcon(notification.type)}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: notification.read ? 'normal' : 'bold',
                                color: notification.read ? 'text.secondary' : 'text.primary'
                              }}
                            >
                              {notification.title}
                            </Typography>
                            {!notification.read && (
                              <Box sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                backgroundColor: 'primary.main' 
                              }} />
                            )}
                          </Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              mb: 0.5
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notification.time}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Box>
              
              {notifications.length > 0 && (
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                  <Button 
                    fullWidth 
                    variant="text" 
                    onClick={handleNotificationMenuClose}
                    sx={{ textTransform: 'none' }}
                  >
                    View All Notifications
                  </Button>
                </Box>
              )}
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Mobile Navigation Drawer */}
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={handleMobileMenuToggle}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <Box sx={{ width: 250, pt: 2 }}>
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <BookIcon sx={{ mr: 1 }} />
                CAP
              </Typography>
            </Box>
            <Divider />
            <List>
              {navigationItems.map((item) => (
                <ListItemButton
                  key={item.path}
                  component={Link}
                  to={item.path}
                  onClick={handleMobileMenuToggle}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
              <Divider sx={{ my: 1 }} />
              <ListItemButton
                onClick={() => {
                  handleMobileMenuToggle();
                  setLoginDialogOpen(true);
                }}
              >
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Login" />
              </ListItemButton>
              <ListItemButton
                onClick={() => {
                  handleMobileMenuToggle();
                  setSignupDialogOpen(true);
                }}
              >
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText primary="Sign Up" />
              </ListItemButton>
            </List>
          </Box>
        </Drawer>
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>

        {/* Global Login and Signup Dialogs */}
        <LoginDialog
          open={loginDialogOpen}
          onClose={() => setLoginDialogOpen(false)}
          onSwitchToSignup={() => {
            setLoginDialogOpen(false);
            setSignupDialogOpen(true);
          }}
        />
        
        <SignupDialog
          open={signupDialogOpen}
          onClose={() => setSignupDialogOpen(false)}
          onSwitchToLogin={() => {
            setSignupDialogOpen(false);
            setLoginDialogOpen(true);
          }}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;
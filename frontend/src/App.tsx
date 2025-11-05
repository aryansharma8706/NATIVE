import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ThemeProvider, createTheme, CssBaseline, Container, AppBar, Toolbar, Typography,
  Box, Button, Card, CardContent, TextField, Alert, Snackbar, Grid, Paper,
  List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Chip, IconButton, Menu, Avatar, Tabs, Tab,
  ListItemIcon
} from '@mui/material';
import {
  School as SchoolIcon, Dashboard as DashboardIcon, Assignment as AssignmentIcon,
  Add as AddIcon, ExitToApp as LogoutIcon, Person as PersonIcon, Class as ClassIcon,
  AccountCircle as AccountCircleIcon, Grade as GradeIcon, ViewList as ViewListIcon,
  Analytics as AnalyticsIcon, CloudUpload as CloudUploadIcon, AttachFile as AttachFileIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import ClassroomDetail from './components/ClassroomDetail';
import TeacherGrading from './components/TeacherGrading';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import NotificationCenter from './components/NotificationCenter';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
axios.defaults.baseURL = API_BASE_URL;

// Theme
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

// Types
interface User {
  _id: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin';
}

interface Classroom {
  _id: string;
  name: string;
  description: string;
  subject: string;
  teacher: User;
  students: User[];
  classCode: string;
  isActive: boolean;
  attachments?: {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    uploadedAt: string;
  }[];
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  classroom: Classroom;
  teacher: User;
  dueDate: string;
  maxPoints: number;
  instructions: string;
  isPublished: boolean;
}

interface Submission {
  _id: string;
  assignment: Assignment;
  student: User;
  content: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  status: 'draft' | 'submitted' | 'graded' | 'returned';
}

// Auth Context
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Auth Provider
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user profile
      axios.get('/auth/profile')
        .then(response => setUser(response.data))
        .catch(() => logout());
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await axios.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = response.data;
    
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const register = async (userData: any) => {
    const response = await axios.post('/auth/register', userData);
    const { token: newToken, user: newUser } = response.data;
    
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Login Component
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('student');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isRegister) {
        await register({ email, password, firstName, lastName, role });
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Classroom Portal
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {isRegister && (
              <>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </Box>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select value={role} onChange={(e) => setRole(e.target.value)} label="Role">
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="teacher">Teacher</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth variant="contained" size="large">
              {isRegister ? 'Create Account' : 'Sign In'}
            </Button>
          </Box>
        </form>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

// Navigation Component
function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <SchoolIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Classroom Portal
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            <DashboardIcon sx={{ mr: 1 }} />
            Dashboard
          </Button>
          
          <Button color="inherit" onClick={() => navigate('/analytics')}>
            <AnalyticsIcon sx={{ mr: 1 }} />
            Analytics
          </Button>
          
          {user?.role === 'teacher' && (
            <Button color="inherit" onClick={() => navigate('/grading')}>
              <GradeIcon sx={{ mr: 1 }} />
              Grading
            </Button>
          )}
          
          <NotificationCenter />
          
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.firstName} {user?.lastName} ({user?.role})
          </Typography>
          <IconButton onClick={handleMenu} color="inherit">
            <AccountCircleIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

// Dashboard Component
function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Dialog states
  const [classroomDialog, setClassroomDialog] = useState(false);
  const [joinDialog, setJoinDialog] = useState(false);

  // Form states
  const [classroomForm, setClassroomForm] = useState({ name: '', description: '', subject: '' });
  const [joinCode, setJoinCode] = useState('');
  const [classroomFiles, setClassroomFiles] = useState<File[]>([]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classroomsRes, assignmentsRes, submissionsRes] = await Promise.allSettled([
        axios.get('/classrooms'),
        user?.role === 'student' ? Promise.resolve({ data: [] }) : axios.get('/assignments'),
        user?.role === 'student' ? axios.get('/submissions/my-submissions') : Promise.resolve({ data: [] })
      ]);

      if (classroomsRes.status === 'fulfilled') setClassrooms(classroomsRes.value.data);
      if (assignmentsRes.status === 'fulfilled') setAssignments(assignmentsRes.value.data);
      if (submissionsRes.status === 'fulfilled') setSubmissions(submissionsRes.value.data);
    } catch (error: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const createClassroom = async () => {
    try {
      const formData = new FormData();
      formData.append('name', classroomForm.name);
      formData.append('description', classroomForm.description);
      formData.append('subject', classroomForm.subject);
      
      // Add files to form data
      classroomFiles.forEach((file) => {
        formData.append('files', file);
      });

      await axios.post('/classrooms', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setClassroomDialog(false);
      setClassroomForm({ name: '', description: '', subject: '' });
      setClassroomFiles([]);
      loadData();
      setSnackbar({ open: true, message: 'Classroom created successfully with files!', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to create classroom', severity: 'error' });
    }
  };

  const joinClassroom = async () => {
    try {
      await axios.post('/classrooms/join', { classCode: joinCode });
      setJoinDialog(false);
      setJoinCode('');
      loadData();
      setSnackbar({ open: true, message: 'Joined classroom successfully!', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to join classroom', severity: 'error' });
    }
  };

  const createAssignment = async () => {
    try {
      await axios.post('/assignments', {
        ...assignmentForm,
        dueDate: new Date(assignmentForm.dueDate).toISOString()
      });
      setAssignmentDialog(false);
      setAssignmentForm({ title: '', description: '', classroom: '', dueDate: '', maxPoints: 100, instructions: '' });
      loadData();
      setSnackbar({ open: true, message: 'Assignment created successfully!', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to create assignment', severity: 'error' });
    }
  };

  const submitAssignment = async () => {
    if (!selectedAssignment) return;
    
    try {
      await axios.post('/submissions', {
        assignmentId: selectedAssignment._id,
        content: submissionContent
      });
      setSubmissionDialog(false);
      setSubmissionContent('');
      setSelectedAssignment(null);
      loadData();
      setSnackbar({ open: true, message: 'Assignment submitted successfully!', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to submit assignment', severity: 'error' });
    }
  };

  if (loading) return <Container><Typography>Loading...</Typography></Container>;

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Quick Actions</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {user?.role === 'teacher' && (
              <>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setClassroomDialog(true)}>
                  Create Classroom
                </Button>
                <Button variant="contained" startIcon={<AssignmentIcon />} onClick={() => setAssignmentDialog(true)}>
                  Create Assignment
                </Button>
              </>
            )}
            {user?.role === 'student' && (
              <Button variant="contained" startIcon={<ClassIcon />} onClick={() => setJoinDialog(true)}>
                Join Classroom
              </Button>
            )}
          </Box>
        </Box>

        {/* Classrooms */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>My Classrooms</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {classrooms.map((classroom) => (
                <Card sx={{ cursor: 'pointer' }} onClick={() => navigate(`/classroom/${classroom._id}`)}>
                  <CardContent>
                    <Typography variant="h6">{classroom.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {classroom.subject}
                    </Typography>
                    <Typography variant="body2">
                      Teacher: {classroom.teacher.firstName} {classroom.teacher.lastName}
                    </Typography>
                    <Chip label={`Code: ${classroom.classCode}`} size="small" sx={{ mt: 1 }} />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {classroom.students.length} students
                    </Typography>
                    <Button 
                      size="small" 
                      sx={{ mt: 1 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/classroom/${classroom._id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
            ))}
          </Box>
        </Box>

        {/* Recent Activity */}
        {user?.role === 'student' && submissions.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>My Submissions</Typography>
            <List>
              {submissions.slice(0, 5).map((submission) => (
                <ListItem key={submission._id}>
                  <ListItemText
                    primary={submission.assignment.title}
                    secondary={`Status: ${submission.status} • Submitted: ${new Date(submission.submittedAt).toLocaleDateString()}`}
                  />
                  {submission.grade && (
                    <Chip label={`Grade: ${submission.grade}`} color="success" />
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Dialogs */}
        <Dialog open={classroomDialog} onClose={() => setClassroomDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Classroom</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Classroom Name"
              value={classroomForm.name}
              onChange={(e) => setClassroomForm({ ...classroomForm, name: e.target.value })}
              margin="normal"
              placeholder="e.g., Advanced Mathematics, Web Development"
            />
            <TextField
              fullWidth
              label="Subject"
              value={classroomForm.subject}
              onChange={(e) => setClassroomForm({ ...classroomForm, subject: e.target.value })}
              margin="normal"
              placeholder="e.g., Mathematics, Computer Science"
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={classroomForm.description}
              onChange={(e) => setClassroomForm({ ...classroomForm, description: e.target.value })}
              margin="normal"
              placeholder="Describe the course objectives, requirements, and expectations..."
            />
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Course Materials (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload syllabus, course outline, reading materials, or other documents
              </Typography>
              
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main' }
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" gutterBottom>
                  Upload Course Materials
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Drag and drop files here or click to browse
                </Typography>
                
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setClassroomFiles(Array.from(e.target.files));
                    }
                  }}
                  style={{ display: 'none' }}
                  id="classroom-file-upload"
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                />
                <label htmlFor="classroom-file-upload">
                  <Button variant="outlined" component="span">
                    Choose Files
                  </Button>
                </label>
                
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Supported: PDF, DOC, DOCX, TXT, PPT, XLS (Max 10MB each)
                </Typography>
              </Box>
              
              {/* Selected Files List */}
              {classroomFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Files ({classroomFiles.length}):
                  </Typography>
                  <List dense>
                    {classroomFiles.map((file, index) => (
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
                            onClick={() => {
                              setClassroomFiles(prev => prev.filter((_, i) => i !== index));
                            }}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <AttachFileIcon />
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
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setClassroomDialog(false);
              setClassroomFiles([]);
            }}>
              Cancel
            </Button>
            <Button onClick={createClassroom} variant="contained">
              Create Classroom
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={joinDialog} onClose={() => setJoinDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Join Classroom</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Class Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              margin="normal"
              placeholder="Enter 6-character class code"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setJoinDialog(false)}>Cancel</Button>
            <Button onClick={joinClassroom} variant="contained">Join</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={assignmentDialog} onClose={() => setAssignmentDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={assignmentForm.title}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Classroom</InputLabel>
              <Select
                value={assignmentForm.classroom}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, classroom: e.target.value })}
                label="Classroom"
              >
                {classrooms.map((classroom) => (
                  <MenuItem key={classroom._id} value={classroom._id}>
                    {classroom.name} ({classroom.subject})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={assignmentForm.description}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Due Date"
              type="datetime-local"
              value={assignmentForm.dueDate}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Max Points"
              type="number"
              value={assignmentForm.maxPoints}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, maxPoints: parseInt(e.target.value) })}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignmentDialog(false)}>Cancel</Button>
            <Button onClick={createAssignment} variant="contained">Create</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

// Wrapper for ClassroomDetail to pass user prop
function ClassroomDetailWrapper() {
  const { user } = useAuth();
  return user ? <ClassroomDetail user={user} /> : <Navigate to="/login" />;
}

// Wrapper for AnalyticsDashboard to pass user role
function AnalyticsDashboardWrapper() {
  const { user } = useAuth();
  return user ? <AnalyticsDashboard userRole={user.role} /> : <Navigate to="/login" />;
}

// Main App Component
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/classroom/:id" element={
              <ProtectedRoute>
                <ClassroomDetailWrapper />
              </ProtectedRoute>
            } />
            <Route path="/grading" element={
              <ProtectedRoute>
                <TeacherGrading />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AnalyticsDashboardWrapper />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
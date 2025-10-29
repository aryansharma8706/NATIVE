import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Container, AppBar, Toolbar, Typography, Box, Button, Card, CardContent,
  CardActions, Fab, Badge, IconButton, Menu, MenuItem, Chip, Avatar, Divider,
  List, ListItem, ListItemText, ListItemIcon, Paper, Tab, Tabs
} from '@mui/material';
import {
  Add as AddIcon, Assignment as AssignmentIcon, Dashboard as DashboardIcon,
  Notifications as NotificationsIcon, Person as PersonIcon, Settings as SettingsIcon,
  CalendarToday as CalendarIcon, Upload as UploadIcon, Grade as GradeIcon,
  School as SchoolIcon, Book as BookIcon, Timer as TimerIcon, CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
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
});

// Types
interface Assignment {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  description: string;
}

// Mock data for demonstration
const mockAssignments: Assignment[] = [
  {
    id: 1,
    title: 'React Components Assignment',
    course: 'Web Development',
    dueDate: '2024-11-05',
    status: 'pending',
    description: 'Create a React component library with proper documentation'
  },
  {
    id: 2,
    title: 'Database Design Project',
    course: 'Database Systems',
    dueDate: '2024-11-10',
    status: 'submitted',
    description: 'Design and implement a normalized database schema'
  },
  {
    id: 3,
    title: 'Algorithm Analysis Report',
    course: 'Data Structures',
    dueDate: '2024-11-15',
    status: 'graded',
    description: 'Analyze time complexity of sorting algorithms'
  }
];

function AssignmentCard({ assignment }: { assignment: Assignment }) {
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

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="h3" gutterBottom>
            {assignment.title}
          </Typography>
          <Chip
            icon={getStatusIcon(assignment.status)}
            label={assignment.status.toUpperCase()}
            color={getStatusColor(assignment.status) as any}
            size="small"
          />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {assignment.course}
        </Typography>
        <Typography variant="body2" paragraph>
          {assignment.description}
        </Typography>
        <Typography variant="body2" color="primary">
          Due: {new Date(assignment.dueDate).toLocaleDateString()}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" startIcon={<AssignmentIcon />}>
          View Details
        </Button>
        {assignment.status === 'pending' && (
          <Button size="small" variant="contained" startIcon={<UploadIcon />}>
            Submit
          </Button>
        )}
        {assignment.status === 'graded' && (
          <Button size="small" startIcon={<GradeIcon />}>
            View Grade
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

function Dashboard() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Quick Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <AssignmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h4">12</Typography>
              <Typography variant="body2" color="text.secondary">
                Total Assignments
              </Typography>
            </Box>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
              <TimerIcon />
            </Avatar>
            <Box>
              <Typography variant="h4">5</Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </Box>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
              <UploadIcon />
            </Avatar>
            <Box>
              <Typography variant="h4">4</Typography>
              <Typography variant="body2" color="text.secondary">
                Submitted
              </Typography>
            </Box>
          </Paper>
        </Box>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
              <GradeIcon />
            </Avatar>
            <Box>
              <Typography variant="h4">3</Typography>
              <Typography variant="body2" color="text.secondary">
                Graded
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Tabs for different views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="All Assignments" icon={<AssignmentIcon />} />
          <Tab label="Upcoming Deadlines" icon={<CalendarIcon />} />
          <Tab label="Recent Activity" icon={<NotificationsIcon />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {mockAssignments.map((assignment) => (
            <Box key={assignment.id} sx={{ flex: '1 1 300px', minWidth: 300, maxWidth: 400 }}>
              <AssignmentCard assignment={assignment} />
            </Box>
          ))}
        </Box>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Upcoming Deadlines
          </Typography>
          <List>
            {mockAssignments
              .filter(a => a.status === 'pending')
              .map((assignment) => (
                <ListItem key={assignment.id}>
                  <ListItemIcon>
                    <TimerIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={assignment.title}
                    secondary={`Due: ${new Date(assignment.dueDate).toLocaleDateString()} - ${assignment.course}`}
                  />
                </ListItem>
              ))}
          </List>
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Algorithm Analysis Report graded"
                secondary="2 hours ago"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <UploadIcon color="info" />
              </ListItemIcon>
              <ListItemText
                primary="Database Design Project submitted"
                secondary="1 day ago"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AddIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="New assignment: React Components Assignment"
                secondary="3 days ago"
              />
            </ListItem>
          </List>
        </Paper>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}

function HomePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 6, textAlign: 'center' }}>
        <SchoolIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h2" component="h1" gutterBottom>
          Classroom Assignment Portal
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          Streamline your educational assignment management
        </Typography>
        <Typography variant="body1" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          A comprehensive platform for teachers to create and manage assignments, 
          and for students to submit work, track deadlines, and collaborate effectively.
        </Typography>

        <Box sx={{ mb: 6 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2, mb: 2 }}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<PersonIcon />}
            sx={{ mr: 2, mb: 2 }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<SchoolIcon />}
            sx={{ mb: 2 }}
          >
            Sign Up
          </Button>
        </Box>

        {/* Feature Cards */}
        <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 300, maxWidth: 350 }}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <AssignmentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Assignment Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create, organize, and track assignments with ease. Set deadlines, 
                requirements, grading criteria.
              </Typography>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300, maxWidth: 350 }}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <UploadIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                File Submissions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Secure file upload system with support for multiple formats. 
                Track submission history and versions.
              </Typography>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300, maxWidth: 350 }}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <CalendarIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Calendar Integration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visual calendar with deadline tracking, notifications, 
                and export to external calendar apps.
              </Typography>
            </Card>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

function App() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <BookIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Classroom Assignment Portal
            </Typography>
            
            <Button color="inherit" component={Link} to="/" startIcon={<DashboardIcon />}>
              Home
            </Button>
            <Button color="inherit" component={Link} to="/dashboard" startIcon={<AssignmentIcon />}>
              Dashboard
            </Button>
            <Button color="inherit" startIcon={<CalendarIcon />}>
              Calendar
            </Button>
            
            <IconButton color="inherit" sx={{ ml: 1 }}>
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
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
              <MenuItem onClick={handleMenuClose}>
                <PersonIcon sx={{ mr: 1 }} /> Profile
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <SettingsIcon sx={{ mr: 1 }} /> Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Box, Button, Card, CardContent,
  List, ListItem, ListItemText, Avatar, Chip, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Grid
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, Add as AddIcon, People as PeopleIcon,
  Assignment as AssignmentIcon, School as SchoolIcon
} from '@mui/icons-material';
import AssignmentList from './AssignmentList';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Classroom {
  _id: string;
  name: string;
  description: string;
  subject: string;
  teacher: User;
  students: User[];
  classCode: string;
}

interface ClassroomDetailProps {
  user: User;
}

export default function ClassroomDetail({ user }: ClassroomDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [assignmentDialog, setAssignmentDialog] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxPoints: 100,
    instructions: ''
  });

  useEffect(() => {
    if (id) {
      loadClassroom();
    }
  }, [id]);

  const loadClassroom = async () => {
    try {
      const response = await axios.get(`/classrooms/${id}`);
      setClassroom(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load classroom');
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async () => {
    try {
      const response = await axios.post('/assignments', {
        ...assignmentForm,
        classroom: id,
        dueDate: new Date(assignmentForm.dueDate).toISOString()
      });
      
      // Auto-publish the assignment so students can see it immediately
      await axios.patch(`/assignments/${response.data.assignment._id}/publish`, {
        isPublished: true
      });
      
      setAssignmentDialog(false);
      setAssignmentForm({
        title: '',
        description: '',
        dueDate: '',
        maxPoints: 100,
        instructions: ''
      });
      
      alert('Assignment created and published successfully! Students can now see it.');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create assignment');
    }
  };

  if (loading) return <Container><CircularProgress /></Container>;
  if (error) return <Container><Alert severity="error">{error}</Alert></Container>;
  if (!classroom) return <Container><Alert severity="error">Classroom not found</Alert></Container>;

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" gutterBottom>
              {classroom.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {classroom.subject}
            </Typography>
            <Typography variant="body1" paragraph>
              {classroom.description}
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <Chip 
                icon={<SchoolIcon />}
                label={`Class Code: ${classroom.classCode}`} 
                color="primary" 
              />
              <Typography variant="body2">
                Teacher: {classroom.teacher.firstName} {classroom.teacher.lastName}
              </Typography>
            </Box>
          </Box>
          
          {user.role === 'teacher' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAssignmentDialog(true)}
            >
              Create Assignment
            </Button>
          )}
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Assignments" icon={<AssignmentIcon />} />
        <Tab label="Students" icon={<PeopleIcon />} />
      </Tabs>

      {tabValue === 0 && (
        <AssignmentList classroomId={classroom._id} userRole={user.role} />
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Students ({classroom.students.length})
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {classroom.students.map((student) => (
              <Card key={student._id}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar>
                      {student.firstName[0]}{student.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        {student.firstName} {student.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {student.email}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Create Assignment Dialog */}
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
            label="Instructions"
            multiline
            rows={4}
            value={assignmentForm.instructions}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
            margin="normal"
          />
          <Box display="flex" gap={2} mt={2}>
            <TextField
              label="Due Date"
              type="datetime-local"
              value={assignmentForm.dueDate}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Max Points"
              type="number"
              value={assignmentForm.maxPoints}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, maxPoints: parseInt(e.target.value) })}
              sx={{ flex: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentDialog(false)}>Cancel</Button>
          <Button onClick={createAssignment} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
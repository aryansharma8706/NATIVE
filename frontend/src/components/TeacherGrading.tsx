import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, Box, Card, CardContent, Button, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  List, ListItem, ListItemText, Chip, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Divider
} from '@mui/material';
import {
  Grade as GradeIcon, Assignment as AssignmentIcon,
  Person as PersonIcon, Schedule as ScheduleIcon
} from '@mui/icons-material';

interface Assignment {
  _id: string;
  title: string;
  maxPoints: number;
  classroom: {
    name: string;
    subject: string;
  };
}

interface Submission {
  _id: string;
  content: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  status: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignment: Assignment;
}

export default function TeacherGrading() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeDialog, setGradeDialog] = useState(false);
  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    if (selectedAssignment) {
      loadSubmissions();
    }
  }, [selectedAssignment]);

  const loadAssignments = async () => {
    try {
      // This would need to be implemented in the backend to get teacher's assignments
      const classrooms = await axios.get('/classrooms');
      const allAssignments: Assignment[] = [];
      
      for (const classroom of classrooms.data) {
        const assignmentRes = await axios.get(`/assignments/classroom/${classroom._id}`);
        allAssignments.push(...assignmentRes.data);
      }
      
      setAssignments(allAssignments);
    } catch (error) {
      console.error('Failed to load assignments');
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/submissions/assignment/${selectedAssignment}`);
      setSubmissions(response.data);
    } catch (error) {
      console.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async () => {
    if (!selectedSubmission) return;
    
    try {
      await axios.patch(`/submissions/${selectedSubmission._id}/grade`, {
        grade,
        feedback
      });
      
      setGradeDialog(false);
      setGrade(0);
      setFeedback('');
      setSelectedSubmission(null);
      loadSubmissions();
      
      alert('Submission graded successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to grade submission');
    }
  };

  const openGradeDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade || 0);
    setFeedback(submission.feedback || '');
    setGradeDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'info';
      case 'graded': return 'success';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Grade Submissions
      </Typography>

      <Box sx={{ mb: 4 }}>
        <FormControl fullWidth>
          <InputLabel>Select Assignment</InputLabel>
          <Select
            value={selectedAssignment}
            onChange={(e) => setSelectedAssignment(e.target.value)}
            label="Select Assignment"
          >
            {assignments.map((assignment) => (
              <MenuItem key={assignment._id} value={assignment._id}>
                {assignment.title} - {assignment.classroom.name} ({assignment.maxPoints} pts)
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedAssignment && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Submissions ({submissions.length})
          </Typography>
          
          {loading ? (
            <CircularProgress />
          ) : submissions.length === 0 ? (
            <Alert severity="info">No submissions found for this assignment.</Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {submissions.map((submission) => (
                <Card key={submission._id}>
                  <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                          <Box display="flex" alignItems="center" gap={2} mb={1}>
                            <PersonIcon />
                            <Typography variant="h6">
                              {submission.student.firstName} {submission.student.lastName}
                            </Typography>
                            <Chip 
                              label={submission.status.toUpperCase()} 
                              color={getStatusColor(submission.status) as any}
                              size="small"
                            />
                            {submission.grade !== undefined && (
                              <Chip 
                                label={`${submission.grade}/${submission.assignment.maxPoints}`}
                                color="success"
                                size="small"
                              />
                            )}
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {submission.student.email}
                          </Typography>
                          
                          <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <ScheduleIcon fontSize="small" />
                            <Typography variant="body2">
                              Submitted: {new Date(submission.submittedAt).toLocaleString()}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body1" paragraph>
                            <strong>Submission:</strong>
                          </Typography>
                          <Box 
                            sx={{ 
                              p: 2, 
                              bgcolor: 'grey.50', 
                              borderRadius: 1, 
                              mb: 2,
                              maxHeight: 200,
                              overflow: 'auto'
                            }}
                          >
                            <Typography variant="body2">
                              {submission.content}
                            </Typography>
                          </Box>
                          
                          {submission.feedback && (
                            <Box>
                              <Typography variant="body1" gutterBottom>
                                <strong>Feedback:</strong>
                              </Typography>
                              <Alert severity="info">
                                {submission.feedback}
                              </Alert>
                            </Box>
                          )}
                        </Box>
                        
                        <Box>
                          <Button
                            variant="contained"
                            startIcon={<GradeIcon />}
                            onClick={() => openGradeDialog(submission)}
                          >
                            {submission.grade !== undefined ? 'Update Grade' : 'Grade'}
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Grading Dialog */}
      <Dialog open={gradeDialog} onClose={() => setGradeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Grade Submission
        </DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Student: {selectedSubmission.student.firstName} {selectedSubmission.student.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Max Points: {selectedSubmission.assignment.maxPoints}
              </Typography>
              
              <TextField
                fullWidth
                label="Grade"
                type="number"
                value={grade}
                onChange={(e) => setGrade(parseInt(e.target.value))}
                inputProps={{ 
                  min: 0, 
                  max: selectedSubmission.assignment.maxPoints 
                }}
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Feedback"
                multiline
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback to the student..."
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialog(false)}>Cancel</Button>
          <Button onClick={handleGrade} variant="contained">
            Save Grade
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
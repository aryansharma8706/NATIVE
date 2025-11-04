import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card, CardContent, Typography, Button, Grid, Chip, Box,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, CircularProgress, List, ListItem, ListItemText, Switch,
  FormControlLabel
} from '@mui/material';
import {
  Assignment as AssignmentIcon, Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon, Upload as UploadIcon,
  Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  instructions: string;
  isPublished: boolean;
  classroom: {
    _id: string;
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
}

interface AssignmentListProps {
  classroomId: string;
  userRole: string;
}

export default function AssignmentList({ classroomId, userRole }: AssignmentListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<{ [key: string]: Submission }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionDialog, setSubmissionDialog] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const togglePublish = async (assignmentId: string, currentStatus: boolean) => {
    try {
      await axios.patch(`/assignments/${assignmentId}/publish`, {
        isPublished: !currentStatus
      });
      
      // Reload assignments to reflect the change
      loadAssignments();
      
      alert(`Assignment ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update assignment status');
    }
  };

  useEffect(() => {
    loadAssignments();
    if (userRole === 'student') {
      loadSubmissions();
    }
  }, [classroomId]);

  const loadAssignments = async () => {
    try {
      const response = await axios.get(`/assignments/classroom/${classroomId}`);
      setAssignments(response.data);
    } catch (error: any) {
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const response = await axios.get('/submissions/my-submissions');
      const submissionMap: { [key: string]: Submission } = {};
      response.data.forEach((sub: any) => {
        submissionMap[sub.assignment._id] = sub;
      });
      setSubmissions(submissionMap);
    } catch (error) {
      console.error('Failed to load submissions');
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;
    
    setSubmitting(true);
    try {
      await axios.post('/submissions', {
        assignmentId: selectedAssignment._id,
        content: submissionContent
      });
      
      setSubmissionDialog(false);
      setSubmissionContent('');
      setSelectedAssignment(null);
      loadSubmissions();
      
      alert('Assignment submitted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChip = (assignment: Assignment) => {
    const submission = submissions[assignment._id];
    const isOverdue = new Date() > new Date(assignment.dueDate);
    
    if (submission) {
      if (submission.grade !== undefined) {
        return <Chip label={`Graded: ${submission.grade}/${assignment.maxPoints}`} color="success" size="small" />;
      }
      return <Chip label="Submitted" color="info" size="small" />;
    }
    
    if (isOverdue) {
      return <Chip label="Overdue" color="error" size="small" />;
    }
    
    return <Chip label="Pending" color="warning" size="small" />;
  };

  const getDaysRemaining = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Assignments
      </Typography>
      
      {assignments.length === 0 ? (
        <Alert severity="info">No assignments found for this classroom.</Alert>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          {assignments.map((assignment) => {
            const daysRemaining = getDaysRemaining(assignment.dueDate);
            const submission = submissions[assignment._id];
            
            return (
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h6" component="h3">
                        {assignment.title}
                      </Typography>
                      {userRole === 'student' && getStatusChip(assignment)}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {assignment.description}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <ScheduleIcon fontSize="small" />
                      <Typography variant="body2">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="primary">
                      Max Points: {assignment.maxPoints}
                    </Typography>
                    
                    {/* Show publish status */}
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      {assignment.isPublished ? (
                        <Chip 
                          icon={<VisibilityIcon />}
                          label="Published" 
                          color="success" 
                          size="small" 
                        />
                      ) : (
                        <Chip 
                          icon={<VisibilityOffIcon />}
                          label="Draft" 
                          color="warning" 
                          size="small" 
                        />
                      )}
                      
                      {/* Teacher can toggle publish status */}
                      {userRole === 'teacher' && (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={assignment.isPublished}
                              onChange={() => togglePublish(assignment._id, assignment.isPublished)}
                              size="small"
                            />
                          }
                          label={assignment.isPublished ? "Published" : "Draft"}
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                    
                    {daysRemaining >= 0 && (
                      <Typography 
                        variant="caption" 
                        color={daysRemaining <= 1 ? 'error' : daysRemaining <= 3 ? 'warning.main' : 'text.secondary'}
                      >
                        {daysRemaining === 0 ? 'Due today' : `${daysRemaining} days remaining`}
                      </Typography>
                    )}
                    
                    {userRole === 'student' && (
                      <Box mt={2}>
                        {submission ? (
                          <Box>
                            <Typography variant="body2" gutterBottom>
                              Submitted: {new Date(submission.submittedAt).toLocaleString()}
                            </Typography>
                            {submission.feedback && (
                              <Alert severity="info" sx={{ mt: 1 }}>
                                <strong>Feedback:</strong> {submission.feedback}
                              </Alert>
                            )}
                          </Box>
                        ) : (
                          <Button
                            variant="contained"
                            startIcon={<UploadIcon />}
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setSubmissionDialog(true);
                            }}
                            disabled={daysRemaining < 0}
                          >
                            Submit Assignment
                          </Button>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
            );
          })}
        </Box>
      )}

      {/* Submission Dialog */}
      <Dialog open={submissionDialog} onClose={() => setSubmissionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Submit Assignment: {selectedAssignment?.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            {selectedAssignment?.instructions}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Your Submission"
            value={submissionContent}
            onChange={(e) => setSubmissionContent(e.target.value)}
            placeholder="Enter your assignment submission here..."
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmissionDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!submissionContent.trim() || submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
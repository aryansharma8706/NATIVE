import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, Box, Card, CardContent, Grid, Paper,
  CircularProgress, Alert, Chip, List, ListItem, ListItemText,
  LinearProgress, Avatar, Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon, Assignment as AssignmentIcon,
  People as PeopleIcon, Grade as GradeIcon, Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon, PendingActions as PendingIcon
} from '@mui/icons-material';

interface DashboardData {
  overview: {
    totalClassrooms?: number;
    totalStudents?: number;
    totalAssignments: number;
    publishedAssignments?: number;
    draftAssignments?: number;
    submittedAssignments?: number;
    gradedAssignments?: number;
    pendingAssignments?: number;
    totalSubmissions?: number;
    gradedSubmissions?: number;
    pendingGrading?: number;
    averageGrade?: number;
  };
  recentActivity?: any[];
  upcomingDeadlines?: any[];
  recentGrades?: any[];
  gradeStatistics?: {
    averageGrade: number;
    totalGraded: number;
    grades: number[];
  };
  classrooms?: any[];
  gradeDistribution?: number[];
}

interface AnalyticsDashboardProps {
  userRole: string;
}

export default function AnalyticsDashboard({ userRole }: AnalyticsDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [userRole]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const endpoint = userRole === 'teacher' ? '/analytics/teacher-dashboard' : '/analytics/student-dashboard';
      const response = await axios.get(endpoint);
      setData(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: number, maxPoints: number = 100) => {
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'info';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  const StatCard = ({ title, value, icon, color = 'primary' }: any) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" color={`${color}.main`}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) return <Container><CircularProgress /></Container>;
  if (error) return <Container><Alert severity="error">{error}</Alert></Container>;
  if (!data) return <Container><Alert severity="info">No data available</Alert></Container>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {userRole === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}
      </Typography>

      {/* Overview Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {userRole === 'teacher' ? (
          <>
            <StatCard
              title="Total Classrooms"
              value={data.overview.totalClassrooms || 0}
              icon={<PeopleIcon />}
              color="primary"
            />
            <StatCard
              title="Total Students"
              value={data.overview.totalStudents || 0}
              icon={<PeopleIcon />}
              color="info"
            />
            <StatCard
              title="Published Assignments"
              value={data.overview.publishedAssignments || 0}
              icon={<AssignmentIcon />}
              color="success"
            />
            <StatCard
              title="Pending Grading"
              value={data.overview.pendingGrading || 0}
              icon={<PendingIcon />}
              color="warning"
            />
          </>
        ) : (
          <>
            <StatCard
              title="My Classrooms"
              value={data.overview.totalClassrooms || 0}
              icon={<PeopleIcon />}
              color="primary"
            />
            <StatCard
              title="Total Assignments"
              value={data.overview.totalAssignments || 0}
              icon={<AssignmentIcon />}
              color="info"
            />
            <StatCard
              title="Submitted"
              value={data.overview.submittedAssignments || 0}
              icon={<CheckCircleIcon />}
              color="success"
            />
            <StatCard
              title="Average Grade"
              value={`${data.overview.averageGrade?.toFixed(1) || 0}%`}
              icon={<GradeIcon />}
              color="warning"
            />
          </>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
        {/* Recent Activity / Upcoming Deadlines */}
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            {userRole === 'teacher' ? 'Recent Submissions' : 'Upcoming Deadlines'}
          </Typography>
            <List sx={{ maxHeight: 320, overflow: 'auto' }}>
              {(userRole === 'teacher' ? data.recentActivity : data.upcomingDeadlines)?.map((item, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={
                      userRole === 'teacher' 
                        ? `${item.student?.firstName} ${item.student?.lastName}`
                        : item.title
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {userRole === 'teacher' 
                            ? `Assignment: ${item.assignment?.title}`
                            : `Due: ${new Date(item.dueDate).toLocaleDateString()}`
                          }
                        </Typography>
                        {userRole === 'teacher' && (
                          <Typography variant="caption" color="text.secondary">
                            Submitted: {new Date(item.submittedAt).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  {userRole === 'student' && (
                    <Chip
                      label={`${item.maxPoints} pts`}
                      size="small"
                      color="primary"
                    />
                  )}
                </ListItem>
              ))}
            </List>
        </Paper>

        {/* Grade Statistics / Recent Grades */}
        <Paper sx={{ p: 3, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            {userRole === 'teacher' ? 'Grade Statistics' : 'Recent Grades'}
          </Typography>
            
            {userRole === 'teacher' && data.gradeStatistics ? (
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h4" color="primary.main">
                    {data.gradeStatistics.averageGrade.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Class Average ({data.gradeStatistics.totalGraded} graded)
                  </Typography>
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  Grade Distribution:
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {['A (90-100%)', 'B (80-89%)', 'C (70-79%)', 'D (60-69%)', 'F (0-59%)'].map((grade, index) => {
                    const ranges = [[90, 100], [80, 89], [70, 79], [60, 69], [0, 59]];
                    const count = data.gradeStatistics!.grades.filter(g => 
                      g >= ranges[index][0] && g <= ranges[index][1]
                    ).length;
                    const percentage = data.gradeStatistics!.totalGraded > 0 
                      ? (count / data.gradeStatistics!.totalGraded) * 100 
                      : 0;
                    
                    return (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">{grade}</Typography>
                          <Typography variant="body2">{count} students</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ) : (
              <List sx={{ maxHeight: 320, overflow: 'auto' }}>
                {data.recentGrades?.map((grade, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={grade.assignment?.title}
                      secondary={`Submitted: ${new Date(grade.submittedAt).toLocaleDateString()}`}
                    />
                    <Chip
                      label={`${grade.grade}/${grade.assignment?.maxPoints}`}
                      color={getGradeColor(grade.grade, grade.assignment?.maxPoints) as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            )}
        </Paper>
      </Box>

      {/* Progress Overview */}
      {userRole === 'student' && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Assignment Progress
          </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Box textAlign="center">
                  <Typography variant="h3" color="success.main">
                    {data.overview.submittedAssignments || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Submitted
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h3" color="info.main">
                    {data.overview.gradedAssignments || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Graded
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h3" color="warning.main">
                    {data.overview.pendingAssignments || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
              </Box>
        </Paper>
      )}
    </Container>
  );
}
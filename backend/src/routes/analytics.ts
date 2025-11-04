import express from 'express';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import Classroom from '../models/Classroom';
import User from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get dashboard analytics for teachers
router.get('/teacher-dashboard', authenticate, authorize('teacher', 'admin'), async (req: AuthRequest, res) => {
  try {
    const teacherId = req.user!._id;

    // Get teacher's classrooms
    const classrooms = await Classroom.find({ teacher: teacherId, isActive: true });
    const classroomIds = classrooms.map(c => c._id);

    // Get assignments statistics
    const totalAssignments = await Assignment.countDocuments({ teacher: teacherId });
    const publishedAssignments = await Assignment.countDocuments({ teacher: teacherId, isPublished: true });
    const draftAssignments = totalAssignments - publishedAssignments;

    // Get submissions statistics
    const assignments = await Assignment.find({ teacher: teacherId });
    const assignmentIds = assignments.map(a => a._id);
    
    const totalSubmissions = await Submission.countDocuments({ assignment: { $in: assignmentIds } });
    const gradedSubmissions = await Submission.countDocuments({ 
      assignment: { $in: assignmentIds }, 
      grade: { $exists: true } 
    });
    const pendingGrading = totalSubmissions - gradedSubmissions;

    // Get recent activity
    const recentSubmissions = await Submission.find({ assignment: { $in: assignmentIds } })
      .populate('student', 'firstName lastName email')
      .populate('assignment', 'title')
      .sort({ submittedAt: -1 })
      .limit(10);

    // Get upcoming deadlines
    const upcomingAssignments = await Assignment.find({
      teacher: teacherId,
      isPublished: true,
      dueDate: { $gte: new Date() }
    })
      .populate('classroom', 'name')
      .sort({ dueDate: 1 })
      .limit(5);

    // Grade distribution
    const gradeStats = await Submission.aggregate([
      { $match: { assignment: { $in: assignmentIds }, grade: { $exists: true } } },
      {
        $group: {
          _id: null,
          averageGrade: { $avg: '$grade' },
          totalGraded: { $sum: 1 },
          grades: { $push: '$grade' }
        }
      }
    ]);

    res.json({
      overview: {
        totalClassrooms: classrooms.length,
        totalStudents: classrooms.reduce((sum, c) => sum + c.students.length, 0),
        totalAssignments,
        publishedAssignments,
        draftAssignments,
        totalSubmissions,
        gradedSubmissions,
        pendingGrading
      },
      recentActivity: recentSubmissions,
      upcomingDeadlines: upcomingAssignments,
      gradeStatistics: gradeStats[0] || { averageGrade: 0, totalGraded: 0, grades: [] }
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
});

// Get dashboard analytics for students
router.get('/student-dashboard', authenticate, authorize('student'), async (req: AuthRequest, res) => {
  try {
    const studentId = req.user!._id;

    // Get student's classrooms
    const classrooms = await Classroom.find({ students: studentId, isActive: true })
      .populate('teacher', 'firstName lastName');

    // Get assignments for student
    const classroomIds = classrooms.map(c => c._id);
    const assignments = await Assignment.find({
      classroom: { $in: classroomIds },
      isPublished: true
    });

    const assignmentIds = assignments.map(a => a._id);

    // Get submission statistics
    const submissions = await Submission.find({ student: studentId, assignment: { $in: assignmentIds } });
    const submissionMap = new Map(submissions.map(s => [s.assignment.toString(), s]));

    const totalAssignments = assignments.length;
    const submittedCount = submissions.length;
    const gradedCount = submissions.filter(s => s.grade !== undefined).length;
    const pendingCount = totalAssignments - submittedCount;

    // Upcoming deadlines
    const upcomingAssignments = assignments
      .filter(a => {
        const hasSubmission = submissionMap.has(a._id.toString());
        return !hasSubmission && new Date(a.dueDate) >= new Date();
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);

    // Recent grades
    const recentGrades = submissions
      .filter(s => s.grade !== undefined)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    // Grade statistics
    const grades = submissions.filter(s => s.grade !== undefined).map(s => s.grade!);
    const averageGrade = grades.length > 0 ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length : 0;

    res.json({
      overview: {
        totalClassrooms: classrooms.length,
        totalAssignments,
        submittedAssignments: submittedCount,
        gradedAssignments: gradedCount,
        pendingAssignments: pendingCount,
        averageGrade: Math.round(averageGrade * 100) / 100
      },
      classrooms,
      upcomingDeadlines: upcomingAssignments,
      recentGrades: await Submission.populate(recentGrades, { path: 'assignment', select: 'title maxPoints' }),
      gradeDistribution: grades
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
});

// Get classroom analytics
router.get('/classroom/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const classroomId = req.params.id;
    const user = req.user!;

    // Verify access to classroom
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    const hasAccess = 
      user.role === 'admin' ||
      classroom.teacher.toString() === user._id.toString() ||
      classroom.students.some(studentId => studentId.toString() === user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this classroom' });
    }

    // Get assignments for this classroom
    const assignments = await Assignment.find({ classroom: classroomId });
    const assignmentIds = assignments.map(a => a._id);

    // Get submissions for these assignments
    const submissions = await Submission.find({ assignment: { $in: assignmentIds } })
      .populate('student', 'firstName lastName')
      .populate('assignment', 'title maxPoints');

    // Calculate statistics
    const totalAssignments = assignments.length;
    const publishedAssignments = assignments.filter(a => a.isPublished).length;
    const totalSubmissions = submissions.length;
    const gradedSubmissions = submissions.filter(s => s.grade !== undefined).length;

    // Student performance
    const studentStats = classroom.students.map(studentId => {
      const studentSubmissions = submissions.filter(s => s.student._id.toString() === studentId.toString());
      const grades = studentSubmissions.filter(s => s.grade !== undefined).map(s => s.grade!);
      const averageGrade = grades.length > 0 ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length : 0;

      return {
        studentId,
        submissionsCount: studentSubmissions.length,
        averageGrade: Math.round(averageGrade * 100) / 100,
        completionRate: publishedAssignments > 0 ? (studentSubmissions.length / publishedAssignments) * 100 : 0
      };
    });

    // Assignment statistics
    const assignmentStats = assignments.map(assignment => {
      const assignmentSubmissions = submissions.filter(s => s.assignment._id.toString() === assignment._id.toString());
      const grades = assignmentSubmissions.filter(s => s.grade !== undefined).map(s => s.grade!);
      const averageGrade = grades.length > 0 ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length : 0;

      return {
        assignmentId: assignment._id,
        title: assignment.title,
        submissionsCount: assignmentSubmissions.length,
        averageGrade: Math.round(averageGrade * 100) / 100,
        submissionRate: classroom.students.length > 0 ? (assignmentSubmissions.length / classroom.students.length) * 100 : 0
      };
    });

    res.json({
      classroom: {
        _id: classroom._id,
        name: classroom.name,
        subject: classroom.subject,
        studentsCount: classroom.students.length
      },
      overview: {
        totalAssignments,
        publishedAssignments,
        totalSubmissions,
        gradedSubmissions,
        averageClassGrade: studentStats.reduce((sum, s) => sum + s.averageGrade, 0) / studentStats.length || 0
      },
      studentPerformance: studentStats,
      assignmentStatistics: assignmentStats
    });
  } catch (error) {
    console.error('Classroom analytics error:', error);
    res.status(500).json({ message: 'Failed to load classroom analytics' });
  }
});

export default router;
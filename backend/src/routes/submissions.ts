import express from 'express';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import Classroom from '../models/Classroom';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Submit assignment (students only)
router.post('/', authenticate, authorize('student'), async (req: AuthRequest, res) => {
  try {
    const { assignmentId, content } = req.body;
    const studentId = req.user!._id;

    const assignment = await Assignment.findById(assignmentId).populate('classroom');
    if (!assignment || !assignment.isPublished) {
      return res.status(404).json({ message: 'Assignment not found or not published' });
    }

    // Check if student is enrolled in the classroom
    const classroom = await Classroom.findById(assignment.classroom._id);
    if (!classroom || !classroom.students.some(id => id.toString() === studentId.toString())) {
      return res.status(403).json({ message: 'You are not enrolled in this classroom' });
    }

    // Check if assignment is past due
    const isLate = new Date() > assignment.dueDate;

    // Check if submission already exists
    let submission = await Submission.findOne({ assignment: assignmentId, student: studentId });
    
    if (submission) {
      // Update existing submission
      submission.content = content;
      submission.submittedAt = new Date();
      submission.isLate = isLate;
      submission.status = 'submitted';
    } else {
      // Create new submission
      submission = new Submission({
        assignment: assignmentId,
        student: studentId,
        content,
        isLate,
        status: 'submitted'
      });
    }

    await submission.save();
    await submission.populate('student', 'firstName lastName email');

    res.json({
      message: 'Assignment submitted successfully',
      submission
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error submitting assignment' });
  }
});

// Get submissions for an assignment (teachers only)
router.get('/assignment/:assignmentId', authenticate, authorize('teacher', 'admin'), async (req: AuthRequest, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if teacher owns this assignment
    if (assignment.teacher.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied to this assignment' });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'firstName lastName email')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error fetching submissions' });
  }
});

// Get student's own submissions
router.get('/my-submissions', authenticate, authorize('student'), async (req: AuthRequest, res) => {
  try {
    const studentId = req.user!._id;
    
    const submissions = await Submission.find({ student: studentId })
      .populate('assignment', 'title dueDate maxPoints')
      .populate({
        path: 'assignment',
        populate: {
          path: 'classroom',
          select: 'name subject'
        }
      })
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ message: 'Server error fetching submissions' });
  }
});

// Grade submission (teachers only)
router.patch('/:id/grade', authenticate, authorize('teacher', 'admin'), async (req: AuthRequest, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findById(req.params.id).populate('assignment');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const assignment = await Assignment.findById(submission.assignment._id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if teacher owns this assignment
    if (assignment.teacher.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied to grade this submission' });
    }

    // Validate grade
    if (grade < 0 || grade > assignment.maxPoints) {
      return res.status(400).json({ 
        message: `Grade must be between 0 and ${assignment.maxPoints}` 
      });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';
    
    await submission.save();
    await submission.populate('student', 'firstName lastName email');

    res.json({
      message: 'Submission graded successfully',
      submission
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Server error grading submission' });
  }
});

export default router;
import express from 'express';
import Assignment from '../models/Assignment';
import Classroom from '../models/Classroom';
import Submission from '../models/Submission';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all assignments for current teacher
router.get('/my-assignments', authenticate, authorize('teacher', 'admin'), async (req: AuthRequest, res) => {
  try {
    const teacherId = req.user!._id;
    
    const assignments = await Assignment.find({ teacher: teacherId })
      .populate('classroom', 'name subject')
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    console.error('Get teacher assignments error:', error);
    res.status(500).json({ message: 'Server error fetching assignments' });
  }
});

// Get all assignments for a classroom
router.get('/classroom/:classroomId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { classroomId } = req.params;
    const user = req.user!;

    // Check if user has access to this classroom
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

    let assignments;
    if (user.role === 'student') {
      // Students only see published assignments
      assignments = await Assignment.find({ classroom: classroomId, isPublished: true })
        .populate('teacher', 'firstName lastName')
        .sort({ dueDate: 1 });
    } else {
      // Teachers see all assignments
      assignments = await Assignment.find({ classroom: classroomId })
        .populate('teacher', 'firstName lastName')
        .sort({ createdAt: -1 });
    }

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error fetching assignments' });
  }
});

// Create new assignment (teachers only)
router.post('/', authenticate, authorize('teacher', 'admin'), async (req: AuthRequest, res) => {
  try {
    const { title, description, classroom, dueDate, maxPoints, instructions } = req.body;
    const teacher = req.user!._id;

    // Verify teacher has access to this classroom
    const classroomDoc = await Classroom.findById(classroom);
    if (!classroomDoc) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    if (classroomDoc.teacher.toString() !== teacher.toString() && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied to this classroom' });
    }

    const assignment = new Assignment({
      title,
      description,
      classroom,
      teacher,
      dueDate: new Date(dueDate),
      maxPoints,
      instructions
    });

    await assignment.save();
    await assignment.populate('teacher', 'firstName lastName');

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error creating assignment' });
  }
});

// Get specific assignment
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('teacher', 'firstName lastName')
      .populate('classroom', 'name subject');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check access permissions
    const user = req.user!;
    const classroom = await Classroom.findById(assignment.classroom._id);
    
    const hasAccess = 
      user.role === 'admin' ||
      assignment.teacher._id.toString() === user._id.toString() ||
      (classroom && classroom.students.some(studentId => studentId.toString() === user._id.toString()) && assignment.isPublished);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this assignment' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Server error fetching assignment' });
  }
});

// Publish/unpublish assignment (teachers only)
router.patch('/:id/publish', authenticate, authorize('teacher', 'admin'), async (req: AuthRequest, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if teacher owns this assignment
    if (assignment.teacher.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied to this assignment' });
    }

    assignment.isPublished = req.body.isPublished !== undefined ? req.body.isPublished : !assignment.isPublished;
    await assignment.save();

    res.json({
      message: `Assignment ${assignment.isPublished ? 'published' : 'unpublished'} successfully`,
      assignment
    });
  } catch (error) {
    console.error('Publish assignment error:', error);
    res.status(500).json({ message: 'Server error updating assignment' });
  }
});

// Update assignment (teachers only)
router.put('/:id', authenticate, authorize('teacher', 'admin'), async (req: AuthRequest, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if teacher owns this assignment
    if (assignment.teacher.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied to this assignment' });
    }

    const { title, description, dueDate, maxPoints, instructions } = req.body;
    
    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.dueDate = dueDate ? new Date(dueDate) : assignment.dueDate;
    assignment.maxPoints = maxPoints || assignment.maxPoints;
    assignment.instructions = instructions || assignment.instructions;

    await assignment.save();
    await assignment.populate('teacher', 'firstName lastName');

    res.json({
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error updating assignment' });
  }
});

export default router;
import express from 'express';
import Classroom from '../models/Classroom';
import User from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all classrooms for current user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    let classrooms;

    if (user.role === 'teacher') {
      classrooms = await Classroom.find({ teacher: user._id, isActive: true })
        .populate('teacher', 'firstName lastName email')
        .populate('students', 'firstName lastName email');
    } else if (user.role === 'student') {
      classrooms = await Classroom.find({ students: user._id, isActive: true })
        .populate('teacher', 'firstName lastName email')
        .populate('students', 'firstName lastName email');
    } else {
      classrooms = await Classroom.find({ isActive: true })
        .populate('teacher', 'firstName lastName email')
        .populate('students', 'firstName lastName email');
    }

    res.json(classrooms);
  } catch (error) {
    console.error('Get classrooms error:', error);
    res.status(500).json({ message: 'Server error fetching classrooms' });
  }
});

// Create new classroom (teachers only)
router.post('/', authenticate, authorize('teacher', 'admin'), async (req: AuthRequest, res) => {
  try {
    const { name, description, subject } = req.body;
    const teacher = req.user!._id;

    const classroom = new Classroom({
      name,
      description,
      subject,
      teacher,
      classCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    });

    await classroom.save();
    await classroom.populate('teacher', 'firstName lastName email');

    res.status(201).json({
      message: 'Classroom created successfully',
      classroom
    });
  } catch (error) {
    console.error('Create classroom error:', error);
    res.status(500).json({ message: 'Server error creating classroom' });
  }
});

// Join classroom by class code (students only)
router.post('/join', authenticate, authorize('student'), async (req: AuthRequest, res) => {
  try {
    const { classCode } = req.body;
    const studentId = req.user!._id;

    const classroom = await Classroom.findOne({ classCode: classCode.toUpperCase(), isActive: true });
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found with this class code' });
    }

    // Check if student is already enrolled
    if (classroom.students.some(id => id.toString() === studentId.toString())) {
      return res.status(400).json({ message: 'You are already enrolled in this classroom' });
    }

    classroom.students.push(studentId as any);
    await classroom.save();
    await classroom.populate('teacher', 'firstName lastName email');

    res.json({
      message: 'Successfully joined classroom',
      classroom
    });
  } catch (error) {
    console.error('Join classroom error:', error);
    res.status(500).json({ message: 'Server error joining classroom' });
  }
});

// Get specific classroom
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('teacher', 'firstName lastName email')
      .populate('students', 'firstName lastName email');

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Check if user has access to this classroom
    const user = req.user!;
    const hasAccess = 
      user.role === 'admin' ||
      classroom.teacher._id.toString() === user._id.toString() ||
      classroom.students.some(student => student._id.toString() === user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to this classroom' });
    }

    res.json(classroom);
  } catch (error) {
    console.error('Get classroom error:', error);
    res.status(500).json({ message: 'Server error fetching classroom' });
  }
});

export default router;
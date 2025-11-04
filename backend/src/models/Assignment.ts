import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  _id: string;
  title: string;
  description: string;
  classroom: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  dueDate: Date;
  maxPoints: number;
  attachments: string[];
  instructions: string;
  isPublished: boolean;
  allowLateSubmissions: boolean;
  latePenalty: number;
  category: string;
  rubric: {
    criteria: string;
    points: number;
    description: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  classroom: {
    type: Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  maxPoints: {
    type: Number,
    required: true,
    min: 0
  },
  attachments: [{
    type: String
  }],
  instructions: {
    type: String,
    trim: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  allowLateSubmissions: {
    type: Boolean,
    default: true
  },
  latePenalty: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  },
  category: {
    type: String,
    enum: ['homework', 'quiz', 'exam', 'project', 'lab', 'other'],
    default: 'homework'
  },
  rubric: [{
    criteria: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IAssignment>('Assignment', assignmentSchema);
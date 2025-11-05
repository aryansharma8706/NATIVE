import mongoose, { Document, Schema } from 'mongoose';

export interface IClassroom extends Document {
  _id: string;
  name: string;
  description: string;
  subject: string;
  teacher: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  classCode: string;
  attachments: {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    uploadedAt: Date;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const classroomSchema = new Schema<IClassroom>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  classCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalname: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate unique class code before saving
classroomSchema.pre('save', function(next) {
  if (!this.classCode) {
    this.classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

export default mongoose.model<IClassroom>('Classroom', classroomSchema);
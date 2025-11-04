import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  _id: string;
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: 'assignment_created' | 'assignment_graded' | 'assignment_due_soon' | 'submission_received' | 'classroom_joined' | 'general';
  title: string;
  message: string;
  relatedId?: mongoose.Types.ObjectId;
  relatedModel?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['assignment_created', 'assignment_graded', 'assignment_due_soon', 'submission_received', 'classroom_joined', 'general'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  relatedId: {
    type: Schema.Types.ObjectId
  },
  relatedModel: {
    type: String,
    enum: ['Assignment', 'Submission', 'Classroom']
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model<INotification>('Notification', notificationSchema);
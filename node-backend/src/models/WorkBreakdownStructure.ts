import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkBreakdownStructure extends Document {
  project: mongoose.Types.ObjectId;
  taskName: string;
  description: string;
  level: number;
  parentTask?: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  duration: number;
  progress: number;
  assignedTo: mongoose.Types.ObjectId[];
  dependencies: mongoose.Types.ObjectId[];
  status: string;
  estimatedCost: number;
}

const WorkBreakdownStructureSchema: Schema = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  taskName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1
  },
  parentTask: {
    type: Schema.Types.ObjectId,
    ref: 'WorkBreakdownStructure'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  progress: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  dependencies: [{
    type: Schema.Types.ObjectId,
    ref: 'WorkBreakdownStructure'
  }],
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'delayed', 'on_hold'],
    default: 'not_started'
  },
  estimatedCost: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying by project
WorkBreakdownStructureSchema.index({ project: 1, level: 1 });

export default mongoose.model<IWorkBreakdownStructure>('WorkBreakdownStructure', WorkBreakdownStructureSchema);

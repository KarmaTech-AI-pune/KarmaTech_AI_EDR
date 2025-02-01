import mongoose, { Schema, Document } from 'mongoose';

export interface IGoNoGoDecision extends Document {
  project: mongoose.Types.ObjectId;
  criteria: {
    strategicFit: number;
    technicalCapability: number;
    resourceAvailability: number;
    financialViability: number;
    riskAssessment: number;
  };
  totalScore: number;
  decision: string;
  comments: string;
  decidedBy: mongoose.Types.ObjectId;
  reviewedBy?: mongoose.Types.ObjectId;
  status: string;
}

const GoNoGoDecisionSchema: Schema = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  criteria: {
    strategicFit: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    technicalCapability: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    resourceAvailability: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    financialViability: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    riskAssessment: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  totalScore: {
    type: Number,
    required: true,
    min: 5,
    max: 25
  },
  decision: {
    type: String,
    required: true,
    enum: ['go', 'no_go', 'conditional_go']
  },
  comments: {
    type: String,
    required: true
  },
  decidedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  }
}, {
  timestamps: true
});

export default mongoose.model<IGoNoGoDecision>('GoNoGoDecision', GoNoGoDecisionSchema);

import mongoose, { Schema } from 'mongoose';
import { IFeedback } from '../config/types';

const FeedbackSchema: Schema = new Schema({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  coachId: {
    type: Schema.Types.ObjectId,
    ref: 'Coach',
    required: true
  },
  workoutId: {
    type: Schema.Types.ObjectId,
    ref: 'Workout',
    required: true
  },
  comment: {
    type: String
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
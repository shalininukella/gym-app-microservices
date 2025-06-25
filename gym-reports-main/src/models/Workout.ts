import mongoose, { Schema } from 'mongoose';
import { IWorkout } from '../config/types';

const WorkoutSchema: Schema = new Schema({
  coachId: {
    type: Schema.Types.ObjectId,
    ref: 'Coach',
    required: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  clientStatus: {
    type: String,
    enum: ['Scheduled', 'Cancelled', 'Finished'],
    default: 'Scheduled'
  },
  coachStatus: {
    type: String,
    enum: ['Scheduled', 'Cancelled', 'Finished'],
    default: 'Scheduled'
  }
}, {
  timestamps: true
});

export default mongoose.model<IWorkout>('Workout', WorkoutSchema);
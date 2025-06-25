import mongoose, { Schema } from 'mongoose';
import { ICoach } from '../config/types';

const CoachSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ICoach>('Coach', CoachSchema);
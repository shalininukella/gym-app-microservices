import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICoach extends Document {
  firstName: string;
  lastName: string;
  profilePic?: string;
  rating?: number;
  title: string;
  about: string;
  type: string;
  specialization?: string[]; 
  certificates?: string[]; 
}

const coachSchema: Schema = new Schema<ICoach>({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  profilePic: {
    type: String,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  title: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  specialization: [
    {
      type: String,
    },
  ],
  certificates: [
    {
      type: String,
    },
  ],
}, { collection: 'coaches' });

const Coach: Model<ICoach> = mongoose.model<ICoach>('Coach', coachSchema);

export default Coach;
import mongoose from 'mongoose';

export interface FileFormat {
  _id?: mongoose.Types.ObjectId | string; // Using string or ObjectId depending on usage context, ObjectId is safer with mongoose
  name: string;
  type: string;
  isActive: boolean;
  createdAt: string; // Or Date if converted upon fetching
  updatedAt: string; // Or Date if converted upon fetching
}
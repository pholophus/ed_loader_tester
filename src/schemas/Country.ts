import { Types } from "mongoose";

export interface Country{
    _id?: Types.ObjectId | string;
    name: string;
    code: string;
    isActive: boolean;
    createdAt?: Date;
    createdBy?: Types.ObjectId | string;
    updatedAt?: Date;
    updatedBy?: Types.ObjectId | string;
  }
import mongoose from 'mongoose';

export interface DataType {
    _id: mongoose.Types.ObjectId;
    name: string;
}

export default DataType;
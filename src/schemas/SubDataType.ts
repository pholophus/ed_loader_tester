import mongoose from 'mongoose';

export interface SubDataType {
    _id: mongoose.Types.ObjectId;
    name: string;
    dataTypeId: mongoose.Types.ObjectId;
}

export default SubDataType;
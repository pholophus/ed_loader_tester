import mongoose from 'mongoose';

interface WellMetadataPivot {
    _id?: mongoose.Types.ObjectId;
    wellId: mongoose.Types.ObjectId;
    wellDataId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export default WellMetadataPivot;
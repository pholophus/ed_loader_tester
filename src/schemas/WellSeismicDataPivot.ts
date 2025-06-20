import mongoose from 'mongoose';

interface WellSeismicDataPivot {
    _id?: mongoose.Types.ObjectId;
    wellId: mongoose.Types.ObjectId;
    seismicDataId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export default WellSeismicDataPivot;
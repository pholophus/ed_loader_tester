import mongoose from 'mongoose';

interface SeismicLineWellMetadataPivot {
    _id?: mongoose.Types.ObjectId;
    wellMetadataId: mongoose.Types.ObjectId;
    seismicLineId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export default SeismicLineWellMetadataPivot;
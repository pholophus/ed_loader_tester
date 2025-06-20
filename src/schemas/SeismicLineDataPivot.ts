import mongoose from 'mongoose';

interface SeismicSurveyLinePivot {
    _id?: mongoose.Types.ObjectId;
    seismicDataId: mongoose.Types.ObjectId;
    lineId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export default SeismicSurveyLinePivot;
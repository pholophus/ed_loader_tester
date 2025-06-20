import mongoose from 'mongoose';

interface SeismicSurveyLinePivot {
    _id?: mongoose.Types.ObjectId;
    surveyId: mongoose.Types.ObjectId;
    lineId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export default SeismicSurveyLinePivot;
import mongoose from 'mongoose';

interface SeismicSurveyLinePivot {
    _id?: string;
    surveyId: string;
    lineId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export default SeismicSurveyLinePivot;
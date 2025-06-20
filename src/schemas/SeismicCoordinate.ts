import mongoose from 'mongoose';

interface SeismicCoordinate {
    _id?: mongoose.Types.ObjectId;
    latitude?: Float32Array;
    longitude?: Float32Array;
    surveyId: mongoose.Types.ObjectId;
    lineId: mongoose.Types.ObjectId;
}

export default SeismicCoordinate;
import mongoose from 'mongoose';

interface SeismicCoordinate {
    _id?: string;
    cdp?: number;
    x?: number;
    y?: number;
    surveyId: string;
    lineId: string;
}

export default SeismicCoordinate;
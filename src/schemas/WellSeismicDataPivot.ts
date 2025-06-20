import mongoose from 'mongoose';

interface WellSeismicDataPivot {
    _id?: string;
    wellId: string;
    seismicDataId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export default WellSeismicDataPivot;
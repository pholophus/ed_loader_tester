import mongoose from 'mongoose';

interface CRS {
    _id: mongoose.Types.ObjectId;
    srid: number;
    name: string;
    proj4: string;
}

export default CRS;
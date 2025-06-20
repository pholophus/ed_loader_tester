import mongoose from 'mongoose';

interface CRS {
    _id: string; // MongoDB ObjectId as string
    srid: number;
    name: string;
    proj4: string;
}

export default CRS;
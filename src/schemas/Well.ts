import mongoose from "mongoose";

interface Well {
    _id?: mongoose.Types.ObjectId;
    wellboreId?: string;
    country?: string;
    region?: string;
    block?: string;
    subBlock?: string;
    field?: string;
    operator?: string;
    latitude?: number;
    longitude?: number;
    purpose?: string;
    spudDate?: string;
    completionDate?: string;
    spudYear?: number;
    status?: string;
    reference?: string;
    kellyBlushings?: number;
    kellyBlushingUom?: string;
    rotaryTable?: number;
    rotaryTableUom?: string;
    derrickFloor?: number;
    derrickFloorUom?: string;
    waterDepth?: number;
    waterDepthUom?: string;
    groundElevation?: number;
    groundElevationUom?: string;
    topDepth?: number;
    topDepthUom?: string;
    baseDepth?: number;
    baseDepthUom?: string;
    totalDepth?: number;
    totalDepthUom?: string;
    easting?: number;
    northing?: number;
    projected?: string;
    remarks?: string;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
    UWI?: string;
    name?: string;
}

export default Well;
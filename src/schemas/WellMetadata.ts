import mongoose from "mongoose";

interface WellMetadata {
    _id?: mongoose.Types.ObjectId;
    datasetTypeId?: string;
    subDatasetTypeId?: string;
    status?: string;
    fileName?: string;
    fileFormat?: string;
    fileSize?: number;
    title?: string;
    description?: string;
    createdBy?: string;
    createdFor?: string;
    recordedBy?: string;
    recordedOn?: string | Date;
    changedBy?: string;
    changedOn?: string | Date;
    interpretedBy?: string;
    interpretedOn?: string | Date;
    remarks?: string;
    fileLocation?: string;
    s3FilePath?: string;
    spudDate?: string;
    completionDate?: string;
    topDepth?: number;
    topDepthUom?: string;
    baseDepth?: number;
    baseDepthUom?: string;
    wellId?: mongoose.Types.ObjectId;
}

export default WellMetadata;
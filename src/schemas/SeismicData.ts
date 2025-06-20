import mongoose from "mongoose";

export interface SeismicData {
  _id?: mongoose.Types.ObjectId;
  datasetTypeId: string;
  subDatasetTypeId: string;
  status?: string;
  fileName: string;
  fileFormat: string;
  fileSize?: number;
  title?: string;
  description?: string;
  createdBy?: string;
  createdFor?: string;
  recordedBy?: string;
  recordedOn?: Date;
  changedBy?: string;
  changedOn?: Date;
  interpretedBy?: string;
  interpretedOn?: Date;
  remarks?: string;
  fileLocation: string;
  s3FilePath?: string;
  recordLength?: number;
  recordLengthUom?: string;
  sampleRate?: number;
  sampleRateUom?: string;
  seismicLineId?: mongoose.Types.ObjectId; 
} 
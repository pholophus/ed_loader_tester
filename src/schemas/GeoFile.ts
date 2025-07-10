export interface GeoFile {
    id?: string; // Primary key
    fileName?: string;
    fileFormatId?: string;
    dataTypeId?: string; // Foreign key
    subDataTypeId?: string; // Foreign key
    type?: string;
    description?: string;
    title?: string;
    remarks?: string;
    createdFor?: string;
    createdBy?: string;
    createdDate?: Date;
    fileLocation?: string;
    fileSize?: number;
    status?: string;
    ownership?: string;
    interpretedBy?: string;
    interpretedOn?: Date;
    approvedBy?: string;
    approvedOn?: string;
    version?: string;
    comment?: string;
    topDepth?: number;
    topDepthUom?: string;
    baseDepth?: number;
    baseDepthUom?: string;
    spudDate?: Date;
    completionDate?: Date;
    // firstFieldFile?: number;
    // lastFieldFile?: number;
    // firstShotPoint?: number;
    // lastShotPoint?: number;
    // firstCDP?: number;
    // lastCDP?: number;
    // firstInline?: number;
    // lastInline?: number;
    // firstXline?: number;
    // lastXline?: number;
    // binSpacing?: number;
    // firstTRC?: number;
    // lastTRC?: number;
    // numberOfTraces?: number;
    // sampleType?: number;
    // sampleRate?: number;
    // sampleRateUom?: number;
    // recordLength?: number;
    // recordLengthUom?: number;
    recordedBy?: string;
    recordedOn?: Date;
    changedBy?: string;
    changedOn?: Date;
    deletedAt?: Date;
    well?: {
        [key: string]: any
    }
    seismic?: {
        [key: string]: any
    }
}

export default GeoFile; 
export interface SeismicLine {
    _id?: string; // MongoDB ObjectId as string
    name?: string;
    lengthToMetres?: number;
    lengthCrossingMetres?: number;
    northernmostLatitude?: number;
    southernmostLatitude?: number;
    westernmostLongitude?: number;
    easternmostLongitude?: number;
    lineType?: string;
    dataInterpretedCoverage?: string;
    rawDataFormatType?: string;
    rawDataCoverage?: string;
    processedDataFormatType?: string;
    processedDataCoverage?: string;
    dataProcessedCoverage?: string;
    country?: string;
    area?: string;
    block?: string;
    surveyArea?: string;
    vintageYear?: number;
    operator?: string;
    contractor?: string;
    shotBy?: string;
    surveyClass?: string;
    vessel?: string;
    crewCode?: string;
    crewName?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
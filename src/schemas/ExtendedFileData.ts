import { ValidationResult } from "@/store/wellStore";

interface ExtendedFileData {
    id: string;
    name: string;
    size: number;
    progress?: number;
    path?: string;
    
    // Data type selection
    selectedDataTypeId?: string;
    selectedSubDataTypeId?: string;
    
    // Metadata properties
    editedBy?: string;
    createdBy?: string;
    createdFor?: string;
    createdDate?: string;
    targetFileName?: string;
    fileFormat?: string;
    
    // Seismic line selection
    lineId?: string;
    
    // Depth information
    // topDepth?: number;
    // topDepthUoM?: string;
    // baseDepth?: number;
    // baseDepthUoM?: string;

    // // Well information
    // wellId?: string;
    // wellName?: string;
    
    // Errors
    validationResult?: ValidationResult;
}

export default ExtendedFileData; 
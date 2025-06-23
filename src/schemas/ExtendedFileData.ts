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
    
    // Depth information
    topDepth?: number;
    topDepthUoM?: string;
    baseDepth?: number;
    baseDepthUoM?: string;

    // Errors
    validationResult?: ValidationResult;
    
    // Legacy/optional properties (commented out in original interfaces)
    // selected?: boolean;
    // targetEntity?: string;
    // preparation?: string;
    // loadingStatus?: string;
    // qualityCheck?: string;
    // qualityStatus?: string;
    // publication?: string;
}

export default ExtendedFileData; 
/**
 * Interface for LAS file preview data
 */
export interface LasPreviewData {
  asciiText: string;
  metadata: {
    wellName?: string;
    location?: string;
    uwi?: string;
    startDepth?: string;
    stopDepth?: string;
    step?: string;
    curveCount?: number;
    curves?: string[];
  };
  error?: string;
}

/**
 * Interface for depth-specific LAS metadata
 */
export interface LasDepthMetadata {
  topDepth: number | null;
  topDepthUom: string;
  baseDepth: number | null;
  baseDepthUom: string;
  step: number | null;
  stepUom: string;
}

/**
 * Interface for comprehensive LAS metadata (matching the fields from user's image)
 */
export interface LasMetadata {
  // File information
  fileName: string;
  filePath: string;
  fileSize: number;
  created: Date;
  loaded: Date;
  lastUpdated: Date;
  
  // Data source information
  dataSource: string;
  
  // Geographic information
  region: string;
  country: string;
  state: string;
  
  // Asset and field information
  asset: string;
  fieldName: string;
  
  // Well identification
  uwi: string;
  wellName: string;
  
  // Operator information
  operator: string;
  
  // Geographic coordinates
  surfaceLatitude: number;
  surfaceLongitude: number;
  
  // Well depth information with units
  startDepth: number;
  stopDepth: number;
  step: number;
  depthUom: string; // Unit of measure for depths (e.g., "M", "FT")
  
  // Service information
  serviceCompany: string;
  logDate: string;
  
  // Curve information
  curves: string[];
  curveCount: number;
  
  // Processing status
  approved: boolean;
  processed: boolean;
  
  // Additional metadata
  nullValue: string;
  version: string;
  wrap: string;
}

/**
 * Interface for comprehensive LAS data extraction result
 */
export interface LasComprehensiveData {
  metadata: LasMetadata;
  wellioJson: any;
  versionInfo: any;
  wellInfo: any;
  curveInfo: any;
  parameterInfo: any;
  logData?: any;
  extractedAt: Date;
}

/**
 * Parse a LAS file content and extract ASCII text for preview
 * @param filePath - Path to the LAS file
 * @returns Promise<LasPreviewData> - Object containing ASCII text and metadata
 */
export async function parseLasFileForPreview(filePath: string): Promise<LasPreviewData> {
  try {
    console.log('[LAS Preview Service] Parsing file via IPC:', filePath);
    
    // Use the IPC bridge to parse the file in the main process
    // @ts-ignore
    const result = await window.electronAPI.parseLasForPreview(filePath);
    
    return result;

  } catch (error) {
    console.error('[LAS Preview Service] Error parsing LAS file:', error);
    return {
      asciiText: '',
      metadata: {},
      error: `Error parsing LAS file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Extract comprehensive metadata from a LAS file
 * @param filePath - Path to the LAS file
 * @returns Promise<{success: boolean, metadata?: LasMetadata, error?: string}>
 */
export async function extractLasMetadata(filePath: string): Promise<{success: boolean, metadata?: LasMetadata, error?: string}> {
  try {
    console.log('[LAS Metadata Service] Extracting metadata from:', filePath);
    
    // @ts-ignore
    const result = await window.electronAPI.extractLasMetadata(filePath);
    
    return result;

  } catch (error) {
    console.error('[LAS Metadata Service] Error extracting metadata:', error);
    return {
      success: false,
      error: `Error extracting LAS metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Extract depth-specific metadata from a LAS file
 * @param filePath - Path to the LAS file
 * @returns Promise<{success: boolean, depthData?: LasDepthMetadata, error?: string}>
 */
export async function extractLasDepthMetadata(filePath: string): Promise<{success: boolean, depthData?: LasDepthMetadata, error?: string}> {
  try {
    console.log('[LAS Depth Service] Extracting depth metadata from:', filePath);
    
    // @ts-ignore
    const result = await window.electronAPI.extractLasDepthMetadata(filePath);
    
    return result;

  } catch (error) {
    console.error('[LAS Depth Service] Error extracting depth metadata:', error);
    return {
      success: false,
      error: `Error extracting LAS depth metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Extract comprehensive data from a LAS file including metadata, wellio JSON, and optionally log data
 * @param filePath - Path to the LAS file
 * @param includeLogData - Whether to include the actual log data (can be large)
 * @returns Promise<{success: boolean, data?: LasComprehensiveData, error?: string}>
 */
export async function extractLasComprehensiveData(filePath: string, includeLogData: boolean = false): Promise<{success: boolean, data?: LasComprehensiveData, error?: string}> {
  try {
    console.log('[LAS Comprehensive Service] Extracting comprehensive data from:', filePath);
    
    // @ts-ignore
    const result = await window.electronAPI.extractLasComprehensiveData(filePath, includeLogData);
    
    return result;

  } catch (error) {
    console.error('[LAS Comprehensive Service] Error extracting comprehensive data:', error);
    return {
      success: false,
      error: `Error extracting comprehensive LAS data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Parse a LAS file to wellio JSON format
 * @param filePath - Path to the LAS file
 * @returns Promise<{success: boolean, wellioJson?: any, error?: string}>
 */
export async function parseLasToWellioJson(filePath: string): Promise<{success: boolean, wellioJson?: any, error?: string}> {
  try {
    console.log('[LAS Wellio Service] Converting to wellio JSON:', filePath);
    
    // @ts-ignore
    const result = await window.electronAPI.parseLasToWellioJson(filePath);
    
    return result;

  } catch (error) {
    console.error('[LAS Wellio Service] Error converting to wellio JSON:', error);
    return {
      success: false,
      error: `Error converting LAS to wellio JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Extract metadata fields that match the user's image format
 * @param filePath - Path to the LAS file
 * @returns Promise<{success: boolean, metadata?: any, error?: string}>
 */
export async function extractLasMetadataForDisplay(filePath: string): Promise<{success: boolean, metadata?: any, error?: string}> {
  try {
    console.log('[LAS Display Service] Extracting metadata for display:', filePath);
    
    const result = await extractLasMetadata(filePath);
    
    if (!result.success || !result.metadata) {
      return result;
    }

    // Format metadata for display matching the user's image
    const displayMetadata = {
      dataSource: result.metadata.dataSource,
      region: result.metadata.region,
      country: result.metadata.country,
      state: result.metadata.state,
      asset: result.metadata.asset,
      fieldName: result.metadata.fieldName,
      uwi: result.metadata.uwi,
      wellName: result.metadata.wellName,
      operator: result.metadata.operator,
      surfaceLatitude: result.metadata.surfaceLatitude,
      surfaceLongitude: result.metadata.surfaceLongitude,
      created: result.metadata.created,
      loaded: result.metadata.loaded,
      approved: result.metadata.approved,
      lastUpdated: result.metadata.lastUpdated,
      
      // Additional technical details
      startDepth: result.metadata.startDepth,
      stopDepth: result.metadata.stopDepth,
      step: result.metadata.step,
      curves: result.metadata.curves,
      curveCount: result.metadata.curveCount,
      serviceCompany: result.metadata.serviceCompany,
      logDate: result.metadata.logDate,
      version: result.metadata.version,
      nullValue: result.metadata.nullValue,
    };

    return {
      success: true,
      metadata: displayMetadata
    };

  } catch (error) {
    console.error('[LAS Display Service] Error extracting metadata for display:', error);
    return {
      success: false,
      error: `Error extracting LAS metadata for display: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Batch extract metadata from multiple LAS files
 * @param filePaths - Array of file paths
 * @returns Promise<Array<{filePath: string, success: boolean, metadata?: LasMetadata, error?: string}>>
 */
export async function batchExtractLasMetadata(filePaths: string[]): Promise<Array<{filePath: string, success: boolean, metadata?: LasMetadata, error?: string}>> {
  const results = [];
  
  for (const filePath of filePaths) {
    try {
      const result = await extractLasMetadata(filePath);
      results.push({
        filePath,
        ...result
      });
    } catch (error) {
      results.push({
        filePath,
        success: false,
        error: `Error processing ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }
  
  return results;
}

/**
 * Check if a file is a LAS file based on extension
 * @param fileName - Name of the file
 * @returns Boolean indicating if it's a LAS file
 */
export function isLasFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.las');
}

/**
 * Get LAS file format information
 * @returns Object with format details
 */
export function getLasFormatInfo() {
  return {
    name: 'Log ASCII Standard',
    extension: '.las',
    version: '2.0',
    description: 'Well log data format used in the oil and gas industry',
    sections: [
      'VERSION INFORMATION',
      'WELL INFORMATION BLOCK', 
      'CURVE INFORMATION BLOCK',
      'PARAMETER INFORMATION',
      'ASCII LOG DATA'
    ]
  };
}

/**
 * Count the number of curves in a LAS file
 * @param filePath - Path to the LAS file
 * @returns Promise<{success: boolean, curveCount?: number, curves?: string[], error?: string}>
 */
export async function countLasCurves(filePath: string): Promise<{success: boolean, curveCount?: number, curves?: string[], error?: string}> {
  try {
    console.log('[LAS Curve Count Service] Counting curves in:', filePath);
    
    // @ts-ignore
    const result = await window.electronAPI.countLasCurves(filePath);
    
    return result;

  } catch (error) {
    console.error('[LAS Curve Count Service] Error counting curves:', error);
    return {
      success: false,
      error: `Error counting curves in LAS file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
} 
/**
 * Interface for SEGY file preview data
 */
export interface SegyPreviewData {
  asciiText: string;
  metadata: {
    fileType?: string;
    headerType?: string;
    fileSize?: number;
    sampleRate?: number;
    traces?: number;
  };
  error?: string;
  isEbcdicHeader?: boolean;
}

/**
 * Interface for SEGY EBCDIC header data
 */
export interface SegyEbcdicHeader {
  header: string[];
  error: string | null;
}

/**
 * Interface for SEGY file metadata
 */
export interface SegyMetadata {
  fileName: string;
  filePath: string;
  fileSize: number;
  sampleRate?: number;
  recordLength?: number;
  dataFormat?: string;
  traces?: number;
  inlines?: number;
  crosslines?: number;
  coordinates?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
}

/**
 * Check if a file is a SEGY file based on extension
 * @param fileName - Name of the file
 * @returns Boolean indicating if it's a SEGY file
 */
export function isSegyFile(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return ['sgy', 'segy', 'seg'].includes(extension);
}

/**
 * Fetch EBCDIC header from a SEGY file via Flask API
 * @param filePath - Path to the SEGY file
 * @returns Promise<SegyPreviewData> - Object containing EBCDIC header data
 */
export async function fetchSegyEbcdicHeader(filePath: string): Promise<SegyPreviewData> {
  try {
    console.log('[SEGY Service] Fetching EBCDIC header for:', filePath);
    
    const response = await fetch(`http://localhost:5000/api/ebcdic_header?file_path=${encodeURIComponent(filePath)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: SegyEbcdicHeader = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    // Format the EBCDIC header data for display
    return {
      asciiText: result.header ? result.header.join('\n') : 'No EBCDIC header content available',
      metadata: {
        fileType: 'SEG-Y',
        headerType: 'EBCDIC Header'
      },
      isEbcdicHeader: true
    };
    
  } catch (error) {
    console.error('[SEGY Service] Error fetching EBCDIC header:', error);
    return {
      asciiText: '',
      metadata: {},
      error: `Error loading EBCDIC header: ${error instanceof Error ? error.message : 'Unknown error'}`,
      isEbcdicHeader: false
    };
  }
}

/**
 * Fetch SEGY file metadata via Flask API
 * @param filePath - Path to the SEGY file
 * @returns Promise<{success: boolean, metadata?: SegyMetadata, error?: string}>
 */
export async function fetchSegyMetadata(filePath: string): Promise<{success: boolean, metadata?: SegyMetadata, error?: string}> {
  try {
    console.log('[SEGY Service] Fetching metadata for:', filePath);
    
    const response = await fetch(`http://localhost:5000/api/file_metadata?file_path=${encodeURIComponent(filePath)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return {
      success: true,
      metadata: result.metadata
    };
    
  } catch (error) {
    console.error('[SEGY Service] Error fetching metadata:', error);
    return {
      success: false,
      error: `Error fetching SEGY metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Parse a SEGY file for preview (combines EBCDIC header and basic metadata)
 * @param filePath - Path to the SEGY file
 * @returns Promise<SegyPreviewData> - Object containing preview data
 */
export async function parseSegyFileForPreview(filePath: string): Promise<SegyPreviewData> {
  try {
    // First get the EBCDIC header
    const ebcdicResult = await fetchSegyEbcdicHeader(filePath);
    
    if (ebcdicResult.error) {
      return ebcdicResult;
    }
    
    // Optionally get additional metadata (you can expand this)
    const metadataResult = await fetchSegyMetadata(filePath);
    
    if (metadataResult.success && metadataResult.metadata) {
      // Enhance the metadata with file information
      ebcdicResult.metadata = {
        ...ebcdicResult.metadata,
        fileSize: metadataResult.metadata.fileSize,
        sampleRate: metadataResult.metadata.sampleRate,
        traces: metadataResult.metadata.traces
      };
    }
    
    return ebcdicResult;
    
  } catch (error) {
    console.error('[SEGY Service] Error parsing SEGY file for preview:', error);
    return {
      asciiText: '',
      metadata: {},
      error: `Error parsing SEGY file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      isEbcdicHeader: false
    };
  }
}

/**
 * Get SEGY file format information
 * @returns Object with format details
 */
export function getSegyFormatInfo() {
  return {
    name: 'Society of Exploration Geophysicists Y',
    extension: ['.sgy', '.segy', '.seg'],
    description: 'Seismic data exchange format used in geophysics',
    components: [
      'EBCDIC Header (3200 bytes)',
      'Binary Header (400 bytes)', 
      'Trace Headers and Data'
    ]
  };
} 
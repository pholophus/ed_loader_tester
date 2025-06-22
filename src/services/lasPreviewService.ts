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
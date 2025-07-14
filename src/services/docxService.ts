/**
 * Interface for DOCX file preview data
 */
export interface DocxPreviewData {
  textContent: string;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    lastModifiedBy?: string;
    creationDate?: string;
    modificationDate?: string;
    pageCount?: number;
    wordCount?: number;
    fileSize?: number;
  };
  error?: string;
}

/**
 * Interface for DOCX metadata extraction result
 */
export interface DocxMetadata {
  title: string;
  author: string;
  subject: string;
  creator: string;
  lastModifiedBy: string;
  creationDate: string;
  modificationDate: string;
  pageCount: number;
  wordCount: number;
  fileSize: number;
  keywords?: string[];
  language?: string;
  category?: string;
  comments?: string;
}

/**
 * Interface for DOCX comprehensive data
 */
export interface DocxComprehensiveData {
  metadata: DocxMetadata;
  textContent: string;
  htmlContent?: string;
  extractedAt: Date;
}

/**
 * Parse a DOCX file and extract text content for preview
 * @param filePath - Path to the DOCX file
 * @returns Promise<DocxPreviewData> - Object containing text content and metadata
 */
export async function parseDocxFileForPreview(filePath: string): Promise<DocxPreviewData> {
  try {
    console.log('[DOCX Preview Service] Parsing file via IPC:', filePath);
    
    // Use the IPC bridge to parse the file in the main process
    // @ts-ignore
    const result = await window.electronAPI.parseDocxForPreview(filePath);
    
    return result;

  } catch (error) {
    console.error('[DOCX Preview Service] Error parsing DOCX file:', error);
    return {
      textContent: '',
      metadata: {},
      error: `Error parsing DOCX file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Extract metadata from a DOCX file
 * @param filePath - Path to the DOCX file
 * @returns Promise<{success: boolean, metadata?: DocxMetadata, error?: string}>
 */
export async function extractDocxMetadata(filePath: string): Promise<{success: boolean, metadata?: DocxMetadata, error?: string}> {
  try {
    console.log('[DOCX Metadata Service] Extracting metadata from:', filePath);
    
    // @ts-ignore
    const result = await window.electronAPI.extractDocxMetadata(filePath);
    
    return result;

  } catch (error) {
    console.error('[DOCX Metadata Service] Error extracting metadata:', error);
    return {
      success: false,
      error: `Error extracting DOCX metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Extract comprehensive data from a DOCX file including text content and metadata
 * @param filePath - Path to the DOCX file
 * @param includeHtml - Whether to include HTML content (default: false)
 * @returns Promise<{success: boolean, data?: DocxComprehensiveData, error?: string}>
 */
export async function extractDocxComprehensiveData(filePath: string, includeHtml: boolean = false): Promise<{success: boolean, data?: DocxComprehensiveData, error?: string}> {
  try {
    console.log('[DOCX Comprehensive Service] Extracting comprehensive data from:', filePath);
    
    // @ts-ignore
    const result = await window.electronAPI.extractDocxComprehensiveData(filePath, includeHtml);
    
    return result;

  } catch (error) {
    console.error('[DOCX Comprehensive Service] Error extracting comprehensive data:', error);
    return {
      success: false,
      error: `Error extracting comprehensive DOCX data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Convert DOCX to HTML format
 * @param filePath - Path to the DOCX file
 * @returns Promise<{success: boolean, htmlContent?: string, error?: string}>
 */
export async function convertDocxToHtml(filePath: string): Promise<{success: boolean, htmlContent?: string, error?: string}> {
  try {
    console.log('[DOCX HTML Service] Converting DOCX to HTML:', filePath);
    
    // @ts-ignore
    const result = await window.electronAPI.convertDocxToHtml(filePath);
    
    return result;

  } catch (error) {
    console.error('[DOCX HTML Service] Error converting DOCX to HTML:', error);
    return {
      success: false,
      error: `Error converting DOCX to HTML: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Check if a file is a DOCX file based on its extension
 * @param fileName - Name of the file to check
 * @returns boolean - True if the file is a DOCX
 */
export function isDocxFile(fileName: string): boolean {
  const extension = fileName.toLowerCase().split('.').pop();
  return extension === 'docx';
}

/**
 * Get DOCX format information
 * @returns Object containing DOCX format details
 */
export function getDocxFormatInfo() {
  return {
    name: 'DOCX',
    description: 'Microsoft Word Document (Open XML)',
    extensions: ['.docx'],
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    supportedFeatures: ['text extraction', 'metadata extraction', 'HTML conversion', 'word count']
  };
}

/**
 * Count words in a DOCX file
 * @param filePath - Path to the DOCX file
 * @returns Promise<{success: boolean, wordCount?: number, error?: string}>
 */
export async function countDocxWords(filePath: string): Promise<{success: boolean, wordCount?: number, error?: string}> {
  try {
    console.log('[DOCX Word Count Service] Counting words in:', filePath);
    
    // @ts-ignore
    const result = await window.electronAPI.countDocxWords(filePath);
    
    return result;

  } catch (error) {
    console.error('[DOCX Word Count Service] Error counting words:', error);
    return {
      success: false,
      error: `Error counting DOCX words: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Extract text from specific sections of a DOCX file
 * @param filePath - Path to the DOCX file
 * @param startParagraph - Starting paragraph number (1-based)
 * @param endParagraph - Ending paragraph number (1-based)
 * @returns Promise<{success: boolean, textContent?: string, error?: string}>
 */
export async function extractDocxParagraphsText(filePath: string, startParagraph: number, endParagraph: number): Promise<{success: boolean, textContent?: string, error?: string}> {
  try {
    console.log('[DOCX Paragraph Text Service] Extracting text from paragraphs', startParagraph, 'to', endParagraph, 'in:', filePath);
    
    // @ts-ignore
    const result = await window.electronAPI.extractDocxParagraphsText(filePath, startParagraph, endParagraph);
    
    return result;

  } catch (error) {
    console.error('[DOCX Paragraph Text Service] Error extracting paragraph text:', error);
    return {
      success: false,
      error: `Error extracting DOCX paragraph text: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Extract images from a DOCX file
 * @param filePath - Path to the DOCX file
 * @returns Promise<{success: boolean, images?: Array<{name: string, data: Buffer, type: string}>, error?: string}>
 */
export async function extractDocxImages(filePath: string): Promise<{success: boolean, images?: Array<{name: string, data: Buffer, type: string}>, error?: string}> {
  try {
    console.log('[DOCX Image Service] Extracting images from:', filePath);
    
    // @ts-ignore
    const result = await window.electronAPI.extractDocxImages(filePath);
    
    return result;

  } catch (error) {
    console.error('[DOCX Image Service] Error extracting images:', error);
    return {
      success: false,
      error: `Error extracting DOCX images: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
} 
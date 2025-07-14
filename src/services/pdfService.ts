/**
 * Interface for PDF file preview data
 */
export interface PdfPreviewData {
  textContent: string;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
    pageCount?: number;
    fileSize?: number;
  };
  error?: string;
}

/**
 * Interface for PDF metadata extraction result
 */
export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
  pageCount: number;
  fileSize: number;
  keywords?: string[];
  language?: string;
}

/**
 * Parse a PDF file and extract text content for preview
 * @param filePath - Path to the PDF file
 * @returns Promise<PdfPreviewData> - Object containing text content and metadata
 */
export async function parsePdfFileForPreview(filePath: string): Promise<PdfPreviewData> {
  try {
    console.log('[PDF Preview Service] Parsing file via IPC:', filePath);
    
    // Use the IPC bridge to parse the file in the main process
    // @ts-ignore
    const result = await window.electronAPI.parsePdfForPreview(filePath);
    
    return result;

  } catch (error) {
    console.error('[PDF Preview Service] Error parsing PDF file:', error);
    return {
      textContent: '',
      metadata: {},
      error: `Error parsing PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Extract metadata from a PDF file
 * @param filePath - Path to the PDF file
 * @returns Promise<{success: boolean, metadata?: PdfMetadata, error?: string}>
 */
export async function extractPdfMetadata(filePath: string): Promise<{success: boolean, metadata?: PdfMetadata, error?: string}> {
  try {
    console.log('[PDF Metadata Service] Extracting metadata from:', filePath);
    
    // @ts-ignore
    const result = await window.electronAPI.extractPdfMetadata(filePath);
    
    return result;

  } catch (error) {
    console.error('[PDF Metadata Service] Error extracting metadata:', error);
    return {
      success: false,
      error: `Error extracting PDF metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Extract comprehensive data from a PDF file including text content and metadata
 * @param filePath - Path to the PDF file
 * @param maxPages - Maximum number of pages to extract (default: 10)
 * @returns Promise<{success: boolean, data?: {textContent: string, metadata: PdfMetadata}, error?: string}>
 */
export async function extractPdfComprehensiveData(filePath: string, maxPages: number = 10): Promise<{success: boolean, data?: {textContent: string, metadata: PdfMetadata}, error?: string}> {
  try {
    console.log('[PDF Comprehensive Service] Extracting comprehensive data from:', filePath);
    
    // @ts-ignore
    const result = await window.electronAPI.extractPdfComprehensiveData(filePath, maxPages);
    
    return result;

  } catch (error) {
    console.error('[PDF Comprehensive Service] Error extracting comprehensive data:', error);
    return {
      success: false,
      error: `Error extracting comprehensive PDF data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Check if a file is a PDF file based on its extension
 * @param fileName - Name of the file to check
 * @returns boolean - True if the file is a PDF
 */
export function isPdfFile(fileName: string): boolean {
  const extension = fileName.toLowerCase().split('.').pop();
  return extension === 'pdf';
}

/**
 * Get PDF format information
 * @returns Object containing PDF format details
 */
export function getPdfFormatInfo() {
  return {
    name: 'PDF',
    description: 'Portable Document Format',
    extensions: ['.pdf'],
    mimeType: 'application/pdf',
    supportedFeatures: ['text extraction', 'metadata extraction', 'page count']
  };
}

/**
 * Count pages in a PDF file
 * @param filePath - Path to the PDF file
 * @returns Promise<{success: boolean, pageCount?: number, error?: string}>
 */
export async function countPdfPages(filePath: string): Promise<{success: boolean, pageCount?: number, error?: string}> {
  try {
    console.log('[PDF Page Count Service] Counting pages in:', filePath);
    
    // @ts-ignore
    const result = await window.electronAPI.countPdfPages(filePath);
    
    return result;

  } catch (error) {
    console.error('[PDF Page Count Service] Error counting pages:', error);
    return {
      success: false,
      error: `Error counting PDF pages: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Extract text from specific pages of a PDF file
 * @param filePath - Path to the PDF file
 * @param startPage - Starting page number (1-based)
 * @param endPage - Ending page number (1-based)
 * @returns Promise<{success: boolean, textContent?: string, error?: string}>
 */
export async function extractPdfPagesText(filePath: string, startPage: number, endPage: number): Promise<{success: boolean, textContent?: string, error?: string}> {
  try {
    console.log('[PDF Page Text Service] Extracting text from pages', startPage, 'to', endPage, 'in:', filePath);
    
    // @ts-ignore
    const result = await window.electronAPI.extractPdfPagesText(filePath, startPage, endPage);
    
    return result;

  } catch (error) {
    console.error('[PDF Page Text Service] Error extracting page text:', error);
    return {
      success: false,
      error: `Error extracting PDF page text: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
} 
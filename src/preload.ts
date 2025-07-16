// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import { manualTraceHeaderExtractRequest } from './schemas/SegyTable';

interface FileDetails {
  name: string;
  extension: string;
  directory: string;
}

// Expose APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  pickFolder: (extensions?: string[]) => ipcRenderer.invoke('dialog:openFolder', extensions),
  openFile: (extensions?: string[]) => ipcRenderer.invoke('dialog:openFile', extensions),
  readDirectory: (path: string) => ipcRenderer.invoke('fs:readDir', path),
  readSingleFile: (filePath: string) => ipcRenderer.invoke('fs:readSingleFile', filePath),
  getFileStats: (filePath: string) => ipcRenderer.invoke('fs:getFileStats', filePath),
  countFilesInFolder: (folderPath: string) => ipcRenderer.invoke('fs:countFilesInFolder', folderPath),
  filterFile: (filePath: string, enableExtensions: string[], chosenDataFormats: string[]) => ipcRenderer.invoke('fs:filterFile', filePath, enableExtensions, chosenDataFormats) as Promise<FileDetails[]| undefined>,
  filterFilesInFolder: (folderPath: string, enableExtensions: string[], chosenDataFormats: string[]) => ipcRenderer.invoke('fs:filterFilesInFolder', folderPath, enableExtensions, chosenDataFormats) as Promise<FileDetails[]| undefined>,
  
  // LAS file operations
  parseLasForPreview: (filePath: string) => ipcRenderer.invoke('las:parseForPreview', filePath),
  extractLasMetadata: (filePath: string) => ipcRenderer.invoke('las:extractMetadata', filePath),
  extractLasDepthMetadata: (filePath: string) => ipcRenderer.invoke('las:extractDepthMetadata', filePath),
  extractLasComprehensiveData: (filePath: string, includeLogData?: boolean) => ipcRenderer.invoke('las:extractComprehensiveData', filePath, includeLogData),
  parseLasToWellioJson: (filePath: string) => ipcRenderer.invoke('las:parseToWellioJson', filePath),
  countLasCurves: (filePath: string) => ipcRenderer.invoke('las:countCurves', filePath),
  
  // PDF file operations
  parsePdfForPreview: (filePath: string) => ipcRenderer.invoke('pdf:parseForPreview', filePath),
  extractPdfMetadata: (filePath: string) => ipcRenderer.invoke('pdf:extractMetadata', filePath),
  extractPdfComprehensiveData: (filePath: string, maxPages?: number) => ipcRenderer.invoke('pdf:extractComprehensiveData', filePath, maxPages),
  countPdfPages: (filePath: string) => ipcRenderer.invoke('pdf:countPages', filePath),
  extractPdfPagesText: (filePath: string, startPage: number, endPage: number) => ipcRenderer.invoke('pdf:extractPagesText', filePath, startPage, endPage),
  
  // DOCX file operations
  parseDocxForPreview: (filePath: string) => ipcRenderer.invoke('docx:parseForPreview', filePath),
  extractDocxMetadata: (filePath: string) => ipcRenderer.invoke('docx:extractMetadata', filePath),
  extractDocxComprehensiveData: (filePath: string, includeHtml?: boolean) => ipcRenderer.invoke('docx:extractComprehensiveData', filePath, includeHtml),
  convertDocxToHtml: (filePath: string) => ipcRenderer.invoke('docx:convertToHtml', filePath),
  countDocxWords: (filePath: string) => ipcRenderer.invoke('docx:countWords', filePath),
  extractDocxParagraphsText: (filePath: string, startParagraph: number, endParagraph: number) => ipcRenderer.invoke('docx:extractParagraphsText', filePath, startParagraph, endParagraph),
  extractDocxImages: (filePath: string) => ipcRenderer.invoke('docx:extractImages', filePath),
  
  // Python script operations
  extractSingleFileSegyContent: (filePath: string) => ipcRenderer.invoke('python:runSingleFileSegy', filePath),
  extractSegyContent: () => ipcRenderer.invoke('python:runSegy'),
  extractLasContent: (folderPath?: string, formData?: any) => ipcRenderer.invoke('python:runLas', folderPath, formData),
  extractOthersContent: (folderPath?: string, formData?: any) => ipcRenderer.invoke('python:runOthers', folderPath, formData),
  extractSEGYFilesContent: (manualTraceHeaderExtractRequest: manualTraceHeaderExtractRequest) => {
    return ipcRenderer.invoke('extract-segy-files-content', manualTraceHeaderExtractRequest)
  },
  extractSegyCoordinates: (fileConfigs: any[], srid: number, proj4_string: string) => 
    ipcRenderer.invoke('python:extractSegyCoordinates', fileConfigs, srid, proj4_string),

  // Tus server operations
  getTusServerUrl: () => ipcRenderer.invoke('tus:getServerUrl'),
  processUploadedFile: (filePath: string, originalName: string, metadata: any) => 
    ipcRenderer.invoke('tus:processUploadedFile', filePath, originalName, metadata),

  // FTP operations
  testFtpConnection: (ftpConfig: any) => ipcRenderer.invoke('ftp:testConnection', ftpConfig),
  getFtpStatus: () => ipcRenderer.invoke('ftp:getStatus'),
  uploadFile: (filePath: string, remoteFileName: string, metadata?: any) => 
    ipcRenderer.invoke('ftp:uploadFile', filePath, remoteFileName, metadata),

  // Upload event listeners
  onUploadComplete: (callback: (file: any) => void) => {
    ipcRenderer.on('upload-complete', (_event, file) => {
      callback(file);
    });
  },
  onUploadProgress: (callback: (data: { file: any, progress: number }) => void) => {
    ipcRenderer.on('upload-progress', (_event, data) => {
      callback(data);
    });
  },
  
  // FTP transfer event listeners
  onFtpTransferStart: (callback: (file: any) => void) => {
    ipcRenderer.on('ftp-transfer-start', (_event, file) => {
      callback(file);
    });
  },
  onFtpTransferProgress: (callback: (data: { file: any, progress: any }) => void) => {
    ipcRenderer.on('ftp-transfer-progress', (_event, data) => {
      callback(data);
    });
  },
  onFtpTransferComplete: (callback: (data: { file: any, remotePath: string }) => void) => {
    ipcRenderer.on('ftp-transfer-complete', (_event, data) => {
      callback(data);
    });
  },
  onFtpTransferError: (callback: (data: { file: any, error: string }) => void) => {
    ipcRenderer.on('ftp-transfer-error', (_event, data) => {
      callback(data);
    });
  },
  
  removeUploadListeners: () => {
    ipcRenderer.removeAllListeners('upload-complete');
    ipcRenderer.removeAllListeners('upload-progress');
    ipcRenderer.removeAllListeners('ftp-transfer-start');
    ipcRenderer.removeAllListeners('ftp-transfer-progress');
    ipcRenderer.removeAllListeners('ftp-transfer-complete');
    ipcRenderer.removeAllListeners('ftp-transfer-error');
  },

  // Deep linking handler
  onDeepLink: (callback: (url: string) => void) => {
    ipcRenderer.on('handle-deep-link', (_event, url) => {
      callback(url);
    });
  },

  // Settings
  setDbName: (newDbName: string) => ipcRenderer.invoke('settings:setDbName', newDbName),

  // Generic backend service call
  callBackendService: (endpoint: string, params?: any) => 
    ipcRenderer.invoke('backend:callService', endpoint, params),
});

// Expose MongoDB API separately
contextBridge.exposeInMainWorld('mongoAPI', {
  find: (collectionName: string, query: any, sessionId?: string) => 
    ipcRenderer.invoke('mongo:find', collectionName, query, sessionId),
  aggregate: (collectionName: string, pipeline: any[], sessionId?: string) => 
    ipcRenderer.invoke('mongo:aggregate', collectionName, pipeline, sessionId),
  insert: (collectionName: string, document: any, sessionId?: string) => 
    ipcRenderer.invoke('mongo:insert', collectionName, document, sessionId),
  insertMany: (collectionName: string, documents: any[], sessionId?: string) => 
    ipcRenderer.invoke('mongo:insertMany', collectionName, documents, sessionId),
  update: (collectionName: string, filter: any, update: any, sessionId?: string) => 
    ipcRenderer.invoke('mongo:update', collectionName, filter, update, sessionId),
  delete: (collectionName: string, filter: any, sessionId?: string) => 
    ipcRenderer.invoke('mongo:delete', collectionName, filter, sessionId),
  upsert: (collectionName: string, filter: any, document: any, sessionId?: string) => 
    ipcRenderer.invoke('mongo:upsert', collectionName, filter, document, sessionId),
  startSession: () => ipcRenderer.invoke('mongo:startSession'),
  startTransaction: (sessionId: string) => ipcRenderer.invoke('mongo:startTransaction', sessionId),
  commitTransaction: (sessionId: string) => ipcRenderer.invoke('mongo:commitTransaction', sessionId),
  abortTransaction: (sessionId: string) => ipcRenderer.invoke('mongo:abortTransaction', sessionId),
  endSession: (sessionId: string) => ipcRenderer.invoke('mongo:endSession', sessionId),
});

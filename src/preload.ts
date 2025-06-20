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
  pickFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  readDirectory: (path: string) => ipcRenderer.invoke('fs:readDir', path),
  readSingleFile: (filePath: string) => ipcRenderer.invoke('fs:readSingleFile', filePath),
  countFilesInFolder: (folderPath: string) => ipcRenderer.invoke('fs:countFilesInFolder', folderPath),
  filterFile: (filePath: string, enableExtensions: string[], chosenDataFormats: string[]) => ipcRenderer.invoke('fs:filterFile', filePath, enableExtensions, chosenDataFormats) as Promise<FileDetails[]| undefined>,
  filterFilesInFolder: (folderPath: string, enableExtensions: string[], chosenDataFormats: string[]) => ipcRenderer.invoke('fs:filterFilesInFolder', folderPath, enableExtensions, chosenDataFormats) as Promise<FileDetails[]| undefined>,
  
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
  removeUploadListeners: () => {
    ipcRenderer.removeAllListeners('upload-complete');
    ipcRenderer.removeAllListeners('upload-progress');
  },

  // Deep linking handler
  onDeepLink: (callback: (url: string) => void) => {
    ipcRenderer.on('handle-deep-link', (_event, url) => {
      callback(url);
    });
  },

  // MongoDB operations
  mongoFind: (collectionName: string, query: any, sessionId?: string) => 
    ipcRenderer.invoke('mongo:find', collectionName, query, sessionId),
  mongoInsert: (collectionName: string, document: any, sessionId?: string) => 
    ipcRenderer.invoke('mongo:insert', collectionName, document, sessionId),
  mongoUpdate: (collectionName: string, filter: any, update: any, sessionId?: string) => 
    ipcRenderer.invoke('mongo:update', collectionName, filter, update, sessionId),
  mongoDelete: (collectionName: string, filter: any, sessionId?: string) => 
    ipcRenderer.invoke('mongo:delete', collectionName, filter, sessionId),
  mongoUpsert: (collectionName: string, filter: any, document: any, sessionId?: string) => 
    ipcRenderer.invoke('mongo:upsert', collectionName, filter, document, sessionId),
  mongoStartSession: () => ipcRenderer.invoke('mongo:startSession'),
  mongoStartTransaction: (sessionId: string) => ipcRenderer.invoke('mongo:startTransaction', sessionId),
  mongoCommitTransaction: (sessionId: string) => ipcRenderer.invoke('mongo:commitTransaction', sessionId),
  mongoAbortTransaction: (sessionId: string) => ipcRenderer.invoke('mongo:abortTransaction', sessionId),
  mongoEndSession: (sessionId: string) => ipcRenderer.invoke('mongo:endSession', sessionId),
  
  // Settings
  setDbName: (newDbName: string) => ipcRenderer.invoke('settings:setDbName', newDbName),
});

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

  // Deep linking handler
  onDeepLink: (callback: (url: string) => void) => {
    ipcRenderer.on('handle-deep-link', (_event, url) => {
      callback(url);
    });
  },

  // Settings handler
  setDbName: (newDbName: string) => ipcRenderer.invoke('settings:setDbName', newDbName),
});

// Expose MongoDB operations to renderer process
contextBridge.exposeInMainWorld('mongoAPI', {
  // MongoDB CRUD operations
  find: (collection: string, query = {}, sessionId?: string) => 
    ipcRenderer.invoke('mongo:find', collection, query, sessionId),
  aggregate: (collection: string, pipeline: any[], sessionId?: string) =>
    ipcRenderer.invoke('mongo:aggregate', collection, pipeline, sessionId),
  insert: (collection: string, document: any, sessionId?: string) => 
    ipcRenderer.invoke('mongo:insert', collection, document, sessionId),
  insertMany: (collection: string, documents: any[], sessionId?: string) =>
    ipcRenderer.invoke('mongo:insertMany', collection, documents, sessionId),
  update: (collection: string, filter: any, update: any, sessionId?: string) => 
    ipcRenderer.invoke('mongo:update', collection, filter, update, sessionId),
  delete: (collection: string, filter: any, sessionId?: string) => 
    ipcRenderer.invoke('mongo:delete', collection, filter, sessionId),
  upsert: (collection: string, filter: any, document: any, sessionId?: string) =>
    ipcRenderer.invoke('mongo:upsert', collection, filter, document, sessionId),
  startSession: () =>
    ipcRenderer.invoke('mongo:startSession'),
  startTransaction: (sessionId: string) =>
    ipcRenderer.invoke('mongo:startTransaction', sessionId),
  commitTransaction: (sessionId: string) =>
    ipcRenderer.invoke('mongo:commitTransaction', sessionId),
  abortTransaction: (sessionId: string) =>
    ipcRenderer.invoke('mongo:abortTransaction', sessionId),
  endSession: (sessionId: string) =>
    ipcRenderer.invoke('mongo:endSession', sessionId),
});

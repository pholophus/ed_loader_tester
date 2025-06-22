interface ElectronAPI {
  pickFolder: () => Promise<Electron.OpenDialogReturnValue>;
  openFile: () => Promise<Electron.OpenDialogReturnValue>;
  readDirectory: (path: string) => Promise<string[]>;
  readSingleFile: (filePath: string) => Promise<string>;
  countFilesInFolder: (folderPath: string) => Promise<number>;
  filterFile: (filePath: string, enableExtensions: string[], chosenDataFormats: string[]) => Promise<any>;
  filterFilesInFolder: (folderPath: string, enableExtensions: string[], chosenDataFormats: string[]) => Promise<any>;
  
  // LAS file operations
  parseLasForPreview: (filePath: string) => Promise<any>;
  
  extractSingleFileSegyContent: (filePath: string) => Promise<any>;
  extractSegyContent: () => Promise<any>;
  extractLasContent: (folderPath?: string, formData?: any) => Promise<any>;
  extractOthersContent: (folderPath?: string, formData?: any) => Promise<any>;
  extractSEGYFilesContent: (manualTraceHeaderExtractRequest: any) => Promise<any>;
  extractSegyCoordinates: (fileConfigs: any[], srid: number, proj4_string: string) => Promise<any>;
  
  // Tus server operations
  getTusServerUrl: () => Promise<string>;
  processUploadedFile: (filePath: string, originalName: string, metadata: any) => Promise<any>;
  
  // Upload event listeners
  onUploadComplete: (callback: (file: any) => void) => void;
  onUploadProgress: (callback: (data: { file: any, progress: number }) => void) => void;
  removeUploadListeners: () => void;
  
  onDeepLink: (callback: (url: string) => void) => void;
  setDbName: (newDbName: string) => Promise<any>;
}

interface MongoAPI {
  find: (collection: string, query?: any, sessionId?: string) => Promise<any>;
  aggregate: (collection: string, pipeline: any[], sessionId?: string) => Promise<any>;
  insert: (collection: string, document: any, sessionId?: string) => Promise<any>;
  insertMany: (collection: string, documents: any[], sessionId?: string) => Promise<any>;
  update: (collection: string, filter: any, update: any, sessionId?: string) => Promise<any>;
  delete: (collection: string, filter: any, sessionId?: string) => Promise<any>;
  upsert: (collection: string, filter: any, document: any, sessionId?: string) => Promise<any>;
  startSession: () => Promise<string>;
  startTransaction: (sessionId: string) => Promise<any>;
  commitTransaction: (sessionId: string) => Promise<any>;
  abortTransaction: (sessionId: string) => Promise<any>;
  endSession: (sessionId: string) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    mongoAPI: MongoAPI;
  }
}

export {}; 
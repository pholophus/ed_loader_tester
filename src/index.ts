import { app, BrowserWindow, ipcMain, protocol, net, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { connectMongo, closeMongo, findDocuments, insertDocument, updateDocument, deleteDocument, upsertDocument, startSession, getDb, getSession, endSession, insertManyDocuments, setDbNameAndReconnect } from './db/mongo';
import { extractSegyContent, extractLasContent, extractOthersContent, extractSEGYFilesContent, extractSegySingleFileContent, extractSegyCoordinates } from './services/pythonService';
import { openFolderDialog, readDirectory, fileExists, readSingleFile } from './services/fileService';
import { startTusServer, stopTusServer, getTusServerUrl, TusServerConfig } from './services/tusServer';
import { manualTraceHeaderExtractRequest } from './schemas/SegyTable';
import log from 'electron-log';

// route console.log/warn/error to a file:


// now all your `console.log(...)` will appear in:
//   • on macOS:  ~/Library/Logs/YourApp/main.log
//   • on Windows:  %USERPROFILE%\AppData\Roaming\YourApp\logs\main.log


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Ensure only a single instance of the application runs
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

// Store deep link arguments and mainWindow reference
let deepLinkUrl: string | null = null;
let mainWindow: BrowserWindow | null = null;

// Handle deep links when the app is already running
app.on('second-instance', (event, argv) => {
  // Protocol control on Windows;
  if (process.platform === 'win32') {
    // Keep only the second argument which is the url
    deepLinkUrl = argv.slice(-1)[0];
  } else {
    // Keep only the url
    deepLinkUrl = argv.slice(1)[0];
  }

  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    // Send the deep link URL to the renderer process
    if (deepLinkUrl) {
      mainWindow.webContents.send('handle-deep-link', deepLinkUrl);
    }
  }
});

const isDev = !app.isPackaged;

// Register custom protocol for static files
function setupStaticFileHandler() {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'static',
      privileges: {
        secure: true,
        standard: true,
        supportFetchAPI: true,
        stream: true
      }
    }
  ]);

  app.whenReady().then(() => {
    protocol.handle('static', (request) => {
      const filePath = path.join(
        isDev ? path.join(__dirname, '../../public') : path.join(process.resourcesPath, 'public'),
        request.url.slice('static://'.length)
      );
      return net.fetch('file://' + filePath);
    });
  });
}

// Initialize static file handler
setupStaticFileHandler();

const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    webPreferences: {
      preload: path.join(__dirname, '../dist/preload.js'),
      // Required for file protocol handling
      webSecurity: false,
      allowRunningInsecureContent: true
    },
    // Enable scrollbars in the window
    transparent: false,
    frame: true,
    resizable: true,
    enableLargerThanScreen: true,
  });

  let indexHtml: string;
  if (isDev) {
    indexHtml = path.join(__dirname, '../out/renderer/index.html');
  } else {
    // Forge will copy your built-out folder into Resources/out/renderer
    // (NOT into app.asar.unpacked/renderer unless you specially configure it)
    // indexHtml = path.join(process.resourcesPath, 'out', 'renderer', 'index.html');
    indexHtml = path.join(process.resourcesPath, 'renderer', 'index.html');
  }

  // console.log('⏳ Loading index.html from:', indexHtml);
  // console.log('📂 Exists? ', fs.existsSync(indexHtml));

  log.transports.file.level = 'info';
  console.log = log.info.bind(log);
  console.warn = log.warn.bind(log);
  console.error = log.error.bind(log);

  mainWindow.webContents
    .on('did-finish-load', () => {
      console.log('✔️ did-finish-load, URL:', mainWindow?.webContents.getURL());
    })
    .on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      console.error(`❌ did-fail-load: ${errorDescription} (code ${errorCode})`, { validatedURL, isMainFrame });
    })
    .on('did-fail-provisional-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      console.error(`❌ did-fail-provisional-load: ${errorDescription} (code ${errorCode})`, { validatedURL, isMainFrame });
    });

  // Ensure window can grow to fit content
  mainWindow.setMinimumSize(800, 600);

  // const rendererUrl = isDev
  //   ? 'http://localhost:5173'
  //   : `file://${path.join(__dirname, '../out/renderer/index.html')}`;

  // mainWindow.loadURL(rendererUrl);

  if (isDev) {
    // during development, point at Vite
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // in production, load the unpacked index.html from inside the ASAR
    // const indexHtml = process.resourcesPath.endsWith('.asar')
    //   ? path.join(process.resourcesPath + '.unpacked', 'renderer', 'index.html')
    //   : path.join(__dirname, '../out/renderer/index.html');

    mainWindow.loadFile(indexHtml);
  }


  mainWindow.webContents.openDevTools({ mode: 'detach' });
  // Open the DevTools in development.
  // if (isDev) {
  //   mainWindow.webContents.openDevTools();
  // }

  // Add event listener to adjust window size if needed
  // mainWindow.webContents.on('did-finish-load', () => {
  //   // Ensure window is ready for content
  //   if (mainWindow) {
  //     mainWindow.webContents.setZoomFactor(1.0);
  //     // Send any pending deep link URL to the renderer process
  //     if (deepLinkUrl) {
  //       mainWindow.webContents.send('handle-deep-link', deepLinkUrl);
  //       deepLinkUrl = null; // Clear the stored URL after sending
  //     }
  //   }
  // });
  // right after you create mainWindow
  


  // Debugging: Log file paths
  const tabulatorJsPath = path.join(
    isDev ? path.join(__dirname, '../public') : path.join(process.resourcesPath, 'public'),
    'vendor/tabulator/tabulator.min.js'
  );
  console.log('Tabulator JS Path:', tabulatorJsPath);
  console.log('File exists:', fs.existsSync(tabulatorJsPath));
};

// Connect to MongoDB when the app is ready
app.whenReady().then(async () => {
  try {
    await connectMongo();
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }

  // Start Tus server for resumable uploads
  try {
    const tusConfig: TusServerConfig = {
      onUploadComplete: (file) => {
        console.log('📁 File upload completed:', file.originalName);
        // Send notification to renderer process
        if (mainWindow) {
          mainWindow.webContents.send('upload-complete', file);
        }
      },
      onUploadProgress: (file, progress) => {
        // Send progress update to renderer process
        if (mainWindow) {
          mainWindow.webContents.send('upload-progress', { file, progress });
        }
      }
    };
    
    const port = await startTusServer(tusConfig);
    console.log(`🎯 Tus server started on port ${port}`);
  } catch (err) {
    console.error('Error starting Tus server:', err);
  }

  // Set up the default protocol client
  const protocol = 'afed-digital-ed-loader-desktop';
  if (process.platform === 'darwin') {
    // On macOS, the protocol client must be set before the app is ready
    // This is handled by the electron-builder configuration in package.json
    // For development, you can manually register it if needed:
    // app.setAsDefaultProtocolClient(protocol);
  } else {
    app.setAsDefaultProtocolClient(protocol);
  }

  // Handle deep links on initial launch
  if (process.platform === 'win32') {
    // Keep only the second argument which is the url
    deepLinkUrl = process.argv.slice(-1)[0];
  } else {
    // Keep only the url
    deepLinkUrl = process.argv.slice(1)[0];
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  // We should not call createWindow directly here anymore, as the app.whenReady handler
  // is now responsible for setting up the protocol client and handling initial deep links
  // before creating the window. However, the app.on('ready') event is still necessary
  // for some Electron modules to initialize.
  // The createWindow function is now called within the app.whenReady().then() block
  // after the protocol client is set up.

  // Check if mainWindow is already created (e.g., from a deep link initial launch)
  if (!mainWindow) {
    createWindow();
  }
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', async () => {
  await closeMongo();
  stopTusServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ======= IPC Handlers =======

// File system handlers
ipcMain.handle('dialog:openFolder', async () => {
  return await openFolderDialog();
});

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  });
  return { canceled, filePaths };
});

ipcMain.handle('fs:readDir', async (_event, folderPath: string) => {
  return readDirectory(folderPath);
});

ipcMain.handle('fs:readSingleFile', async (_event, filePath: string) => {
  return readSingleFile(filePath);
});

// Add a new handler to count files in a folder
ipcMain.handle('fs:countFilesInFolder', async (_event, folderPath: string, allowedExtensions: string[] = []) => {
  try {
    const files = await fs.promises.readdir(folderPath);
    // Filter out directories and count only files
    let fileCount = 0;
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = await fs.promises.stat(filePath);
      if (stats.isFile()) {
        // Check if the file extension is in the allowed list if provided
        if (allowedExtensions.length === 0 || allowedExtensions.includes(path.extname(file).toLowerCase().substring(1))) {
          fileCount++;
        }
      }
    }
    return fileCount;
  } catch (error) {
    console.error('Error counting files in folder:', error);
    throw error; // Re-throw the error to be caught in the renderer process
  }
});

// Add a new handler to list all files in a folder
ipcMain.handle('fs:filterFilesInFolder', async (_event, folderPath: string, enableExtensions: string[], chosenDataFormats: string[]) => {
  try {
    const segyListPath = path.join(__dirname, '../scripts/data/segy_list.txt');
    await fs.promises.writeFile(segyListPath, '');
    const lasListPath = path.join(__dirname, '../scripts/data/las_list.txt');
    await fs.promises.writeFile(lasListPath, '');
    const othersListPath = path.join(__dirname, '../scripts/data/others_list.txt');
    await fs.promises.writeFile(othersListPath, '');

    const files = await fs.promises.readdir(folderPath);
    // const allFileDetails: { name: string; extension: string; directory: string; filepath: string; }[] = [];
    let totalFiles = 0;
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = await fs.promises.stat(filePath);
      if (stats.isFile()) {
        const parts = file.split('.');
        // const fileName = path.basename(filePath);
        const fileExtension = parts.length > 1 ? (parts.pop() || '') : '';
        // const fileDirectory = path.dirname(filePath);

        if (fileExtension.toLowerCase() == 'sgy' && chosenDataFormats.includes('SEGY')) {
          const segyListPath = path.join(__dirname, '../scripts/data/segy_list.txt');
          // Ensure the directory exists
          const dir = path.dirname(segyListPath);
          await fs.promises.mkdir(dir, { recursive: true });
          await fs.promises.appendFile(segyListPath, filePath + '\n');
          totalFiles++;
        }

        if (fileExtension.toLowerCase() == 'las' && chosenDataFormats.includes('LAS')) {
          const lasListPath = path.join(__dirname, '../scripts/data/las_list.txt');
          // Ensure the directory exists
          const dir = path.dirname(lasListPath);
          await fs.promises.mkdir(dir, { recursive: true });
          await fs.promises.appendFile(lasListPath, filePath + '\n');
          totalFiles++;
        }

        if (enableExtensions.includes(fileExtension) && chosenDataFormats.includes('OTHERS')) {
          const othersListPath = path.join(__dirname, '../scripts/data/others_list.txt');
          // Ensure the directory exists
          const dir = path.dirname(othersListPath);
          await fs.promises.mkdir(dir, { recursive: true });
          await fs.promises.appendFile(othersListPath, filePath + '\n');
          totalFiles++;
        }

        // allFileDetails.push({
        //     name: fileName,
        //     extension: fileExtension,
        //     directory: fileDirectory,
        //     filepath: filePath
        // });
      }
    }
    return totalFiles
    // return allFileDetails;
  } catch (error) {
    console.error('Error listing files in folder:', error);
    throw error; // Re-throw the error to be caught in the renderer process
  }
});

ipcMain.handle('fs:filterFile', async (_event, filePath: string, enableExtensions: string[], chosenDataFormats: string[]) => {
  try {
    const stats = await fs.promises.stat(filePath);
    if (stats.isFile()) {
      const fileExtension = path.extname(filePath).toLowerCase().substring(1); // Get extension without the dot

      if (fileExtension == 'sgy' && chosenDataFormats.includes('SEGY')) {
        const segyListPath = path.join(__dirname, '../scripts/data/segy_list.txt');
        // Ensure the directory exists
        const dir = path.dirname(segyListPath);
        await fs.promises.mkdir(dir, { recursive: true });
        await fs.promises.appendFile(segyListPath, filePath + '\n');

        // console.log("selmata berlepas");
      }

      if (fileExtension == 'las' && chosenDataFormats.includes('LAS')) {
        const lasListPath = path.join(__dirname, '../scripts/data/las_list.txt');
        // Ensure the directory exists
        const dir = path.dirname(lasListPath);
        await fs.promises.mkdir(dir, { recursive: true });
        await fs.promises.appendFile(lasListPath, filePath + '\n');
      }

      if (enableExtensions.includes(fileExtension) && chosenDataFormats.includes('OTHERS')) {
        const othersListPath = path.join(__dirname, '../scripts/data/others_list.txt');
        // Ensure the directory exists
        const dir = path.dirname(othersListPath);
        await fs.promises.mkdir(dir, { recursive: true });
        await fs.promises.appendFile(othersListPath, filePath + '\n');
      }
    }
    // return allFileDetails;
  } catch (error) {
    console.error('Error processing file:', error);
    throw error; // Re-throw the error to be caught in the renderer process
  }
});

// Python script handlers
ipcMain.handle('python:runSingleFileSegy', async (_event, filePath: string) => {
  return await extractSegySingleFileContent(filePath);
});

ipcMain.handle('python:runSegy', async (_event) => {
  return await extractSegyContent();
});

ipcMain.handle('python:runLas', async (_event, folderPath?: string, formData?: any) => {
  return await extractLasContent(folderPath, formData);
});

ipcMain.handle('python:runOthers', async (_event, folderPath?: string, formData?: any) => {
  return await extractOthersContent(folderPath, formData);
});

ipcMain.handle('extract-segy-files-content', async (event, manualTraceHeaderExtractRequest: manualTraceHeaderExtractRequest) => {
  return extractSEGYFilesContent(manualTraceHeaderExtractRequest);
});

ipcMain.handle('python:extractSegyCoordinates', async (_event, fileConfigs: any[], srid: number, proj4_string: string) => {
  return extractSegyCoordinates(fileConfigs, srid, proj4_string);
});

// LAS file preview handler
ipcMain.handle('las:parseForPreview', async (_event, filePath: string) => {
  try {
    const wellio = require('wellio');
    
    // Read the file content
    const fileContent = await readSingleFile(filePath);
    
    if (!fileContent) {
      return {
        asciiText: '',
        metadata: {},
        error: 'Unable to read file content'
      };
    }

    // Filter out ASCII data section - only show header sections
    const lines = fileContent.split('\n');
    const headerLines: string[] = [];
    let inAsciiDataSection = false;
    
    for (const line of lines) {
      // Check if we've reached the ASCII data section
      if (line.trim().startsWith('~A') || line.trim().startsWith('~ASCII')) {
        inAsciiDataSection = true;
        headerLines.push(line); // Include the ~A header line
        headerLines.push('... [ASCII log data section excluded from preview] ...');
        break; // Stop processing lines after ASCII section starts
      }
      
      // Only include lines that are not in the ASCII data section
      if (!inAsciiDataSection) {
        headerLines.push(line);
      }
    }
    
    const asciiText = headerLines.join('\n');

    // Try to parse basic metadata from the LAS file
    let metadata: any = {};
    
    try {
      // Use wellio to parse the LAS file for metadata
      const wellioJson = wellio.las2json(fileContent);
      
      if (wellioJson && wellioJson['WELL INFORMATION BLOCK']) {
        const wellInfo = wellioJson['WELL INFORMATION BLOCK'];
        
        // Extract common metadata fields
        metadata = {
          wellName: extractWellInfoValue(wellInfo, 'WELL'),
          location: extractWellInfoValue(wellInfo, 'LOC'),
          uwi: extractWellInfoValue(wellInfo, 'UWI'),
          startDepth: extractWellInfoValue(wellInfo, 'STRT'),
          stopDepth: extractWellInfoValue(wellInfo, 'STOP'),
          step: extractWellInfoValue(wellInfo, 'STEP'),
        };
      }

      // Extract curve information
      if (wellioJson && wellioJson['CURVE INFORMATION BLOCK']) {
        const curveInfo = wellioJson['CURVE INFORMATION BLOCK'];
        const curves: string[] = [];
        
        Object.keys(curveInfo).forEach(key => {
          if (curveInfo[key] && curveInfo[key].MNEM) {
            curves.push(curveInfo[key].MNEM);
          }
        });
        
        metadata.curves = curves;
        metadata.curveCount = curves.length;
      }
    } catch (parseError) {
      console.warn('[LAS Preview Service] Could not parse metadata:', parseError);
      // Continue without metadata - we can still show the ASCII text
    }

    return {
      asciiText,
      metadata,
    };

  } catch (error) {
    console.error('[LAS Preview Service] Error parsing LAS file:', error);
    return {
      asciiText: '',
      metadata: {},
      error: `Error parsing LAS file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
});

// Helper function for extracting well info values
function extractWellInfoValue(wellInfo: any, key: string): string | undefined {
  // Look for exact key match first
  if (wellInfo[key] && wellInfo[key].DATA) {
    return wellInfo[key].DATA;
  }
  
  // Look for key in MNEM_* pattern
  for (const infoKey of Object.keys(wellInfo)) {
    if (infoKey.startsWith('MNEM_') && wellInfo[infoKey] && wellInfo[infoKey].MNEM === key) {
      return wellInfo[infoKey].DATA;
    }
  }
  
  return undefined;
}

// ipcMain.handle('python:runCustom', async (_event, scriptPath: string, args: string[] = []) => {
//   return runCustomPythonScript(scriptPath, args);
// });

// MongoDB operations
ipcMain.handle('mongo:find', async (_event, collectionName: string, query: any, sessionId?: string) => {
  return await findDocuments(collectionName, query, sessionId);
});

ipcMain.handle('mongo:aggregate', async (_event, collectionName: string, pipeline: any[], sessionId?: string) => {
  const db = getDb();
  const session = sessionId ? getSession(sessionId) : undefined;
  try {
    const result = await db.collection(collectionName).aggregate(pipeline, { session }).toArray();
    return result;
  } catch (error: any) {
    return { error: error.message };
  }
});

ipcMain.handle('mongo:insert', async (_event, collectionName: string, document: any, sessionId?: string) => {
  return await insertDocument(collectionName, document, sessionId);
});

ipcMain.handle('mongo:insertMany', async (_event, collectionName: string, documents: any[], sessionId?: string) => {
  return await insertManyDocuments(collectionName, documents, sessionId);
});

ipcMain.handle('mongo:update', async (_event, collectionName: string, filter: any, update: any, sessionId?: string) => {
  return await updateDocument(collectionName, filter, update, sessionId);
});

ipcMain.handle('mongo:delete', async (_event, collectionName: string, filter: any, sessionId?: string) => {
  return await deleteDocument(collectionName, filter, sessionId);
});

ipcMain.handle('mongo:upsert', async (_event, collectionName: string, filter: any, document: any, sessionId?: string) => {
  return await upsertDocument(collectionName, filter, document, sessionId);
});

// Session operations
ipcMain.handle('mongo:startSession', async () => {
  return await startSession();
});

ipcMain.handle('mongo:startTransaction', async (_event, sessionId: string) => {
  try {
    const session = getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    await session.startTransaction();
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
});

ipcMain.handle('mongo:commitTransaction', async (_event, sessionId: string) => {
  try {
    const session = getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    await session.commitTransaction();
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
});

ipcMain.handle('mongo:abortTransaction', async (_event, sessionId: string) => {
  try {
    const session = getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    await session.abortTransaction();
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
});

ipcMain.handle('mongo:endSession', async (_event, sessionId: string) => {
  try {
    await endSession(sessionId);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
});

ipcMain.handle('settings:setDbName', async (_event, newDbName: string) => {
  try {
    await setDbNameAndReconnect(newDbName);
    // Reload the main window after successful DB name change and reconnection
    if (mainWindow) {
      mainWindow.reload();
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error setting new DB name and reconnecting:', error);
    return { error: error.message };
  }
});

// Tus server operations
ipcMain.handle('tus:getServerUrl', async () => {
  return getTusServerUrl();
});

ipcMain.handle('tus:processUploadedFile', async (_event, filePath: string, originalName: string, metadata: any) => {
  try {
    // Process the uploaded file - categorize it based on extension
    const fileExtension = path.extname(originalName).toLowerCase().substring(1);
    
    if (fileExtension === 'sgy' || fileExtension === 'segy') {
      // Copy to SEGY list for processing
      const segyListPath = path.join(__dirname, '../scripts/data/segy_list.txt');
      const dir = path.dirname(segyListPath);
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.appendFile(segyListPath, filePath + '\n');
    } else if (fileExtension === 'las') {
      // Copy to LAS list for processing
      const lasListPath = path.join(__dirname, '../scripts/data/las_list.txt');
      const dir = path.dirname(lasListPath);
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.appendFile(lasListPath, filePath + '\n');
    } else {
      // Copy to others list for processing
      const othersListPath = path.join(__dirname, '../scripts/data/others_list.txt');
      const dir = path.dirname(othersListPath);
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.appendFile(othersListPath, filePath + '\n');
    }
    
    return { success: true, fileType: fileExtension };
  } catch (error: any) {
    console.error('Error processing uploaded file:', error);
    return { error: error.message };
  }
});

// Add a new handler to get file stats
ipcMain.handle('fs:getFileStats', async (_event, filePath: string) => {
  try {
    const stats = await fs.promises.stat(filePath);
    const fileName = path.basename(filePath);
    return {
      name: fileName,
      size: stats.size,
      path: filePath,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      modified: stats.mtime,
      created: stats.birthtime
    };
  } catch (error) {
    console.error('Error getting file stats:', error);
    throw error;
  }
});


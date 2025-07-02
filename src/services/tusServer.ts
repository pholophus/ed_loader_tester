import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';
import { createServer } from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { FtpService, FtpConfig, FtpTransferProgress, createFtpService } from './ftpService';

let httpServer: any = null;
let serverPort = 3001;
let ftpService: FtpService | null = null;

export interface TusServerConfig {
  uploadDir?: string;
  port?: number;
  onUploadComplete?: (file: any) => void;
  onUploadProgress?: (file: any, progress: number) => void;
  onFtpTransferStart?: (file: any) => void;
  onFtpTransferProgress?: (file: any, progress: FtpTransferProgress) => void;
  onFtpTransferComplete?: (file: any, remotePath: string) => void;
  onFtpTransferError?: (file: any, error: string) => void;
  ftpConfig?: FtpConfig;
  enableFtpTransfer?: boolean;
}

interface UploadInfo {
  id: string;
  size: number;
  offset: number;
  metadata: Record<string, string>;
  path: string;
}

const uploads = new Map<string, UploadInfo>();

function generateUploadId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function parseMetadata(metadataHeader: string): Record<string, string> {
  const metadata: Record<string, string> = {};
  if (!metadataHeader) return metadata;
  
  const pairs = metadataHeader.split(',');
  for (const pair of pairs) {
    const [key, value] = pair.trim().split(' ');
    if (key && value) {
      metadata[key] = Buffer.from(value, 'base64').toString('utf8');
    }
  }
  return metadata;
}

function handleTusRequest(req: IncomingMessage, res: ServerResponse, config: TusServerConfig, uploadDir: string) {
  console.log(`🌐 TUS Request: ${req.method} ${req.url}`);
  console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Upload-Offset, Upload-Length, Upload-Metadata, Tus-Resumable');
  res.setHeader('Access-Control-Expose-Headers', 'Upload-Offset, Upload-Length, Upload-Metadata, Tus-Resumable, Location');
  res.setHeader('Tus-Resumable', '1.0.0');

  if (req.method === 'OPTIONS') {
    console.log('✅ Responding to OPTIONS request');
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url || '', `http://localhost:${serverPort}`);
  console.log(`🔍 Parsed URL path: ${url.pathname}`);
  
  if (req.method === 'POST' && url.pathname === '/files') {
    console.log('📤 Creating new upload');
    // Create new upload
    const uploadLength = parseInt(req.headers['upload-length'] as string || '0');
    const uploadMetadata = parseMetadata(req.headers['upload-metadata'] as string || '');
    const uploadId = generateUploadId();
    
    console.log(`📏 Upload length: ${uploadLength}`);
    console.log(`📋 Upload metadata:`, uploadMetadata);
    
    const uploadInfo: UploadInfo = {
      id: uploadId,
      size: uploadLength,
      offset: 0,
      metadata: uploadMetadata,
      path: path.join(uploadDir, uploadId)
    };
    
    uploads.set(uploadId, uploadInfo);
    
    // Create empty file
    fs.writeFileSync(uploadInfo.path, '');
    
    console.log('🚀 Upload created:', uploadId);
    console.log('📁 File path:', uploadInfo.path);
    
    res.setHeader('Location', `/files/${uploadId}`);
    res.writeHead(201);
    res.end();
    return;
  }
  
  if (req.method === 'PATCH' && url.pathname.startsWith('/files/')) {
    console.log('⬆️ Continuing upload');
    // Continue upload
    const uploadId = url.pathname.split('/')[2];
    const uploadInfo = uploads.get(uploadId);
    
    console.log(`🔍 Looking for upload ID: ${uploadId}`);
    
    if (!uploadInfo) {
      console.log('❌ Upload not found');
      res.writeHead(404);
      res.end();
      return;
    }
    
    const uploadOffset = parseInt(req.headers['upload-offset'] as string || '0');
    console.log(`📍 Upload offset: ${uploadOffset}, expected: ${uploadInfo.offset}`);
    
    if (uploadOffset !== uploadInfo.offset) {
      console.log('⚠️ Offset mismatch - conflict');
      res.writeHead(409); // Conflict
      res.end();
      return;
    }
    
    const chunks: Buffer[] = [];
    
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    req.on('end', async () => {
      const data = Buffer.concat(chunks);
      console.log(`📦 Received ${data.length} bytes`);
      
      // Write data to file
      const fd = fs.openSync(uploadInfo.path, 'r+');
      fs.writeSync(fd, data, 0, data.length, uploadInfo.offset);
      fs.closeSync(fd);
      
      uploadInfo.offset += data.length;
      uploads.set(uploadId, uploadInfo);
      
      const progress = (uploadInfo.offset / uploadInfo.size) * 100;
      console.log(`📊 Upload progress for ${uploadId}: ${progress.toFixed(2)}%`);
      
      if (config.onUploadProgress) {
        config.onUploadProgress(uploadInfo, progress);
      }
      
      res.setHeader('Upload-Offset', uploadInfo.offset.toString());
      res.writeHead(204);
      res.end();
      
      // Check if upload is complete
      if (uploadInfo.offset >= uploadInfo.size) {
        console.log('✅ Upload completed:', uploadId);
        
        const fileInfo = {
          id: uploadInfo.id,
          path: uploadInfo.path,
          size: uploadInfo.size,
          metadata: uploadInfo.metadata,
          originalName: uploadInfo.metadata.filename || uploadInfo.id
        };

        if (config.onUploadComplete) {
          config.onUploadComplete(fileInfo);
        }
        
        // Start FTP transfer if enabled
        if (config.enableFtpTransfer && ftpService) {
          await startFtpTransfer(fileInfo, config);
        }
        
        uploads.delete(uploadId);
      }
    });
    
    return;
  }
  
  if (req.method === 'HEAD' && url.pathname.startsWith('/files/')) {
    console.log('🔍 Getting upload info');
    // Get upload info
    const uploadId = url.pathname.split('/')[2];
    const uploadInfo = uploads.get(uploadId);
    
    if (!uploadInfo) {
      console.log('❌ Upload not found for HEAD request');
      res.writeHead(404);
      res.end();
      return;
    }
    
    console.log(`📊 Upload info - Offset: ${uploadInfo.offset}, Size: ${uploadInfo.size}`);
    
    res.setHeader('Upload-Offset', uploadInfo.offset.toString());
    res.setHeader('Upload-Length', uploadInfo.size.toString());
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Not found
  console.log('❌ Request not handled - 404');
  res.writeHead(404);
  res.end();
}

async function startFtpTransfer(fileInfo: any, config: TusServerConfig): Promise<void> {
  try {
    console.log(`🚀 Starting FTP transfer for: ${fileInfo.originalName}`);
    
    if (config.onFtpTransferStart) {
      config.onFtpTransferStart(fileInfo);
    }

    if (!ftpService) {
      throw new Error('FTP service not initialized');
    }

    // Use original filename for remote file
    const remoteFileName = fileInfo.originalName || fileInfo.id;
    
    const result = await ftpService.uploadFile(
      fileInfo.path,
      remoteFileName,
      (progress) => {
        console.log(`📊 FTP progress for ${remoteFileName}: ${progress.percentage}%`);
        if (config.onFtpTransferProgress) {
          config.onFtpTransferProgress(fileInfo, progress);
        }
      }
    );

    if (result.success) {
      console.log(`✅ FTP transfer completed: ${result.remotePath}`);
      
      if (config.onFtpTransferComplete) {
        config.onFtpTransferComplete(fileInfo, result.remotePath || '');
      }

      // Clean up local file after successful FTP transfer
      try {
        fs.unlinkSync(fileInfo.path);
        console.log(`🗑️ Cleaned up local file: ${fileInfo.path}`);
      } catch (cleanupError) {
        console.warn('Warning: Could not clean up local file:', cleanupError);
      }
    } else {
      console.error(`❌ FTP transfer failed: ${result.error}`);
      
      if (config.onFtpTransferError) {
        config.onFtpTransferError(fileInfo, result.error || 'Unknown FTP error');
      }
    }
  } catch (error: any) {
    console.error('❌ FTP transfer error:', error);
    
    if (config.onFtpTransferError) {
      config.onFtpTransferError(fileInfo, error.message || 'Unknown FTP error');
    }
  }
}

export function startTusServer(config: TusServerConfig = {}): Promise<number> {
  return new Promise((resolve, reject) => {
    const uploadDir = config.uploadDir || path.join(app.getPath('userData'), 'uploads');
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Initialize FTP service if config is provided
    if (config.ftpConfig && config.enableFtpTransfer) {
      ftpService = createFtpService(config.ftpConfig);
      console.log('📡 FTP service initialized');
    }
    
    const port = config.port || serverPort;
    
    httpServer = createServer((req, res) => {
      handleTusRequest(req, res, config, uploadDir);
    });
    
    httpServer.listen(port, () => {
      console.log(`🎯 Tus server started on port ${port}`);
      console.log(`📡 Upload endpoint: http://localhost:${port}/files`);
      if (config.enableFtpTransfer) {
        console.log('📤 FTP transfer enabled');
      }
      serverPort = port;
      resolve(port);
    });

    httpServer.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        const newPort = port + 1;
        console.log(`Port ${port} is in use, trying ${newPort}`);
        config.port = newPort;
        startTusServer(config).then(resolve).catch(reject);
      } else {
        reject(error);
      }
    });
  });
}

export function stopTusServer() {
  if (httpServer) {
    httpServer.close();
    httpServer = null;
    uploads.clear();
    console.log('🛑 Tus server stopped');
  }

  // Disconnect FTP service
  if (ftpService) {
    ftpService.disconnect();
    ftpService = null;
    console.log('🔌 FTP service disconnected');
  }
}

export function getTusServerUrl(): string {
  return `http://localhost:${serverPort}`;
}

export async function testFtpConnection(ftpConfig: FtpConfig): Promise<boolean> {
  try {
    const testService = createFtpService(ftpConfig);
    const result = await testService.testConnection();
    return result;
  } catch (error) {
    console.error('FTP test failed:', error);
    return false;
  }
} 
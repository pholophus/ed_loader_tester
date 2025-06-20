import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';
import { createServer } from 'http';
import { IncomingMessage, ServerResponse } from 'http';

let httpServer: any = null;
let serverPort = 3001;

export interface TusServerConfig {
  uploadDir?: string;
  port?: number;
  onUploadComplete?: (file: any) => void;
  onUploadProgress?: (file: any, progress: number) => void;
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
    
    req.on('end', () => {
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
        
        if (config.onUploadComplete) {
          const fileInfo = {
            id: uploadInfo.id,
            path: uploadInfo.path,
            size: uploadInfo.size,
            metadata: uploadInfo.metadata,
            originalName: uploadInfo.metadata.filename || uploadInfo.id
          };
          config.onUploadComplete(fileInfo);
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

export function startTusServer(config: TusServerConfig = {}): Promise<number> {
  return new Promise((resolve, reject) => {
    const uploadDir = config.uploadDir || path.join(app.getPath('userData'), 'uploads');
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const port = config.port || serverPort;
    
    httpServer = createServer((req, res) => {
      handleTusRequest(req, res, config, uploadDir);
    });
    
    httpServer.listen(port, () => {
      console.log(`🎯 Tus server started on port ${port}`);
      console.log(`📡 Upload endpoint: http://localhost:${port}/files`);
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
}

export function getTusServerUrl(): string {
  return `http://localhost:${serverPort}`;
} 
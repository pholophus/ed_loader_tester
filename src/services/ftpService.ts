import { Client as FtpClient } from 'basic-ftp';
import * as fs from 'fs';
import * as path from 'path';

export interface FtpConfig {
  host: string;
  username: string;
  password: string;
  port?: number;
  secure?: boolean;
  remotePath?: string;
}

export interface FtpTransferProgress {
  transferredBytes: number;
  totalBytes: number;
  percentage: number;
  filename: string;
}

export interface FtpTransferResult {
  success: boolean;
  remotePath?: string;
  error?: string;
  transferredBytes?: number;
}

export class FtpService {
  private config: FtpConfig;
  private client: FtpClient | null = null;
  private isConnected = false;

  constructor(config: FtpConfig) {
    this.config = {
      port: 21,
      secure: false,
      remotePath: '/',
      ...config
    };
  }

  async connect(): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        return true;
      }

      this.client = new FtpClient();
      
      console.log(`🔌 Connecting to FTP server: ${this.config.host}:${this.config.port}`);
      
      await this.client.access({
        host: this.config.host,
        port: this.config.port,
        user: this.config.username,
        password: this.config.password,
        secure: this.config.secure
      });

      this.isConnected = true;
      console.log('✅ FTP connection established');
      
      // Navigate to the specified remote path
      if (this.config.remotePath && this.config.remotePath !== '/') {
        await this.client.ensureDir(this.config.remotePath);
        console.log(`📁 Changed to remote directory: ${this.config.remotePath}`);
      }

      return true;
    } catch (error) {
      console.error('❌ FTP connection failed:', error);
      this.isConnected = false;
      this.client = null;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        this.client.close();
        console.log('🔌 FTP connection closed');
      }
    } catch (error) {
      console.error('Error closing FTP connection:', error);
    } finally {
      this.client = null;
      this.isConnected = false;
    }
  }

  async uploadFile(
    localFilePath: string, 
    remoteFileName: string,
    onProgress?: (progress: FtpTransferProgress) => void,
    maxRetries: number = 3,
    retryDelay: number = 2000
  ): Promise<FtpTransferResult> {
    // Check if local file exists first
    if (!fs.existsSync(localFilePath)) {
      return { success: false, error: 'Local file does not exist' };
    }

    const fileStats = fs.statSync(localFilePath);
    const totalBytes = fileStats.size;

    // Retry loop
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Force reconnection on retry attempts
        if (attempt > 1) {
          console.log(`🔄 Retry attempt ${attempt}/${maxRetries} for: ${remoteFileName}`);
          await this.disconnect();
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }

        // Ensure we're connected
        if (!this.isConnected || !this.client) {
          const connected = await this.connect();
          if (!connected || !this.client) {
            if (attempt === maxRetries) {
              return { success: false, error: 'Failed to connect to FTP server after retries' };
            }
            continue; // Try next attempt
          }
        }

        let transferredBytes = 0;
        console.log(`📤 Starting FTP upload: ${remoteFileName} (${totalBytes} bytes) - Attempt ${attempt}`);

        // Create progress tracking
        const progressCallback = (info: any) => {
          transferredBytes = info.bytes || 0;
          const percentage = totalBytes > 0 ? Math.round((transferredBytes / totalBytes) * 100) : 0;
          
          if (onProgress) {
            onProgress({
              transferredBytes,
              totalBytes,
              percentage,
              filename: remoteFileName
            });
          }
        };

        // Set up progress tracking and perform upload
        if (this.client) {
          this.client.trackProgress(progressCallback);

          // Perform the upload
          const remotePath = path.posix.join(this.config.remotePath || '/', remoteFileName);
          await this.client.uploadFrom(localFilePath, remotePath);

          // Stop progress tracking
          this.client.trackProgress();
        }

        console.log(`✅ FTP upload completed: ${remoteFileName}`);
        
        return {
          success: true,
          remotePath: path.posix.join(this.config.remotePath || '/', remoteFileName),
          transferredBytes: totalBytes
        };

      } catch (error: any) {
        console.error(`❌ FTP upload failed (attempt ${attempt}/${maxRetries}):`, error);
        
        // Stop progress tracking on error
        if (this.client) {
          this.client.trackProgress();
        }

        // Check if this is a connection-related error that we should retry
        const errorMessage = error.message || '';
        const isConnectionError = errorMessage.includes('FIN packet') || 
                                 errorMessage.includes('closed') || 
                                 errorMessage.includes('connection') ||
                                 errorMessage.includes('timeout') ||
                                 errorMessage.includes('ECONNRESET') ||
                                 errorMessage.includes('EPIPE');

        if (isConnectionError && attempt < maxRetries) {
          console.log(`🔄 Connection error detected, will retry: ${errorMessage}`);
          // Force disconnect to ensure clean reconnection
          await this.disconnect();
          continue; // Try next attempt
        }

        // If not a connection error, or we've exhausted retries, return the error
        return {
          success: false,
          error: attempt === maxRetries 
            ? `Upload failed after ${maxRetries} attempts: ${errorMessage}`
            : errorMessage
        };
      }
    }

    // Should never reach here, but just in case
    return { success: false, error: 'Upload failed for unknown reason' };
  }

  async testConnection(): Promise<boolean> {
    try {
      const connected = await this.connect();
      if (connected && this.client) {
        // Test by listing the current directory
        await this.client.list();
        await this.disconnect();
        return true;
      }
      return false;
    } catch (error) {
      console.error('FTP test connection failed:', error);
      await this.disconnect();
      return false;
    }
  }

  async ensureRemoteDirectory(remotePath: string): Promise<boolean> {
    try {
      if (!this.isConnected || !this.client) {
        const connected = await this.connect();
        if (!connected || !this.client) return false;
      }

      if (this.client) {
        await this.client.ensureDir(remotePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to ensure remote directory:', error);
      return false;
    }
  }

  isConnectionActive(): boolean {
    return this.isConnected && this.client !== null;
  }

  getConfig(): FtpConfig {
    return { ...this.config };
  }
}

// Singleton instance for the default FTP configuration
let defaultFtpService: FtpService | null = null;

export function createFtpService(config: FtpConfig): FtpService {
  return new FtpService(config);
}

export function getDefaultFtpService(): FtpService | null {
  return defaultFtpService;
}

export function initializeDefaultFtpService(config: FtpConfig): FtpService {
  defaultFtpService = new FtpService(config);
  return defaultFtpService;
} 
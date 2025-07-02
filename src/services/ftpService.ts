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
    onProgress?: (progress: FtpTransferProgress) => void
  ): Promise<FtpTransferResult> {
    try {
      if (!this.isConnected || !this.client) {
        const connected = await this.connect();
        if (!connected || !this.client) {
          return { success: false, error: 'Failed to connect to FTP server' };
        }
      }

      // Check if local file exists
      if (!fs.existsSync(localFilePath)) {
        return { success: false, error: 'Local file does not exist' };
      }

      const fileStats = fs.statSync(localFilePath);
      const totalBytes = fileStats.size;
      let transferredBytes = 0;

      console.log(`📤 Starting FTP upload: ${remoteFileName} (${totalBytes} bytes)`);

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

      // Set up progress tracking
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
      console.error('❌ FTP upload failed:', error);
      
      // Stop progress tracking on error
      if (this.client) {
        this.client.trackProgress();
      }
      
      return {
        success: false,
        error: error.message || 'Unknown FTP upload error'
      };
    }
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
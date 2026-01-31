import { Client } from 'basic-ftp';
import { createReadStream } from 'fs';
import path from 'path';

export interface FTPConfig {
  host: string;
  user: string;
  password: string;
  port: number;
  remoteDir: string;
  cdnBaseUrl: string;
}

export interface FTPTransferResult {
  success: boolean;
  cdnUrl?: string;
  error?: string;
  duration?: number;
}

// Get FTP config from environment
export function getFTPConfig(): FTPConfig {
  const host = process.env.FTP_HOST;
  const user = process.env.FTP_USER;
  const password = process.env.FTP_PASSWORD;
  const port = parseInt(process.env.FTP_PORT || '21');
  const remoteDir = process.env.FTP_REMOTE_DIR;
  const cdnBaseUrl = process.env.CDN_BASE_URL;

  if (!host || !user || !password || !remoteDir || !cdnBaseUrl) {
    throw new Error('FTP configuration incomplete. Check .env.local');
  }

  return { host, user, password, port, remoteDir, cdnBaseUrl };
}

/**
 * Upload file to O2Switch FTP
 * @param localPath - Full path to local file on VPS
 * @param remoteFilename - Filename to use on FTP (optional, defaults to basename)
 * @returns CDN URL if successful
 */
export async function uploadToO2Switch(
  localPath: string,
  remoteFilename?: string
): Promise<FTPTransferResult> {
  const startTime = Date.now();
  const client = new Client();
  client.ftp.verbose = process.env.NODE_ENV === 'development';

  try {
    const config = getFTPConfig();

    // Connect to FTP
    await client.access({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
      secure: false, // Use FTPS if available
    });

    console.log('✅ FTP connected to', config.host);

    // Navigate to remote directory
    await client.ensureDir(config.remoteDir);
    console.log('📁 Remote directory:', config.remoteDir);

    // Determine remote filename
    const filename = remoteFilename || path.basename(localPath);

    // Upload file
    const readStream = createReadStream(localPath);
    await client.uploadFrom(readStream, filename);

    const duration = Date.now() - startTime;
    console.log(`✅ Upload complete: ${filename} (${duration}ms)`);

    // Generate CDN URL
    const cdnUrl = `${config.cdnBaseUrl}/${filename}`;

    return {
      success: true,
      cdnUrl,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ FTP upload failed:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown FTP error',
      duration,
    };
  } finally {
    client.close();
  }
}

/**
 * Check FTP connection health
 */
export async function checkFTPConnection(): Promise<boolean> {
  const client = new Client();

  try {
    const config = getFTPConfig();
    await client.access({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
      secure: false,
    });

    console.log('✅ FTP connection test successful');
    return true;
  } catch (error) {
    console.error('❌ FTP connection test failed:', error);
    return false;
  } finally {
    client.close();
  }
}

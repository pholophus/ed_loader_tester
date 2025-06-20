import { createHash } from 'crypto';
import { createReadStream, readdirSync, statSync } from 'fs';
import { promisify } from 'util';
import { pipeline } from 'stream';
import * as path from 'path';

// Set the folder path here
const FOLDER_PATH = 'test_files/MYS1993P20152DM01PMOREGION'; // Change this to your folder

// Promisify the pipeline function for async/await
const pipelineAsync = promisify(pipeline);

/**
 * Computes the SHA-256 hash of a file.
 * @param filePath Path to the file.
 * @returns Promise<string> SHA-256 hash in hex format.
 */
async function computeSha256(filePath: string): Promise<string> {
  const hash = createHash('sha256');
  const stream = createReadStream(filePath);

  try {
    // Pipe the file stream through the hash generator
    await pipelineAsync(stream, hash);
    return hash.digest('hex');
  } catch (err) {
    throw new Error(`Failed to compute hash: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Computes SHA-256 hashes for all files in a folder (non-recursive).
 * @param folderPath Path to the folder.
 */
async function computeHashesInFolder(folderPath: string) {
  const files = readdirSync(folderPath);
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    if (statSync(filePath).isFile()) {
      try {
        const hash = await computeSha256(filePath);
        // console.log(`${file}: ${hash}`);
      } catch (err) {
        console.error(`Error hashing ${file}:`, err instanceof Error ? err.message : String(err));
      }
    }
  }
}

// Run directly
computeHashesInFolder(FOLDER_PATH);
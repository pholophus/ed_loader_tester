import * as fs from 'fs';
import * as path from 'path';
import { dialog } from 'electron';

/**
 * Open a folder dialog and return the selected path
 * @returns Object with selected folder path or cancellation info
 */
export async function openFolderDialog() {
  return await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
}

/**
 * Read the contents of a directory
 * @param folderPath - Path to the folder to read
 * @returns Array of file/directory names or empty array on error
 */
export function readDirectory(folderPath: string): string[] {
  try {
    // console.log('Reading directory:', folderPath);
    return fs.readdirSync(folderPath);
  } catch (e) {
    console.error('Error reading directory:', e);
    return [];
  }
}

/**
 * Get file stats for a given path
 * @param filePath - Path to the file
 * @returns Object with file stats or null on error
 */
export function getFileStats(filePath: string) {
  try {
    return fs.statSync(filePath);
  } catch (e) {
    console.error('Error getting file stats:', e);
    return null;
  }
}

/**
 * Check if a file exists
 * @param filePath - Path to the file
 * @returns Boolean indicating if the file exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Read a text file
 * @param filePath - Path to the file
 * @returns File contents as string or null on error
 */
export function readTextFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    console.error('Error reading file:', e);
    return null;
  }
}

/**
 * Read a single file.
 * @param filePath - The path of the file to read.
 * @returns A promise that resolves with the file content as a string, or null if an error occurs.
 */
export async function readSingleFile(filePath: string): Promise<string | null> {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading single file:', error);
    return null;
  }
}

/**
 * Write to a text file
 * @param filePath - Path to the file
 * @param content - Content to write
 * @returns Boolean indicating success
 */
export function writeTextFile(filePath: string, content: string): boolean {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (e) {
    console.error('Error writing file:', e);
    return false;
  }
} 
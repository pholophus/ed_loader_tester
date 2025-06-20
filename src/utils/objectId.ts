/**
 * Utility functions for ObjectId operations without mongoose dependency
 */

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param id String to validate
 * @returns boolean indicating if the string is a valid ObjectId
 */
export function isValidObjectId(id: string | any): boolean {
  if (typeof id !== 'string') return false;
  
  // MongoDB ObjectId is 24 character hex string
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
}

/**
 * Ensure a value is a string representation of ObjectId
 * @param id ObjectId value (string or other)
 * @returns string representation of the ObjectId
 */
export function toObjectIdString(id: any): string {
  if (typeof id === 'string') return id;
  if (id && typeof id === 'object' && id.toString) return id.toString();
  return id;
} 
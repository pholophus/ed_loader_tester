import { useWellMetadata } from "../renderer/Composables/useWellMetadata";
import { useWellMetadataPivot } from "../renderer/Composables/useWellMetadataPivot";
import WellMetadata from "../schemas/WellMetadata";
import mongoose from 'mongoose';

/**
 * Excludes specified keys from an object
 * @param obj The object to exclude keys from
 * @param keysToExclude Array of keys to exclude
 * @returns A new object without the excluded keys
 */
function excludeKeys<T extends object>(obj: T, keysToExclude: (keyof T)[]): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keysToExclude.includes(key as keyof T))
  ) as Partial<T>;
}

/**
 * Upserts well metadata and inserts pivot entries for newly inserted metadata.
 *
 * @param wellMetadatasToUpsert An array of well metadata objects to upsert.
 * @param wellId The ID of the well to associate the metadata with.
 * @returns Promise<void>
 */
export async function processWellMetadata(wellMetadatasToUpsert: WellMetadata[]): Promise<void> {
  const { upsert: wellMetadataUpsert } = useWellMetadata();
  const { insert: wellMedataPivotInsert } = useWellMetadataPivot();

  for (const wellMetadataToUpsert of wellMetadatasToUpsert) {
    try {
      const wellId = wellMetadataToUpsert.wellId;
      const filteredMetadata = excludeKeys(wellMetadataToUpsert, ['wellId','_id']); // Add any keys you want to exclude
      
      const upsertedMetadata = await wellMetadataUpsert(
        { fileName: wellMetadataToUpsert.fileName }, 
        filteredMetadata as WellMetadata
      );

      // console.log("upsertedMetadata ", upsertedMetadata);

      if (upsertedMetadata && (upsertedMetadata as any)._id) {
        // Skip pivot creation if wellId is empty or invalid
        if (!wellId) {
          console.warn(`Skipping pivot creation for file ${wellMetadataToUpsert.fileName}: No wellId provided`);
          return;
        }

        // Validate wellId before creating ObjectId
        if (!mongoose.Types.ObjectId.isValid(wellId)) {
          throw new Error(`Invalid wellId format for file ${wellMetadataToUpsert.fileName}: ${wellId}. WellId must be a valid 24-character hex string.`);
        }

        await wellMedataPivotInsert({
          wellId: (wellId as any) as mongoose.Types.ObjectId,
          wellDataId: (upsertedMetadata as any)._id as mongoose.Types.ObjectId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error(`Service Error: Failed to process well metadata for file ${wellMetadataToUpsert.fileName}:`, error);
      // Re-throw the error to be caught by the caller
      throw error;
    }
  }
} 
import { useSeismicLine } from '../renderer/Composables/useSeismicLine';
import { useSeismicData } from '../renderer/Composables/useSeismicData';
import { SeismicLine } from '../schemas/SeismicLine';
import { SeismicData } from '../schemas/SeismicData';
import { useWell } from '../renderer/Composables/useWell';
import { useWellMetadata } from "../renderer/Composables/useWellMetadata";
import { useWellMetadataPivot } from "../renderer/Composables/useWellMetadataPivot";
import Well from "../schemas/Well";
import WellMetadata from "../schemas/WellMetadata";

import mongoose from 'mongoose';
import { useSeismicLineDataPivot } from '../renderer/Composables/useSeismicLineDataPivot';

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

export async function processMetadata(wellMetadatasToUpsert: WellMetadata[], seismicDatasToUpsert: SeismicData[]): Promise<void> {
    const { upsert: seismicDataUpsert } = useSeismicData();
    const { insert: seismicLineDataPivotInsert } = useSeismicLineDataPivot();

    for (const seismicDataToUpsert of seismicDatasToUpsert) {
        try {
            const seismicLineId = seismicDataToUpsert.seismicLineId;
            const filteredMetadata = excludeKeys(seismicDataToUpsert, ['seismicLineId', '_id']); // Add any keys you want to exclude

            const upsertedMetadata = await seismicDataUpsert(
                { fileName: seismicDataToUpsert.fileName },
                filteredMetadata as SeismicData
            );

            if (upsertedMetadata && (upsertedMetadata as any)._id) {
                // Skip pivot creation if wellId is empty or invalid
                if (!seismicLineId) {
                    console.warn(`Skipping pivot creation for file ${upsertedMetadata.fileName}: No seismicLineId provided`);
                    return;
                }

                // Validate wellId before creating ObjectId
                if (!mongoose.Types.ObjectId.isValid(seismicLineId)) {
                    throw new Error(`Invalid wellId format for file ${upsertedMetadata.fileName}: ${seismicLineId}. seismicLineId must be a valid 24-character hex string.`);
                }

                await seismicLineDataPivotInsert({
                    lineId: (seismicLineId as any) as mongoose.Types.ObjectId,
                    seismicDataId: (upsertedMetadata as any)._id as mongoose.Types.ObjectId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        } catch (error) {
            console.error(`Service Error: Failed to process seismic metadata for file ${seismicDataToUpsert.fileName}:`, error);
            // Re-throw the error to be caught by the caller
            throw error;
        }
    }

    const { upsert: wellMetadataUpsert } = useWellMetadata();
    const { insert: wellMedataPivotInsert } = useWellMetadataPivot();

    for (const wellMetadataToUpsert of wellMetadatasToUpsert) {
        try {
            const wellId = wellMetadataToUpsert.wellId;
            const filteredMetadata = excludeKeys(wellMetadataToUpsert, ['wellId', '_id']); // Add any keys you want to exclude

            const upsertedMetadata = await wellMetadataUpsert(
                { fileName: wellMetadataToUpsert.fileName },
                filteredMetadata as WellMetadata
            );

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

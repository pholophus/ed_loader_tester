import WellMetadata from '../../schemas/WellMetadata';
import { useMongo } from './useMongo'; // adjust path as needed
import { ref } from 'vue';

export const useWellMetadata = () => {
    const baseCrud = useMongo<WellMetadata>('welldatas');
    
    const getWellsForMetadata = async (metadataId: string) => {
        const loading = ref(false);
        const error = ref<string | null>(null);
        const wells = ref<any[]>([]);

        loading.value = true;
        error.value = null;

        try {
            const pipeline = [
                {
                    $match: { 
                        wellMetadataId: { $eq: metadataId }
                    }
                },
                {
                    $lookup: {
                        from: 'wells',
                        localField: 'wellId',
                        foreignField: '_id',
                        as: 'well'
                    }
                },
                {
                    $unwind: '$well'
                },
                {
                    $replaceRoot: { newRoot: '$well' }
                }
            ];

            // @ts-ignore
            const result = await window.mongoAPI.aggregate('wellmetadatapivots', pipeline);

            if (Array.isArray(result)) {
                wells.value = result;
            } else {
                error.value = result.error || 'No wells found for this metadata';
            }
        } catch (e: any) {
            error.value = e.message;
        } finally {
            loading.value = false;
        }

        return {
            wells,
            loading,
            error
        };
    };

    const getMetadataWithWellCount = async () => {
        const loading = ref(false);
        const error = ref<string | null>(null);
        const metadataList = ref<any[]>([]);

        loading.value = true;
        error.value = null;

        try {
            const pipeline = [
                {
                    $lookup: {
                        from: 'wellmetadatapivots',
                        localField: '_id',
                        foreignField: 'wellMetadataId',
                        as: 'wells'
                    }
                },
                {
                    $addFields: {
                        wellCount: { $size: '$wells' }
                    }
                },
                {
                    $project: {
                        wells: 0 
                    }
                }
            ];

            // @ts-ignore
            const result = await window.mongoAPI.aggregate('wellmetadatas', pipeline);

            if (Array.isArray(result)) {
                metadataList.value = result;
            } else {
                error.value = result.error || 'Failed to fetch metadata with well counts';
            }
        } catch (e: any) {
            error.value = e.message;
        } finally {
            loading.value = false;
        }

        return {
            metadataList,
            loading,
            error
        };
    };

    // Function to create an empty WellMetadata object
    const createEmptyWellMetadata = (): WellMetadata => ({
        _id: undefined,
        datasetTypeId: undefined,
        subDatasetTypeId: undefined,
        status: undefined,
        fileName: undefined,
        fileFormat: undefined,
        fileSize: undefined,
        title: undefined,
        description: undefined,
        createdBy: undefined,
        createdFor: undefined,
        recordedBy: undefined,
        recordedOn: undefined,
        changedBy: undefined,
        changedOn: undefined,
        interpretedBy: undefined,
        interpretedOn: undefined,
        remarks: undefined,
        fileLocation: undefined,
        s3FilePath: undefined,
        spudDate: undefined,
        completionDate: undefined,
        topDepth: undefined,
        topDepthUom: undefined,
        baseDepth: undefined,
        baseDepthUom: undefined,
        wellId: undefined,
    });

    return {
        ...baseCrud,
        getWellsForMetadata,
        getMetadataWithWellCount,
        createEmptyWellMetadata,
    };
};

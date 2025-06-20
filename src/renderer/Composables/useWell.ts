import Well from '../../schemas/Well';
import { useMongo } from './useMongo';
import { ref } from 'vue';

export const useWell = () => {
    const baseCrud = useMongo<Well>('wells');
    
    const getWellMetadata = async (wellId: string) => {
        const loading = ref(false);
        const error = ref<string | null>(null);
        const metadata = ref<any>(null);

        loading.value = true;
        error.value = null;

        try {
            // Create the aggregation pipeline
            const pipeline = [
                {
                    $match: { 
                        wellId: { $eq: wellId }
                    }
                },
                {
                    $lookup: {
                        from: 'wellmetadatas',
                        localField: 'wellMetadataId',
                        foreignField: '_id',
                        as: 'metadata'
                    }
                },
                {
                    $unwind: '$metadata'
                },
                {
                    $replaceRoot: { newRoot: '$metadata' }
                }
            ];

            // @ts-ignore
            const result = await window.mongoAPI.aggregate('wellmetadatapivots', pipeline);

            if (Array.isArray(result)) {
                metadata.value = result;
            } else {
                error.value = result.error || 'Well metadata not found';
            }
        } catch (e: any) {
            error.value = e.message;
        } finally {
            loading.value = false;
        }

        return {
            metadata,
            loading,
            error
        };
    };

    const getWellsByLocation = async (coordinates: { lat: number; lon: number }, radiusKm: number) => {
        const loading = ref(false);
        const error = ref<string | null>(null);
        const wells = ref<Well[]>([]);

        loading.value = true;
        error.value = null;

        try {
            // @ts-ignore
            const result = await window.mongoAPI.find('wells', {
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [coordinates.lon, coordinates.lat]
                        },
                        $maxDistance: radiusKm * 1000 // Convert km to meters
                    }
                }
            });

            if (Array.isArray(result)) {
                wells.value = result;
            } else {
                error.value = 'Failed to fetch wells by location';
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

    const getWellsByDateRange = async (startDate: Date, endDate: Date) => {
        const loading = ref(false);
        const error = ref<string | null>(null);
        const wells = ref<Well[]>([]);

        loading.value = true;
        error.value = null;

        try {
            // @ts-ignore
            const result = await window.mongoAPI.find('wells', {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            });

            if (Array.isArray(result)) {
                wells.value = result;
            } else {
                error.value = 'Failed to fetch wells by date range';
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

    // Function to create an empty Well object
    const createEmptyWell = (): Well => ({
        _id: undefined,
        wellboreId: undefined,
        country: undefined,
        region: undefined,
        block: undefined,
        subBlock: undefined,
        field: undefined,
        operator: undefined,
        latitude: undefined,
        longitude: undefined,
        purpose: undefined,
        spudDate: undefined,
        completionDate: undefined,
        spudYear: undefined,
        status: undefined,
        reference: undefined,
        kellyBlushings: undefined,
        kellyBlushingUom: undefined,
        rotaryTable: undefined,
        rotaryTableUom: undefined,
        derrickFloor: undefined,
        derrickFloorUom: undefined,
        waterDepth: undefined,
        waterDepthUom: undefined,
        groundElevation: undefined,
        groundElevationUom: undefined,
        topDepth: undefined,
        topDepthUom: undefined,
        baseDepth: undefined,
        baseDepthUom: undefined,
        totalDepth: undefined,
        totalDepthUom: undefined,
        easting: undefined,
        northing: undefined,
        projected: undefined,
        remarks: undefined,
        createdAt: undefined,
        createdBy: undefined,
        updatedAt: undefined,
        updatedBy: undefined,
        UWI: undefined,
    });

    return {
        ...baseCrud,
        getWellMetadata,
        getWellsByLocation,
        getWellsByDateRange,
        createEmptyWell,
    };
};

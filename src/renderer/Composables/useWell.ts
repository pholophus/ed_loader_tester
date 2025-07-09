import Well from '../../schemas/Well';
import { useApi } from './useApi';
import { apiService } from '../../services/apiService';
import { getApiUrl } from '../../config/api';
import { ref } from 'vue';

export const useWell = () => {
    const baseCrud = useApi<Well>('well');
    
    // Override specific methods if needed with different endpoints
    const customFetch = async (query = {}) => {
        try {
            // Use a different endpoint for fetch if needed
            const result = await apiService.get('well/fetchAll', query);
            
            if (result.success && result.data) {
                return result.data;
            } else {
                throw new Error(result.error || 'Failed to fetch wells');
            }
        } catch (error: any) {
            console.error('Error in customFetch:', error);
            throw error; // Re-throw the error so calling code can handle it
        }
    };
    
    const getWellMetadata = async (wellId: string) => {
        const loading = ref(false);
        const error = ref<string | null>(null);
        const metadata = ref<any>(null);

        loading.value = true;
        error.value = null;

        try {
            // Use API endpoint for well metadata aggregation
            const response = await fetch(getApiUrl(`well-data/${wellId}`));
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            metadata.value = result;
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
            // Use API endpoint for location-based well search
            const response = await fetch(getApiUrl(`well/location?lat=${coordinates.lat}&lon=${coordinates.lon}&radius=${radiusKm}`));
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            wells.value = result;
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
            // Use API endpoint for date range well search
            const response = await fetch(getApiUrl(`well/date-range?start=${startDate.toISOString()}&end=${endDate.toISOString()}`));
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            wells.value = result;
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
        name: undefined, // Added missing property from schema
    });

    return {
        ...baseCrud,
        // Override fetch if needed
        fetch: customFetch,
        getWellMetadata,
        getWellsByLocation,
        getWellsByDateRange,
        createEmptyWell,
    };
};

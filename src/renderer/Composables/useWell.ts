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

    const update = async (wellId: string, data: any) => {
        const result = await apiService.put('well', wellId, data);
        return result;
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
        wellboreId: "",
        country: "",
        region: "",
        block: "",
        subBlock: "",
        field: "",
        operator: "",
        latitude: 0,
        longitude: 0,
        purpose: "",
        spudDate: "",
        completionDate: "",
        spudYear: 0,
        status: "",
        reference: "",
        kellyBlushings: 0,
        kellyBlushingUom: "",
        rotaryTable: 0,
        rotaryTableUom: "",
        derrickFloor: 0,
        derrickFloorUom: "",
        waterDepth: 0,
        waterDepthUom: "",
        groundElevation: 0,
        groundElevationUom: "",
        topDepth: 0,
        topDepthUom: "",
        baseDepth: 0,
        baseDepthUom: "",
        totalDepth: 0,
        totalDepthUom: "",
        easting: 0,
        northing: 0,
        projected: "",
        remarks: "",
        createdAt: "",
        createdBy: "",
        updatedAt: "",
        updatedBy: "",
        UWI: "",
        name: "", // Added missing property from schema
    });

    const insert = async (well: Well) => {
        const result = await apiService.post('well/create', well);
        return result;
    };

    return {
        ...baseCrud,
        // Override fetch if needed
        insert,
        update,
        fetch: customFetch,
        getWellMetadata,
        getWellsByLocation,
        getWellsByDateRange,
        createEmptyWell,
    };
};

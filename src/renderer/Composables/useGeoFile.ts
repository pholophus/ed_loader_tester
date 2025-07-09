import GeoFile from '../../schemas/GeoFile';
import { apiService } from '../../services/apiService';
import { useApi } from './useApi';

export function useGeoFile() {
    const createBulk = async (body: any) => {
        try {
            console.log('[Create GeoFile API] - Request body:', body);

            // Use the bulk creation endpoint
            const result = await apiService.post('geofile/create-bulk', body);

            if (result.success && result.data) {
                console.log('[Create GeoFile API] - Success response:', result.data);
                return result.data;
            } else {
                console.error('[Create GeoFile API] - Error response:', result.error);
                throw new Error(result.error || 'Failed to create GeoFiles');
            }
        } catch (error: any) {
            console.error('Error in createBulk:', error);
            throw error; // Re-throw the error so calling code can handle it
        }
    };

    return {
        ...useApi<GeoFile>('geofile'),
        createBulk
    };
} 
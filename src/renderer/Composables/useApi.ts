import { ref } from 'vue';
import { apiService, type ApiResponse } from '../../services/apiService';

export const useApi = <T = any>(endpoint: string) => {
    const items = ref<T[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetch = async (query = {}, sessionId?: string): Promise<T[]> => {
        loading.value = true;
        error.value = null;
        try {
            console.log(`[useApi] Fetching from ${endpoint} with query:`, JSON.stringify(query, null, 2));
            
            const result: ApiResponse<T[]> = await apiService.get(endpoint, query);
            
            console.log(`[useApi] Raw result for ${endpoint}:`, result);
            
            if (result.success && result.data) {
                console.log(`[useApi] Setting items for ${endpoint}, count:`, result.data.length);
                items.value = result.data;
                return result.data;
            } else {
                console.log(`[useApi] API call failed for ${endpoint}:`, result.error);
                error.value = result.error || 'Unknown error';
                return [];
            }
        } catch (e: any) {
            console.error(`[useApi] Error fetching from ${endpoint}:`, e);
            error.value = e.message;
            return [];
        } finally {
            loading.value = false;
        }
    };

    const insert = async (document: T, sessionId?: string): Promise<T> => {
        loading.value = true;
        error.value = null;
        try {
            const result: ApiResponse<T> = await apiService.post(endpoint, document);
            
            if (result.success && result.data) {
                console.log('Insert successful', result.data);
                return result.data;
            } else {
                error.value = result.error || 'Insert failed';
                throw new Error(result.error || 'Insert failed');
            }
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            loading.value = false;
        }
    };

    const insertMany = async (documents: T[], sessionId?: string): Promise<T[]> => {
        loading.value = true;
        error.value = null;
        try {
            const result: ApiResponse<T[]> = await apiService.postMany(endpoint, documents);
            
            if (result.success && result.data) {
                console.log('Bulk insert successful', result.data);
                return result.data;
            } else {
                error.value = result.error || 'Bulk insert failed';
                throw new Error(result.error || 'Bulk insert failed');
            }
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            loading.value = false;
        }
    };

    const update = async (filter: any, updateData: any, sessionId?: string): Promise<T | null> => {
        loading.value = true;
        error.value = null;
        try {
            let result: ApiResponse<T>;

            // If filter has _id, treat it as ID-based update
            if (filter._id && typeof filter._id === 'string') {
                result = await apiService.put(endpoint, filter._id, updateData);
            } else {
                // Use custom filter-based update
                result = await apiService.updateWithFilter(endpoint, filter, updateData);
            }

            if (result.success) {
                // Optionally refresh the items list
                await fetch();
                return result.data || null;
            } else {
                error.value = result.error || 'Update failed';
                return null;
            }
        } catch (e: any) {
            error.value = e.message;
            return null;
        } finally {
            loading.value = false;
        }
    };

    const remove = async (filter: any, sessionId?: string): Promise<boolean> => {
        loading.value = true;
        error.value = null;
        try {
            let result: ApiResponse<any>;

            // If filter has _id, treat it as ID-based delete
            if (filter._id && typeof filter._id === 'string') {
                result = await apiService.delete(endpoint, filter._id);
            } else {
                // For more complex filters, you might need a custom delete endpoint
                // For now, we'll assume the API supports this pattern
                const deleteUrl = `${endpoint}/delete`;
                result = await apiService.updateWithFilter(deleteUrl.replace(`${endpoint}/`, ''), filter, {});
            }

            if (result.success) {
                // Refresh the items list
                await fetch();
                return true;
            } else {
                error.value = result.error || 'Delete failed';
                return false;
            }
        } catch (e: any) {
            error.value = e.message;
            return false;
        } finally {
            loading.value = false;
        }
    };

    const upsert = async (filter: any, document: T, sessionId?: string): Promise<T> => {
        loading.value = true;
        error.value = null;
        try {
            const result: ApiResponse<T> = await apiService.upsert(endpoint, filter, document);
            
            if (result.success && result.data) {
                console.log('Upsert successful', result.data);
                return result.data;
            } else {
                error.value = result.error || 'Upsert failed';
                throw new Error(result.error || 'Upsert failed');
            }
        } catch (e: any) {
            error.value = e.message;
            throw e;
        } finally {
            loading.value = false;
        }
    };

    const getById = async (id: string): Promise<T | null> => {
        loading.value = true;
        error.value = null;
        try {
            const result: ApiResponse<T> = await apiService.getById(endpoint, id);
            
            if (result.success && result.data) {
                return result.data;
            } else {
                error.value = result.error || 'Document not found';
                return null;
            }
        } catch (e: any) {
            error.value = e.message;
            return null;
        } finally {
            loading.value = false;
        }
    };

    const aggregate = async (pipeline: any[], sessionId?: string): Promise<T[]> => {
        loading.value = true;
        error.value = null;
        try {
            const result: ApiResponse<T[]> = await apiService.aggregate(endpoint, pipeline);
            
            if (result.success && result.data) {
                return result.data;
            } else {
                error.value = result.error || 'Aggregation failed';
                return [];
            }
        } catch (e: any) {
            error.value = e.message;
            return [];
        } finally {
            loading.value = false;
        }
    };

    const count = async (query = {}): Promise<number> => {
        loading.value = true;
        error.value = null;
        try {
            const result: ApiResponse<{ count: number }> = await apiService.count(endpoint, query);
            
            if (result.success && result.data) {
                return result.data.count;
            } else {
                error.value = result.error || 'Count failed';
                return 0;
            }
        } catch (e: any) {
            error.value = e.message;
            return 0;
        } finally {
            loading.value = false;
        }
    };

    return {
        items,
        loading,
        error,
        fetch,
        insert,
        insertMany,
        update,
        remove,
        upsert,
        getById,
        aggregate,
        count,
    };
}; 
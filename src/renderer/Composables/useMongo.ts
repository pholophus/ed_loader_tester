import { ref } from 'vue';

export const useMongo = <T = any>(collectionName: string) => {
    const items = ref<T[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetch = async (query = {}, session?: any) => {
        loading.value = true;
        error.value = null;
        try {
            // console.log(`[useMongo] Fetching from ${collectionName} with query:`, JSON.stringify(query, null, 2));
            // @ts-ignore
            const result = await window.mongoAPI.find(collectionName, query, session);
            // console.log(`[useMongo] Raw result for ${collectionName}:`, result);
            // console.log(`[useMongo] Result type:`, typeof result);
            // console.log(`[useMongo] Is array:`, Array.isArray(result));
            
            if (Array.isArray(result)) {
                // console.log(`[useMongo] Setting items for ${collectionName}, count:`, result.length);
                items.value = result;
                return result; // Return the result array
            } else {
                // console.log(`[useMongo] Result is not array for ${collectionName}:`, result);
                error.value = result?.error || 'Unknown error';
                return []; // Return empty array on error
            }
        } catch (e: any) {
            // console.error(`[useMongo] Error fetching from ${collectionName}:`, e);
            error.value = e.message;
            return []; // Return empty array on error
        } finally {
            loading.value = false;
        }
    };

    const insert = async (document: T, session?: any): Promise<T> => {
        loading.value = true;
        error.value = null;
        try {
            // @ts-ignore
            const result = await window.mongoAPI.insert(collectionName, document, session);
            if (result.error) {
                error.value = result.error;
                throw new Error(result.error);
            }
            console.log('Insert successful', result);
            return result; // Now returns the full document with _id
        } catch (e: any) {
            error.value = e.message;
            throw e; // Re-throw the error after logging
        } finally {
            loading.value = false;
        }
    };

    const insertMany = async (documents: T[], session?: any): Promise<T[]> => {
        loading.value = true;
        error.value = null;
        try {
            // @ts-ignore
            const result = await window.mongoAPI.insertMany(collectionName, documents, session);
            if (result.error) {
                error.value = result.error;
                throw new Error(result.error);
            }
            console.log('Bulk insert successful', result);
            return result; // Returns array of inserted documents with _ids
        } catch (e: any) {
            error.value = e.message;
            throw e; // Re-throw the error after logging
        } finally {
            loading.value = false;
        }
    };

    const update = async (filter: any, update: any, session?: any) => {
        loading.value = true;
        error.value = null;
        try {
            // @ts-ignore
            const result = await window.mongoAPI.update(collectionName, filter, update, session);
            if (result.error) {
                error.value = result.error;
            } else {
                await fetch();
            }
        } catch (e: any) {
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    };

    const remove = async (filter: any, session?: any) => {
        loading.value = true;
        error.value = null;
        try {
            // @ts-ignore
            const result = await window.mongoAPI.delete(collectionName, filter, session);
            if (result.error) {
                error.value = result.error;
            } else {
                await fetch();
            }
        } catch (e: any) {
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    };

    const upsert = async (filter: any, document: T, session?: any): Promise<T> => {
        loading.value = true;
        error.value = null;
        try {
            // @ts-ignore
            const result = await window.mongoAPI.upsert(collectionName, filter, document, session);
            if (result.error) {
                error.value = result.error;
                throw new Error(result.error);
            }
            console.log('Upsert successful', result);
            return result; // Now returns the full document with _id
        } catch (e: any) {
            error.value = e.message;
            throw e; // Re-throw the error after logging
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
    };
};

import { User } from '../../schemas/User';
import { apiService } from '../../services/apiService';
import { useApi } from './useApi'; // Changed from useMongo to useApi

export function useEmployee() {
    const fetchByPocketbaseID = async (id: string): Promise<User> => {
        const response = await apiService.get(`/employees/pocketbase/${id}`);
        return response as User;
    }

    return {
        ...useApi<User>('employees'),
        fetchByPocketbaseID
    };
} 
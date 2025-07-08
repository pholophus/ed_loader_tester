import SubDataType from '../../schemas/SubDataType';
import { useApi } from './useApi'; // Changed from useMongo to useApi

export function useSubDataType() {
  return useApi<SubDataType>('subdata-types'); // Now uses API endpoint http://localhost:3000/api/sub-data-types
}

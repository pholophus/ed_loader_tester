import DataType from '../../schemas/DataType';
import { useApi } from './useApi'; // Changed from useMongo to useApi

export function useDataType() {
  return useApi<DataType>('data-types'); // Now uses API endpoint http://localhost:3000/api/datatype
}

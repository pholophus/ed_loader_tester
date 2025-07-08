import CRS from '../../schemas/CRS';
import { useApi } from './useApi'; // Changed from useMongo to useApi

export function useCRS() {
  return useApi<CRS>('crs'); // Now uses API endpoint http://localhost:3000/api/crs
}

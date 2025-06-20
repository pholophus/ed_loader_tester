import CRS from '../../schemas/CRS';
import { useMongo } from './useMongo'; // adjust path as needed

export function useCRS() {
  return useMongo<CRS>('crs');
}

import { Country } from '../../schemas/Country';
import { useMongo } from './useMongo'; // adjust path as needed

export function useCountry() {
  return useMongo<Country>('countries');
} 
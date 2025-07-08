import { Country } from '../../schemas/Country';
import { useApi } from './useApi'; // Changed from useMongo to useApi

export function useCountry() {
  return useApi<Country>('countries'); // Now uses API endpoint http://localhost:3000/api/countries
} 
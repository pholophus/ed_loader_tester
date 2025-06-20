import WellSeismicDataPivot from '../../schemas/WellSeismicDataPivot';
import { useMongo } from './useMongo'; // adjust path as needed

export function useWellSeismicDataPivot() {
  return useMongo<WellSeismicDataPivot>('wellseismicdatapivot');
}

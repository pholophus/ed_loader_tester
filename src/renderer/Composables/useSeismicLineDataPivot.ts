import SeismicLineDataPivot from '../../schemas/SeismicLineDataPivot';
import { useMongo } from './useMongo'; // adjust path as needed

export function useSeismicLineDataPivot() {
  return useMongo<SeismicLineDataPivot>('seismiclinedatapivots');
}

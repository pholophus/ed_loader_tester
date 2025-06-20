import WellMetadataPivot from '../../schemas/WellMetadataPivot';
import { useMongo } from './useMongo'; // adjust path as needed

export function useWellMetadataPivot() {
  return useMongo<WellMetadataPivot>('welldatapivots');
}

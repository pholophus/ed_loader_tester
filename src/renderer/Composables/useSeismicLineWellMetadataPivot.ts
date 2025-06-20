import SeismicLineWellMetadataPivot from '../../schemas/SeismicLineWellMetadataPivot';
import { useMongo } from './useMongo'; // adjust path as needed

export function useSeismicLineWellMetadataPivot() {
  return useMongo<SeismicLineWellMetadataPivot>('seismiclinewellmetadatapivot');
}

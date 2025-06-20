import SubDataType from '../../schemas/SubDataType';
import { useMongo } from './useMongo'; // adjust path as needed

export function useSubDataType() {
  return useMongo<SubDataType>('subdatatype');
}

import DataType from '../../schemas/DataType';
import { useMongo } from './useMongo'; // adjust path as needed

export function useDataType() {
  return useMongo<DataType>('datatype');
}

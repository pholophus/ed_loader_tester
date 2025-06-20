import { FileFormat } from '../../schemas/FileFormat';
import { useMongo } from './useMongo'; // adjust path as needed

export function useFileFormat() {
  return useMongo<FileFormat>('fileformat');
}

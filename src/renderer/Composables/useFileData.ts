import { ref, computed } from 'vue';
import { useWellStore } from '../store/wellStore';
import ExtendedFileData from '../../schemas/ExtendedFileData';

interface FileDataOptions {
  // For DataQC specific fields
  includeQCFields?: boolean;
  // For DataLoading specific fields  
  includeLoadingFields?: boolean;
  // Default quality status for QC view
  defaultQualityStatus?: 'success' | 'error' | 'pending';
}

export function useFileData(options: FileDataOptions = {}) {
  const wellStore = useWellStore();
  const fileDataMap = ref<Map<string, ExtendedFileData>>(new Map());

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const initializeFileData = () => {
    const newMap = new Map<string, ExtendedFileData>();
    
    wellStore.data.wellMetadatas.forEach((file, index) => {
      const fileId = file.id || `file-${index}-${Date.now()}`;
      const fileName = file.name || 'unknown';
      
      // Base file data that's common to both
      const baseFileData: ExtendedFileData = {
        id: fileId,
        name: fileName,
        size: file.size || 0,
        progress: file.progress || 0,
        path: file.path,
        selectedDataTypeId: file.dataTypeId || '',
        selectedSubDataTypeId: file.subDataTypeId || '',
        editedBy: file.editedBy || '',
        createdBy: file.createdBy || '',
        targetFileName: fileName,
        fileFormat: file.fileFormat || getFileExtension(fileName).toUpperCase(),
        createdFor: file.createdFor || '',
        createdDate: file.createdDate || '',
        wellId: file.wellId || '',
      };

      // Add DataLoading specific fields
      if (options.includeLoadingFields) {
        Object.assign(baseFileData, {
          topDepth: file.topDepth || 0,
          topDepthUoM: file.topDepthUoM || '',
          baseDepth: file.baseDepth || 0,
          baseDepthUoM: file.baseDepthUoM || '',
        });
      }

      // Add DataQC specific fields
      if (options.includeQCFields) {
        Object.assign(baseFileData, {
          selected: false,
          targetEntity: getFileExtension(fileName) === 'las' ? 'LOG' : 'BOREHOLE FILE',
          preparation: 'All',
          qualityStatus: options.defaultQualityStatus || 'success',
          publication: 'All',
          topDepth: file.topDepth,
          topDepthUoM: file.topDepthUoM,
          stopDepth: file.baseDepth, // Note: QC uses stopDepth instead of baseDepth
          baseDepthUoM: file.baseDepthUoM,
        });
      }

      newMap.set(fileId, baseFileData);
    });
    
    fileDataMap.value = newMap;
  };

  // Computed property for display files
  const displayFiles = computed(() => {
    return Array.from(fileDataMap.value.values());
  });

  // Method to get files filtered by well ID
  const getFilesByWellId = (wellId: string) => {
    const allFiles = Array.from(fileDataMap.value.values());
    if (wellId) {
      const wellMetadatas = wellStore.getWellMetadatasByWellId(wellId);
      return allFiles.filter(file => 
        wellMetadatas.some(metadata => metadata.id === file.id)
      );
    }
    return allFiles;
  };

  // Method to update file data
  const updateFileData = (fileId: string, updates: Partial<ExtendedFileData>) => {
    const fileData = fileDataMap.value.get(fileId);
    if (fileData) {
      const updatedFile = { ...fileData, ...updates };
      fileDataMap.value.set(fileId, updatedFile);
    }
  };

  // Method to remove file
  const removeFile = (fileId: string) => {
    const fileToRemove = fileDataMap.value.get(fileId);
    if (fileToRemove) {
      wellStore.removeSelectedFile(fileToRemove.name);
      fileDataMap.value.delete(fileId);
    }
  };

  return {
    fileDataMap,
    displayFiles,
    initializeFileData,
    getFilesByWellId,
    updateFileData,
    removeFile,
  };
} 
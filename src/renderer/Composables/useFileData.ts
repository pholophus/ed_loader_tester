import { ref, computed } from 'vue';
import { useWellStore } from '../store/wellStore';
import { useSeismicStore } from '../store/seismicStore';
import ExtendedFileData from '../../schemas/ExtendedFileData';

interface FileDataOptions {
  // For DataQC specific fields
  includeQCFields?: boolean;
  // For DataLoading specific fields  
  includeLoadingFields?: boolean;
  // Default quality status for QC view
  defaultQualityStatus?: 'success' | 'error' | 'pending';
  // Store type to use
  storeType?: 'well' | 'seismic';
}

export function useFileData(options: FileDataOptions = {}) {
  const { storeType = 'well' } = options;
  
  // Get the appropriate store based on type
  const wellStore = storeType === 'well' ? useWellStore() : null;
  const seismicStore = storeType === 'seismic' ? useSeismicStore() : null;
  
  const fileDataMap = ref<Map<string, ExtendedFileData>>(new Map());

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  // Abstract method to get metadatas based on store type
  const getMetadatas = () => {
    if (storeType === 'well' && wellStore) {
      return wellStore.data.wellMetadatas;
    } else if (storeType === 'seismic' && seismicStore) {
      return seismicStore.data.seismicMetadatas;
    }
    return [];
  };

  // Abstract method to get metadatas by ID
  const getMetadatasById = (id: string) => {
    if (storeType === 'well' && wellStore) {
      return wellStore.getWellMetadatasByWellId(id);
    } else if (storeType === 'seismic' && seismicStore) {
      return seismicStore.getSeismicMetadatasBySeismicId(id);
    }
    return [];
  };

  // Abstract method to remove file
  const removeFileFromStore = (fileName: string) => {
    if (storeType === 'well' && wellStore) {
      wellStore.removeSelectedFile(fileName);
    } else if (storeType === 'seismic' && seismicStore) {
      seismicStore.removeSelectedFile(fileName);
    }
  };

  const initializeFileData = () => {
    const newMap = new Map<string, ExtendedFileData>();
    const metadatas = getMetadatas();
    
    metadatas.forEach((file, index) => {
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
        // For well data, use wellId; for seismic data, use lineId
        wellId: storeType === 'well' ? ((file as any).wellId || '') : ((file as any).lineId || ''),
      };

      // Add DataLoading specific fields (only for well data as seismic doesn't have depth fields)
      if (options.includeLoadingFields && storeType === 'well') {
        Object.assign(baseFileData, {
          topDepth: (file as any).topDepth || 0,
          topDepthUoM: (file as any).topDepthUoM || '',
          baseDepth: (file as any).baseDepth || 0,
          baseDepthUoM: (file as any).baseDepthUoM || '',
        });
      }

      // Add DataQC specific fields (only for well data as seismic doesn't have depth fields)
      if (options.includeQCFields && storeType === 'well') {
        Object.assign(baseFileData, {
          selected: false,
          targetEntity: getFileExtension(fileName) === 'las' ? 'LOG' : 'BOREHOLE FILE',
          preparation: 'All',
          qualityStatus: options.defaultQualityStatus || 'success',
          publication: 'All',
          topDepth: (file as any).topDepth,
          topDepthUoM: (file as any).topDepthUoM,
          stopDepth: (file as any).baseDepth, // Note: QC uses stopDepth instead of baseDepth
          baseDepthUoM: (file as any).baseDepthUoM,
        });
      } else if (options.includeQCFields && storeType === 'seismic') {
        // For seismic data, add QC fields without depth-related properties
        Object.assign(baseFileData, {
          selected: false,
          targetEntity: 'SEISMIC FILE',
          preparation: 'All',
          qualityStatus: options.defaultQualityStatus || 'success',
          publication: 'All',
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

  // Method to get files filtered by entity ID (wellId for wells, lineId for seismic)
  const getFilesByEntityId = (entityId: string) => {
    const allFiles = Array.from(fileDataMap.value.values());
    if (entityId) {
      const metadatas = getMetadatasById(entityId);
      return allFiles.filter(file => 
        metadatas.some(metadata => metadata.id === file.id)
      );
    }
    return allFiles;
  };

  // Backward compatibility method for wells
  const getFilesByWellId = (wellId: string) => {
    if (storeType !== 'well') {
      console.warn('getFilesByWellId should only be used with well store type');
      return [];
    }
    return getFilesByEntityId(wellId);
  };

  // New method for seismic data
  const getFilesByLineId = (lineId: string) => {
    if (storeType !== 'seismic') {
      console.warn('getFilesByLineId should only be used with seismic store type');
      return [];
    }
    return getFilesByEntityId(lineId);
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
      removeFileFromStore(fileToRemove.name);
      fileDataMap.value.delete(fileId);
    }
  };

  return {
    fileDataMap,
    displayFiles,
    initializeFileData,
    getFilesByEntityId,
    getFilesByWellId, // Backward compatibility
    getFilesByLineId, // For seismic data
    updateFileData,
    removeFile,
    storeType, // Expose store type for debugging/conditional logic
  };
} 
import { ref, computed } from 'vue';
import { useWellStore } from '../store/wellStore';
import { useSeismicStore } from '../store/seismicStore';
import ExtendedFileData from '../../schemas/ExtendedFileData';

interface FileDataOptions {
  includeQCFields?: boolean;
  includeLoadingFields?: boolean;
  defaultQualityStatus?: 'success' | 'error' | 'pending';
  storeType?: 'well' | 'seismic';
}

export function useFileData(options: FileDataOptions = {}) {
  const { storeType = 'well' } = options;
  
  const wellStore = storeType === 'well' ? useWellStore() : null;
  const seismicStore = storeType === 'seismic' ? useSeismicStore() : null;
  
  const fileDataMap = ref<Map<string, ExtendedFileData>>(new Map());

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getMetadatas = () => {
    if (storeType === 'well' && wellStore) {
      return wellStore.data.wellMetadatas;
    } else if (storeType === 'seismic' && seismicStore) {
      return seismicStore.data.seismicMetadatas;
    }
    return [];
  };

  const getMetadatasById = (id: string) => {
    if (storeType === 'well' && wellStore) {
      return wellStore.getWellMetadatasByWellId(id);
    } else if (storeType === 'seismic' && seismicStore) {
      return seismicStore.getSeismicMetadatasBySeismicId(id);
    }
    return [];
  };

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

    console.log("storeType ", storeType);
    console.log("metadatas ", metadatas);
    
    metadatas.forEach((file, index) => {
      const fileId = file.id || `file-${index}-${Date.now()}`;
      const fileName = file.name || 'unknown';
      
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
      };

      if (options.includeLoadingFields && storeType === 'well') {
        Object.assign(baseFileData, {
          topDepth: (file as any).topDepth || 0,
          topDepthUoM: (file as any).topDepthUoM || '',
          baseDepth: (file as any).baseDepth || 0,
          baseDepthUoM: (file as any).baseDepthUoM || '',
        });
      }

      // Add lineId initialization for seismic files
      if (storeType === 'seismic') {
        Object.assign(baseFileData, {
          lineId: (file as any).lineId || '',
        });
      }

      if (storeType === 'well') {
        Object.assign(baseFileData, {
          wellId: (file as any).wellId || '',
          wellName: (file as any).wellName || '',
        });
      }

      if (options.includeQCFields && storeType === 'well') {
        Object.assign(baseFileData, {
          selected: false,
          targetEntity: getFileExtension(fileName) === 'las' ? 'LOG' : 'BOREHOLE FILE',
          preparation: 'All',
          qualityStatus: options.defaultQualityStatus || 'success',
          publication: 'All',
          topDepth: (file as any).topDepth,
          topDepthUoM: (file as any).topDepthUoM,
          stopDepth: (file as any).baseDepth,
          baseDepthUoM: (file as any).baseDepthUoM,
        });
        
      } else if (options.includeQCFields && storeType === 'seismic') {
        Object.assign(baseFileData, {
          selected: false,
          targetEntity: 'SEISMIC FILE',
          preparation: 'All',
          qualityStatus: options.defaultQualityStatus || 'success',
          publication: 'All',
        });
      }

      console.log("baseFileData ", baseFileData);

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
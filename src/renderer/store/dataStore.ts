import { defineStore } from 'pinia';

interface FileData {
  id: string;
  name: string;
  size: number;
  progress: number;
  path?: string; // File path/location
}

export const useDataStore = defineStore('data', {
  state: () => ({
    selectedFiles: [] as FileData[],
  }),
  
  actions: {
    setSelectedFiles(files: FileData[]) {
      this.selectedFiles = files;
    },
    
    addSelectedFile(file: FileData) {
      this.selectedFiles.push(file);
    },
    
    removeSelectedFile(fileId: string) {
      this.selectedFiles = this.selectedFiles.filter(file => file.id !== fileId);
    },
    
    clearSelectedFiles() {
      this.selectedFiles = [];
    },
    
    updateFileLocation(fileId: string, path: string) {
      const file = this.selectedFiles.find(f => f.id === fileId);
      if (file) {
        file.path = path;
      }
    }
  },
  
  getters: {
    getSelectedFiles: (state) => state.selectedFiles,
    getSelectedFileCount: (state) => state.selectedFiles.length,
    getSelectedFileById: (state) => (id: string) => state.selectedFiles.find(file => file.id === id),
    getTotalSelectedSize: (state) => state.selectedFiles.reduce((total, file) => total + file.size, 0),
  }
});

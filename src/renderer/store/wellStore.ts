import { defineStore } from 'pinia';

interface Well{
  wellId: string;
  wellName: string;
  UWI: string;
}

interface FileData{
  id: string;
  name: string;
  size: number;
  progress: number;
  path: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
      title: string;
      message: string;
      type: string;
  }>;
}

export type WorkflowStage = 'preparation' | 'loading' | 'quality-check' | 'approval' | 'publication';

interface Approval {
  isApproved: boolean;
  comments: string;
}

interface Dataset{
    well: Well[];
    wellMetadatas: Metadata[],
    hasDoneQC: boolean;
    currentStage: WorkflowStage;
    completedStages: WorkflowStage[];
    approval: Approval;
}

interface Metadata {
  id?: string;
  name?: string;
  size?: number;
  progress?: number;
  path?: string;
  editedBy?: string;
  createdBy?: string;
  createdFor?: string;
  createdDate?: string;
  fileFormat?: string;
  dataTypeId?: string;
  dataTypeName?: string;
  subDataTypeId?: string;
  subDataTypeName?: string;
  topDepth?: number;
  topDepthUoM?: string;
  baseDepth?: number;
  baseDepthUoM?: string;
  validationResult?: ValidationResult;
  wellId?: string;
}

export const useWellStore = defineStore('wellData', {
  state: () => ({
    data: {
      well: [] as Well[],
      wellMetadatas: [] as Metadata[],
      hasDoneQC: false,
      currentStage: 'preparation' as WorkflowStage,
      completedStages: [] as WorkflowStage[],
      approval: {
        isApproved: false,
        comments: '',
      },
    } as Dataset,
  }),
  
  actions: {
    addWellData(data: Well) {
      const existingWell = this.data.well.find(well => well.wellId === data.wellId);
      if (existingWell) {
        return; 
      }
      this.data.well.push(data);
    },

    removeWellData(wellId: string) {
      this.data.well = this.data.well.filter(well => well.wellId !== wellId);
    },

    setSelectedFiles(files: FileData[]) {
      this.data.wellMetadatas = files.map(file => ({
        id: file.id,
        path: file.path,
        name: file.name,
        size: file.size,
        progress: file.progress,
      }));
    },

    setMetadatas(metadatas: Metadata[]) {
      this.data.wellMetadatas = this.data.wellMetadatas.map((existingFile, index) => ({
        ...existingFile,
        ...(metadatas[index] && {
          editedBy: metadatas[index].editedBy,
          createdBy: metadatas[index].createdBy,
          fileFormat: metadatas[index].fileFormat,
          dataTypeId: metadatas[index].dataTypeId,
          dataTypeName: metadatas[index].dataTypeName,
          subDataTypeId: metadatas[index].subDataTypeId,
          subDataTypeName: metadatas[index].subDataTypeName,
          topDepth: metadatas[index].topDepth,
          topDepthUoM: metadatas[index].topDepthUoM,
          baseDepth: metadatas[index].baseDepth,
          baseDepthUoM: metadatas[index].baseDepthUoM,
          wellId: metadatas[index].wellId,
        })
      }));
    },
    
    removeSelectedFile(name: string) {
      this.data.wellMetadatas = this.data.wellMetadatas.filter(file => file.name !== name);
    },
    
    updateFileValidationResult(fileId: string, validationResult: ValidationResult) {
      const file = this.data.wellMetadatas.find(f => f.id === fileId);
      if (file) {
        file.validationResult = validationResult;
      }
    },

    clearFileValidationResults() {
      this.data.wellMetadatas.forEach(file => {
        file.validationResult = undefined;
      });
    },

    setHasDoneQC(hasDoneQC: boolean) {
      this.data.hasDoneQC = hasDoneQC;
    },
    
    setCurrentStage(stage: WorkflowStage) {
      this.data.currentStage = stage;
    },

    addCompletedStage(stage: WorkflowStage) {
      if (!this.data.completedStages.includes(stage)) {
        this.data.completedStages.push(stage);
      }
    },

    setCompletedStages(stages: WorkflowStage[]) {
      this.data.completedStages = stages;
    },

    advanceWorkflow(nextStage: WorkflowStage, completePreviousStage?: WorkflowStage) {
      if (completePreviousStage && !this.data.completedStages.includes(completePreviousStage)) {
        this.data.completedStages.push(completePreviousStage);
      }
      this.data.currentStage = nextStage;
    },

    resetWorkflow() {
      this.data.currentStage = 'preparation';
      this.data.completedStages = [];
    },

    approveDataset(comments: string) {
      this.data.approval.isApproved = true;
      this.data.approval.comments = comments;

      // Advance to publication stage and mark approval as completed
      this.advanceWorkflow('publication', 'approval');
    },

    rejectDataset() {
      this.data.approval.isApproved = false;
      // Reset workflow back to preparation stage
      // this.resetWorkflow();
    },

    clearAllWells() {
      this.data.well = [];
    },

    removeWell(wellId: string) {
      this.data.well = this.data.well.filter(well => well.wellId !== wellId);
    },

  },
  
  getters: {
    // Get wellMetadatas filtered by wellId
    getWellMetadatasByWellId: (state) => (wellId: string) => {
      return state.data.wellMetadatas.filter(metadata => metadata.wellId === wellId);
    },
    
    // Get total file count for a specific well
    getWellFileCount: (state) => (wellId: string) => {
      return state.data.wellMetadatas.filter(metadata => metadata.wellId === wellId).length;
    },
    
    // Get total file size for a specific well
    getWellFileSize: (state) => (wellId: string) => {
      return state.data.wellMetadatas
        .filter(metadata => metadata.wellId === wellId)
        .reduce((total, metadata) => total + (metadata.size || 0), 0);
    },
    
    // Check if a well has any files
    wellHasFiles: (state) => (wellId: string) => {
      return state.data.wellMetadatas.some(metadata => metadata.wellId === wellId);
    }
  }
});

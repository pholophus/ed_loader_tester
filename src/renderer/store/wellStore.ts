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
    well: Well;
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
}

// export interface ValidationError {
//   title: string;
//   message: string;
//   type: string;
// }

export const useWellStore = defineStore('wellData', {
  state: () => ({
    data: {
      well: {
        wellId: '',
        wellName: '',
        UWI: '',
      },
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
    setWellData(data: Well) {
      this.data.well = data;
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
    
    // clearSelectedFiles() {
    //   this.selectedFiles = [];
    // },
    
    // updateFileLocation(fileId: string, path: string) {
    //   const file = this.selectedFiles.find(f => f.id === fileId);
    //   if (file) {
    //     file.path = path;
    //   }
    // }
  },
  
  getters: {
    // getSelectedFiles: (state) => state.selectedFiles,
    // getSelectedFileCount: (state) => state.selectedFiles.length,
    // getSelectedFileById: (state) => (id: string) => state.selectedFiles.find(file => file.id === id),
    // getTotalSelectedSize: (state) => state.selectedFiles.reduce((total, file) => total + file.size, 0),
  }
});

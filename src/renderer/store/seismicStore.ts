import { defineStore } from 'pinia';

interface Survey {
    name: string;
    country: string;
    dimension: string;
    surveyId: string;
}

export type WorkflowStage = 'preparation' | 'loading' | 'quality-check' | 'approval' | 'publication';

interface Approval {
    isApproved: boolean;
    comments: string;
}

interface Line {
    lineId: string;
    name: string;
    firstField: string;
    lastField: string;
    firstShot: string;
    lastShot: string;
    firstCDP: string;
    lastCDP: string;
    firstTrace: string;
    lastTrace: string;
    inLine: string;
    crossLine: string;
    metadata: Metadata[];
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
    validationResult?: ValidationResult;
    lineId?: string;
}

interface Dataset {
    survey: Survey;
    line: Line[];
    hasDoneQC: boolean;
    currentStage: WorkflowStage;
    completedStages: WorkflowStage[];
    approval: Approval;
    seismicMetadatas: Metadata[];
    isForCreatingNewSeismic: boolean;
    isForUploadingFileForExistingSeismic: boolean;
}

interface FileData {
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

export const useSeismicStore = defineStore('seismicData', {
    state: () => ({
        data: {
            survey: {} as Survey,
            line: [] as Line[],
            hasDoneQC: false,
            currentStage: 'preparation' as WorkflowStage,
            completedStages: [] as WorkflowStage[],
            approval: {
                isApproved: false,
                comments: '',
            },
            seismicMetadatas: [] as Metadata[],
            isForCreatingNewSeismic: false,
            isForUploadingFileForExistingSeismic: false,
        } as Dataset,
    }),

    actions: {
        addSurveyData(data: Survey) {
            this.data.survey = data;
        },

        removeSurveyData(surveyId: string) {
            this.data.survey = {} as Survey;
        },

        addLineData(data: Line) {
            this.data.line.push(data);
        },

        removeLineData(lineId: string) {
            this.data.line = this.data.line.filter(line => line.metadata.find(m => m.id === lineId));
        },
        
        setSelectedFiles(files: FileData[]) {
            this.data.seismicMetadatas = files.map(file => ({
                id: file.id,
                path: file.path,
                name: file.name,
                size: file.size,
                progress: file.progress,
            }));
        },

        setMetadatas(metadatas: Metadata[]) {
            this.data.seismicMetadatas = this.data.seismicMetadatas.map((existingFile, index) => ({
                ...existingFile,
                ...(metadatas[index] && {
                    editedBy: metadatas[index].editedBy,
                    createdBy: metadatas[index].createdBy,
                    fileFormat: metadatas[index].fileFormat,
                    dataTypeId: metadatas[index].dataTypeId,
                    dataTypeName: metadatas[index].dataTypeName,
                    subDataTypeId: metadatas[index].subDataTypeId,
                    subDataTypeName: metadatas[index].subDataTypeName,
                })
            }));
        },

        clearAllMetadatas() {
            this.data.seismicMetadatas = [];
        },

        removeMetadata(metadataId: string) {
            this.data.seismicMetadatas = this.data.seismicMetadatas.filter(metadata => metadata.id !== metadataId);
        },

        removeSelectedFile(name: string) {
            this.data.seismicMetadatas = this.data.seismicMetadatas.filter(file => file.name !== name);
        },

        updateFileValidationResult(fileId: string, validationResult: ValidationResult) {
            const file = this.data.seismicMetadatas.find(f => f.id === fileId);
            if (file) {
                file.validationResult = validationResult;
            }
        },

        clearFileValidationResults() {
            this.data.seismicMetadatas.forEach(file => {
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
            this.advanceWorkflow('publication', 'approval');
        },

        rejectDataset() {
            this.data.approval.isApproved = false;
        },

        setUploadOption(option: 'new' | 'existing') {
            if (option === 'new') {
                this.data.isForCreatingNewSeismic = true;
                this.data.isForUploadingFileForExistingSeismic = false;
            } else if (option === 'existing') {
                this.data.isForCreatingNewSeismic = false;
                this.data.isForUploadingFileForExistingSeismic = true;
            }
        },

        resetUploadOptions() {
            this.data.isForCreatingNewSeismic = false;
            this.data.isForUploadingFileForExistingSeismic = false;
        },
    },

    getters: {
        getSeismicMetadatasBySeismicId: (state) => (seismicId: string) => {
            return state.data.seismicMetadatas.filter(metadata => metadata.id === seismicId);
        },

        getSeismicFileCount: (state) => (seismicId: string) => {
            return state.data.seismicMetadatas.filter(metadata => metadata.id === seismicId).length;
        },

        getSeismicFileSize: (state) => (seismicId: string) => {
            return state.data.seismicMetadatas
                .filter(metadata => metadata.id === seismicId)
                .reduce((total, metadata) => total + (metadata.size || 0), 0);
        },

        seismicHasFiles: (state) => (seismicId: string) => {
            return state.data.seismicMetadatas.some(metadata => metadata.id === seismicId);
        }
    }
});

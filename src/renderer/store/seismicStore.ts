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
    first_field_file?: number;
    last_field_file?: number;
    first_shot_point?: number;
    last_shot_point?: number;
    first_cdp?: number;
    last_cdp?: number;
    inline?: number;
    crossline?: number;
    ffid_byte_position?: number;
    sp_byte_position?: number;
    cdp_byte_position?: number;
    il_byte_position?: number;
    xl_byte_position?: number;
}

interface SurveyCornerPoints {
    inline: number;
    xline: number;
    latitude: number;
    longitude: number;
}

interface Dataset {
    survey: Survey;

    //used when uploading file for existing surveys
    lines: Line[];

    hasDoneQC: boolean;
    currentStage: WorkflowStage;
    completedStages: WorkflowStage[];
    approval: Approval;

    //used when uploading new seismic
    seismicMetadatas: Metadata[];
    
    isForCreatingNewSeismic: boolean;
    isForUploadingFileForExistingSeismic: boolean;
    CRS: {
        proj4: string;
        srid: string;
    };
    surveyCornerPoints?: SurveyCornerPoints[];
    uploadOption: 'new' | 'existing';
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
            lines: [] as Line[],
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
            uploadOption: 'new',
        } as Dataset,
    }),

    actions: {
        setCRS(crs: { proj4: string, srid: string }) {
            this.data.CRS = crs;
        },

        addSurveyData(data: Survey) {
            this.data.survey = data;
        },

        setSurveyCornerPoints(data: SurveyCornerPoints[]) {
            this.data.surveyCornerPoints = data;
        },

        removeSurveyData(surveyId: string) {
            this.data.survey = {} as Survey;
        },

        addLineData(data: Line) {
            this.data.lines.push(data);
        },

        removeLineData(lineId: string) {
            this.data.lines = this.data.lines.filter(line => line.metadata.find(m => m.id === lineId));
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

        updateFileExtractionValues(fileId: string, values: {
            first_field_file?: number;
            last_field_file?: number;
            first_shot_point?: number;
            last_shot_point?: number;
            first_cdp?: number;
            last_cdp?: number;
            inline?: number;
            crossline?: number;
            ffid_byte_position?: number;
            sp_byte_position?: number;
            cdp_byte_position?: number;
            il_byte_position?: number;
            xl_byte_position?: number;
        }) {
            const file = this.data.seismicMetadatas.find(f => f.id === fileId);
            if (file) {
                // Update only the provided values
                if (values.first_field_file !== undefined) file.first_field_file = values.first_field_file;
                if (values.last_field_file !== undefined) file.last_field_file = values.last_field_file;
                if (values.first_shot_point !== undefined) file.first_shot_point = values.first_shot_point;
                if (values.last_shot_point !== undefined) file.last_shot_point = values.last_shot_point;
                if (values.first_cdp !== undefined) file.first_cdp = values.first_cdp;
                if (values.last_cdp !== undefined) file.last_cdp = values.last_cdp;
                if (values.inline !== undefined) file.inline = values.inline;
                if (values.crossline !== undefined) file.crossline = values.crossline;
                if (values.ffid_byte_position !== undefined) file.ffid_byte_position = values.ffid_byte_position;
                if (values.sp_byte_position !== undefined) file.sp_byte_position = values.sp_byte_position;
                if (values.cdp_byte_position !== undefined) file.cdp_byte_position = values.cdp_byte_position;
                if (values.il_byte_position !== undefined) file.il_byte_position = values.il_byte_position;
                if (values.xl_byte_position !== undefined) file.xl_byte_position = values.xl_byte_position;
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
            this.data.uploadOption = option;
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

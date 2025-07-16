<template>
    <div class="data-loading-content">
        <!-- Header -->
        <header class="page-header">
            <div class="header-nav">
                <router-link to="/seismic/data-preparation" class="back-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                    Back to Preparation
                </router-link>
                <div class="header-actions">
                    <button class="btn btn-primary" @click="proceedToQualityCheck"
                        :disabled="!canProceedToQualityCheck">
                        Load
                    </button>
                </div>
            </div>
            <div class="header-title">
                <!-- <h1>Data Loading</h1> -->
                <!-- <p>Loading your dataset files into the system</p> -->
            </div>

            <!-- Workflow Progress -->
            <WorkflowProgress :current-stage="seismicStore.data.currentStage"
                :completed-stages="seismicStore.data.completedStages" />
        </header>

        <main class="loading-main">
            <div class="main-grid">
                <!-- Left Panel - Components -->
                <div class="components-panel">
                    <div class="panel-card">
                        <div class="panel-header">
                            <div class="panel-header-top">
                                <div class="panel-header-right">
                                </div>
                            </div>
                            <div class="panel-title-row">
                                <h3 class="panel-title">Components</h3>
                                <div class="panel-actions">
                                    <button v-if="seismicStore.data.uploadOption === 'new'"
                                        class="btn btn-secondary manual-extract-btn" @click="openManualExtractionModal">
                                        Custom Extraction
                                    </button>
                                    <button class="btn btn-secondary remove-btn" @click="removeSelectedFile"
                                        :disabled="checkedFiles.size === 0">
                                        Remove{{ checkedFiles.size > 0 ? ` (${checkedFiles.size})` : '' }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="table-container">
                            <div class="table-scroll-wrapper">
                                <table class="components-table">
                                    <thead>
                                        <tr>
                                            <th><input type="checkbox" :checked="allFilesChecked"
                                                    :indeterminate="someFilesChecked" @change="toggleAllFiles" /></th>
                                            <th>File Name</th>
                                            <th>Size</th>
                                            <th v-if="seismicStore.data.uploadOption === 'existing'">Line</th>
                                            <th>Category</th>
                                            <th>Sub Category</th>
                                            <th v-if="seismicStore.data.uploadOption === 'new'">First Field File</th>
                                            <th v-if="seismicStore.data.uploadOption === 'new'">Last Field File</th>
                                            <th v-if="seismicStore.data.uploadOption === 'new'">FSP</th>
                                            <th v-if="seismicStore.data.uploadOption === 'new'">LSP</th>
                                            <th v-if="seismicStore.data.uploadOption === 'new'">First CDP</th>
                                            <th v-if="seismicStore.data.uploadOption === 'new'">Last CDP</th>
                                            <th v-if="seismicStore.data.uploadOption === 'new'">InLine</th>
                                            <th v-if="seismicStore.data.uploadOption === 'new'">XLine</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="file in paginatedFiles" :key="file.id"
                                            :class="{ selected: selectedFile?.id === file.id }"
                                            @click="selectFile(file)">
                                            <td><input type="checkbox" :checked="isFileChecked(file.id)"
                                                    @click="toggleFileCheck(file.id, $event)" /></td>
                                            <td class="file-name">{{ file.name }}</td>
                                            <td>{{ formatFileSize(file.size) }}</td>
                                            <td v-if="seismicStore.data.uploadOption === 'existing'">
                                                <select class="entity-select"
                                                    v-model="(file as SeismicDataLoadingFileData).lineId">
                                                    <option value="">Select Line</option>
                                                    <option v-for="line in seismicStore.data.lines" :key="line.lineId"
                                                        :value="line.lineId">
                                                        {{ line.name }}
                                                    </option>
                                                </select>
                                            </td>
                                            <td>
                                                <select class="entity-select" v-model="file.selectedDataTypeId"
                                                    @change="onDataTypeChange(file, file.selectedDataTypeId || '')">
                                                    <option value="">Select Category</option>
                                                    <option v-for="dataType in activeDataTypes" :key="dataType._id"
                                                        :value="dataType._id">
                                                        {{ dataType.displayName }}
                                                    </option>
                                                </select>
                                            </td>
                                            <td>
                                                <select class="entity-select" v-model="file.selectedSubDataTypeId"
                                                    :disabled="!file.selectedDataTypeId"
                                                    @change="onSubDataTypeChange(file, file.selectedSubDataTypeId || '')">
                                                    <option value="">Select Sub Category</option>
                                                    <option
                                                        v-for="subDataType in getFilteredSubDataTypes(file.selectedDataTypeId || '')"
                                                        :key="subDataType._id" :value="subDataType._id">
                                                        {{ subDataType.displayName }}
                                                    </option>
                                                </select>
                                            </td>
                                            <td v-if="seismicStore.data.uploadOption === 'new'">{{
                                                getExtractedValue(file, 'first_trace', 'Ffid') }}</td>
                                            <td v-if="seismicStore.data.uploadOption === 'new'">{{
                                                getExtractedValue(file, 'last_trace', 'Ffid') }}</td>
                                            <td v-if="seismicStore.data.uploadOption === 'new'">{{
                                                getExtractedValue(file, 'first_trace', 'Sp') }}</td>
                                            <td v-if="seismicStore.data.uploadOption === 'new'">{{
                                                getExtractedValue(file, 'last_trace', 'Sp') }}</td>
                                            <td v-if="seismicStore.data.uploadOption === 'new'">{{
                                                getExtractedValue(file, 'first_trace', 'Cdp') }}</td>
                                            <td v-if="seismicStore.data.uploadOption === 'new'">{{
                                                getExtractedValue(file, 'last_trace', 'Cdp') }}</td>
                                            <td v-if="seismicStore.data.uploadOption === 'new'">{{
                                                getExtractedValue(file, 'first_trace', 'Il') }}</td>
                                            <td v-if="seismicStore.data.uploadOption === 'new'">{{
                                                getExtractedValue(file, 'first_trace', 'Xl') }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="table-footer">
                                <div class="footer-left">
                                    <span>{{ paginationInfo }}</span>
                                    <div class="items-per-page">
                                        <label>Show:</label>
                                        <select v-model="itemsPerPage" class="items-select">
                                            <option :value="5">5</option>
                                            <option :value="10">10</option>
                                            <option :value="25">25</option>
                                            <option :value="50">50</option>
                                        </select>
                                        <span>per page</span>
                                    </div>
                                </div>
                                <div class="pagination">
                                    <button class="page-btn" @click="goToPreviousPage"
                                        :disabled="!canGoToPreviousPage">‹</button>
                                    <span class="page-info">Page {{ currentPage }} of {{ totalPages || 1 }}</span>
                                    <button class="page-btn" @click="goToNextPage"
                                        :disabled="!canGoToNextPage">›</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Panel - Details -->
                <div class="details-panel">
                    <div class="panel-card">
                        <div class="panel-header">
                            <div class="panel-tabs">
                                <button class="tab-btn" :class="{ active: activeTab === 'metadata' }"
                                    @click="activeTab = 'metadata'">Metadata</button>
                                <button class="tab-btn" :class="{ active: activeTab === 'preview' }"
                                    @click="activeTab = 'preview'">Preview</button>
                            </div>
                        </div>

                        <div class="details-content" v-if="selectedFile">
                            <div v-if="activeTab === 'metadata'" class="metadata-form">
                                <div class="metadata-header">
                                    <div></div>
                                    <!-- <div class="metadata-actions">
                                        <button class="btn btn-primary" @click="updateMetadata">Update</button>
                                        <button class="btn btn-secondary" @click="resetFileName">Reset</button>
                                    </div> -->
                                </div>

                                <div class="form-group">
                                    <label>Edited By</label>
                                    <span class="form-value">{{ userStore.user.data?.name }}</span>
                                </div>

                                <div class="form-group">
                                    <label>Created By</label>
                                    <span class="form-value">{{ userStore.user.data?.name }}</span>
                                </div>

                                <div class="form-group">
                                    <label>Target File Name</label>
                                    <div class="input-with-icon">
                                        <input type="text" v-model="editableFileName"
                                            class="form-input form-input-long" />
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="input-icon">
                                            <path d="M12 2L12 22M2 12L22 12" stroke="currentColor" stroke-width="2" />
                                        </svg>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>File Format</label>
                                    <span class="form-value">{{ selectedFile.fileFormat }}</span>
                                </div>

                                <!-- <div class="form-group">
                                    <label>Status</label>
                                    <span class="form-value">{{ selectedFile.status }}</span>
                                </div> -->

                                <div class="form-group">
                                    <label>Data Type</label>
                                    <span class="form-value">{{ selectedDataTypeName }}</span>
                                </div>

                                <div class="form-group">
                                    <label>Sub Data Type</label>
                                    <span class="form-value">{{ selectedSubDataTypeName }}</span>
                                </div>

                                <div class="form-group" v-if="seismicStore.data.isForUploadingFileForExistingSeismic">
                                    <label>Line</label>
                                    <span class="form-value">{{ selectedLineName }}</span>
                                </div>

                            </div>

                            <div v-else-if="activeTab === 'preview'" class="preview-content">
                                <div v-if="isLoadingPreview" class="loading-preview">
                                    <div class="loading-spinner"></div>
                                    <p>Loading preview...</p>
                                </div>

                                <div v-else-if="previewData?.error" class="preview-error">
                                    <p>{{ previewData.error }}</p>
                                </div>

                                <div v-else-if="previewData" class="preview-data">
                                    <!-- EBCDIC Header Section for SEGY files -->
                                    <div v-if="'isEbcdicHeader' in previewData && previewData.isEbcdicHeader"
                                        class="ebcdic-header-section">
                                        <div class="ebcdic-header">
                                            <h4>EBCDIC Header</h4>
                                            <div class="ebcdic-content">
                                                <pre>{{ previewData.asciiText }}</pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- PDF File Preview -->
                                <div v-else-if="isPdfFile(selectedFile?.name) && pdfFileUrl" class="preview-data">
                                    <iframe :src="pdfFileUrl" width="100%" height="600px" style="border: none;"></iframe>
                                </div>
                                
                                <!-- DOCX File Preview -->
                                <!-- <div v-else-if="isDocxFile(selectedFile?.name) && docxHtmlContent" class="preview-data">
                                    <div v-html="docxHtmlContent" style="background:white; padding:1rem; min-height:400px;"></div>
                                </div> -->

                                <div v-else class="no-preview">
                                    <p>No preview available</p>
                                </div>
                            </div>
                        </div>

                        <div v-else class="no-selection">
                            <p>Select a file to view details</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Manual Extraction Modal -->
        <div v-if="showManualExtractionModal" class="modal-overlay" @click="closeManualExtractionModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Custom Field Extraction</h3>
                    <button class="modal-close" @click="closeManualExtractionModal">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <!-- Description -->
                    <div class="extraction-description">
                        <p>Customize byte positions for field extraction. Default values have already been extracted
                            using standard SEG-Y positions. Use this form to override with custom byte positions.</p>
                    </div>

                    <!-- Selected Files Section -->
                    <div class="selected-files-section">
                        <h4>Selected Files for Extraction</h4>
                        <div class="selected-files-list">
                            <div v-for="fileId in Array.from(checkedFiles)" :key="fileId" class="selected-file-item">
                                <div class="file-info">
                                    <span class="file-name">{{ getFileById(fileId)?.name || 'Unknown file' }}</span>
                                    <span class="file-size">{{ formatFileSize(getFileById(fileId)?.size || 0) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Extraction Form -->
                    <div class="extraction-form">
                        <div class="form-row">
                            <div class="form-field">
                                <input type="checkbox" id="ffid" v-model="extractionFields.ffid.enabled"
                                    class="field-checkbox">
                                <label for="ffid" class="field-label">FFID</label>
                                <input type="text" v-model="extractionFields.ffid.value"
                                    :disabled="!extractionFields.ffid.enabled" class="field-input" placeholder="">
                            </div>
                            <div class="form-field">
                                <input type="checkbox" id="il" v-model="extractionFields.il.enabled"
                                    class="field-checkbox">
                                <label for="il" class="field-label">IL</label>
                                <input type="text" v-model="extractionFields.il.value"
                                    :disabled="!extractionFields.il.enabled" class="field-input" placeholder="">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-field">
                                <input type="checkbox" id="sp" v-model="extractionFields.sp.enabled"
                                    class="field-checkbox">
                                <label for="sp" class="field-label">SP</label>
                                <input type="text" v-model="extractionFields.sp.value"
                                    :disabled="!extractionFields.sp.enabled" class="field-input" placeholder="">
                            </div>
                            <div class="form-field">
                                <input type="checkbox" id="xl" v-model="extractionFields.xl.enabled"
                                    class="field-checkbox">
                                <label for="xl" class="field-label">XL</label>
                                <input type="text" v-model="extractionFields.xl.value"
                                    :disabled="!extractionFields.xl.enabled" class="field-input" placeholder="">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-field">
                                <input type="checkbox" id="cdp" v-model="extractionFields.cdp.enabled"
                                    class="field-checkbox">
                                <label for="cdp" class="field-label">CDP</label>
                                <input type="text" v-model="extractionFields.cdp.value"
                                    :disabled="!extractionFields.cdp.enabled" class="field-input" placeholder="">
                            </div>
                            <div class="form-field format-field">
                                <label class="field-label">FORMAT</label>
                                <select v-model="extractionFields.format" class="format-select">
                                    <option value="">Select Format</option>
                                    <option value="2-BYTE">2-BYTE</option>
                                    <option value="4-BYTE">4-BYTE</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="closeManualExtractionModal">Cancel</button>
                    <button class="btn btn-primary" @click="performManualExtraction">Extract</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
// import { useFileStore } from '../store/fileStore';
import { useSeismicStore } from '../../store/seismicStore';
import { useDataType } from '../../Composables/useDataType';
import { useSubDataType } from '../../Composables/useSubDataType';
import { useFileData } from '../../Composables/useFileData';
import { useSeismicLine } from '../../Composables/useSeismicLine';
import { useSeismicSurveyLinePivot } from '../../Composables/useSeismicSurveyLinePivot';
import WorkflowProgress from '../../Components/WorkflowProgress.vue';
import ExtendedFileData from '../../../schemas/ExtendedFileData';
import {
    parseLasFileForPreview,
    isLasFile,
    extractLasMetadata,
    extractLasComprehensiveData,
    extractLasMetadataForDisplay,
    parseLasToWellioJson,
    type LasPreviewData,
    type LasMetadata,
    type LasComprehensiveData
} from '../../../services/lasService';
import {
    parseSegyFileForPreview,
    isSegyFile,
    type SegyPreviewData
} from '../../../services/segyService';
import { 
    isPdfFile
} from '../../../services/pdfService';
import { 
    parseDocxFileForPreview, 
    isDocxFile,
    type DocxPreviewData
} from '../../../services/docxService';
import { useUserStore } from '../../store/userStore';

// Extended interface for seismic data loading with additional properties
interface SeismicDataLoadingFileData extends ExtendedFileData {
    // Survey and seismic identification
    surveyId?: string;
    seismicId?: string;
    seismic_name?: string;

    // File properties
    dimension?: string;
    description?: string;
    itemRemarks?: string;

    // Seismic trace data
    firstFieldFile?: number;
    lastFieldFile?: number;
    fsp?: number;
    lsp?: number;
    fcdp?: number;
    lcdp?: number;
    inline?: number;
    xline?: number;

    // Trace information
    firstTrc?: number;
    lastTrc?: number;
    ntraces?: number;

    // Sample data
    sampleType?: string;
    sampleRate?: number;
    sampleRateUom?: string;
    recordLength?: number;
    recordLengthUom?: string;

    // File paths
    fileWindowsPath?: string;
    fileUnixPath?: string;

    // Bin spacing
    binSpacing?: number;

    // Well/Line ID (reusing wellId for line selection in seismic context)
    lineId?: string;
}

const router = useRouter();
// const fileStore = useFileStore();
const seismicStore = useSeismicStore();
const userStore = useUserStore();

// Composables
const { items: dataTypes, fetch: fetchDataTypes } = useDataType();
const { items: subDataTypes, fetch: fetchSubDataTypes } = useSubDataType();
const {
    fileDataMap,
    displayFiles,
    initializeFileData,
    updateFileData,
    removeFile,
    getFilesByLineId
} = useFileData({
    includeLoadingFields: true,
    storeType: 'seismic'
});

// Seismic line composables
const { items: seismicLines, fetch: fetchSeismicLines } = useSeismicLine();
const { items: surveyLinePivots, fetch: fetchSurveyLinePivots } = useSeismicSurveyLinePivot();

// State
const activeTab = ref('metadata');
const selectedFile = ref<SeismicDataLoadingFileData | null>(null);
const checkedFiles = ref<Set<string>>(new Set());
const editableFileName = ref('');
const previewData = ref<LasPreviewData | SegyPreviewData | DocxPreviewData | null>(null);
const isLoadingPreview = ref(false);
const showManualExtractionModal = ref(false);

// DOCX HTML preview state
const docxHtmlContent = ref('');

// Manual extraction form data
const extractionFields = ref({
    ffid: { enabled: false, value: '' },
    il: { enabled: false, value: '' },
    sp: { enabled: false, value: '' },
    xl: { enabled: false, value: '' },
    cdp: { enabled: false, value: '' },
    format: ''
});

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Computed properties
const activeDataTypes = computed(() => {

    if (!dataTypes.value) {
        return [];
    }

    const filtered = dataTypes.value.filter((dt: any) => {
        return dt.isActive;
    });

    return filtered;
});

// Add computed properties to get display names for selected data types
const selectedDataTypeName = computed(() => {
    if (!selectedFile.value?.selectedDataTypeId || !dataTypes.value) {
        return '';
    }
    const dataType = dataTypes.value.find((dt: any) => dt._id === selectedFile.value?.selectedDataTypeId);
    return dataType?.displayName || '';
});

const selectedSubDataTypeName = computed(() => {
    if (!selectedFile.value?.selectedSubDataTypeId || !subDataTypes.value) {
        return '';
    }
    const subDataType = subDataTypes.value.find((sdt: any) => sdt._id === selectedFile.value?.selectedSubDataTypeId);
    return subDataType?.displayName || '';
});

const selectedLineName = computed(() => {
    const seismicLines = seismicStore.data.lines;

    console.log("seismicLines", seismicLines);

    for (const line of seismicLines) {
        console.log("line", line);
    }

    if (!(selectedFile.value as SeismicDataLoadingFileData)?.lineId || !seismicLines.length) {
        return '';
    }
    const line = seismicLines.find((l: any) => l.lineId === (selectedFile.value as SeismicDataLoadingFileData)?.lineId);

    console.log("line", line);

    return line?.name || '';
});

const getFilteredSubDataTypes = (dataTypeId: string) => {

    const filtered = subDataTypes.value?.filter((sdt: any) => {
        return sdt.isActive && sdt.dataTypeId === dataTypeId;
    }) || [];

    return filtered;
};

const totalPages = computed(() => {
    return Math.ceil(displayFiles.value.length / itemsPerPage.value);
});

const paginatedFiles = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return displayFiles.value.slice(start, end);
});

const paginationInfo = computed(() => {
    if (displayFiles.value.length === 0) {
        return '0 results';
    }

    const start = (currentPage.value - 1) * itemsPerPage.value + 1;
    const end = Math.min(currentPage.value * itemsPerPage.value, displayFiles.value.length);
    return `${start} - ${end} of ${displayFiles.value.length} results`;
});

const canGoToPreviousPage = computed(() => {
    return currentPage.value > 1;
});

const canGoToNextPage = computed(() => {
    return currentPage.value < totalPages.value;
});

// Methods
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
};

// Helper method to get file by ID
const getFileById = (fileId: string): ExtendedFileData | undefined => {
    return displayFiles.value.find(file => file.id === fileId);
};

const selectFile = (file: SeismicDataLoadingFileData) => {
    selectedFile.value = fileDataMap.value.get(file.id) || file;
    // Initialize editable filename with the selected file's target filename
    editableFileName.value = selectedFile.value.targetFileName || selectedFile.value.name;

    // Clear previous preview data
    previewData.value = null;
    docxHtmlContent.value = ''; // Clear DOCX HTML content

    // Load preview if preview tab is active and file type is supported
    if (activeTab.value === 'preview' && 
        (isLasFile(selectedFile.value.name) || isPdfFile(selectedFile.value.name) || isDocxFile(selectedFile.value.name))) {
        loadFilePreview();
    }
};

// Method to toggle checkbox for a file
const toggleFileCheck = (fileId: string, event: Event) => {
    event.stopPropagation(); // Prevent row selection when clicking checkbox

    if (checkedFiles.value.has(fileId)) {
        checkedFiles.value.delete(fileId);
    } else {
        checkedFiles.value.add(fileId);
    }
};

// Method to check if a file is checked
const isFileChecked = (fileId: string) => {
    return checkedFiles.value.has(fileId);
};

// Computed property to check if all files are selected
const allFilesChecked = computed(() => {
    return paginatedFiles.value.length > 0 && paginatedFiles.value.every(file => checkedFiles.value.has(file.id));
});

// Computed property to check if some (but not all) files are selected
const someFilesChecked = computed(() => {
    const checkedFilesOnCurrentPage = paginatedFiles.value.filter(file => checkedFiles.value.has(file.id)).length;
    return checkedFilesOnCurrentPage > 0 && !allFilesChecked.value;
});

// Method to toggle all checkboxes
const toggleAllFiles = (event: Event) => {
    const target = event.target as HTMLInputElement;

    if (target.checked) {
        // Check all files on current page
        paginatedFiles.value.forEach(file => {
            checkedFiles.value.add(file.id);
        });
    } else {
        // Uncheck all files on current page
        paginatedFiles.value.forEach(file => {
            checkedFiles.value.delete(file.id);
        });
    }
};

const proceedToQualityCheck = () => {

    if (selectedFile.value && editableFileName.value !== selectedFile.value.targetFileName) {
        updateMetadata();
    }

    console.log("fileDataMap.value ", fileDataMap.value);


    // console.log("displayFiles ", displayFiles.value);

    // console.log("seismicStore.data.selectedLines ", seismicStore.data.selectedLines);
    // return;
    
    // console.log('filesByLineId', filesByLineId);
    // return;

    // if (seismicStore.data.uploadOption === 'existing') {
    //     console.log("displayFiles ", displayFiles.value);
        
    //     // Group displayFiles by lineId
    //     const filesByLineId = displayFiles.value.reduce((acc: any[], file: any) => {
    //         const lineId = file.lineId || 'no_line';
    //         let group = acc.find(g => g.lineId === lineId);
    //         if (!group) {
    //             group = { lineId, files: [] };
    //             acc.push(group);
    //         }
    //         group.files.push(file);
    //         return acc;
    //     }, []);

    //     for(const fileByLineId of filesByLineId) {
    //         // let metadatas = [];
    //         for(const file of fileByLineId.files) {
    //             const metadata = {
    //                 createdBy: file.createdBy,
    //                 createdFor: file.createdFor,
    //                 createdDate: file.createdDate,
    //                 fileFormat: file.fileFormat,
    //                 lineId: file.lineId,
    //                 dataTypeId: file.selectedDataTypeId,
    //                 subDataTypeId: file.selectedSubDataTypeId
    //             }
    //             seismicStore.addSelectedLineData(fileByLineId.lineId, metadata);
    //         }
    //     }

    //     // return;

    // } else if (seismicStore.data.uploadOption === 'new') {
    //     const metadatas = Array.from(fileDataMap.value.values()).map(file => {
    //         const seismicFile = file as SeismicDataLoadingFileData;
    //         return {
    //             editedBy: seismicFile.editedBy,
    //             createdBy: seismicFile.createdBy,
    //             createdFor: seismicFile.createdFor,
    //             // createdDate: seismicFile.createdDate,
    //             fileFormat: seismicFile.fileFormat,
    //             dataTypeId: seismicFile.selectedDataTypeId,
    //             subDataTypeId: seismicFile.selectedSubDataTypeId,
    //             dataTypeName: getDataTypeName(seismicFile.selectedDataTypeId || ''),
    //             subDataTypeName: getSubDataTypeName(seismicFile.selectedSubDataTypeId || ''),
    //         };
    //     });

    //     // Update the seismic store with metadata
    //     seismicStore.setMetadatas(metadatas);
    // }

    const metadatas = Array.from(fileDataMap.value.values()).map(file => {
        const seismicFile = file as SeismicDataLoadingFileData;
        return {
            seismic_name: seismicFile.name,
            editedBy: seismicFile.editedBy,
            createdBy: seismicFile.createdBy,
            createdFor: seismicFile.createdFor,
            // createdDate: seismicFile.createdDate,
            lineId: seismicFile.lineId || '',
            path: seismicFile.path || '',
            name: seismicFile.name || '',
            size: seismicFile.size || 0,
            createdDate: (seismicFile.createdDate || new Date()).toString(),
            fileFormat: seismicFile.fileFormat,
            dataTypeId: seismicFile.selectedDataTypeId,
            subDataTypeId: seismicFile.selectedSubDataTypeId,
            dataTypeName: getDataTypeName(seismicFile.selectedDataTypeId || ''),
            subDataTypeName: getSubDataTypeName(seismicFile.selectedSubDataTypeId || ''),
        };
    });

    console.log('[DataLoading] metadatas to store in seismic store ', metadatas);

    // Update the seismic store with metadata
    seismicStore.setMetadatas(metadatas);

    // Advance workflow to quality-check stage and mark loading as completed
    seismicStore.advanceWorkflow('quality-check', 'loading');

    router.push('/seismic/data-qc');
};

// Method to handle data type selection change
const onDataTypeChange = (file: SeismicDataLoadingFileData, dataTypeId: string) => {
    updateFileData(file.id, {
        selectedDataTypeId: dataTypeId,
        selectedSubDataTypeId: '', // Reset sub data type when main data type changes
    });

    // Update selected file if it's the current one
    if (selectedFile.value?.id === file.id) {
        selectedFile.value = fileDataMap.value.get(file.id) || null;
    }
};

// Method to handle sub data type selection change
const onSubDataTypeChange = (file: SeismicDataLoadingFileData, subDataTypeId: string) => {
    updateFileData(file.id, {
        selectedSubDataTypeId: subDataTypeId,
    });

    // Update selected file if it's the current one
    if (selectedFile.value?.id === file.id) {
        selectedFile.value = fileDataMap.value.get(file.id) || null;
    }
};

// Method to remove the selected file
const removeSelectedFile = () => {
    if (checkedFiles.value.size === 0) return;

    // Remove all checked files
    checkedFiles.value.forEach(fileId => {
        removeFile(fileId);

        // Clear selected file if it was one of the removed files
        if (selectedFile.value?.id === fileId) {
            selectedFile.value = null;
        }
    });

    // Clear checked files set
    checkedFiles.value.clear();

    // Auto-select the first remaining file if no file is currently selected
    if (!selectedFile.value) {
        const remainingFiles = displayFiles.value;
        if (remainingFiles.length > 0) {
            selectedFile.value = remainingFiles[0];
        }
    }
};

const updateMetadata = () => {
    if (selectedFile.value) {
        updateFileData(selectedFile.value.id, {
            targetFileName: editableFileName.value,
        });

        selectedFile.value = fileDataMap.value.get(selectedFile.value.id) || null;
    }
};

const loadFilePreview = async () => {
    if (!selectedFile.value) return;

    isLoadingPreview.value = true;

    // Clear all preview data
    previewData.value = null;
    docxHtmlContent.value = ''; // Clear DOCX HTML content

    try {
        const filePath = selectedFile.value.path;
        if (!filePath) {
            throw new Error('File path not available');
        }

        if (isLasFile(selectedFile.value.name)) {
            // For .las files, use the LAS preview service
            previewData.value = await parseLasFileForPreview(filePath);
        } else if (isSegyFile(selectedFile.value.name)) {
            // For SEGY files, use the SEGY preview service
            previewData.value = await parseSegyFileForPreview(filePath);
        } else if (isPdfFile(selectedFile.value.name)) {
            // For .pdf files, we'll use iframe display, so no need to call parsePdfFileForPreview
            // The pdfFileUrl computed property will handle the iframe src
            console.log(`[DataLoading] PDF file detected: ${selectedFile.value.name}`);
        } else if (isDocxFile(selectedFile.value.name)) {
            // For .docx files, use the DOCX preview service
            previewData.value = await parseDocxFileForPreview(filePath);
        } else {
            // For other file types, show a placeholder
            console.log(`Preview not available for ${selectedFile.value.name}. File type: ${getFileExtension(selectedFile.value.name).toUpperCase()}`);
        }
    } catch (error) {
        console.error('[DataLoading] Error loading file preview:', error);
        const errorMessage = `Error loading preview: ${error instanceof Error ? error.message : 'Unknown error'}`;
        
        // Set error on the appropriate preview data based on file type
        if (isLasFile(selectedFile.value.name)) {
            previewData.value = {
                asciiText: '',
                metadata: {},
                error: errorMessage
            };
        } else if (isSegyFile(selectedFile.value.name)) {
            previewData.value = {
                asciiText: '',
                metadata: {},
                error: errorMessage,
                isEbcdicHeader: false
            };
        } else if (isDocxFile(selectedFile.value.name)) {
            previewData.value = {
                textContent: '',
                metadata: {},
                error: errorMessage
            };
        }
    } finally {
        isLoadingPreview.value = false;
    }
};

const getDataTypeName = (dataTypeId: string) => {
    const dataType = dataTypes.value?.find((dt: any) => dt._id === dataTypeId);
    console.log('[DataLoading] Data type name:', dataType);
    return dataType?.displayName || '';
};

const getSubDataTypeName = (subDataTypeId: string) => {
    const subDataType = subDataTypes.value?.find((sdt: any) => sdt._id === subDataTypeId);
    console.log('[DataLoading] Sub data type name:', subDataType);
    return subDataType?.displayName || '';
};

// New computed property to check if all files have category, sub-category, and line selected
const canProceedToQualityCheck = computed(() => {
    return displayFiles.value.every(file => {
        return file.selectedDataTypeId && file.selectedDataTypeId !== '' &&
            file.selectedSubDataTypeId && file.selectedSubDataTypeId !== '';
        // Removed wellId requirement for seismic data
    });
});

const pdfFileUrl = computed(() => {
    if (selectedFile.value && isPdfFile(selectedFile.value.name) && selectedFile.value.path) {
        return `file://${selectedFile.value.path}`;
    }
    return '';
});

const goToPreviousPage = () => {
    if (canGoToPreviousPage.value) {
        currentPage.value--;
    }
};

const goToNextPage = () => {
    if (canGoToNextPage.value) {
        currentPage.value++;
    }
};

const resetPagination = () => {
    currentPage.value = 1;
};

const openManualExtractionModal = () => {
    // Check if any files are selected
    if (checkedFiles.value.size === 0) {
        alert('Please select at least one file for custom extraction.');
        return;
    }

    // Initialize with empty values and no fields enabled
    extractionFields.value = {
        ffid: { enabled: false, value: '' },
        il: { enabled: false, value: '' },
        sp: { enabled: false, value: '' },
        xl: { enabled: false, value: '' },
        cdp: { enabled: false, value: '' },
        format: ''
    };

    showManualExtractionModal.value = true;
};

const closeManualExtractionModal = () => {
    showManualExtractionModal.value = false;
    // Reset form when closing
    extractionFields.value = {
        ffid: { enabled: false, value: '' },
        il: { enabled: false, value: '' },
        sp: { enabled: false, value: '' },
        xl: { enabled: false, value: '' },
        cdp: { enabled: false, value: '' },
        format: ''
    };
};

const performManualExtraction = async () => {
    // Define the field type explicitly
    type FieldData = { enabled: boolean; value: string };

    // Validate that at least one field is enabled and has a value
    const enabledFields: Array<[string, FieldData]> = [];

    // Iterate through fields and collect enabled ones
    Object.entries(extractionFields.value).forEach(([key, field]) => {
        // Skip format field and only check field objects
        if (key === 'format' || typeof field === 'string') return;

        const fieldData = field as FieldData;
        if (fieldData.enabled && fieldData.value.trim() !== '') {
            enabledFields.push([key, fieldData]);
        }
    });

    if (enabledFields.length === 0) {
        alert('Please enable and fill at least one field for extraction.');
        return;
    }

    // Validate that all enabled fields have valid integer values
    for (const [key, field] of enabledFields) {
        const value = parseInt(field.value.trim());
        if (isNaN(value) || value < 1) {
            alert(`Invalid byte position for ${key.toUpperCase()}: must be a positive integer`);
            return;
        }
    }

    // Validate that files are selected
    if (checkedFiles.value.size === 0) {
        alert('Please select at least one file for extraction.');
        return;
    }

    try {
        // Build field mappings object for the API
        const fieldMappings: Record<string, number> = {};

        // Map Vue field names to API field names and convert values to integers
        const fieldNameMapping: Record<string, string> = {
            ffid: 'Ffid',
            il: 'Il',
            sp: 'Sp',
            xl: 'Xl',
            cdp: 'Cdp'
        };

        enabledFields.forEach(([key, field]) => {
            const apiFieldName = fieldNameMapping[key];
            if (apiFieldName) {
                fieldMappings[apiFieldName] = parseInt(field.value.trim());
            }
        });

        console.log('[DataLoading] Starting manual extraction for selected files...');
        console.log('[DataLoading] Field mappings:', fieldMappings);

        // Process each selected file
        const results = [];
        const errors = [];

        for (const fileId of checkedFiles.value) {
            const file = getFileById(fileId);
            if (!file || !file.path) {
                errors.push(`File not found or missing path: ${fileId}`);
                continue;
            }

            try {
                // Prepare request body for this file
                const requestBody = {
                    file_path: file.path,
                    field_mappings: fieldMappings,
                    format: extractionFields.value.format
                };

                // console.log(`[DataLoading] Processing file: ${file.name}`);

                console.log("requestBody ", requestBody);

                // Make POST request to the Flask API
                const response = await fetch('http://localhost:5001/api/segy_manual_read', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.error && result.error.type) {
                    throw new Error(result.error.message || 'Manual extraction failed');
                }

                results.push({
                    fileName: file.name,
                    fileId: fileId,
                    data: result
                });

                // Store the extraction results in the seismic store
                if (result.custom_extracted_fields) {
                    // Create update object with only the enabled fields
                    const updateValues: any = {};

                    // Only update the fields that were enabled in the extraction
                    enabledFields.forEach(([key]) => {
                        const apiFieldName = fieldNameMapping[key];
                        if (apiFieldName && result.custom_extracted_fields.first_trace[apiFieldName] !== undefined) {
                            // Map API field names to store property names
                            switch (apiFieldName) {
                                case 'Ffid':
                                    updateValues.first_field_file = result.custom_extracted_fields.first_trace[apiFieldName];
                                    updateValues.last_field_file = result.custom_extracted_fields.last_trace[apiFieldName];
                                    updateValues.ffid_byte_position = result.custom_extracted_fields.byte_positions[apiFieldName];
                                    break;
                                case 'Sp':
                                    updateValues.first_shot_point = result.custom_extracted_fields.first_trace[apiFieldName];
                                    updateValues.last_shot_point = result.custom_extracted_fields.last_trace[apiFieldName];
                                    updateValues.sp_byte_position = result.custom_extracted_fields.byte_positions[apiFieldName];
                                    break;
                                case 'Cdp':
                                    updateValues.first_cdp = result.custom_extracted_fields.first_trace[apiFieldName];
                                    updateValues.last_cdp = result.custom_extracted_fields.last_trace[apiFieldName];
                                    updateValues.cdp_byte_position = result.custom_extracted_fields.byte_positions[apiFieldName];
                                    break;
                                case 'Il':
                                    updateValues.inline = result.custom_extracted_fields.first_trace[apiFieldName];
                                    updateValues.il_byte_position = result.custom_extracted_fields.byte_positions[apiFieldName];
                                    break;
                                case 'Xl':
                                    updateValues.crossline = result.custom_extracted_fields.first_trace[apiFieldName];
                                    updateValues.xl_byte_position = result.custom_extracted_fields.byte_positions[apiFieldName];
                                    break;
                            }
                        }
                    });

                    seismicStore.updateFileExtractionValues(fileId, updateValues);

                    console.log(`[DataLoading] Successfully extracted values for ${file.name}`);
                }

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                errors.push(`${file.name}: ${errorMessage}`);
                console.error(`[DataLoading] Error processing file ${file.name}:`, error);
            }
        }

        // Show results summary
        let message = `Custom field extraction completed!\n\n`;
        message += `Successfully processed: ${results.length} file(s)\n`;
        message += `Default extraction values have been overridden with custom byte positions.\n`;

        if (errors.length > 0) {
            message += `\nFailed: ${errors.length} file(s)\n\nErrors:\n`;
            errors.forEach(error => {
                message += `• ${error}\n`;
            });
        }

        console.log('[DataLoading] Manual extraction results:', { results, errors });
        alert(message);

        // Close modal after extraction
        closeManualExtractionModal();

    } catch (error) {
        console.error('[DataLoading] Error during manual extraction:', error);
        alert(`Manual extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

const getExtractedValue = (file: ExtendedFileData, trace: string, field: string): string => {
    // Find the file metadata in the seismic store
    const fileMetadata = seismicStore.data.seismicMetadatas.find(f => f.id === file.id);
    if (!fileMetadata) return '';

    // Map the trace and field combination to the flattened property names
    const fieldMap: Record<string, string> = {
        'first_trace_Ffid': 'first_field_file',
        'last_trace_Ffid': 'last_field_file',
        'first_trace_Sp': 'first_shot_point',
        'last_trace_Sp': 'last_shot_point',
        'first_trace_Cdp': 'first_cdp',
        'last_trace_Cdp': 'last_cdp',
        'first_trace_Il': 'inline',
        'first_trace_Xl': 'crossline'
    };

    const key = `${trace}_${field}`;
    const propertyName = fieldMap[key];

    if (propertyName && fileMetadata[propertyName as keyof typeof fileMetadata] !== undefined) {
        return fileMetadata[propertyName as keyof typeof fileMetadata]?.toString() || '';
    }

    return '';
};

// New method to perform automatic extraction for all files with default byte positions
const performDefaultExtraction = async () => {
    const defaultFieldMappings = {
        Ffid: 9,     // Field File Identification Number (bytes 9-12)
        Sp: 17,      // Shot Point Number (bytes 17-20)
        Cdp: 21,     // CDP Number (bytes 21-24)
        Il: 189,     // Inline Number (bytes 189-192)
        Xl: 193      // Crossline Number (bytes 193-196)
    };

    // Process each file
    const results = [];
    const errors = [];

    for (const file of displayFiles.value) {
        if (!file.path) {
            console.warn(`[DataLoading] Skipping file ${file.name} - no file path`);
            continue;
        }

        try {
            // Prepare request body for this file
            const requestBody = {
                file_path: file.path,
                field_mappings: defaultFieldMappings
            };

            // Make POST request to the Flask API
            const response = await fetch('http://localhost:5001/api/segy_manual_read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.error && result.error.type) {
                throw new Error(result.error.message || 'Automatic extraction failed');
            }

            // Store the extraction results in the seismic store
            if (result.custom_extracted_fields) {
                // Map API results to flattened store structure
                const updateValues = {
                    first_field_file: result.custom_extracted_fields.first_trace.Ffid,
                    last_field_file: result.custom_extracted_fields.last_trace.Ffid,
                    first_shot_point: result.custom_extracted_fields.first_trace.Sp,
                    last_shot_point: result.custom_extracted_fields.last_trace.Sp,
                    first_cdp: result.custom_extracted_fields.first_trace.Cdp,
                    last_cdp: result.custom_extracted_fields.last_trace.Cdp,
                    inline: result.custom_extracted_fields.first_trace.Il,
                    crossline: result.custom_extracted_fields.first_trace.Xl,
                    ffid_byte_position: result.custom_extracted_fields.byte_positions.Ffid,
                    sp_byte_position: result.custom_extracted_fields.byte_positions.Sp,
                    cdp_byte_position: result.custom_extracted_fields.byte_positions.Cdp,
                    il_byte_position: result.custom_extracted_fields.byte_positions.Il,
                    xl_byte_position: result.custom_extracted_fields.byte_positions.Xl
                };

                seismicStore.updateFileExtractionValues(file.id, updateValues);
            }

            results.push({
                fileName: file.name,
                fileId: file.id,
                success: true
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`${file.name}: ${errorMessage}`);

            results.push({
                fileName: file.name,
                fileId: file.id,
                success: false,
                error: errorMessage
            });
        }
    }

    // Log summary
    const successCount = results.filter(r => r.success).length;
    const errorCount = errors.length;

    console.log(`[DataLoading] Automatic extraction completed: ${successCount} successful, ${errorCount} failed`);

    if (errorCount > 0) {
        console.warn('[DataLoading] Automatic extraction errors:', errors);
    }
};

// Lifecycle
onMounted(async () => {

    initializeFileData();

    // Fetch data types and sub data types
    try {
        await fetchDataTypes();
        await fetchSubDataTypes();

        // Fetch seismic lines and survey-line relationships
        await fetchSeismicLines();
        await fetchSurveyLinePivots();
    } catch (error) {
        console.error('[DataLoading] Error fetching data:', error);
    }

    // Auto-select first file
    if (displayFiles.value.length > 0) {
        selectedFile.value = displayFiles.value[0];
        editableFileName.value = selectedFile.value.targetFileName || selectedFile.value.name;
    }

    // Perform automatic extraction for all files with default byte positions
    if (seismicStore.data.uploadOption === 'new') {
        await performDefaultExtraction();
    }
});

// Watch for changes in displayFiles to reset pagination
watch(displayFiles, () => {
    resetPagination();
});

// Watch for changes in itemsPerPage to adjust current page if needed
watch(itemsPerPage, () => {
    // If current page exceeds total pages after items per page change, reset to page 1
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = 1;
    }
});

// Watch for tab changes to load preview when needed
watch(activeTab, async (newTab) => {
    if (newTab === 'preview' && selectedFile.value && !previewData.value && !docxHtmlContent.value) {
        loadFilePreview();
    }
    // Load DOCX HTML preview if DOCX file is selected
    if (newTab === 'preview' && selectedFile.value && isDocxFile(selectedFile.value.name)) {
        if (selectedFile.value.path) {
            // @ts-ignore
            const result = await window.electronAPI.convertDocxToHtml(selectedFile.value.path);
            if (result && result.success) {
                docxHtmlContent.value = result.htmlContent;
            } else {
                docxHtmlContent.value = '<p style="color:red">Unable to render DOCX preview.</p>';
            }
        }
    } else {
        docxHtmlContent.value = '';
    }
});

</script>

<style scoped>
.data-loading-content {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    min-height: 100vh;
}

.page-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e2e8f0;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.back-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #475569;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
}

.back-button:hover {
    color: #3b82f6;
    background: #eff6ff;
    transform: translateX(-2px);
}

.header-title h1 {
    color: #0f172a;
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.header-title p {
    color: #64748b;
    font-size: 1rem;
    margin: 0;
}

.loading-main {
    padding: 1rem;
    max-width: 100%;
    margin: 0 auto;
}

.main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    height: calc(100vh - 200px);
}

.components-panel {
    max-width: 100%;
    overflow: hidden;
}

.panel-card {
    background: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.panel-header {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 8px 8px 0 0;
}

.panel-header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.panel-header-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.panel-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.panel-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
}

.panel-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.manual-extract-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    background: white;
    color: #6b7280;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.manual-extract-btn:hover {
    background: #e5e7eb;
}

.remove-btn {
    align-self: flex-start;
    font-size: 0.875rem;
}

.panel-tabs {
    display: flex;
    gap: 0.5rem;
}

.tab-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    background: white;
    color: #6b7280;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.tab-btn.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

.dataset-select {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background: white;
    font-size: 0.875rem;
}

.table-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
}

.table-scroll-wrapper {
    flex: 1;
    overflow-x: auto;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px 8px 0 0;
    border-bottom: none;
    background: white;
    max-height: calc(100% - 60px);
    /* Account for footer height */
}

/* Custom scrollbar styling */
.table-scroll-wrapper::-webkit-scrollbar {
    height: 8px;
    width: 8px;
}

.table-scroll-wrapper::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
}

.table-scroll-wrapper::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}

.table-scroll-wrapper::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

.components-table {
    width: 100%;
    font-size: 0.75rem;
    border-collapse: collapse;
    min-width: 1400px;
    /* Fixed minimum width to ensure horizontal scroll */
    background: white;
    border: none;
}

.components-table th {
    background: #f8fafc;
    padding: 1rem 1.25rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
    font-size: 0.8rem;
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 10;
    min-width: 120px;
    /* Ensure consistent minimum column width */
}

.components-table th:first-child {
    min-width: 50px;
    /* Smaller width for checkbox column */
}

.components-table th:nth-child(2) {
    min-width: 200px;
    /* File name column gets more space */
}

.components-table td {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.8rem;
    vertical-align: middle;
    white-space: nowrap;
    min-width: 120px;
}

.components-table td:first-child {
    min-width: 50px;
}

.components-table td:nth-child(2) {
    min-width: 200px;
}

.components-table tbody tr {
    transition: all 0.2s ease;
}

.components-table tbody tr:hover {
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.components-table tr.selected {
    background: #dbeafe;
    border-left: 3px solid #3b82f6;
}

.components-table tr.selected:hover {
    background: #bfdbfe;
}

.file-name {
    font-weight: 500;
    color: #1f2937;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.entity-select,
.status-select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.8rem;
    width: 140px;
    background: white;
    transition: all 0.2s ease;
}

.entity-select:focus,
.status-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.entity-select:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
}

.table-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border: 1px solid #e5e7eb;
    border-top: none;
    font-size: 0.875rem;
    color: #6b7280;
    background: #f8fafc;
    border-radius: 0 0 8px 8px;
    min-height: 60px;
    flex-shrink: 0;
}

.footer-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.items-per-page {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.items-select {
    padding: 0.25rem 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
    background: white;
    color: #374151;
    min-width: 60px;
}

.pagination {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.page-btn {
    padding: 0.25rem 0.5rem;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.875rem;
    color: #374151;
    transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #9ca3af;
}

.page-btn:disabled {
    background: #f9fafb;
    color: #d1d5db;
    cursor: not-allowed;
    opacity: 0.6;
}

.page-info {
    font-size: 0.875rem;
    color: #374151;
    font-weight: 500;
    padding: 0 0.5rem;
    white-space: nowrap;
}

.details-content {
    padding: 1rem;
    overflow-y: auto;
    flex: 1;
}

.metadata-form {
    display: grid;
    gap: 1rem;
}

.metadata-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.metadata-actions {
    display: flex;
    gap: 0.5rem;
}

.form-group {
    display: grid;
    grid-template-columns: 150px 1fr;
    align-items: center;
    gap: 1rem;
}

.form-group label {
    font-size: 0.875rem;
    color: #374151;
    font-weight: 500;
}

.form-value {
    font-size: 0.875rem;
    color: #1f2937;
}

.form-input,
.form-select {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
}

.form-input-long {
    width: 100%;
    min-width: 300px;
}

.input-with-icon,
.select-with-icon {
    position: relative;
}

.input-icon,
.select-icon {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    pointer-events: none;
}

.no-selection {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #6b7280;
    font-style: italic;
}

.preview-content {
    padding: 1rem;
    overflow-y: auto;
    flex: 1;
    max-height: 100%;
}

.loading-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    gap: 1rem;
    color: #6b7280;
}

.preview-error {
    padding: 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    color: #dc2626;
}

.preview-data {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.preview-metadata {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 1rem;
    background: #f9fafb;
}

.preview-metadata h4 {
    margin: 0 0 1rem 0;
    color: #1f2937;
    font-size: 1rem;
    font-weight: 600;
}

.preview-metadata h5 {
    margin: 1rem 0 0.5rem 0;
    color: #374151;
    font-size: 0.875rem;
    font-weight: 600;
}

.metadata-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
}

.metadata-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.metadata-item label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.metadata-item span {
    font-size: 0.875rem;
    color: #1f2937;
    font-weight: 500;
}

.curves-section {
    margin-top: 1rem;
}

.curves-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.curve-tag {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: #dbeafe;
    color: #1e40af;
    border-radius: 3px;
    font-size: 0.75rem;
    font-weight: 500;
    border: 1px solid #bfdbfe;
}

.ascii-preview {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
}

.ascii-preview h4 {
    margin: 0;
    padding: 0.75rem 1rem;
    background: #f3f4f6;
    border-bottom: 1px solid #e5e7eb;
    color: #1f2937;
    font-size: 1rem;
    font-weight: 600;
}

.ascii-content {
    max-height: 400px;
    overflow-y: auto;
    background: #ffffff;
}

.ascii-content pre {
    margin: 0;
    padding: 1rem;
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
    line-height: 1.4;
    color: #374151;
    white-space: pre;
    overflow-x: auto;
}

.no-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #6b7280;
    font-style: italic;
}

.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-primary:hover {
    background: #1e40af;
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #9ca3af;
    transform: none;
    box-shadow: none;
}

.btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
}

.btn-secondary:hover {
    background: #e5e7eb;
}

.loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loading-spinner.small {
    width: 12px;
    height: 12px;
    border-width: 1px;
}

.status-pending {
    font-size: 12px;
    opacity: 0.6;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@media (max-width: 1024px) {
    .main-grid {
        grid-template-columns: 1fr;
    }
}

.entity-select {
    padding: 0.25rem 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
    background: white;
    color: #374151;
    min-width: 120px;
}

.entity-select:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
}

.entity-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
}

.modal-close {
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.modal-close:hover {
    background: #f3f4f6;
    color: #374151;
}

.modal-body {
    padding: 1.5rem;
    color: #374151;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
}

.extraction-form {
    display: grid;
    gap: 1.5rem;
}

.form-row {
    display: flex;
    gap: 2rem;
    align-items: center;
}

.form-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
}

.field-checkbox {
    margin: 0;
    width: 16px;
    height: 16px;
}

.field-label {
    font-size: 0.875rem;
    color: #374151;
    font-weight: 500;
    min-width: 40px;
    text-align: left;
}

.field-input {
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
    flex: 1;
    min-width: 120px;
}

.field-input:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
}

.format-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
}

.format-select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
    flex: 1;
    min-width: 140px;
    background: white;
}

/* Selected Files Section */
.selected-files-section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.selected-files-section h4 {
    margin: 0 0 1rem 0;
    color: #1f2937;
    font-size: 1rem;
    font-weight: 600;
}

.selected-files-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    padding: 0.75rem;
    background: #f9fafb;
}

.selected-file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    font-size: 0.875rem;
}

.file-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.file-info .file-name {
    font-weight: 500;
    color: #1f2937;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.file-info .file-size {
    color: #6b7280;
    font-size: 0.8rem;
    min-width: 60px;
    text-align: right;
}

/* Extraction Description */
.extraction-description {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 6px;
}

.extraction-description p {
    margin: 0;
    color: #0c4a6e;
    font-size: 0.875rem;
    line-height: 1.5;
}

/* EBCDIC Header Styles */
.ebcdic-header-section {
    margin-bottom: 1.5rem;
}

.ebcdic-header {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
    background: #ffffff;
}

.ebcdic-header h4 {
    margin: 0;
    padding: 0.75rem 1rem;
    background: #1e40af;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    border-bottom: 1px solid #1e40af;
}

.ebcdic-content {
    max-height: 500px;
    overflow-y: auto;
    background: #ffffff;
}

.ebcdic-content pre {
    margin: 0;
    padding: 1rem;
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
    line-height: 1.4;
    color: #374151;
    white-space: pre;
    overflow-x: auto;
    background: #ffffff;
}

/* Custom scrollbar for EBCDIC content */
.ebcdic-content::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.ebcdic-content::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
}

.ebcdic-content::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}

.ebcdic-content::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>

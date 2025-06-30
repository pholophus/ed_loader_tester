<template>
    <div class="data-loading-content">
        <!-- Header -->
        <header class="page-header">
            <div class="header-nav">
                <router-link to="/seismic/data-preparation" class="back-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Back to Preparation
                </router-link>
                <div class="header-actions">
                    <button 
                        class="btn btn-primary" 
                        @click="proceedToQualityCheck" 
                        :disabled="!canProceedToQualityCheck"
                    >
                        Load
                    </button>
                </div>
            </div>
            <div class="header-title">
                <!-- <h1>Data Loading</h1> -->
                <!-- <p>Loading your dataset files into the system</p> -->
            </div>
            
            <!-- Workflow Progress -->
            <WorkflowProgress 
                :current-stage="seismicStore.data.currentStage"
                :completed-stages="seismicStore.data.completedStages"
            />
        </header>

        <main class="loading-main">
            <div class="main-grid">
                <!-- Left Panel - Components -->
                <div class="components-panel">
                    <div class="panel-card">
                        <div class="panel-header">
                            <div class="panel-header-top">
                                <div class="panel-header-right">
                                    <!-- <select class="dataset-select">
                                        <option>Dataset</option>
                                    </select> -->
                                    <!-- <button class="tab-btn active">Files ({{ displayFiles.length }})</button> -->
                                    <!-- <button class="tab-btn">Logs (1)</button> -->
                                    <!-- <button class="btn btn-secondary">Reanalyze</button> -->
                                </div>
                            </div>
                            <div class="panel-title-row">
                                <h3 class="panel-title">Components</h3>
                                <div class="panel-actions">
                                    <button class="btn btn-secondary manual-extract-btn" @click="openManualExtractionModal">
                                        Manual Extraction
                                    </button>
                                    <button class="btn btn-secondary remove-btn" @click="removeSelectedFile" :disabled="checkedFiles.size === 0">
                                        Remove{{ checkedFiles.size > 0 ? ` (${checkedFiles.size})` : '' }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="table-container">
                            <table class="components-table">
                                <thead>
                                    <tr>
                                        <th><input type="checkbox" 
                                            :checked="allFilesChecked" 
                                            :indeterminate="someFilesChecked"
                                            @change="toggleAllFiles" /></th>
                                        <th>File Name</th>
                                        <th>Size</th>
                                        <th v-if="seismicStore.data.isForUploadingFileForExistingSeismic">Line</th>
                                        <th>Category</th>
                                        <th>Sub Category</th>
                                        <th>First Field File</th>
                                        <th>Last Field File</th>
                                        <th>FSP</th>
                                        <th>LSP</th>
                                        <th>First CDP</th>
                                        <th>Last CDP</th>
                                        <th>InLine</th>
                                        <th>XLine</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="file in paginatedFiles" :key="file.id" 
                                        :class="{ selected: selectedFile?.id === file.id }"
                                        @click="selectFile(file)">
                                        <td><input type="checkbox" :checked="isFileChecked(file.id)" @click="toggleFileCheck(file.id, $event)" /></td>
                                        <td class="file-name">{{ file.name }}</td>
                                        <td>{{ formatFileSize(file.size) }}</td>
                                        <td v-if="seismicStore.data.isForUploadingFileForExistingSeismic">
                                            <select class="entity-select" v-model="file.wellId">
                                                <option value="">Select Line</option>
                                                <option v-for="line in filteredSeismicLines" :key="line._id" :value="line._id">
                                                    {{ line.name }}
                                                </option>
                                            </select>
                                        </td>
                                        <td>
                                            <select class="entity-select" v-model="file.selectedDataTypeId" @change="onDataTypeChange(file, file.selectedDataTypeId || '')">
                                                <option value="">Select Category</option>
                                                <option v-for="dataType in activeDataTypes" :key="dataType._id" :value="dataType._id">
                                                    {{ dataType.name }}
                                                </option>
                                            </select>
                                        </td>
                                        <td>
                                            <select class="entity-select" v-model="file.selectedSubDataTypeId" :disabled="!file.selectedDataTypeId" @change="onSubDataTypeChange(file, file.selectedSubDataTypeId || '')">
                                                <option value="">Select Sub Category</option>
                                                <option v-for="subDataType in getFilteredSubDataTypes(file.selectedDataTypeId || '')" :key="subDataType._id" :value="subDataType._id">
                                                    {{ subDataType.name }}
                                                </option>
                                            </select>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            
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
                                    <button class="page-btn" @click="goToPreviousPage" :disabled="!canGoToPreviousPage">‹</button>
                                    <span class="page-info">Page {{ currentPage }} of {{ totalPages || 1 }}</span>
                                    <button class="page-btn" @click="goToNextPage" :disabled="!canGoToNextPage">›</button>
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
                                    <div class="metadata-actions">
                                        <button class="btn btn-primary" @click="updateMetadata">Update</button>
                                        <button class="btn btn-secondary" @click="resetFileName">Reset</button>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label>Edited By</label>
                                    <span class="form-value">{{ selectedFile.editedBy }}</span>
                                </div>
                                
                                <div class="form-group">
                                    <label>Created By</label>
                                    <span class="form-value">{{ selectedFile.createdBy }}</span>
                                </div>

                                <div class="form-group">
                                    <label>Target File Name</label>
                                    <div class="input-with-icon">
                                        <input type="text" v-model="editableFileName" class="form-input form-input-long" />
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="input-icon">
                                            <path d="M12 2L12 22M2 12L22 12" stroke="currentColor" stroke-width="2"/>
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

                                <div class="form-group">
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
                                    <!-- Metadata Section -->
                                    <div v-if="previewData.metadata && Object.keys(previewData.metadata).length > 0" class="preview-metadata">
                                        <h4>File Information</h4>
                                        <div class="metadata-grid">
                                            <div v-if="previewData.metadata.wellName" class="metadata-item">
                                                <label>Well Name:</label>
                                                <span>{{ previewData.metadata.wellName }}</span>
                                            </div>
                                            <div v-if="previewData.metadata.location" class="metadata-item">
                                                <label>Location:</label>
                                                <span>{{ previewData.metadata.location }}</span>
                                            </div>
                                            <div v-if="previewData.metadata.uwi" class="metadata-item">
                                                <label>UWI:</label>
                                                <span>{{ previewData.metadata.uwi }}</span>
                                            </div>
                                            <div v-if="previewData.metadata.startDepth" class="metadata-item">
                                                <label>Start Depth:</label>
                                                <span>{{ previewData.metadata.startDepth }}</span>
                                            </div>
                                            <div v-if="previewData.metadata.stopDepth" class="metadata-item">
                                                <label>Stop Depth:</label>
                                                <span>{{ previewData.metadata.stopDepth }}</span>
                                            </div>
                                            <div v-if="previewData.metadata.step" class="metadata-item">
                                                <label>Step:</label>
                                                <span>{{ previewData.metadata.step }}</span>
                                            </div>
                                            <div v-if="previewData.metadata.curveCount" class="metadata-item">
                                                <label>Curve Count:</label>
                                                <span>{{ previewData.metadata.curveCount }}</span>
                                            </div>
                                        </div>
                                        
                                        <!-- Curves List -->
                                        <div v-if="previewData.metadata.curves && previewData.metadata.curves.length > 0" class="curves-section">
                                            <h5>Available Curves</h5>
                                            <div class="curves-list">
                                                <span v-for="curve in previewData.metadata.curves" :key="curve" class="curve-tag">
                                                    {{ curve }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- ASCII Text Section -->
                                    <div class="ascii-preview">
                                        <h4>ASCII Content</h4>
                                        <div class="ascii-content">
                                            <pre>{{ previewData.asciiText }}</pre>
                                        </div>
                                    </div>
                                </div>
                                
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
                    <h3>Manual Extraction</h3>
                    <button class="modal-close" @click="closeManualExtractionModal">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="extraction-form">
                        <div class="form-row">
                            <div class="form-field">
                                <input type="checkbox" id="ffid" v-model="extractionFields.ffid.enabled" class="field-checkbox">
                                <label for="ffid" class="field-label">FFID</label>
                                <input 
                                    type="text" 
                                    v-model="extractionFields.ffid.value" 
                                    :disabled="!extractionFields.ffid.enabled"
                                    class="field-input"
                                    placeholder=""
                                >
                            </div>
                            <div class="form-field">
                                <input type="checkbox" id="il" v-model="extractionFields.il.enabled" class="field-checkbox">
                                <label for="il" class="field-label">IL</label>
                                <input 
                                    type="text" 
                                    v-model="extractionFields.il.value" 
                                    :disabled="!extractionFields.il.enabled"
                                    class="field-input"
                                    placeholder=""
                                >
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-field">
                                <input type="checkbox" id="sp" v-model="extractionFields.sp.enabled" class="field-checkbox">
                                <label for="sp" class="field-label">SP</label>
                                <input 
                                    type="text" 
                                    v-model="extractionFields.sp.value" 
                                    :disabled="!extractionFields.sp.enabled"
                                    class="field-input"
                                    placeholder=""
                                >
                            </div>
                            <div class="form-field">
                                <input type="checkbox" id="xl" v-model="extractionFields.xl.enabled" class="field-checkbox">
                                <label for="xl" class="field-label">XL</label>
                                <input 
                                    type="text" 
                                    v-model="extractionFields.xl.value" 
                                    :disabled="!extractionFields.xl.enabled"
                                    class="field-input"
                                    placeholder=""
                                >
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-field">
                                <input type="checkbox" id="cdp" v-model="extractionFields.cdp.enabled" class="field-checkbox">
                                <label for="cdp" class="field-label">CDP</label>
                                <input 
                                    type="text" 
                                    v-model="extractionFields.cdp.value" 
                                    :disabled="!extractionFields.cdp.enabled"
                                    class="field-input"
                                    placeholder=""
                                >
                            </div>
                            <div class="form-field format-field">
                                <label class="field-label">FORMAT</label>
                                <select v-model="extractionFields.format" class="format-select">
                                    <option value="">Select Format</option>
                                    <option value="segy">SEG-Y</option>
                                    <option value="segd">SEG-D</option>
                                    <option value="ascii">ASCII</option>
                                    <option value="binary">Binary</option>
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

const router = useRouter();
// const fileStore = useFileStore();
const seismicStore = useSeismicStore();

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
const selectedFile = ref<ExtendedFileData | null>(null);
const checkedFiles = ref<Set<string>>(new Set());
const editableFileName = ref('');
const previewData = ref<LasPreviewData | null>(null);
const isLoadingPreview = ref(false);
const showManualExtractionModal = ref(false);

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
    return dataType?.name || '';
});

const selectedSubDataTypeName = computed(() => {
    if (!selectedFile.value?.selectedSubDataTypeId || !subDataTypes.value) {
        return '';
    }
    const subDataType = subDataTypes.value.find((sdt: any) => sdt._id === selectedFile.value?.selectedSubDataTypeId);
    return subDataType?.name || '';
});

const selectedLineName = computed(() => {
    if (!selectedFile.value?.wellId || !filteredSeismicLines.value.length) {
        return '';
    }
    const line = filteredSeismicLines.value.find((l: any) => l._id === selectedFile.value?.wellId);
    return line?.name || '';
});

// Computed property to get lines filtered by current surveyId
const filteredSeismicLines = computed(() => {
    const currentSurveyId = seismicStore.data.survey.surveyId;
    
    if (!currentSurveyId || !surveyLinePivots.value || !seismicLines.value) {
        return [];
    }
    
    // Get line IDs associated with the current survey
    const associatedLineIds = surveyLinePivots.value
        .filter(pivot => pivot.surveyId === currentSurveyId)
        .map(pivot => pivot.lineId);
    
    // Filter seismic lines to only include those associated with the survey
    return seismicLines.value.filter(line => 
        line._id && associatedLineIds.includes(line._id)
    );
});

const getFilteredSubDataTypes = (dataTypeId: string) => {
    
    const filtered = subDataTypes.value?.filter((sdt: any) => {
        return sdt.isActive && sdt.dataTypeId === dataTypeId;
    }) || [];
    
    return filtered;
};

// Pagination computed properties
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

const selectFile = (file: ExtendedFileData) => {
    selectedFile.value = fileDataMap.value.get(file.id) || file;
    // Initialize editable filename with the selected file's target filename
    editableFileName.value = selectedFile.value.targetFileName || selectedFile.value.name;
    
    // Clear previous preview data
    previewData.value = null;
    
    // Load preview if it's a .las file and preview tab is active
    if (activeTab.value === 'preview' && isLasFile(selectedFile.value.name)) {
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
    // First, save any pending changes to the currently selected file
    if (selectedFile.value && editableFileName.value !== selectedFile.value.targetFileName) {
        updateMetadata();
    }
    
    // Prepare metadata from all files in fileDataMap with the most current values
    const metadatas = Array.from(fileDataMap.value.values()).map(file => ({
        editedBy: file.editedBy,
        createdBy: file.createdBy,
        createdFor: file.createdFor,
        createdDate: file.createdDate,
        fileFormat: file.fileFormat,
        dataTypeId: file.selectedDataTypeId, // From Category dropdown
        subDataTypeId: file.selectedSubDataTypeId, // From Sub Category dropdown
        dataTypeName: getDataTypeName(file.selectedDataTypeId || ''),
        subDataTypeName: getSubDataTypeName(file.selectedSubDataTypeId || ''),
        lineId: file.wellId, // For seismic data, wellId field actually contains lineId
    }));

    console.log('[DataLoading] Proceeding to quality check...');
    console.log('[DataLoading] Metadatas:', metadatas);
    
    // Update the seismic store with metadata
    seismicStore.setMetadatas(metadatas);
    
    // Advance workflow to quality-check stage and mark loading as completed
    seismicStore.advanceWorkflow('quality-check', 'loading');
    
    router.push('/seismic/data-qc');
};

// Method to handle data type selection change
const onDataTypeChange = (file: ExtendedFileData, dataTypeId: string) => {
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
const onSubDataTypeChange = (file: ExtendedFileData, subDataTypeId: string) => {
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

// Lifecycle
onMounted(async () => {

    // console.log('[DataLoading] Well data:', seismicStore.data);
    // console.log('[DataLoading] Well data:', seismicStore.data.well);
    // Initialize file data
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
        // Initialize editable filename
        editableFileName.value = selectedFile.value.targetFileName || selectedFile.value.name;
    }
});

const updateMetadata = () => {
    if (selectedFile.value) {
        // Update target file name using the composable
        updateFileData(selectedFile.value.id, {
            targetFileName: editableFileName.value,
        });
        
        // Update the selected file reference
        selectedFile.value = fileDataMap.value.get(selectedFile.value.id) || null;
    }
};

const resetFileName = () => {
    if (selectedFile.value) {
        editableFileName.value = selectedFile.value.targetFileName || selectedFile.value.name;
    }
};

// Method to load file preview
const loadFilePreview = async () => {
    if (!selectedFile.value) return;
    
    isLoadingPreview.value = true;
    previewData.value = null;
    
    try {
        if (isLasFile(selectedFile.value.name)) {
            // For .las files, use the LAS preview service
            const filePath = selectedFile.value.path;
            if (filePath) {
                previewData.value = await parseLasFileForPreview(filePath);
            } else {
                previewData.value = {
                    asciiText: '',
                    metadata: {},
                    error: 'File path not available'
                };
            }
        } else {
            // For other file types, show a placeholder
            previewData.value = {
                asciiText: `Preview not available for ${selectedFile.value.name}.\nFile type: ${getFileExtension(selectedFile.value.name).toUpperCase()}`,
                metadata: {},
            };
        }
    } catch (error) {
        console.error('[DataLoading] Error loading file preview:', error);
        previewData.value = {
            asciiText: '',
            metadata: {},
            error: `Error loading preview: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    } finally {
        isLoadingPreview.value = false;
    }
};

// Watch for tab changes to load preview when needed
watch(activeTab, (newTab) => {
    if (newTab === 'preview' && selectedFile.value && !previewData.value) {
        loadFilePreview();
    }
});

const getDataTypeName = (dataTypeId: string) => {
    const dataType = dataTypes.value?.find((dt: any) => dt._id === dataTypeId);
    console.log('[DataLoading] Data type name:', dataType);
    return dataType?.name || '';
};

const getSubDataTypeName = (subDataTypeId: string) => {
    const subDataType = subDataTypes.value?.find((sdt: any) => sdt._id === subDataTypeId);
    console.log('[DataLoading] Sub data type name:', subDataType);
    return subDataType?.name || '';
};

// New computed property to check if all files have category, sub-category, and line selected
const canProceedToQualityCheck = computed(() => {
    return displayFiles.value.every(file => {
        return file.selectedDataTypeId && file.selectedDataTypeId !== '' && 
               file.selectedSubDataTypeId && file.selectedSubDataTypeId !== '';
        // Removed wellId requirement for seismic data
    });
});

// Pagination methods
const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

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

// Manual extraction modal methods
const openManualExtractionModal = () => {
    showManualExtractionModal.value = true;
};

const closeManualExtractionModal = () => {
    showManualExtractionModal.value = false;
};

const performManualExtraction = () => {
    // TODO: Implement manual extraction logic
    console.log('[DataLoading] Performing manual extraction...');
    
    // Close modal after extraction
    closeManualExtractionModal();
};
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
    overflow-x: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
}

.components-table {
    width: 100%;
    font-size: 0.75rem;
    border-collapse: collapse;
    min-width: 800px;
    background: white;
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
}

.components-table td {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.8rem;
    vertical-align: middle;
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
    border-top: 2px solid #e5e7eb;
    font-size: 0.875rem;
    color: #6b7280;
    background: #f8fafc;
    border-radius: 0 0 8px 8px;
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
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
</style>


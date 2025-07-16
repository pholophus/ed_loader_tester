<template>
    <div class="data-loading-content">
        <!-- Header -->
        <header class="page-header">
            <div class="header-nav">
                <router-link to="/well/data-preparation" class="back-button">
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
                :current-stage="wellStore.data.currentStage"
                :completed-stages="wellStore.data.completedStages"
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
                                <button class="btn btn-secondary remove-btn" @click="removeSelectedFile" :disabled="checkedFiles.size === 0">
                                    Remove{{ checkedFiles.size > 0 ? ` (${checkedFiles.size})` : '' }}
                                </button>
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
                                        <th>Well</th>
                                        <th>Category</th>
                                        <th>Sub Category</th>
                                        <!-- <th>Preparation</th>
                                        <th>Loading</th>
                                        <th>Quality Check</th>
                                        <th>Publication</th> -->
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="file in displayFiles" :key="file.id" 
                                        :class="{ selected: selectedFile?.id === file.id }"
                                        @click="selectFile(file as DataLoadingFileData)">
                                        <td><input type="checkbox" :checked="isFileChecked(file.id)" @click="toggleFileCheck(file.id, $event)" /></td>
                                        <td class="file-name">{{ file.name }}</td>
                                        <td>{{ formatFileSize(file.size) }}</td>
                                        <td>
                                            <select class="entity-select" v-model="(file as DataLoadingFileData).wellId">
                                                <option value="">Select Well</option>
                                                <option v-for="well in wellStore.data.well" :key="well.wellId" :value="well.wellId">
                                                    {{ well.wellName }}
                                                </option>
                                            </select>
                                        </td>
                                        <td>
                                            <select class="entity-select" v-model="file.selectedDataTypeId" @change="onDataTypeChange(file as DataLoadingFileData, file.selectedDataTypeId || '')">
                                                <option value="">Select Category</option>
                                                <option v-for="dataType in activeDataTypes" :key="dataType._id" :value="dataType._id">
                                                    {{ dataType.displayName }}
                                                </option>
                                            </select>
                                        </td>
                                        <td>
                                            <select class="entity-select" v-model="file.selectedSubDataTypeId" :disabled="!file.selectedDataTypeId" @change="onSubDataTypeChange(file as DataLoadingFileData, file.selectedSubDataTypeId || '')">
                                                <option value="">Select Sub Category</option>
                                                <option v-for="subDataType in getFilteredSubDataTypes(file.selectedDataTypeId || '')" :key="subDataType._id" :value="subDataType._id">
                                                    {{ subDataType.displayName }}
                                                </option>
                                            </select>
                                        </td>

                                        <!-- <td>
                                            <select class="status-select" v-model="file.preparation">
                                                <option value="All">All</option>
                                                <option value="A3">A3</option>
                                            </select>
                                        </td>
                                        <td>
                                            <div class="status-icon" :class="file.loadingStatus">
                                                <svg v-if="file.loadingStatus === 'completed'" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                                <div v-else-if="file.loadingStatus === 'loading'" class="loading-spinner small"></div>
                                                <div v-else class="status-pending">⏳</div>
                                            </div>
                                        </td>
                                        <td>
                                            <select class="status-select" v-model="file.qualityCheck">
                                                <option value="All">All</option>
                                                <option value="A3">A3</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select class="status-select" v-model="file.publication">
                                                <option value="All">All</option>
                                                <option value="A3">A3</option>
                                            </select>
                                        </td> -->
                                    </tr>
                                </tbody>
                            </table>
                            
                            <div class="table-footer">
                                <span>{{ displayFiles.length > 0 ? `1 - ${displayFiles.length} of ${displayFiles.length}` : '0' }} results</span>
                                <div class="pagination">
                                    <button class="page-btn">‹</button>
                                    <span>1</span>
                                    <button class="page-btn">›</button>
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
                                        <!-- <button class="btn btn-primary" @click="updateMetadata">Update</button>
                                        <button class="btn btn-secondary" @click="resetFileName">Reset</button> -->
                                    </div>
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
                                    <label>Well</label>
                                    <span class="form-value">{{ selectedWellName }}</span>
                                </div>

                                <div class="form-group">
                                    <label>Top Depth </label>
                                    <span class="form-value">
                                        <template v-if="isLoadingDepthMetadata">
                                            <div class="loading-spinner small"></div>
                                        </template>
                                        <template v-else-if="currentDepthMetadata?.topDepth !== null && currentDepthMetadata?.topDepth !== undefined">
                                            {{ currentDepthMetadata.topDepth }}
                                        </template>
                                        <template v-else>
                                            N/A
                                        </template>
                                    </span>
                                </div>

                                <div class="form-group">
                                    <label>Top Depth UoM</label>
                                    <span class="form-value">
                                        <template v-if="isLoadingDepthMetadata">
                                            <div class="loading-spinner small"></div>
                                        </template>
                                        <template v-else-if="currentDepthMetadata?.topDepthUom">
                                            {{ currentDepthMetadata.topDepthUom }}
                                        </template>
                                        <template v-else>
                                            N/A
                                        </template>
                                    </span>
                                </div>

                                <div class="form-group">
                                    <label>Base Depth</label>
                                    <span class="form-value">
                                        <template v-if="isLoadingDepthMetadata">
                                            <div class="loading-spinner small"></div>
                                        </template>
                                        <template v-else-if="currentDepthMetadata?.baseDepth !== null && currentDepthMetadata?.baseDepth !== undefined">
                                            {{ currentDepthMetadata.baseDepth }}
                                        </template>
                                        <template v-else>
                                            N/A
                                        </template>
                                    </span>
                                </div>

                                <div class="form-group">
                                    <label>Base Depth UoM</label>
                                    <span class="form-value">
                                        <template v-if="isLoadingDepthMetadata">
                                            <div class="loading-spinner small"></div>
                                        </template>
                                        <template v-else-if="currentDepthMetadata?.baseDepthUom">
                                            {{ currentDepthMetadata.baseDepthUom }}
                                        </template>
                                        <template v-else>
                                            N/A
                                        </template>
                                    </span>
                                </div>

                            </div>

                            <div v-else-if="activeTab === 'preview'" class="preview-content">
                                <div v-if="isLoadingPreview" class="loading-preview">
                                    <div class="loading-spinner"></div>
                                    <p>Loading preview...</p>
                                </div>
                                
                                <!-- LAS File Preview -->
                                <div v-else-if="lasPreviewData?.error" class="preview-error">
                                    <p>{{ lasPreviewData.error }}</p>
                                </div>
                                
                                <div v-else-if="lasPreviewData" class="preview-data">
                                    <!-- Metadata Section -->
                                    <div v-if="lasPreviewData.metadata && Object.keys(lasPreviewData.metadata).length > 0" class="preview-metadata">
                                        <h4>File Information</h4>
                                        <div class="metadata-grid">
                                            <div v-if="lasPreviewData.metadata.wellName" class="metadata-item">
                                                <label>Well Name:</label>
                                                <span>{{ lasPreviewData.metadata.wellName }}</span>
                                            </div>
                                            <div v-if="lasPreviewData.metadata.location" class="metadata-item">
                                                <label>Location:</label>
                                                <span>{{ lasPreviewData.metadata.location }}</span>
                                            </div>
                                            <div v-if="lasPreviewData.metadata.uwi" class="metadata-item">
                                                <label>UWI:</label>
                                                <span>{{ lasPreviewData.metadata.uwi }}</span>
                                            </div>
                                            <div v-if="lasPreviewData.metadata.startDepth" class="metadata-item">
                                                <label>Start Depth:</label>
                                                <span>{{ lasPreviewData.metadata.startDepth }}</span>
                                            </div>
                                            <div v-if="lasPreviewData.metadata.stopDepth" class="metadata-item">
                                                <label>Stop Depth:</label>
                                                <span>{{ lasPreviewData.metadata.stopDepth }}</span>
                                            </div>
                                            <div v-if="lasPreviewData.metadata.step" class="metadata-item">
                                                <label>Step:</label>
                                                <span>{{ lasPreviewData.metadata.step }}</span>
                                            </div>
                                            <div v-if="lasPreviewData.metadata.curveCount" class="metadata-item">
                                                <label>Curve Count:</label>
                                                <span>{{ lasPreviewData.metadata.curveCount }}</span>
                                            </div>
                                        </div>
                                        
                                        <!-- Curves List -->
                                        <div v-if="lasPreviewData.metadata.curves && lasPreviewData.metadata.curves.length > 0" class="curves-section">
                                            <h5>Available Curves</h5>
                                            <div class="curves-list">
                                                <span v-for="curve in lasPreviewData.metadata.curves" :key="curve" class="curve-tag">
                                                    {{ curve }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- ASCII Text Section -->
                                    <div class="ascii-preview">
                                        <h4>ASCII Content</h4>
                                        <div class="ascii-content">
                                            <pre>{{ lasPreviewData.asciiText }}</pre>
                                        </div>
                                    </div>
                                </div>

                                <!-- PDF File Preview -->
                                <div v-else-if="isPdfFile(selectedFile?.name) && pdfFileUrl" class="preview-data">
                                    <iframe :src="pdfFileUrl" width="100%" height="600px" style="border: none;"></iframe>
                                </div>
                                
                                <!-- DOCX File Preview -->
                                <div v-else-if="isDocxFile(selectedFile?.name) && docxHtmlContent" class="preview-data">
                                    <div v-html="docxHtmlContent" style="background:white; padding:1rem; min-height:400px;"></div>
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
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
// import { useFileStore } from '../store/fileStore';
import { useWellStore } from '../../store/wellStore';
import { useDataType } from '../../Composables/useDataType';
import { useSubDataType } from '../../Composables/useSubDataType';
import { useFileData } from '../../Composables/useFileData';
import WorkflowProgress from '../../Components/WorkflowProgress.vue';
import ExtendedFileData from '../../../schemas/ExtendedFileData';
import { 
    parseLasFileForPreview, 
    isLasFile, 
    extractLasMetadata,
    extractLasComprehensiveData,
    extractLasMetadataForDisplay,
    extractLasDepthMetadata,
    parseLasToWellioJson,
    type LasPreviewData,
    type LasMetadata,
    type LasComprehensiveData,
    type LasDepthMetadata
} from '../../../services/lasService';
import { 
    parsePdfFileForPreview, 
    isPdfFile,
    type PdfPreviewData
} from '../../../services/pdfService';
import { 
    parseDocxFileForPreview, 
    isDocxFile,
    type DocxPreviewData
} from '../../../services/docxService';
import { useUserStore } from '../../store/userStore';

const router = useRouter();
// const fileStore = useFileStore();
const wellStore = useWellStore();

// Composables
const { items: dataTypes, fetch: fetchDataTypes } = useDataType();
const { items: subDataTypes, fetch: fetchSubDataTypes } = useSubDataType();
const { 
    fileDataMap, 
    displayFiles, 
    initializeFileData, 
    updateFileData,
    removeFile 
} = useFileData({ includeLoadingFields: true });
const userStore = useUserStore();

// State
const activeTab = ref('metadata');
const selectedFile = ref<DataLoadingFileData | null>(null);
const checkedFiles = ref<Set<string>>(new Set());
const editableFileName = ref('');
const lasPreviewData = ref<LasPreviewData | null>(null);
const pdfPreviewData = ref<PdfPreviewData | null>(null);
const docxPreviewData = ref<DocxPreviewData | null>(null);
const isLoadingPreview = ref(false);

// LAS depth metadata state
const currentDepthMetadata = ref<LasDepthMetadata | null>(null);
const isLoadingDepthMetadata = ref(false);
const depthMetadataCache = ref<Map<string, LasDepthMetadata>>(new Map());

// DOCX HTML preview state
const docxHtmlContent = ref('');

// Extended interface for DataLoading-specific properties
interface DataLoadingFileData extends ExtendedFileData {
    // Depth information
    topDepth?: number;
    topDepthUoM?: string;
    baseDepth?: number;
    baseDepthUoM?: string;
    
    // Well information
    wellId?: string;
    wellName?: string;
}

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

const selectedWellName = computed(() => {
    if (!(selectedFile.value as DataLoadingFileData)?.wellId || !wellStore.data.well.length) {
        return '';
    }
    const well = wellStore.data.well.find((w: any) => w.wellId === (selectedFile.value as DataLoadingFileData)?.wellId);
    return well?.wellName || '';
});

const getFilteredSubDataTypes = (dataTypeId: string) => {
    
    const filtered = subDataTypes.value?.filter((sdt: any) => {
        return sdt.isActive && sdt.dataTypeId === dataTypeId;
    }) || [];
    
    return filtered;
};

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

const selectFile = (file: DataLoadingFileData) => {
    selectedFile.value = fileDataMap.value.get(file.id) || file;
    // Initialize editable filename with the selected file's target filename
    editableFileName.value = selectedFile.value.targetFileName || selectedFile.value.name;
    
    // Clear previous preview data
    lasPreviewData.value = null;
    pdfPreviewData.value = null;
    docxPreviewData.value = null;
    docxHtmlContent.value = ''; // Clear DOCX HTML content
    
    // Set depth metadata from cache if it's a LAS file
    if (isLasFile(selectedFile.value.name)) {
        const cached = depthMetadataCache.value.get(selectedFile.value.path || '');
        if (cached) {
            currentDepthMetadata.value = cached;
        } else {
            // If not in cache, load it
            loadDepthMetadata(selectedFile.value);
        }
    } else {
        currentDepthMetadata.value = null;
    }
    
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
    return displayFiles.value.length > 0 && displayFiles.value.every(file => checkedFiles.value.has(file.id));
});

// Computed property to check if some (but not all) files are selected
const someFilesChecked = computed(() => {
    return checkedFiles.value.size > 0 && !allFilesChecked.value;
});

// Method to toggle all checkboxes
const toggleAllFiles = (event: Event) => {
    const target = event.target as HTMLInputElement;
    
    if (target.checked) {
        // Check all files
        displayFiles.value.forEach(file => {
            checkedFiles.value.add(file.id);
        });
    } else {
        // Uncheck all files
        checkedFiles.value.clear();
    }
};

const proceedToQualityCheck = () => {
    // First, save any pending changes to the currently selected file
    if (selectedFile.value && editableFileName.value !== selectedFile.value.targetFileName) {
        updateMetadata();
    }
    
    // Prepare metadata from all files in fileDataMap with the most current values
    const metadatas = Array.from(fileDataMap.value.values()).map(file => {
        const loadingFile = file as DataLoadingFileData;
        return {
            editedBy: loadingFile.editedBy,
            createdBy: loadingFile.createdBy,
            createdFor: loadingFile.createdFor,
            createdDate: loadingFile.createdDate,
            fileFormat: loadingFile.fileFormat,
            dataTypeId: loadingFile.selectedDataTypeId, // From Category dropdown (lines 80-94)
            subDataTypeId: loadingFile.selectedSubDataTypeId, // From Sub Category dropdown (lines 80-94)
            dataTypeName: getDataTypeName(loadingFile.selectedDataTypeId || ''),
            subDataTypeName: getSubDataTypeName(loadingFile.selectedSubDataTypeId || ''),
            topDepth: loadingFile.topDepth,
            topDepthUoM: loadingFile.topDepthUoM,
            baseDepth: loadingFile.baseDepth,
            baseDepthUoM: loadingFile.baseDepthUoM,
            wellId: loadingFile.wellId,
        };
    });

    // console.log('[DataLoading] Proceeding to quality check...');
    // console.log('[DataLoading] Metadatas:', metadatas);

    // console.log("Array.from(fileDataMap.value.values()); ", Array.from(fileDataMap.value.values()));

    // return;
    
    // Update the well store with metadata
    wellStore.setMetadatas(metadatas);
    
    // Advance workflow to quality-check stage and mark loading as completed
    wellStore.advanceWorkflow('quality-check', 'loading');
    
    router.push('/well/data-qc');
};

// Method to handle data type selection change
const onDataTypeChange = (file: DataLoadingFileData, dataTypeId: string) => {
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
const onSubDataTypeChange = (file: DataLoadingFileData, subDataTypeId: string) => {
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

    // console.log('[DataLoading] Well data:', wellStore.data);
    console.log('[DataLoading] Well data:', wellStore.data.well);
    // Initialize file data
    initializeFileData();
    
    // Fetch data types and sub data types
    try {
        await fetchDataTypes();
        
        await fetchSubDataTypes();
    } catch (error) {
        console.error('[DataLoading] Error fetching data:', error);
    }
    
    // Load depth metadata for all LAS files
    const allFiles = Array.from(fileDataMap.value.values());
    const lasFiles = allFiles.filter(file => isLasFile(file.name));
    
    // Load depth metadata for all LAS files in parallel
    await Promise.all(lasFiles.map(file => loadDepthMetadata(file)));
    
    // Auto-select first file
    if (displayFiles.value.length > 0) {
        selectedFile.value = displayFiles.value[0];
        // Initialize editable filename
        editableFileName.value = selectedFile.value.targetFileName || selectedFile.value.name;
        
        // Depth metadata already loaded above, just set current metadata if it's a LAS file
        if (isLasFile(selectedFile.value.name)) {
            const cached = depthMetadataCache.value.get(selectedFile.value.path || '');
            if (cached) {
                currentDepthMetadata.value = cached;
            }
        }
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

// Method to load LAS depth metadata
const loadDepthMetadata = async (file: DataLoadingFileData) => {
    if (!file.path || !isLasFile(file.name)) {
        currentDepthMetadata.value = null;
        return;
    }

    // Check cache first
    const cached = depthMetadataCache.value.get(file.path);
    if (cached) {
        currentDepthMetadata.value = cached;
        // Update file data with cached metadata
        updateFileWithDepthMetadata(file, cached);
        return;
    }

    isLoadingDepthMetadata.value = true;
    
    try {
        const result = await extractLasDepthMetadata(file.path);
        
        if (result.success && result.depthData) {
            currentDepthMetadata.value = result.depthData;
            // Cache the result
            depthMetadataCache.value.set(file.path, result.depthData);
            // Update file data with extracted metadata
            updateFileWithDepthMetadata(file, result.depthData);
        } else {
            console.error('[DataLoading] Failed to extract depth metadata:', result.error);
            currentDepthMetadata.value = null;
        }
    } catch (error) {
        console.error('[DataLoading] Error loading depth metadata:', error);
        currentDepthMetadata.value = null;
    } finally {
        isLoadingDepthMetadata.value = false;
    }
};

// Helper function to update file data with depth metadata
const updateFileWithDepthMetadata = (file: DataLoadingFileData, depthData: LasDepthMetadata) => {
    updateFileData(file.id, {
        topDepth: depthData.topDepth ?? 0,
        topDepthUoM: depthData.topDepthUom || '',
        baseDepth: depthData.baseDepth ?? 0,
        baseDepthUoM: depthData.baseDepthUom || '',
    } as Partial<DataLoadingFileData>);
    
    // Update selected file if it's the current one
    if (selectedFile.value?.id === file.id) {
        selectedFile.value = fileDataMap.value.get(file.id) || null;
    }
};

// Method to load file preview
const loadFilePreview = async () => {
    if (!selectedFile.value) return;
    
    isLoadingPreview.value = true;
    
    // Clear all preview data
    lasPreviewData.value = null;
    pdfPreviewData.value = null;
    docxPreviewData.value = null;
    docxHtmlContent.value = ''; // Clear DOCX HTML content
    
    try {
        const filePath = selectedFile.value.path;
        if (!filePath) {
            throw new Error('File path not available');
        }

        if (isLasFile(selectedFile.value.name)) {
            // For .las files, use the LAS preview service
            lasPreviewData.value = await parseLasFileForPreview(filePath);
        } else if (isPdfFile(selectedFile.value.name)) {
            // For .pdf files, use the PDF preview service
            pdfPreviewData.value = await parsePdfFileForPreview(filePath);
        } else if (isDocxFile(selectedFile.value.name)) {
            // For .docx files, use the DOCX preview service
            docxPreviewData.value = await parseDocxFileForPreview(filePath);
        } else {
            // For other file types, show a placeholder
            console.log(`Preview not available for ${selectedFile.value.name}. File type: ${getFileExtension(selectedFile.value.name).toUpperCase()}`);
        }
    } catch (error) {
        console.error('[DataLoading] Error loading file preview:', error);
        const errorMessage = `Error loading preview: ${error instanceof Error ? error.message : 'Unknown error'}`;
        
        // Set error on the appropriate preview data based on file type
        if (isLasFile(selectedFile.value.name)) {
            lasPreviewData.value = {
                asciiText: '',
                metadata: {},
                error: errorMessage
            };
        } else if (isPdfFile(selectedFile.value.name)) {
            pdfPreviewData.value = {
                textContent: '',
                metadata: {},
                error: errorMessage
            };
        } else if (isDocxFile(selectedFile.value.name)) {
            docxPreviewData.value = {
                textContent: '',
                metadata: {},
                error: errorMessage
            };
        }
    } finally {
        isLoadingPreview.value = false;
    }
};

// Watch for tab changes to load preview when needed
watch(activeTab, async (newTab) => {
    if (newTab === 'preview' && selectedFile.value && !lasPreviewData.value && !pdfPreviewData.value && !docxPreviewData.value) {
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

// New computed property to check if all files have category, sub-category, and well selected
const canProceedToQualityCheck = computed(() => {
    return displayFiles.value.every(file => {
        const loadingFile = file as DataLoadingFileData;
        return loadingFile.selectedDataTypeId && loadingFile.selectedDataTypeId !== '' && 
               loadingFile.selectedSubDataTypeId && loadingFile.selectedSubDataTypeId !== '' && 
               loadingFile.wellId && loadingFile.wellId !== '';
    });
});

const pdfFileUrl = computed(() => {
    if (selectedFile.value && isPdfFile(selectedFile.value.name) && selectedFile.value.path) {
        return `file://${selectedFile.value.path}`;
    }
    return '';
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

/* Text Preview Styles */
.text-preview {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
}

.text-preview h4 {
    margin: 0;
    padding: 0.75rem 1rem;
    background: #f3f4f6;
    border-bottom: 1px solid #e5e7eb;
    color: #1f2937;
    font-size: 1rem;
    font-weight: 600;
}

.text-content {
    max-height: 400px;
    overflow-y: auto;
    background: #ffffff;
}

.text-content pre {
    margin: 0;
    padding: 1rem;
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
    line-height: 1.4;
    color: #374151;
    white-space: pre-wrap;
    overflow-x: auto;
    word-wrap: break-word;
}
</style>


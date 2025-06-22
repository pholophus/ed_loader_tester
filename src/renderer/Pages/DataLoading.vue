<template>
    <div class="data-loading-content">
        <!-- Header -->
        <header class="page-header">
            <div class="header-nav">
                <router-link to="/data-preparation" class="back-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Back to Preparation
                </router-link>
                <div class="header-actions">
                    <button class="btn btn-primary" @click="proceedToQualityCheck">
                        Proceed to Quality Check
                    </button>
                </div>
            </div>
            <div class="header-title">
                <h1>Data Loading</h1>
                <p>Loading your dataset files into the system</p>
            </div>
            
            <!-- Workflow Progress -->
            <WorkflowProgress 
                :current-stage="'loading'"
                :completed-stages="['preparation']"
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
                                        @click="selectFile(file)">
                                        <td><input type="checkbox" :checked="isFileChecked(file.id)" @click="toggleFileCheck(file.id, $event)" /></td>
                                        <td class="file-name">{{ file.name }}</td>
                                        <td>{{ formatFileSize(file.size) }}</td>
                                        <td>
                                            <select class="entity-select" v-model="file.selectedDataTypeId" @change="onDataTypeChange(file, file.selectedDataTypeId)">
                                                <option value="">Select Category</option>
                                                <option v-for="dataType in activeDataTypes" :key="dataType._id" :value="dataType._id">
                                                    {{ dataType.name }}
                                                </option>
                                            </select>
                                        </td>
                                        <td>
                                            <select class="entity-select" v-model="file.selectedSubDataTypeId" :disabled="!file.selectedDataTypeId" @change="onSubDataTypeChange(file, file.selectedSubDataTypeId)">
                                                <option value="">Select Sub Category</option>
                                                <option v-for="subDataType in getFilteredSubDataTypes(file.selectedDataTypeId)" :key="subDataType._id" :value="subDataType._id">
                                                    {{ subDataType.name }}
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

                                <!-- <div class="form-group">
                                    <label>Borehole Name</label>
                                    <span class="form-value">{{ selectedFile.boreholeName }}</span>
                                </div>

                                <div class="form-group">
                                    <label>Field Name</label>
                                    <span class="form-value">{{ selectedFile.fieldName }}</span>
                                </div> -->

                                <!-- <div class="form-group">
                                    <label>Target ONLINE Project</label>
                                    <div class="select-with-icon">
                                        <select class="form-select">
                                            <option :selected="selectedFile.targetProject === 'CORPORATE'">CORPORATE</option>
                                        </select>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="select-icon">
                                            <path d="M12 2L12 22M2 12L22 12" stroke="currentColor" stroke-width="2"/>
                                        </svg>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>Number of Logs</label>
                                    <span class="form-value">{{ selectedFile.numberOfLogs }}</span>
                                </div>

                                <div class="form-group">
                                    <label>Contractor</label>
                                    <div class="select-with-icon">
                                        <select class="form-select">
                                            <option>Select...</option>
                                        </select>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="select-icon">
                                            <path d="M12 2L12 22M2 12L22 12" stroke="currentColor" stroke-width="2"/>
                                        </svg>
                                    </div>
                                </div> -->
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
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useFileStore } from '../store/fileStore';
import { useDataType } from '../Composables/useDataType';
import { useSubDataType } from '../Composables/useSubDataType';
import WorkflowProgress from '../Components/WorkflowProgress.vue';
import { parseLasFileForPreview, isLasFile, type LasPreviewData } from '../../services/lasPreviewService';

// Types - Extended FileData to include additional properties for the loading view
interface ExtendedFileData {
    id: string;
    name: string;
    size: number;
    progress: number;
    path?: string;
    // Additional properties for loading view
    targetEntity: string;
    selectedDataTypeId: string;
    selectedSubDataTypeId: string;
    preparation: string;
    loadingStatus: string;
    qualityCheck: string;
    publication: string;
    editedBy: string;
    createdBy: string;
    targetFileName: string;
    fileFormat: string;
    status: string;
    boreholeName: string;
    fieldName: string;
    targetProject: string;
    numberOfLogs: string;
}

const router = useRouter();
const fileStore = useFileStore();

// Composables
const { items: dataTypes, fetch: fetchDataTypes } = useDataType();
const { items: subDataTypes, fetch: fetchSubDataTypes } = useSubDataType();

// State
const activeTab = ref('metadata');
const selectedFile = ref<ExtendedFileData | null>(null);
const fileDataMap = ref<Map<string, ExtendedFileData>>(new Map());
const checkedFiles = ref<Set<string>>(new Set());
const editableFileName = ref('');
const previewData = ref<LasPreviewData | null>(null);
const isLoadingPreview = ref(false);

// Initialize file data from store
const initializeFileData = () => {
    const newMap = new Map<string, ExtendedFileData>();
    fileStore.getSelectedFiles.forEach((file, index) => {
        newMap.set(file.id, {
            ...file,
            // Add default values for properties not in the store
            targetEntity: getFileExtension(file.name) === 'las' ? 'LOG' : 'BOREHOLE_FILE',
            selectedDataTypeId: '',
            selectedSubDataTypeId: '',
            // loadingStatus: file.progress >= 100 ? 'completed' : file.progress > 0 ? 'loading' : 'pending',
            editedBy: '',
            createdBy: '',
            targetFileName: file.name,
            fileFormat: getFileExtension(file.name).toUpperCase(),
            // status: file.progress >= 100 ? 'COMPLETED' : 'PENDING',
            // boreholeName: '15_5-F-11B',
            // fieldName: 'VOLVE',
            // targetProject: 'CORPORATE',
            // numberOfLogs: getFileExtension(file.name) === 'las' ? '1' : '0'
        } as ExtendedFileData);
    });
    fileDataMap.value = newMap;
    console.log('[DataLoading] File data map:', fileDataMap.value);
};

// Computed properties
const displayFiles = computed(() => {
    return Array.from(fileDataMap.value.values());
});

// Computed properties for filtered data
const activeDataTypes = computed(() => {
    console.log('[DataLoading] Computing active data types...');
    console.log('[DataLoading] dataTypes.value:', dataTypes.value);
    
    if (!dataTypes.value) {
        console.log('[DataLoading] dataTypes.value is null/undefined');
        return [];
    }
    
    const filtered = dataTypes.value.filter((dt: any) => {
        console.log('[DataLoading] Checking data type:', dt.name, 'isActive:', dt.isActive, 'type:', typeof dt.isActive);
        return dt.isActive;
    });
    
    console.log('[DataLoading] Filtered active data types:', filtered);
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

const getFilteredSubDataTypes = (dataTypeId: string) => {
    console.log('[DataLoading] Filtering sub data types for dataTypeId:', dataTypeId);
    console.log('[DataLoading] Available sub data types:', subDataTypes.value);
    
    const filtered = subDataTypes.value?.filter((sdt: any) => {
        console.log('[DataLoading] Checking sub data type:', sdt.name, 'isActive:', sdt.isActive, 'dataTypeId:', sdt.dataTypeId, 'matches:', sdt.dataTypeId === dataTypeId);
        return sdt.isActive && sdt.dataTypeId === dataTypeId;
    }) || [];
    
    console.log('[DataLoading] Filtered sub data types:', filtered);
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
    router.push('/data-qc');
};

// Method to handle data type selection change
const onDataTypeChange = (file: ExtendedFileData, dataTypeId: string) => {
    const fileData = fileDataMap.value.get(file.id);
    if (fileData) {
        fileData.selectedDataTypeId = dataTypeId;
        fileData.selectedSubDataTypeId = ''; // Reset sub data type when main data type changes
        
        // Update the map to trigger reactivity
        fileDataMap.value.set(file.id, { ...fileData });
        
        // Update selected file if it's the current one
        if (selectedFile.value?.id === file.id) {
            selectedFile.value = fileDataMap.value.get(file.id) || null;
        }
    }
};

// Method to handle sub data type selection change
const onSubDataTypeChange = (file: ExtendedFileData, subDataTypeId: string) => {
    const fileData = fileDataMap.value.get(file.id);
    if (fileData) {
        fileData.selectedSubDataTypeId = subDataTypeId;
        
        // Update the map to trigger reactivity
        fileDataMap.value.set(file.id, { ...fileData });
        
        // Update selected file if it's the current one
        if (selectedFile.value?.id === file.id) {
            selectedFile.value = fileDataMap.value.get(file.id) || null;
        }
    }
};

// Method to remove the selected file
const removeSelectedFile = () => {
    if (checkedFiles.value.size === 0) return;
    
    // Remove all checked files
    checkedFiles.value.forEach(fileId => {
        // Remove from file store
        fileStore.removeSelectedFile(fileId);
        
        // Remove from local file data map
        fileDataMap.value.delete(fileId);
        
        // Clear selected file if it was one of the removed files
        if (selectedFile.value?.id === fileId) {
            selectedFile.value = null;
        }
    });
    
    // Clear checked files set
    checkedFiles.value.clear();
    
    // Auto-select the first remaining file if no file is currently selected
    if (!selectedFile.value) {
        const remainingFiles = Array.from(fileDataMap.value.values());
        if (remainingFiles.length > 0) {
            selectedFile.value = remainingFiles[0];
        }
    }
};

// Test function to check MongoDB connection and data
// const testMongoConnection = async () => {
//     try {
//         console.log('[DataLoading] Testing direct MongoDB connection...');
        
//         // Test direct mongoAPI call
//         // @ts-ignore
//         const directDataTypes = await window.mongoAPI.find('datatype', {});
//         console.log('[DataLoading] Direct datatype query result:', directDataTypes);
        
//         // @ts-ignore
//         const directSubDataTypes = await window.mongoAPI.find('subdatatype', {});
//         console.log('[DataLoading] Direct subdatatype query result:', directSubDataTypes);
        
//         // Check if collections exist by querying without filters
//         // @ts-ignore
//         const allDataTypes = await window.mongoAPI.find('datatype');
//         console.log('[DataLoading] All datatypes (no filter):', allDataTypes);
        
//     } catch (error) {
//         console.error('[DataLoading] MongoDB test error:', error);
//     }
// };

// Lifecycle
onMounted(async () => {
    // Initialize file data
    initializeFileData();
    
    // Fetch data types and sub data types
    try {
        // console.log('[DataLoading] Fetching data types...');
        await fetchDataTypes();
        // console.log('[DataLoading] Data types fetched:', dataTypes.value);
        // console.log('[DataLoading] Data types count:', dataTypes.value?.length);
        
        // Log first few data types to see their structure
        // if (dataTypes.value && dataTypes.value.length > 0) {
        //     console.log('[DataLoading] First data type structure:', dataTypes.value[0]);
        //     console.log('[DataLoading] First data type isActive:', dataTypes.value[0].isActive);
        //     console.log('[DataLoading] First data type isActive type:', typeof dataTypes.value[0].isActive);
        // }
        
        // console.log('[DataLoading] Fetching sub data types...');
        await fetchSubDataTypes();
        // console.log('[DataLoading] Sub data types fetched:', subDataTypes.value);
        // console.log('[DataLoading] Sub data types count:', subDataTypes.value?.length);
        
        // Log first few sub data types to see their structure
        // if (subDataTypes.value && subDataTypes.value.length > 0) {
        //     console.log('[DataLoading] First sub data type structure:', subDataTypes.value[0]);
        //     console.log('[DataLoading] First sub data type isActive:', subDataTypes.value[0].isActive);
        //     console.log('[DataLoading] First sub data type dataTypeId:', subDataTypes.value[0].dataTypeId);
        // }
        
        // console.log('[DataLoading] Active data types:', activeDataTypes.value);
        // console.log('[DataLoading] Active data types count:', activeDataTypes.value?.length);
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
        // Update target file name
        selectedFile.value.targetFileName = editableFileName.value;
        
        // Update the file data map to persist all changes (including category and subcategory)
        fileDataMap.value.set(selectedFile.value.id, { ...selectedFile.value });
        
        // console.log('Updated file data:', selectedFile.value);
    }
};

const resetFileName = () => {
    if (selectedFile.value) {
        editableFileName.value = selectedFile.value.targetFileName;
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
}

.components-table {
    width: 100%;
    font-size: 0.75rem;
    border-collapse: collapse;
}

.components-table th {
    background: #f9fafb;
    padding: 0.5rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.75rem;
}

.components-table td {
    padding: 0.5rem;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.75rem;
}

.components-table tr:hover {
    background: #f8fafc;
}

.components-table tr.selected {
    background: #dbeafe;
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
    padding: 0.25rem;
    border: 1px solid #d1d5db;
    border-radius: 3px;
    font-size: 0.75rem;
    width: 80px;
}

.status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
}

.status-icon.completed {
    color: #22c55e;
}

.table-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-top: 1px solid #e5e7eb;
    font-size: 0.875rem;
    color: #6b7280;
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
</style>


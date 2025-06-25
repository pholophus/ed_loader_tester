<template>
    <div class="data-qc-content">
        <!-- Header -->
        <header class="page-header">
            <div class="header-nav">
                <router-link to="/data-loading" class="back-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                    Back
                </router-link>
                <div class="header-actions">
                    <button v-if="wellStore.data.currentStage !== 'publication'" class="btn btn-primary" @click="proceedToQualityCheck"
                        >
                        Quality Check
                    </button>
                    <button v-if="wellStore.data.currentStage == 'publication' && wellStore.data.approval.isApproved" class="btn btn-primary" @click="proceedToPublish">
                        Publish
                    </button>
                </div>
            </div>
            <div class="header-info">
                <div class="dataset-title">
                    <h1>{{ datasetName || 'OSDU_Demo' }}</h1>
                    <div class="dataset-meta">
                        <span class="company">Company: - </span>
                        <span class="created-by">Created By: - </span>
                        <span class="uploaded">Uploaded: {{ uploadedDate }}</span>
                        <span class="size">Size: {{ totalWellFileSize }}</span>
                    </div>
                </div>
            </div>

            <!-- Workflow Progress -->
            <WorkflowProgress :current-stage="wellStore.data.currentStage" :completed-stages="wellStore.data.completedStages" />

            <!-- Approval Notice -->
            <div v-if="settingsStore.options.publishAuto == false && wellStore.data.currentStage == 'approval'" class="approval-notice">
                <div class="approval-content">
                    <span class="approval-text">Publication of this dataset requires your approval</span>
                    <div class="approval-actions">
                        <button class="btn btn-approve" @click="showApprovalModal">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Approve Dataset
                        </button>
                        <button class="btn btn-reject" @click="rejectDataset">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Reject Dataset
                        </button>
                    </div>
                </div>
            </div>

            
        </header>

        <main class="qc-main">
            <div class="qc-grid">
                <!-- Components Panel -->
                <div class="components-panel">
                    <div class="panel-card">
                        <div class="panel-header">
                            <h2>Components</h2>
                            <button class="expand-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        </div>

                        <!-- Tabs -->
                        <div class="tabs">
                            <button class="tab" :class="{ active: activeTab === 'dataset' }"
                                @click="activeTab = 'dataset'">
                                Dataset
                            </button>
                            <button class="tab" :class="{ active: activeTab === 'files' }" @click="activeTab = 'files'">
                                Files ({{ selectedWellId ? wellStore.getWellFileCount(selectedWellId) : files.length }})
                            </button>
                            <!-- <button class="tab" :class="{ active: activeTab === 'logs' }" @click="activeTab = 'logs'">
                                Logs ({{ logs.length }})
                            </button>
                            <button class="tab" :class="{ active: activeTab === 'curves' }"
                                @click="activeTab = 'curves'">
                                Curves ({{ curves.length }})
                            </button> -->
                        </div>

                        <!-- Dataset Tab Content -->
                        <div v-if="activeTab === 'dataset'" class="tab-content">
                            <div class="dataset-info">
                                <!-- Wells List -->
                                <div class="info-section">
                                    <!-- <h3>Wells ({{ wellStore.data.well.length }})</h3> -->
                                    <div v-if="wellStore.data.well.length === 0" class="no-wells">
                                        No wells available
                                    </div>
                                    <div v-else class="wells-table-container">
                                        <table class="wells-table">
                                            <thead>
                                                <tr>
                                                    <th>Well Name</th>
                                                    <th>Well ID</th>
                                                    <th>UWI</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="well in wellStore.data.well" 
                                                    :key="well.wellId"
                                                    :class="{ 'selected-well': selectedWellId === well.wellId }"
                                                    @click="selectWell(well.wellId)">
                                                    <td class="well-name">{{ well.wellName }}</td>
                                                    <td class="well-id-cell">{{ well.wellId }}</td>
                                                    <td class="well-uwi">{{ well.UWI || 'N/A' }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div class="wells-count">
                                            {{ wellStore.data.well.length }} well{{ wellStore.data.well.length !== 1 ? 's' : '' }}
                                            <span v-if="selectedWellId" class="selected-well-indicator">
                                                • {{ getSelectedWellName() }} selected
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- File Info -->
                                <div class="info-row">
                                    <label>Total File Size:</label>
                                    <span>{{ totalWellFileSize }}</span>
                                </div>
                            </div>

                            <!-- Status Summary -->
                            <!-- <div class="status-summary">
                                <div class="status-item">
                                    <div class="status-number">{{ statusCounts.logs }}</div>
                                    <div class="status-label">Logs</div>
                                </div>
                                <div class="status-item">
                                    <div class="status-number">{{ statusCounts.logFiles }}</div>
                                    <div class="status-label">Log Files</div>
                                </div>
                                <div class="status-item">
                                    <div class="status-number">{{ statusCounts.wellFiles }}</div>
                                    <div class="status-label">Well Files</div>
                                </div>
                                <div class="status-item">
                                    <div class="status-number">{{ statusCounts.boreholeFiles }}</div>
                                    <div class="status-label">Borehole Files</div>
                                </div>
                            </div> -->
                        </div>

                        <!-- Files Tab Content -->
                        <div v-if="activeTab === 'files'" class="tab-content">
                            <div v-if="!selectedWellId" class="no-well-selected">
                                <div class="no-well-message">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" class="no-well-icon">
                                        <path d="M9 12L11 14L15 10" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <circle cx="12" cy="12" r="10" stroke="#9ca3af" stroke-width="2" fill="none"/>
                                    </svg>
                                    <h3>Select a Well</h3>
                                    <p>Please select a well from the Dataset tab to view its files.</p>
                                </div>
                            </div>
                            
                            <div v-else>
                                <div class="files-actions">
                                    <button class="btn btn-outline btn-sm" @click="removeSelectedFiles" 
                                            :disabled="checkedFiles.size === 0">
                                        Remove{{ checkedFiles.size > 0 ? ` (${checkedFiles.size})` : '' }}
                                    </button>
                                </div>

                                <div class="table-container">
                                    <table class="components-table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <input type="checkbox" 
                                                           :checked="allFilesChecked" 
                                                           :indeterminate="someFilesChecked"
                                                           @change="toggleAllFiles" />
                                                </th>
                                                <th>File Name</th>
                                                <th>Size</th>
                                                <th>Category</th>
                                                <th>Sub Category</th>
                                                <th>Well</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(file, index) in files" :key="file.id" class="table-row"
                                                @click="selectRow(index)"
                                                
                                            >
                                                <td>
                                                    <input type="checkbox" 
                                                           :checked="isFileChecked(file.id)" 
                                                           @click="toggleFileCheck(file.id, $event)" />
                                                </td>
                                                <td class="file-name">{{ file.name }}</td>
                                                <td>{{ formatFileSize(file.size) }}</td>
                                                <td>
                                                    <select class="entity-select" 
                                                            v-model="file.selectedDataTypeId" 
                                                            @change="onDataTypeChange(file, file.selectedDataTypeId || '')"
                                                            @click.stop>
                                                        <option value="">Select Category</option>
                                                        <option v-for="dataType in activeDataTypes" 
                                                                :key="dataType._id" 
                                                                :value="dataType._id">
                                                            {{ dataType.name }}
                                                        </option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <select class="entity-select" 
                                                            v-model="file.selectedSubDataTypeId" 
                                                            :disabled="!file.selectedDataTypeId" 
                                                            @change="onSubDataTypeChange(file, file.selectedSubDataTypeId || '')"
                                                            @click.stop>
                                                        <option value="">Select Sub Category</option>
                                                        <option v-for="subDataType in getFilteredSubDataTypes(file.selectedDataTypeId || '')" 
                                                                :key="subDataType._id" 
                                                                :value="subDataType._id">
                                                            {{ subDataType.name }}
                                                        </option>
                                                    </select>
                                                </td>
                                                <td>{{ file.wellId }}</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div class="table-footer">
                                        <span>{{ files.length > 0 ? `1 - ${files.length} of ${files.length}` : '0' }} results</span>
                                        <div class="pagination">
                                            <button class="page-btn">‹</button>
                                            <span>1</span>
                                            <button class="page-btn">›</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>



                        <!-- Process Status -->
                        <!-- <div class="process-status">
                            <div class="process-stage"
                                :class="{ active: currentStage === 'preparation', completed: stageCompleted('preparation') }">
                                <div class="stage-icon">
                                    <svg v-if="stageCompleted('preparation')" width="32" height="32" viewBox="0 0 24 24"
                                        fill="none">
                                        <circle cx="12" cy="12" r="10" fill="#22c55e" />
                                        <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                                <div class="stage-label">
                                    <h3>Preparation</h3>
                                    <p>100%</p>
                                </div>
                            </div>

                            <div class="process-stage"
                                :class="{ active: currentStage === 'loading', completed: stageCompleted('loading') }">
                                <div class="stage-icon">
                                    <div v-if="currentStage === 'loading'" class="loading-circle">
                                        <div class="spinner"></div>
                                    </div>
                                    <svg v-else-if="stageCompleted('loading')" width="32" height="32"
                                        viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" fill="#22c55e" />
                                        <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                                <div class="stage-label">
                                    <h3>Loading</h3>
                                    <p>{{ currentStage === 'loading' ? 'Pending...' : '100%' }}</p>
                                </div>
                            </div>

                            <div class="process-stage">
                                <div class="stage-icon"></div>
                                <div class="stage-label">
                                    <h3>Quality Check</h3>
                                    <p></p>
                                </div>
                            </div>

                            <div class="process-stage">
                                <div class="stage-icon"></div>
                                <div class="stage-label">
                                    <h3>Approval</h3>
                                    <p></p>
                                </div>
                            </div>

                            <div class="process-stage">
                                <div class="stage-icon"></div>
                                <div class="stage-label">
                                    <h3>Publication</h3>
                                    <p></p>
                                </div>
                            </div>
                        </div> -->
                    </div>
                </div>

                <!-- Details Panel -->
                <DatasetDetails v-if="activeTab === 'dataset'"/>
                <FilesDetails v-if="activeTab === 'files' && selectedRowIndex !== null" :selected-row-index="selectedRowIndex"/>
            </div>
        </main>

        <!-- Approval Modal -->
        <div v-if="showApprovalModalDialog" class="modal-overlay" @click.self="closeApprovalModal">
            <div class="modal-container">
                <div class="modal-header">
                    <h3>Approval Comments</h3>
                    <button class="modal-close" @click="closeApprovalModal">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <label for="approval-comments" class="modal-label">Approval comments (optional)</label>
                    <textarea 
                        id="approval-comments"
                        v-model="approvalComments"
                        class="modal-textarea"
                        placeholder="Enter your approval comments here..."
                        rows="4"
                    ></textarea>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" @click="closeApprovalModal">
                        Cancel
                    </button>
                    <button class="btn btn-approve" @click="approveDataset">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Approve
                    </button>
                </div>
            </div>
        </div>

        <!-- Success Modal -->
        <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeSuccessModal">
            <div class="success-modal-container">
                <div class="success-modal-content">
                    <div class="success-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="#22c55e"/>
                            <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h3 class="success-title">Dataset Approved</h3>
                    <button class="btn btn-primary success-btn" @click="closeSuccessModal">
                        Done
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DatasetDetails from './DataQC/DatasetDetails.vue';
import FilesDetails from './DataQC/FilesDetails.vue';
import WorkflowProgress from '../Components/WorkflowProgress.vue';
import { useWellStore, ValidationResult } from '../store/wellStore';
import { useSettingsStore } from '../store/settingsStore';
import { useDataType } from '../Composables/useDataType';
import { useSubDataType } from '../Composables/useSubDataType';
import { useFileData } from '../Composables/useFileData';
import { lasSchema } from '../../schemas/qc/las';
import ExtendedFileData from '../../schemas/ExtendedFileData';

const route = useRoute();
const router = useRouter();
const wellStore = useWellStore();
const settingsStore = useSettingsStore();

// Composables
const { items: dataTypes, fetch: fetchDataTypes } = useDataType();
const { items: subDataTypes, fetch: fetchSubDataTypes } = useSubDataType();
const { 
    fileDataMap, 
    initializeFileData, 
    getFilesByWellId,
    updateFileData,
    removeFile 
} = useFileData({ includeQCFields: true, defaultQualityStatus: 'success' });

// Data from route or default values
const datasetName = ref(route.query.datasetName as string || 'OSDU_Demo');
// const datasetId = ref(route.query.datasetId as string || '1051');
// const company = ref(route.query.company as string || 'BAKER HUGHES');
// const createdBy = ref(route.query.createdBy as string || 'recall_controller');
const uploadedDate = ref(route.query.uploadedDate as string || new Date().toISOString().slice(0, 19).replace('T', ' '));
// const totalSize = ref(route.query.totalSize as string || '6.3 MB');
// const description = ref(route.query.description as string || '');
// const dataSource = ref(route.query.dataSource as string || 'BAKER HUGHES');

// Additional metadata fields
// const region = ref('');
// const createdDate = ref('2021-03-11 10:57:20');
// const loadedDate = ref('2021-03-11 10:57:20');
// const loadedBy = ref('recall_controller');
// const approvedStatus = ref('NotRequired');
// const lastUpdated = ref('2021-03-11 10:57:20');
// const lastUpdatedBy = ref('recall_controller');

// Tab management
const activeTab = ref('dataset');

// Modal management
const showApprovalModalDialog = ref(false);
const approvalComments = ref('');
const showSuccessModal = ref(false);

// File management
const checkedFiles = ref<Set<string>>(new Set());
const selectAllFiles = ref(false);
const selectedRowIndex = ref<number | null>(null);
// Store validation results for each file
// const validationResults = ref<Map<string, ValidationResult>>(new Map());
// const selectedFile = ref<ExtendedFileData | null>(null);

// Well selection management
const selectedWellId = ref<string | null>(null);

// Computed properties
const files = computed(() => {
    // If a well is selected, filter files by wellId
    if (selectedWellId.value) {
        return getFilesByWellId(selectedWellId.value);
    }
    
    // Otherwise return all files
    return Array.from(fileDataMap.value.values());
});

// Computed properties for filtered data
const activeDataTypes = computed(() => {
    if (!dataTypes.value) {
        return [];
    }
    
    const filtered = dataTypes.value.filter((dt: any) => {
        return dt.isActive;
    });
    
    return filtered;
});

const getFilteredSubDataTypes = (dataTypeId: string) => {
    const filtered = subDataTypes.value?.filter((sdt: any) => {
        return sdt.isActive && sdt.dataTypeId === dataTypeId;
    }) || [];
    
    return filtered;
};

// Computed properties for checkbox management
const allFilesChecked = computed(() => {
    return files.value.length > 0 && files.value.every(file => checkedFiles.value.has(file.id));
});

const someFilesChecked = computed(() => {
    return checkedFiles.value.size > 0 && !allFilesChecked.value;
});

// const logs = ref([]);
// const curves = ref(Array(14).fill(null));

// const statusCounts = computed(() => ({
//     logs: 1,
//     logFiles: 2,
//     wellFiles: 0,
//     boreholeFiles: 1
// }));

// Calculate total file size from well store
const totalWellFileSize = computed(() => {
    const totalBytes = wellStore.data.wellMetadatas.reduce((total, metadata) => {
        return total + (metadata.size || 0);
    }, 0);

    // Convert bytes to human readable format
    if (totalBytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(totalBytes) / Math.log(k));
    return parseFloat((totalBytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
});

// Utility Methods
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

// File Management Methods
const selectRow = (index: number) => {
    selectedRowIndex.value = index;
};

const toggleFileCheck = (fileId: string, event: Event) => {
    event.stopPropagation(); // Prevent row selection when clicking checkbox
    
    if (checkedFiles.value.has(fileId)) {
        checkedFiles.value.delete(fileId);
    } else {
        checkedFiles.value.add(fileId);
    }
    
    updateSelectAllState();
};

const isFileChecked = (fileId: string) => {
    return checkedFiles.value.has(fileId);
};

const toggleAllFiles = (event: Event) => {
    const target = event.target as HTMLInputElement;
    
    if (target.checked) {
        files.value.forEach(file => {
            checkedFiles.value.add(file.id);
        });
    } else {
        checkedFiles.value.clear();
    }
    
    selectAllFiles.value = target.checked;
};

const updateSelectAllState = () => {
    if (files.value.length === 0) {
        selectAllFiles.value = false;
    } else if (checkedFiles.value.size === files.value.length) {
        selectAllFiles.value = true;
    } else {
        selectAllFiles.value = false;
    }
};

const removeSelectedFiles = () => {
    if (checkedFiles.value.size === 0) return;
    
    checkedFiles.value.forEach(fileId => {
        removeFile(fileId);
    });
    
    checkedFiles.value.clear();
    selectAllFiles.value = false;
};

const onDataTypeChange = (file: ExtendedFileData, dataTypeId: string) => {
    updateFileData(file.id, {
        selectedDataTypeId: dataTypeId,
        selectedSubDataTypeId: '',
    });
};

const onSubDataTypeChange = (file: ExtendedFileData, subDataTypeId: string) => {
    updateFileData(file.id, {
        selectedSubDataTypeId: subDataTypeId,
    });
};

// Well selection methods
const selectWell = (wellId: string) => {
    selectedWellId.value = wellId;
    // Clear file selection when switching wells
    checkedFiles.value.clear();
    selectedRowIndex.value = null;
};

const getSelectedWellName = (): string => {
    if (!selectedWellId.value) return '';
    const well = wellStore.data.well.find(w => w.wellId === selectedWellId.value);
    return well?.wellName || '';
};

// Validation Methods
const validateFileData = (file: ExtendedFileData): ValidationResult => {
    try {
        // Map file data to the expected schema format
        const validationData = {
            file_name: file.name,
            edafy_well_id: file.wellId,
            well_name: file.wellName,
            extensionType: file.fileFormat || getFileExtension(file.name).toUpperCase(),
            category: file.selectedDataTypeId, // This should map to CATEGORIES from las.ts
            subcategory: file.selectedSubDataTypeId, // This should map to SUBCATEGORIES from las.ts
            top_depth: file.topDepth, // These would need to come from actual file parsing
            top_depth_uom: file.topDepthUoM,
            base_depth: file.baseDepth,
            base_depth_uom: file.baseDepthUoM,
            createdFor: file.createdFor,
            createdBy: file.createdBy,
            createdDate: file.createdDate,
        };

        const result = lasSchema.safeParse(validationData);
        
        if (result.success) {
            console.log('[Validation] File passed validation:', file.name);
            return {
                isValid: true,
                errors: []
            };
        } else {
            console.log('[Validation] File failed validation:', file.name, result.error.issues);
            return {
                isValid: false,
                errors: result.error.issues.map(issue => ({
                    title: issue.path.join('.') || 'Validation Error',
                    message: issue.message,
                    type: 'error'
                }))
            };
        }
    } catch (error) {
        console.error('[Validation] Error validating file:', file.name, error);
        return {
            isValid: false,
            errors: [{
                title: 'General Error',
                message: 'Validation error occurred',
                type: 'error'
            }]
        };
    }
};

// const getFileValidationResult = (fileId: string): ValidationResult | null => {
//     return validationResults.value.get(fileId) || null;
// };

const runValidationForAllFiles = () => {
    console.log('[QC] Starting quality check validation...');

    wellStore.clearFileValidationResults();
    
    Array.from(fileDataMap.value.values()).forEach(file => {
        const result = validateFileData(file);
        // validationResults.value.set(file.id, result);
        
        console.log('[QC] File:', file.name, 'Validation Result:', result);
        // Store validation result in wellStore
        wellStore.updateFileValidationResult(file.id, result);
    });
};

const proceedToQualityCheck = async () => {
    console.log('[QC] Starting quality check process...');
    
    try {
        // Run validation for all files
        await runValidationForAllFiles();
        
        // Set that QC has been done
        wellStore.setHasDoneQC(true);
        
        // Advance workflow to approval stage and mark quality-check as completed
        wellStore.advanceWorkflow('approval', 'quality-check');
        
        console.log('[QC] Stage updated to approval, completed stages:', wellStore.data.completedStages);
        
        // Navigate to approval page
        // router.push('/data-approval');
    } catch (error) {
        console.error('[QC] Error during quality check:', error);
    }
};

const proceedToPublish = async () => {
    console.log('[QC] Starting publish process...');
    
    // Navigate to publication page
    // router.push('/data-publication');
};

const showApprovalModal = () => {
    approvalComments.value = wellStore.data.approval.comments || '';
    showApprovalModalDialog.value = true;
};

const closeApprovalModal = () => {
    showApprovalModalDialog.value = false;
    approvalComments.value = '';
};

const approveDataset = () => {
    // console.log('[QC] Approving dataset with comments:', approvalComments.value);
    wellStore.approveDataset(approvalComments.value);
    // console.log('[QC] Dataset approved, isApproved:', wellStore.data.approval.isApproved);
    // console.log('[QC] Current stage:', wellStore.data.currentStage);
    closeApprovalModal();
    
    // Show success modal after approval
    setTimeout(() => {
        showSuccessModal.value = true;
    }, 300);
};

const closeSuccessModal = () => {
    showSuccessModal.value = false;
};

const rejectDataset = () => {
    console.log('[QC] Rejecting dataset...');
    wellStore.rejectDataset();
    console.log('[QC] Dataset rejected, isApproved:', wellStore.data.approval.isApproved);
    console.log('[QC] Current stage:', wellStore.data.currentStage);
};

// const toggleSelectAllFiles = () => {
//     files.value.forEach(file => {
//         file.selected = selectAllFiles.value;
//     });
// };

// Lifecycle
onMounted(async () => {
    
    // Initialize file data from store
    initializeFileData();
    
    // Fetch data types and sub data types
    try {
        await fetchDataTypes();
        await fetchSubDataTypes();
    } catch (error) {
        console.error('[QC] Error fetching data:', error);
    }
    
    // Set the current stage to quality-check if coming from loading
    if (wellStore.data.currentStage === 'loading') {
        wellStore.setCurrentStage('quality-check');
        if (!wellStore.data.completedStages.includes('loading')) {
            wellStore.addCompletedStage('loading');
        }
    }
    
    setTimeout(() => {
        if (wellStore.data.currentStage === 'preparation') {
            wellStore.setCurrentStage('loading');
            wellStore.addCompletedStage('preparation');
        }
    }, 1000);
});

// Watch for activeTab changes to auto-select first file when files tab is activated
watch(activeTab, (newTab) => {
    if (newTab === 'files' && selectedWellId.value && files.value.length > 0) {
        // Auto-select the first file when files tab is clicked
        selectedRowIndex.value = 0;
    }
});

// Watch for selectedWellId changes to auto-select first file when a well is selected
watch(selectedWellId, (newWellId) => {
    if (newWellId && activeTab.value === 'files' && files.value.length > 0) {
        // Auto-select the first file when a well is selected and files tab is active
        selectedRowIndex.value = 0;
    }
});
</script>

<style scoped>
.data-qc-content {
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

.header-info {
    margin-bottom: 1.5rem;
}

.dataset-title h1 {
    color: #0f172a;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.dataset-meta {
    display: flex;
    gap: 2rem;
    color: #64748b;
    font-size: 0.8rem;
}

.qc-main {
    padding: 2rem 1rem;
    max-width: 95vw;
    margin: 0 auto;
}

.qc-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.panel-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    border: 1px solid #e2e8f0;
    height: fit-content;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
}

.panel-header h2 {
    color: #0f172a;
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
}

.expand-btn {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.expand-btn:hover {
    color: #3b82f6;
    background: #eff6ff;
}

.tabs {
    display: flex;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 1rem;
}

.tab {
    background: none;
    border: none;
    padding: 0.6rem 0.8rem;
    cursor: pointer;
    color: #64748b;
    font-weight: 500;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
    font-size: 0.85rem;
}

.tab.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
}

.tab:hover {
    color: #3b82f6;
}

.tab-content {
    padding: 1rem 0;
    width: 100%;
    overflow: hidden;
}

.dataset-info,
.metadata-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
}

.info-row label {
    color: #64748b;
    font-weight: 500;
    min-width: 100px;
    font-size: 0.8rem;
}

.info-row span {
    color: #1f2937;
    text-align: right;
    flex: 1;
    font-size: 0.8rem;
}

.files-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
}

.table-container {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 1rem;
    width: 100%;
}

.components-table {
    width: 100%;
    font-size: 0.75rem;
    border-collapse: collapse;
    table-layout: fixed;
}

.components-table th {
    background: #f9fafb;
    padding: 0.4rem 0.3rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.7rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.components-table td {
    padding: 0.4rem 0.3rem;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.7rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.components-table th:nth-child(1),
.components-table td:nth-child(1) {
    width: 30px;
    padding: 0.4rem 0.2rem;
}

.components-table th:nth-child(2),
.components-table td:nth-child(2) {
    width: 45%;
    min-width: 200px;
}

.components-table th:nth-child(3),
.components-table td:nth-child(3) {
    width: 15%;
    min-width: 80px;
}

.components-table th:nth-child(4),
.components-table td:nth-child(4) {
    width: 20%;
    min-width: 120px;
}

.components-table th:nth-child(5),
.components-table td:nth-child(5) {
    width: 20%;
    min-width: 120px;
}

.components-table th:nth-child(6),
.components-table td:nth-child(6) {
    width: 8%;
    min-width: 60px;
}

.components-table th:nth-child(7),
.components-table td:nth-child(7) {
    width: 8%;
    min-width: 60px;
}

.components-table th:nth-child(8),
.components-table td:nth-child(8) {
    width: 10%;
    min-width: 70px;
}

.components-table th:nth-child(9),
.components-table td:nth-child(9) {
    width: 9%;
    min-width: 60px;
}

.components-table tr:hover {
    background: #f8fafc;
    cursor: pointer;
}

.components-table tr.selected {
    background: #dbeafe !important;
    border-left: 3px solid #3b82f6;
}

.components-table tr.selected:hover {
    background: #bfdbfe !important;
}

.components-table tr.validation-error {
    background: #fef2f2 !important;
    border-left: 3px solid #ef4444;
}

.components-table tr.validation-error:hover {
    background: #fee2e2 !important;
}

.components-table tr.validation-success {
    background: #f0fdf4 !important;
    border-left: 3px solid #22c55e;
}

.components-table tr.validation-success:hover {
    background: #dcfce7 !important;
}

.file-name {
    font-weight: 500;
    color: #1f2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.entity-select {
    padding: 0.2rem 0.3rem;
    border: 1px solid #d1d5db;
    border-radius: 3px;
    font-size: 0.7rem;
    background: white;
    color: #374151;
    width: 100%;
    max-width: 100%;
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

.table-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-top: 1px solid #e5e7eb;
    font-size: 0.875rem;
    color: #6b7280;
    background: #f8fafc;
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
    font-size: 0.75rem;
}

.page-btn:hover {
    background: #f3f4f6;
}

.status-icon {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
}

.status-icon.success {
    background: #22c55e;
    color: white;
}

.mini-select {
    width: 100%;
    padding: 0.2rem;
    border: 1px solid #d1d5db;
    border-radius: 3px;
    font-size: 0.7rem;
    background: white;
}

.preview-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    background: #fafbfc;
}

.loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.loading-indicator p {
    color: #64748b;
    margin: 0;
}

.btn {
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: none;
    font-size: 0.8rem;
}

.btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.btn-primary:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    background: #9ca3af;
}

.btn-outline {
    background: white;
    color: #374151;
    border: 1px solid #e5e7eb;
}

.btn-outline:hover {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #3b82f6;
}

.btn-sm {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
}

.approval-notice {
    background: #e0f2fe;
    border: 1px solid #b3e5fc;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
}

.approval-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.approval-text {
    color: #0f172a;
    font-size: 0.875rem;
    font-weight: 500;
}

.approval-actions {
    display: flex;
    gap: 0.75rem;
}

.btn-approve {
    background: #22c55e;
    color: white;
    border: 1px solid #16a34a;
}

.btn-approve:hover {
    background: #16a34a;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-reject {
    background: #ef4444;
    color: white;
    border: 1px solid #dc2626;
}

.btn-reject:hover {
    background: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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
    backdrop-filter: blur(4px);
}

.modal-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
    transform: scale(1);
    transition: all 0.3s ease;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
    margin: 0;
    color: #0f172a;
    font-size: 1.2rem;
    font-weight: 600;
}

.modal-close {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-close:hover {
    color: #ef4444;
    background: #fef2f2;
}

.modal-body {
    padding: 1.5rem;
}

.modal-label {
    display: block;
    color: #374151;
    font-weight: 500;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
}

.modal-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #374151;
    background: white;
    resize: vertical;
    min-height: 100px;
    transition: all 0.2s ease;
    font-family: inherit;
    line-height: 1.5;
}

.modal-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-textarea::placeholder {
    color: #9ca3af;
}

.modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
}

.modal-footer .btn {
    min-width: 100px;
    justify-content: center;
}

/* Success Modal Styles */
.success-modal-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 320px;
    overflow: hidden;
    transform: scale(1);
    transition: all 0.3s ease;
}

.success-modal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1.5rem 1.5rem 1.5rem;
    text-align: center;
}

.success-icon {
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.success-title {
    color: #0f172a;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
}

.success-btn {
    min-width: 120px;
    padding: 0.75rem 1.5rem;
}

/* Wells List Styles */
.info-section {
    margin-bottom: 1.5rem;
}

.info-section h3 {
    color: #374151;
    font-size: 0.85rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.no-wells {
    color: #6b7280;
    font-style: italic;
    text-align: center;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
    font-size: 0.8rem;
}

.wells-table-container {
    overflow-x: auto;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
}

.wells-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
}

.wells-table th,
.wells-table td {
    padding: 0.5rem 0.75rem;
    text-align: left;
    border-bottom: 1px solid #f3f4f6;
}

.wells-table th {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
    font-size: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
}

.wells-table tbody tr:hover {
    background: #f8fafc;
    cursor: pointer;
}

.wells-table tbody tr.selected-well {
    background: #dbeafe !important;
    border-left: 3px solid #3b82f6;
}

.wells-table tbody tr.selected-well:hover {
    background: #bfdbfe !important;
}

.wells-table tbody tr:last-child td {
    border-bottom: none;
}

.well-name {
    font-weight: 500;
    color: #1e293b;
}

.well-id-cell {
    font-weight: 500;
    color: #64748b;
    font-family: monospace;
}

.well-uwi {
    font-weight: 400;
    color: #6b7280;
    font-family: monospace;
}

.wells-count {
    margin-top: 0.5rem;
    text-align: right;
    font-size: 0.75rem;
    color: #6b7280;
    padding: 0.5rem 0.75rem;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
}

.selected-well-indicator {
    font-weight: 500;
    color: #3b82f6;
}

/* No well selected styles */
.no-well-selected {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
}

.no-well-message {
    text-align: center;
    color: #6b7280;
}

.no-well-icon {
    margin: 0 auto 1rem;
    opacity: 0.5;
}

.no-well-message h3 {
    color: #374151;
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
}

.no-well-message p {
    color: #6b7280;
    font-size: 0.9rem;
    margin: 0;
}

@media (max-width: 1024px) {
    .qc-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .workflow-progress {
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .table-header,
    .table-row {
        grid-template-columns: 30px 1fr 60px 80px 60px 60px 60px 60px;
        font-size: 0.75rem;
    }

    .dataset-meta {
        flex-wrap: wrap;
        gap: 1rem;
    }

    .modal-container {
        width: 95%;
        margin: 1rem;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
        padding: 1rem;
    }

    .modal-footer {
        flex-direction: column;
        gap: 0.5rem;
    }

    .modal-footer .btn {
        width: 100%;
    }

    .success-modal-container {
        width: 95%;
        max-width: 300px;
    }

    .success-modal-content {
        padding: 1.5rem 1rem;
    }

    .success-title {
        font-size: 1.1rem;
    }
}
</style>
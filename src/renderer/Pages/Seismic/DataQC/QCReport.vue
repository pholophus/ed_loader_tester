<template>
    <div class="qc-report-container">
        <!-- Header Section -->
        <div class="report-header">
            <div class="status-banner">
                <!-- <div class="status-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </div> -->
                <h1 class="report-title">
                    QUALITY CHECK COMPLETED. DATASET REPORT
                </h1>
            </div>
        </div>

        <!-- Data Information Section -->
        <div class="data-section">
            <table class="data-table">
                <thead>
                    <tr class="header-row">
                        <th class="data-header">DATA</th>
                        <th class="action-header">ACTION</th>
                        <!-- <th class="loaded-header">LOADED</th>
                        <th class="not-loaded-header">NOT LOADED</th> -->
                    </tr>
                </thead>
                <tbody>
                    <tr class="data-row">
                        <td class="data-cell dataset-info">
                            <div class="data-item">
                                <span class="label">Files:</span>
                                <span class="value">{{ datasetInfo.filesCount }}</span>
                            </div>
                            <div class="data-item">
                                <span class="label">Size:</span>
                                <span class="value">{{ datasetInfo.size }}</span>
                            </div>
                        </td>
                        <td class="data-cell action-info">
                            <div class="data-item">
                                <span class="label">Created By:</span>
                                <span class="value">{{ datasetInfo.createdBy }}</span>
                            </div>
                            <div class="data-item">
                                <span class="label">Date:</span>
                                <span class="value">{{ datasetInfo.date }}</span>
                            </div>
                            <div class="data-item">
                                <span class="label">Edited By:</span>
                                <span class="value">{{ datasetInfo.editedBy }}</span>
                            </div>
                            <div class="data-item">
                                <span class="label">Loaded By:</span>
                                <span class="value">{{ datasetInfo.loadedBy }}</span>
                            </div>
                            <div class="data-item">
                                <span class="label">Last Update:</span>
                                <span class="value">{{ datasetInfo.lastUpdate }}</span>
                            </div>
                            <div class="data-item">
                                <span class="label">Checked By:</span>
                                <span class="value">{{ datasetInfo.checkedBy }}</span>
                            </div>
                        </td>
                        <!-- <td class="data-cell loaded-info">
                            <div class="data-item">
                                <span class="label">Files:</span>
                                <span class="value">{{ datasetInfo.loadedFiles }}</span>
                            </div>
                        </td>
                        <td class="data-cell not-loaded-info">
                            <div class="data-item">
                                <span class="label">Files:</span>
                                <span class="value">{{ datasetInfo.notLoadedFiles }}</span>
                            </div>
                        </td> -->
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Loaded Files Section -->
        <div class="loaded-section">
            <div class="section-header">
                <h2>FILES</h2>
            </div>

            <table class="loaded-table">
                <thead>
                    <tr class="table-header-row">
                        <th class="header-filename">FILENAME</th>
                        <!-- <th class="header-recall">RECALL ENTITY</th> -->
                        <!-- <th class="header-quality">
                            <div class="quality-header-main">QUALITY</div>
                            <div class="quality-subheader">
                                <span>MetaData</span>
                                <span>Completeness</span>
                                <span>Child</span>
                            </div>
                        </th> -->
                        <th class="header-validation">QC VALIDATION</th>
                        <th class="header-traces">TRACES</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="file in loadedSeismicFiles" :key="file.id" class="table-row">
                        <td class="cell-filename">{{ file.filename }}</td>
                        <!-- <td class="cell-recall">{{ file.recallEntity }}</td> -->
                        <!-- <td class="cell-quality">
                            <div class="quality-metrics">
                                <div class="metric" :class="getQualityClass(file.quality.metadata)">
                                    {{ file.quality.metadata }}
                                </div>
                                <div class="metric" :class="getQualityClass(file.quality.completeness)">
                                    {{ file.quality.completeness }}
                                </div>
                                <div class="metric" :class="getQualityClass(file.quality.child)">
                                    {{ file.quality.child }}
                                </div>
                            </div>
                        </td> -->
                        <td class="cell-validation">
                            <div class="validation-status" :class="getValidationStatusClass(file.validation.status)">
                                <div class="status-indicator">
                                    <svg v-if="file.validation.status === 'passed'" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <svg v-else-if="file.validation.status === 'failed'" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                                <div class="status-content">
                                    <div class="status-text">{{ getValidationStatusText(file.validation.status) }}</div>
                                    <div v-if="file.validation.errorCount > 0" class="error-count">
                                        {{ file.validation.errorCount }} {{ file.validation.errorCount === 1 ? 'error' : 'errors' }}
                                    </div>
                                </div>
                                <button 
                                    v-if="file.validation.errors.length > 0" 
                                    @click="toggleValidationDetails(file.id)"
                                    class="details-toggle"
                                    :class="{ 'expanded': expandedValidations.includes(file.id) }"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                            </div>
                            
                            <!-- Expandable error details -->
                            <div v-if="expandedValidations.includes(file.id) && file.validation.errors.length > 0" class="validation-details">
                                <div class="error-list">
                                    <div v-for="error in file.validation.errors" :key="error.field" class="error-item">
                                        <div class="error-field">{{ error.field }}</div>
                                        <div class="error-message">{{ error.message }}</div>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td class="cell-traces">{{ file.traces }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useSeismicStore } from '@/store/seismicStore';

interface ValidationError {
    field: string;
    message: string;
}

interface ValidationStatus {
    status: 'passed' | 'failed' | 'warning' | 'pending';
    errorCount: number;
    errors: ValidationError[];
}

interface SeismicFile {
    id: string;
    filename: string;
    traces: string;
    validation: ValidationStatus;
}

const seismicStore = useSeismicStore();

// Computed property to get dataset info with real data from seismicStore
const datasetInfo = computed(() => ({
    name: seismicStore.data.survey.name || 'Unknown Survey',
    country: seismicStore.data.survey.country || 'Unknown',
    filesCount: seismicStore.data.seismicMetadatas.length,
    size: calculateTotalSize(),
    createdBy: seismicStore.data.seismicMetadatas[0]?.createdBy || 'recall_controller',
    date: '2021-03-11 10:57:20',
    editedBy: seismicStore.data.seismicMetadatas[0]?.editedBy || 'recall_controller',
    loadedBy: 'recall_controller',
    lastUpdate: '2021-03-11 10:59:27',
    checkedBy: 'None',
    loadedFiles: seismicStore.data.seismicMetadatas.length,

}));

// Helper function to calculate total size
const calculateTotalSize = (): string => {
    const totalBytes = seismicStore.data.seismicMetadatas.reduce((total, file) => total + (file.size || 0), 0);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);
    return `${totalMB}MB`;
};

// Computed property for seismic files
const loadedSeismicFiles = computed<SeismicFile[]>(() => {
    return seismicStore.data.seismicMetadatas.map((metadata, index) => {
        const fileId = metadata.id || metadata.name || '';
        let tracesInfo = 'Seismic Data';
        
        // Determine trace info based on file type
        if (metadata.path && metadata.name) {
            const fileName = metadata.name.toLowerCase();
            if (fileName.endsWith('.segy') || fileName.endsWith('.sgy')) {
                tracesInfo = 'Seismic Traces';
            } else if (fileName.endsWith('.las')) {
                tracesInfo = 'Well Log Data';
            } else {
                tracesInfo = metadata.dataTypeName || 'Seismic Data';
            }
        } else {
            tracesInfo = metadata.dataTypeName || 'Seismic Data';
        }

        // Get validation data from seismicStore
        const validationData = metadata.validationResult || {
            isValid: false,
            errors: []
        };

        // Convert ValidationResult to ValidationStatus format
        const validationStatus: ValidationStatus = {
            status: validationData.isValid ? 'passed' : (validationData.errors.length > 0 ? 'failed' : 'pending'),
            errorCount: validationData.errors.length,
            errors: validationData.errors.map(error => ({
                field: error.title,
                message: error.message
            }))
        };

        return {
            id: fileId,
            filename: metadata.name || 'Unknown File',
            traces: tracesInfo,
            validation: validationStatus
        };
    });
});

// Store for tracking expanded validation details
const expandedValidations = ref<string[]>([]);

// Function to toggle validation details expansion
const toggleValidationDetails = (fileId: string) => {
    const index = expandedValidations.value.indexOf(fileId);
    if (index > -1) {
        expandedValidations.value.splice(index, 1);
    } else {
        expandedValidations.value.push(fileId);
    }
};

// Function to get validation status CSS class
const getValidationStatusClass = (status: string): string => {
    switch (status) {
        case 'passed':
            return 'validation-passed';
        case 'failed':
            return 'validation-failed';
        case 'warning':
            return 'validation-warning';
        default:
            return 'validation-pending';
    }
};

// Function to get validation status text
const getValidationStatusText = (status: string): string => {
    switch (status) {
        case 'passed':
            return 'PASSED';
        case 'failed':
            return 'FAILED';
        case 'warning':
            return 'WARNING';
        default:
            return 'PENDING';
    }
};
</script>

<style scoped>
.qc-report-container {
    padding: 1.5rem;
    background: #f8fafc;
    min-height: 100vh;
}

.report-header {
    margin-bottom: 2rem;
}

.status-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #dcfce7;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    padding: 1rem 1.5rem;
}

.status-icon {
    background: #22c55e;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.report-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #166534;
    margin: 0;
}

.data-section,
.loaded-section {
    background: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    margin-bottom: 1.5rem;
    overflow: hidden;
}

/* Data Table Styles */
.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table thead {
    background: #f1f5f9;
}

.data-table th {
    text-align: left;
    padding: 0.75rem 1.5rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: #64748b;
    border-bottom: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
}

.data-table th:last-child {
    border-right: none;
}

.data-table td {
    padding: 1.5rem;
    vertical-align: top;
    border-right: 1px solid #f1f5f9;
}

.data-table td:last-child {
    border-right: none;
}

.data-cell {
    min-width: 0;
}

.data-item {
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    width: 100%;
}

.data-item .label {
    font-weight: 500;
    color: #64748b;
    flex-shrink: 0;
    width: 100px;
    min-width: 100px;
}

.data-item .value {
    color: #334155;
    font-weight: 400;
    text-align: left;
    flex: 1;
}

/* Special styling for first items (Dataset ID, Source) */
.dataset-info .data-item:first-child .value,
.source-info .data-item:first-child .value {
    font-weight: 600;
    color: #334155;
}

/* Section header for loaded section */
.section-header {
    background: #f1f5f9;
    padding: 0.75rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.section-header h2 {
    font-size: 0.9rem;
    font-weight: 600;
    color: #334155;
    margin: 0;
}

/* Loaded Files Table Styles */
.loaded-table {
    width: 100%;
    border-collapse: collapse;
}

.loaded-table thead {
    background: #f8fafc;
}

.loaded-table th {
    text-align: left;
    padding: 0.75rem 1.5rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: #64748b;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
}

.header-filename {
    width: 25%;
}

.header-recall {
    width: 20%;
}

.header-quality {
    width: 35%;
}

.header-validation {
    width: 25%;
}

.header-traces {
    width: 20%;
}

.quality-header-main {
    font-size: 0.8rem;
    font-weight: 500;
    color: #64748b;
    margin-bottom: 0.5rem;
}

.quality-subheader {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    font-weight: 400;
    color: #64748b;
}

.loaded-table tbody tr {
    border-bottom: 1px solid #f1f5f9;
}

.loaded-table tbody tr:last-child {
    border-bottom: none;
}

.loaded-table td {
    padding: 0.75rem 1.5rem;
    font-size: 0.8rem;
    vertical-align: top;
}

.cell-filename {
    font-weight: 500;
    color: #334155;
}

.cell-recall {
    color: #64748b;
}

.cell-quality {
    /* Quality column styling */
}

.quality-metrics {
    display: flex;
    justify-content: space-between;
    gap: 0.25rem;
}

.metric {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    text-align: center;
    min-width: 50px;
}

.quality-good {
    background: #dcfce7;
    color: #166534;
}

.quality-fair {
    background: #fef3c7;
    color: #92400e;
}

.quality-poor {
    background: #fee2e2;
    color: #dc2626;
}

/* Validation Styles */
.cell-validation {
    /* Validation column styling */
}

.validation-status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid;
    transition: all 0.2s ease;
}

.validation-passed {
    background: #f0fdf4;
    border-color: #bbf7d0;
    color: #166534;
}

.validation-failed {
    background: #fef2f2;
    border-color: #fecaca;
    color: #dc2626;
}

.validation-warning {
    background: #fffbeb;
    border-color: #fed7aa;
    color: #d97706;
}

.validation-pending {
    background: #f8fafc;
    border-color: #e2e8f0;
    color: #64748b;
}

.status-indicator {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.status-content {
    flex: 1;
    min-width: 0;
}

.status-text {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.error-count {
    font-size: 0.7rem;
    opacity: 0.8;
    margin-top: 0.125rem;
}

.details-toggle {
    background: none;
    border: none;
    padding: 0.25rem;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    color: currentColor;
}

.details-toggle:hover {
    background: rgba(0, 0, 0, 0.05);
}

.details-toggle.expanded {
    transform: rotate(180deg);
}

.validation-details {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.error-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.error-item {
    padding: 0.5rem;
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 4px;
}

.error-field {
    font-size: 0.7rem;
    font-weight: 600;
    color: #dc2626;
    text-transform: uppercase;
    margin-bottom: 0.25rem;
}

.error-message {
    font-size: 0.75rem;
    color: #374151;
    line-height: 1.4;
}

.cell-traces {
    color: #64748b;
}

@media (max-width: 1200px) {
    .qc-report-container {
        padding: 1rem;
    }
    
    .data-table th,
    .data-table td {
        padding: 0.75rem 1rem;
    }
    
    .loaded-table th,
    .loaded-table td {
        padding: 0.5rem 1rem;
    }
    
    .quality-metrics {
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .metric {
        min-width: auto;
    }

    .validation-status {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .status-content {
        order: -1;
    }
}

@media (max-width: 768px) {
    .data-table,
    .loaded-table {
        font-size: 0.75rem;
    }
    
    .quality-subheader {
        flex-direction: column;
        gap: 0.25rem;
    }

    .header-validation,
    .header-traces {
        width: auto;
    }

    .validation-status {
        padding: 0.375rem;
    }

    .error-item {
        padding: 0.375rem;
    }
}
</style>

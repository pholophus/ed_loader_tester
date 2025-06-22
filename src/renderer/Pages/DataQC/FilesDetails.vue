<template>
    <div class="files-details-panel">
        <div class="panel-card">
            <div class="panel-header">
                <h2>Details</h2>
                <div class="header-actions">
                    <button class="btn btn-primary btn-sm">Update</button>
                    <button class="btn btn-outline btn-sm">Reset</button>
                </div>
            </div>
            
            <!-- Details Tabs -->
            <div class="tabs">
                <button class="tab" :class="{ active: detailsTab === 'metadata' }" @click="detailsTab = 'metadata'">
                    Metadata
                </button>
                <button class="tab" :class="{ active: detailsTab === 'preview' }" @click="detailsTab = 'preview'">
                    Preview
                </button>
            </div>
            
            <!-- Metadata Tab -->
            <div v-if="detailsTab === 'metadata'" class="tab-content">
                <div class="file-metadata">
                    <div class="metadata-row">
                        <label>Edited By:</label>
                        <span>{{ editedBy || 'recall_controller' }}</span>
                    </div>
                    
                    <div class="metadata-row">
                        <label>Created By:</label>
                        <span>{{ createdBy || 'recall_controller' }}</span>
                    </div>
                    
                    <div class="metadata-row">
                        <label>Target File Name:</label>
                        <div class="select-wrapper">
                            <select v-model="targetFileName" class="file-select">
                                <option value="15_9.5-11_B_02.LWD_EWL_MWD_REPORT_1-1107.PDF">15_9.5-11_B_02.LWD_EWL_MWD_REPORT_1-1107.PDF</option>
                                <option value="other_file.pdf">other_file.pdf</option>
                            </select>
                            <svg class="select-icon" width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="metadata-row">
                        <label>File Format:</label>
                        <span class="file-format">{{ fileFormat || 'PDF' }}</span>
                    </div>
                    
                    <div class="metadata-row">
                        <label>Status:</label>
                        <span class="status completed">{{ status || 'COMPLETED' }}</span>
                    </div>
                    
                    <div class="metadata-row">
                        <label>Target Entity:</label>
                        <span class="target-entity">{{ targetEntity || 'BOREHOLE FILE' }}</span>
                    </div>
                    
                    <div class="metadata-row">
                        <label>Borehole Name:</label>
                        <span>{{ boreholeName || '15_9.5-11B' }}</span>
                    </div>
                    
                    <div class="metadata-row">
                        <label>Field Name:</label>
                        <span>{{ fieldName || 'VOLVE' }}</span>
                    </div>
                    
                    <div class="metadata-row">
                        <label>Target OSDU Project:</label>
                        <div class="select-wrapper">
                            <select v-model="targetProject" class="project-select">
                                <option value="CORPORATE">CORPORATE</option>
                                <option value="PROJECT_A">PROJECT_A</option>
                                <option value="PROJECT_B">PROJECT_B</option>
                            </select>
                            <svg class="select-icon" width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="metadata-row">
                        <label>Number of Logs:</label>
                        <span>{{ numberOfLogs || '1' }}</span>
                    </div>
                    
                    <div class="metadata-row">
                        <label>Contractor:</label>
                        <div class="select-wrapper">
                            <select v-model="contractor" class="contractor-select">
                                <option value="">Select...</option>
                                <option value="HALLIBURTON">HALLIBURTON</option>
                                <option value="SCHLUMBERGER">SCHLUMBERGER</option>
                                <option value="BAKER_HUGHES">BAKER_HUGHES</option>
                            </select>
                            <svg class="select-icon" width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Preview Tab -->
            <div v-if="detailsTab === 'preview'" class="tab-content">
                <div class="preview-area">
                    <div class="preview-content">
                        <div class="preview-header">
                            <h3>Preview</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Props for receiving data from parent component
interface Props {
    selectedFile?: any;
    editedBy?: string;
    createdBy?: string;
    fileFormat?: string;
    status?: string;
    targetEntity?: string;
    boreholeName?: string;
    fieldName?: string;
    numberOfLogs?: string;
}

const props = withDefaults(defineProps<Props>(), {
    editedBy: 'recall_controller',
    createdBy: 'recall_controller',
    fileFormat: 'PDF',
    status: 'COMPLETED',
    targetEntity: 'BOREHOLE FILE',
    boreholeName: '15_9.5-11B',
    fieldName: 'VOLVE',
    numberOfLogs: '1'
});

// Local reactive data
const detailsTab = ref('metadata');
const targetFileName = ref('15_9.5-11_B_02.LWD_EWL_MWD_REPORT_1-1107.PDF');
const targetProject = ref('CORPORATE');
const contractor = ref('');

// Mock event logs
const eventLogs = ref([
    {
        id: 1,
        timestamp: '2021-03-11 10:57:20',
        message: 'File uploaded successfully',
        user: 'recall_controller'
    },
    {
        id: 2,
        timestamp: '2021-03-11 10:58:15',
        message: 'Metadata updated',
        user: 'recall_controller'
    },
    {
        id: 3,
        timestamp: '2021-03-11 11:00:02',
        message: 'Quality check completed',
        user: 'system'
    }
]);
</script>

<style scoped>
.files-details-panel {
    /* This will inherit panel styles from parent */
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

.header-actions {
    display: flex;
    gap: 0.5rem;
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
}

.file-metadata {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.metadata-row {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.metadata-row label {
    color: #64748b;
    font-weight: 500;
    font-size: 0.8rem;
}

.metadata-row span {
    color: #1f2937;
    font-size: 0.8rem;
    padding: 0.4rem 0;
}

.file-format {
    background: #f3f4f6;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-weight: 500;
    display: inline-block;
    width: fit-content;
    font-size: 0.75rem;
}

.status {
    font-weight: 600;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    display: inline-block;
    width: fit-content;
    font-size: 0.75rem;
}

.status.completed {
    background: #dcfce7;
    color: #166534;
}

.target-entity {
    background: #eff6ff;
    color: #1d4ed8;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-weight: 500;
    display: inline-block;
    width: fit-content;
    font-size: 0.75rem;
}

.select-wrapper {
    position: relative;
    display: inline-block;
    width: 100%;
}

.file-select,
.project-select,
.contractor-select {
    width: 100%;
    padding: 0.4rem 1.8rem 0.4rem 0.6rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.8rem;
    background: white;
    appearance: none;
    cursor: pointer;
    transition: border-color 0.2s ease;
}

.file-select:focus,
.project-select:focus,
.contractor-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.select-icon {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #9ca3af;
}

.event-log-area {
    max-height: 400px;
    overflow-y: auto;
}

.event-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.event-item {
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #fafbfc;
}

.event-timestamp {
    font-size: 0.8rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
}

.event-message {
    font-size: 0.9rem;
    color: #1f2937;
    margin-bottom: 0.25rem;
}

.event-user {
    font-size: 0.8rem;
    color: #6b7280;
    font-style: italic;
}

.btn {
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: none;
    font-size: 0.75rem;
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

/* Responsive design */
@media (max-width: 768px) {
    .panel-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }
    
    .header-actions {
        justify-content: flex-end;
    }
    
    .metadata-row {
        gap: 0.25rem;
    }
}
</style>

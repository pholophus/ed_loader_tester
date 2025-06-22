<template>
    <div class="data-qc-content">
        <!-- Header -->
        <header class="page-header">
            <div class="header-nav">
                <router-link to="/data-loading" class="back-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Back
                </router-link>
                <div class="header-actions">
                    <button class="btn btn-primary" @click="proceedToQualityCheck" :disabled="currentStage !== 'loading'">
                        Quality Check
                    </button>
                </div>
            </div>
            <div class="header-info">
                <div class="dataset-title">
                    <h1>{{ datasetName || 'OSDU_Demo' }}</h1>
                    <div class="dataset-meta">
                        <span class="company">Company: {{ company || 'BAKER HUGHES' }}</span>
                        <span class="created-by">Created By: {{ createdBy || 'recall_controller' }}</span>
                        <span class="uploaded">Uploaded: {{ uploadedDate || '2021-03-11 10:57:20' }}</span>
                        <span class="size">Size: {{ totalSize || '6.3 MB' }}</span>
                    </div>
                </div>
            </div>
            
            <!-- Workflow Progress -->
            <WorkflowProgress 
                :current-stage="'quality-check'"
                :completed-stages="['preparation', 'loading']"
            />
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
                                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        
                        <!-- Tabs -->
                        <div class="tabs">
                            <button class="tab" :class="{ active: activeTab === 'dataset' }" @click="activeTab = 'dataset'">
                                Dataset
                            </button>
                            <button class="tab" :class="{ active: activeTab === 'files' }" @click="activeTab = 'files'">
                                Files ({{ files.length }})
                            </button>
                            <button class="tab" :class="{ active: activeTab === 'logs' }" @click="activeTab = 'logs'">
                                Logs ({{ logs.length }})
                            </button>
                            <button class="tab" :class="{ active: activeTab === 'curves' }" @click="activeTab = 'curves'">
                                Curves ({{ curves.length }})
                            </button>
                        </div>
                        
                        <!-- Dataset Tab Content -->
                        <div v-if="activeTab === 'dataset'" class="tab-content">
                            <div class="dataset-info">
                                <div class="info-row">
                                    <label>Dataset Name:</label>
                                    <span>{{ datasetName || 'OSDU_Demo' }}</span>
                                </div>
                                <div class="info-row">
                                    <label>Dataset ID:</label>
                                    <span>{{ datasetId || '1051' }}</span>
                                </div>
                                <div class="info-row">
                                    <label>Total File Size:</label>
                                    <span>{{ totalSize || '6.3 MB' }}</span>
                                </div>
                                <div class="info-row">
                                    <label>Description:</label>
                                    <span>{{ description || '' }}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Files Tab Content -->
                        <div v-if="activeTab === 'files'" class="tab-content">
                            <div class="files-actions">
                                <button class="btn btn-outline btn-sm" @click="removeSelectedFiles">Remove</button>
                            </div>
                            
                            <div class="files-table">
                                <div class="table-header">
                                    <div class="col-checkbox">
                                        <input type="checkbox" v-model="selectAllFiles" @change="toggleSelectAllFiles">
                                    </div>
                                    <div class="col-name">File Name</div>
                                    <div class="col-size">Size</div>
                                    <div class="col-target">Target Entity</div>
                                    <div class="col-preparation">Preparation</div>
                                    <div class="col-loading">Loading</div>
                                    <div class="col-quality">Quality Check</div>
                                    <div class="col-publication">Publication</div>
                                </div>
                                
                                <div class="table-body">
                                    <div v-for="file in files" :key="file.id" class="table-row" :class="{ selected: file.selected }">
                                        <div class="col-checkbox">
                                            <input type="checkbox" v-model="file.selected">
                                        </div>
                                        <div class="col-name">{{ file.name }}</div>
                                        <div class="col-size">{{ file.size }}</div>
                                        <div class="col-target">
                                            <select v-model="file.targetEntity" class="mini-select">
                                                <option value="LOG">LOG</option>
                                                <option value="BOREHOLE FILE">BOREHOLE FILE</option>
                                                <option value="All">All</option>
                                            </select>
                                        </div>
                                        <div class="col-preparation">
                                            <div class="status-icon success">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                            </div>
                                        </div>
                                        <div class="col-loading">
                                            <div class="status-icon success">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                            </div>
                                        </div>
                                        <div class="col-quality">
                                            <div class="status-icon" :class="file.qualityStatus">
                                                <svg v-if="file.qualityStatus === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                            </div>
                                        </div>
                                        <div class="col-publication">
                                            <select v-model="file.publication" class="mini-select">
                                                <option value="All">All</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="pagination">
                                <span>1 - 3 of 3 results</span>
                                <div class="pagination-controls">
                                    <button class="page-btn active">1</button>
                                    <select class="page-size">
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Status Summary -->
                        <div class="status-summary">
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
                        </div>
                        
                        <!-- Process Status -->
                        <div class="process-status">
                            <div class="process-stage" :class="{ active: currentStage === 'preparation', completed: stageCompleted('preparation') }">
                                <div class="stage-icon">
                                    <svg v-if="stageCompleted('preparation')" width="32" height="32" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" fill="#22c55e"/>
                                        <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <div class="stage-label">
                                    <h3>Preparation</h3>
                                    <p>100%</p>
                                </div>
                            </div>
                            
                            <div class="process-stage" :class="{ active: currentStage === 'loading', completed: stageCompleted('loading') }">
                                <div class="stage-icon">
                                    <div v-if="currentStage === 'loading'" class="loading-circle">
                                        <div class="spinner"></div>
                                    </div>
                                    <svg v-else-if="stageCompleted('loading')" width="32" height="32" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" fill="#22c55e"/>
                                        <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
                        </div>
                    </div>
                </div>

                <!-- Details Panel -->
                <DatasetDetails 
                    v-if="activeTab === 'dataset'"
                    :data-source="dataSource" 
                    :region="region"
                    :created-date="createdDate"
                    :created-by="createdBy"
                    :loaded-date="loadedDate"
                    :loaded-by="loadedBy"
                    :approved-status="approvedStatus"
                    :last-updated="lastUpdated"
                    :last-updated-by="lastUpdatedBy"
                />
                <FilesDetails 
                    v-if="activeTab === 'files'"
                    :files="files"
                />
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DatasetDetails from './DataQC/DatasetDetails.vue';
import FilesDetails from './DataQC/FilesDetails.vue';
import WorkflowProgress from '../Components/WorkflowProgress.vue';

const route = useRoute();
const router = useRouter();

// Data from route or default values
const datasetName = ref(route.query.datasetName as string || 'OSDU_Demo');
const datasetId = ref(route.query.datasetId as string || '1051');
const company = ref(route.query.company as string || 'BAKER HUGHES');
const createdBy = ref(route.query.createdBy as string || 'recall_controller');
const uploadedDate = ref(route.query.uploadedDate as string || '2021-03-11 10:57:20');
const totalSize = ref(route.query.totalSize as string || '6.3 MB');
const description = ref(route.query.description as string || '');
const dataSource = ref(route.query.dataSource as string || 'BAKER HUGHES');

// Additional metadata fields
const region = ref('');
const createdDate = ref('2021-03-11 10:57:20');
const loadedDate = ref('2021-03-11 10:57:20');
const loadedBy = ref('recall_controller');
const approvedStatus = ref('NotRequired');
const lastUpdated = ref('2021-03-11 10:57:20');
const lastUpdatedBy = ref('recall_controller');

// Current workflow stage
const currentStage = ref('preparation');
const completedStages = ref(['preparation']);

// Tab management
const activeTab = ref('files');

// File selection
const selectAllFiles = ref(false);

// Mock data
const files = ref([
    {
        id: 1,
        name: 'WLC_PETRO_COMPUTED_INPUT_1-1100.LAS',
        size: '101.7 KB',
        targetEntity: 'LOG',
        selected: true,
        qualityStatus: 'success',
        publication: 'All'
    },
    {
        id: 2,
        name: 'FM_PRESS_COMPUTED_MWD_1-1100.LAS',
        size: '1.7 KB',
        targetEntity: 'LOG',
        selected: false,
        qualityStatus: 'success',
        publication: 'All'
    },
    {
        id: 3,
        name: '15_5.IF-11.6_03.LWD_EWL_MWD_REPORT_1-11...',
        size: '6.2 MB',
        targetEntity: 'BOREHOLE FILE',
        selected: false,
        qualityStatus: 'success',
        publication: 'All'
    }
]);

const logs = ref([]);
const curves = ref(Array(14).fill(null));

const statusCounts = computed(() => ({
    logs: 1,
    logFiles: 2,
    wellFiles: 0,
    boreholeFiles: 1
}));

// Methods
const stageCompleted = (stage: string) => {
    return completedStages.value.includes(stage);
};

const proceedToQualityCheck = () => {
    if (currentStage.value === 'loading') {
        currentStage.value = 'quality-check';
        completedStages.value.push('loading');
    }
};

const toggleSelectAllFiles = () => {
    files.value.forEach(file => {
        file.selected = selectAllFiles.value;
    });
};

const removeSelectedFiles = () => {
    files.value = files.value.filter(file => !file.selected);
    selectAllFiles.value = false;
};

// Simulate loading progression
onMounted(() => {
    setTimeout(() => {
        currentStage.value = 'loading';
        completedStages.value.push('preparation');
    }, 1000);
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

.files-table {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 1rem;
}

.table-header {
    display: grid;
    grid-template-columns: 40px 2fr 80px 100px 80px 80px 80px 80px;
    gap: 0.5rem;
    padding: 0.6rem;
    background: #f8fafc;
    font-weight: 600;
    font-size: 0.75rem;
    color: #374151;
    border-bottom: 1px solid #e2e8f0;
}

.table-body {
    max-height: 300px;
    overflow-y: auto;
}

.table-row {
    display: grid;
    grid-template-columns: 40px 2fr 80px 100px 80px 80px 80px 80px;
    gap: 0.5rem;
    padding: 0.6rem;
    border-bottom: 1px solid #f3f4f6;
    align-items: center;
    font-size: 0.8rem;
    transition: background 0.2s ease;
}

.table-row:hover {
    background: #f8fafc;
}

.table-row.selected {
    background: #eff6ff;
    border-color: #dbeafe;
}

.col-checkbox {
    display: flex;
    justify-content: center;
}

.col-name {
    font-weight: 500;
    color: #1f2937;
}

.col-size {
    color: #64748b;
    font-size: 0.75rem;
}

.mini-select {
    width: 100%;
    padding: 0.2rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.7rem;
    background: white;
}

.status-icon {
    width: 20px;
    height: 20px;
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

.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    font-size: 0.8rem;
    color: #64748b;
}

.pagination-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.page-btn {
    width: 26px;
    height: 26px;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.75rem;
}

.page-btn.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

.page-size {
    padding: 0.2rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.75rem;
}

.status-summary {
    display: flex;
    justify-content: space-around;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 6px;
    margin: 1rem 0;
}

.status-item {
    text-align: center;
}

.status-number {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
}

.status-label {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 0.25rem;
}

.process-status {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.process-stage {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
}

.process-stage.active {
    background: #eff6ff;
    border-color: #3b82f6;
}

.process-stage.completed {
    background: #f0fdf4;
    border-color: #22c55e;
}

.stage-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #f1f5f9;
    border: 2px solid #e2e8f0;
}

.process-stage.completed .stage-icon {
    background: transparent;
    border: none;
}

.loading-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
}

.spinner {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.stage-label h3 {
    margin: 0 0 0.25rem 0;
    color: #1f2937;
    font-size: 0.9rem;
    font-weight: 600;
}

.stage-label p {
    margin: 0;
    color: #64748b;
    font-size: 0.8rem;
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

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
}
</style> 
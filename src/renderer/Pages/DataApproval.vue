<template>
    <div class="data-approval-content">
        <!-- Header -->
        <header class="page-header">
            <div class="header-nav">
                <router-link to="/data-qc" class="back-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Back to Quality Check
                </router-link>
                <div class="header-actions">
                    <button class="btn btn-outline" @click="rejectDataset">Reject</button>
                    <button class="btn btn-primary" @click="approveDataset">Approve & Publish</button>
                </div>
            </div>
            <div class="header-title">
                <h1>Data Approval</h1>
                <p>Review and approve the dataset for publication</p>
            </div>
            
            <!-- Workflow Progress -->
            <WorkflowProgress 
                :current-stage="wellStore.data.currentStage"
                :completed-stages="wellStore.data.completedStages"
            />
        </header>

        <main class="approval-main">
            <div class="approval-grid">
                <!-- Approval Summary Panel -->
                <div class="summary-panel">
                    <div class="panel-card">
                        <h2>Approval Summary</h2>
                        
                        <div class="approval-status">
                            <div class="status-header">
                                <h3>Dataset: OSDU_Demo</h3>
                                <span class="status-badge pending">Pending Approval</span>
                            </div>
                            
                            <div class="dataset-meta">
                                <div class="meta-item">
                                    <span class="label">Company:</span>
                                    <span class="value">BAKER HUGHES</span>
                                </div>
                                <div class="meta-item">
                                    <span class="label">Created By:</span>
                                    <span class="value">recall_controller</span>
                                </div>
                                <div class="meta-item">
                                    <span class="label">Total Size:</span>
                                    <span class="value">6.3 MB</span>
                                </div>
                                <div class="meta-item">
                                    <span class="label">Files:</span>
                                    <span class="value">3 files processed</span>
                                </div>
                            </div>
                        </div>

                        <div class="quality-results">
                            <h4>Quality Check Results</h4>
                            <div class="results-grid">
                                <div class="result-item success">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <div>
                                        <div class="result-title">File Validation</div>
                                        <div class="result-desc">All files passed validation</div>
                                    </div>
                                </div>
                                
                                <div class="result-item success">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <div>
                                        <div class="result-title">Data Integrity</div>
                                        <div class="result-desc">No corruption detected</div>
                                    </div>
                                </div>
                                
                                <div class="result-item success">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <div>
                                        <div class="result-title">Format Compliance</div>
                                        <div class="result-desc">OSDU standards met</div>
                                    </div>
                                </div>
                                
                                <div class="result-item warning">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <div>
                                        <div class="result-title">Metadata</div>
                                        <div class="result-desc">1 optional field missing</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="approval-form">
                            <h4>Approval Notes</h4>
                            <textarea 
                                v-model="approvalNotes" 
                                placeholder="Add any notes or comments for this approval..."
                                class="approval-textarea"
                                rows="4"
                            ></textarea>
                            
                            <div class="approval-options">
                                <label class="checkbox-item">
                                    <input type="checkbox" v-model="publishImmediate" />
                                    <span class="checkmark"></span>
                                    Publish immediately after approval
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" v-model="notifyStakeholders" />
                                    <span class="checkmark"></span>
                                    Notify stakeholders of publication
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- File Review Panel -->
                <div class="files-panel">
                    <div class="panel-card">
                        <h2>Files Review</h2>
                        
                        <div class="files-list">
                            <div v-for="file in files" :key="file.id" class="file-item">
                                <div class="file-icon">
                                    <svg v-if="file.status === 'approved'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <svg v-else-if="file.status === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <div v-else class="file-placeholder">📄</div>
                                </div>
                                <div class="file-info">
                                    <div class="file-name">{{ file.name }}</div>
                                    <div class="file-details">
                                        <span class="file-size">{{ file.size }}</span>
                                        <span class="file-type">{{ file.type }}</span>
                                    </div>
                                </div>
                                <div class="file-status">
                                    <span :class="file.status">{{ formatStatus(file.status) }}</span>
                                </div>
                                <div class="file-actions">
                                    <button class="btn btn-ghost btn-sm" @click="reviewFile(file)">
                                        Review
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="approval-history">
                            <h4>Approval History</h4>
                            <div class="history-list">
                                <div class="history-item">
                                    <div class="history-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </div>
                                    <div class="history-info">
                                        <div class="history-action">Quality Check Completed</div>
                                        <div class="history-time">2 minutes ago by recall_controller</div>
                                    </div>
                                </div>
                                <div class="history-item">
                                    <div class="history-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </div>
                                    <div class="history-info">
                                        <div class="history-action">Data Loading Completed</div>
                                        <div class="history-time">5 minutes ago by system</div>
                                    </div>
                                </div>
                                <div class="history-item">
                                    <div class="history-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </div>
                                    <div class="history-info">
                                        <div class="history-action">Dataset Prepared</div>
                                        <div class="history-time">10 minutes ago by recall_controller</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import WorkflowProgress from '../Components/WorkflowProgress.vue';
import { useWellStore } from '../store/wellStore';

const router = useRouter();
const wellStore = useWellStore();

// Form data
const approvalNotes = ref('');
const publishImmediate = ref(true);
const notifyStakeholders = ref(true);

// Mock files data
const files = ref([
    {
        id: 1,
        name: 'WLC_PETRO_COMPUTED_INPUT_1-1100.LAS',
        size: '101.7 KB',
        type: 'LOG',
        status: 'approved'
    },
    {
        id: 2,
        name: 'FM_PRESS_COMPUTED_MWD_1-1100.LAS',
        size: '1.7 KB',
        type: 'LOG',
        status: 'approved'
    },
    {
        id: 3,
        name: '15_5.IF-11.6_03.LWD_EWL_MWD_REPORT_1-11...',
        size: '6.2 MB',
        type: 'BOREHOLE FILE',
        status: 'warning'
    }
]);

// Methods
const formatStatus = (status: string) => {
    switch (status) {
        case 'approved': return 'Approved';
        case 'warning': return 'Warning';
        case 'rejected': return 'Rejected';
        default: return 'Pending';
    }
};

const reviewFile = (file: any) => {
    // console.log('Reviewing file:', file.name);
};

const approveDataset = () => {
    // Advance workflow to publication stage and mark approval as completed
    wellStore.advanceWorkflow('publication', 'approval');
    
    console.log('[Approval] Dataset approved, advancing to publication stage');
    router.push('/data-publication');
};

const rejectDataset = () => {
    // Handle rejection logic
    // console.log('Dataset rejected');
};
</script>

<style scoped>
.data-approval-content {
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

.approval-main {
    padding: 2rem 1rem;
    max-width: 95vw;
    margin: 0 auto;
}

.approval-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.panel-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    border: 1px solid #e2e8f0;
}

.panel-card h2 {
    color: #0f172a;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
}

.approval-status {
    margin-bottom: 2rem;
}

.status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.status-header h3 {
    color: #1f2937;
    font-size: 1.125rem;
    font-weight: 600;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
}

.status-badge.pending {
    background: #fef3c7;
    color: #92400e;
}

.dataset-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}

.meta-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f3f4f6;
}

.meta-item .label {
    color: #6b7280;
    font-size: 0.875rem;
}

.meta-item .value {
    color: #1f2937;
    font-size: 0.875rem;
    font-weight: 500;
}

.quality-results {
    margin-bottom: 2rem;
}

.quality-results h4 {
    color: #1f2937;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.results-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}

.result-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.result-item.success {
    background: #f0fdf4;
    border-color: #22c55e;
    color: #166534;
}

.result-item.warning {
    background: #fef3c7;
    border-color: #f59e0b;
    color: #92400e;
}

.result-title {
    font-weight: 500;
    font-size: 0.875rem;
}

.result-desc {
    font-size: 0.75rem;
    opacity: 0.8;
}

.approval-form h4 {
    color: #1f2937;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.approval-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    resize: vertical;
    margin-bottom: 1rem;
}

.approval-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.approval-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #374151;
    font-size: 0.875rem;
    cursor: pointer;
}

.checkbox-item input {
    margin: 0;
    accent-color: #3b82f6;
}

.files-list {
    margin-bottom: 2rem;
}

.file-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border-bottom: 1px solid #f3f4f6;
    transition: background-color 0.2s ease;
}

.file-item:hover {
    background: #f8fafc;
}

.file-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.file-icon .approved {
    color: #22c55e;
}

.file-icon .warning {
    color: #f59e0b;
}

.file-info {
    flex: 1;
}

.file-name {
    font-size: 0.875rem;
    color: #1f2937;
    font-weight: 500;
    margin-bottom: 0.25rem;
}

.file-details {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: #6b7280;
}

.file-status span {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: 500;
}

.file-status .approved {
    background: #dcfce7;
    color: #166534;
}

.file-status .warning {
    background: #fef3c7;
    color: #92400e;
}

.approval-history h4 {
    color: #1f2937;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.history-list {
    max-height: 200px;
    overflow-y: auto;
}

.history-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f3f4f6;
}

.history-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #dcfce7;
    color: #166534;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.history-action {
    font-size: 0.875rem;
    color: #1f2937;
    font-weight: 500;
}

.history-time {
    font-size: 0.75rem;
    color: #6b7280;
}

.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
}

.btn-primary:hover {
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-outline {
    background: white;
    color: #ef4444;
    border: 2px solid #ef4444;
}

.btn-outline:hover {
    background: #ef4444;
    color: white;
}

.btn-ghost {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
}

.btn-ghost:hover {
    background: #e5e7eb;
}

.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
}

@media (max-width: 1024px) {
    .approval-grid {
        grid-template-columns: 1fr;
    }
    
    .results-grid {
        grid-template-columns: 1fr;
    }
}
</style> 
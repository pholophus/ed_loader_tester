<template>
    <div class="data-publication-content">
        <!-- Header -->
        <header class="page-header">
            <div class="header-nav">
                <router-link to="/data-approval" class="back-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Back to Approval
                </router-link>
                <div class="header-actions">
                    <button class="btn btn-outline" @click="goToDashboard">Return to Dashboard</button>
                    <button class="btn btn-primary" @click="publishDataset" :disabled="!canPublish">
                        Publish Dataset
                    </button>
                </div>
            </div>
            <div class="header-title">
                <h1>Data Publication</h1>
                <p>Publish your approved dataset to make it available</p>
            </div>
            
            <!-- Workflow Progress -->
            <WorkflowProgress 
                :current-stage="'publication'"
                :completed-stages="['preparation', 'loading', 'quality-check', 'approval']"
            />
        </header>

        <main class="publication-main">
            <div class="publication-grid">
                <!-- Publication Settings Panel -->
                <div class="settings-panel">
                    <div class="panel-card">
                        <h2>Publication Settings</h2>
                        
                        <div class="publication-status" :class="{ published: isPublished }">
                            <div class="status-header">
                                <h3>Dataset: OSDU_Demo</h3>
                                <span class="status-badge" :class="{ published: isPublished, ready: !isPublished }">
                                    {{ isPublished ? 'Published' : 'Ready to Publish' }}
                                </span>
                            </div>
                            
                            <div v-if="isPublished" class="published-info">
                                <div class="published-meta">
                                    <div class="meta-item">
                                        <span class="label">Published On:</span>
                                        <span class="value">{{ publishedDate }}</span>
                                    </div>
                                    <div class="meta-item">
                                        <span class="label">Published By:</span>
                                        <span class="value">{{ publishedBy }}</span>
                                    </div>
                                    <div class="meta-item">
                                        <span class="label">Dataset URL:</span>
                                        <a :href="publishedUrl" class="value link">{{ publishedUrl }}</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="publication-options" v-if="!isPublished">
                            <h4>Publication Options</h4>
                            
                            <div class="form-group">
                                <label>Visibility</label>
                                <select v-model="visibility" class="form-select">
                                    <option value="public">Public - Available to all users</option>
                                    <option value="organization">Organization - Available to organization members</option>
                                    <option value="private">Private - Available to specific users only</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Categories</label>
                                <div class="checkbox-group">
                                    <label class="checkbox-item">
                                        <input type="checkbox" v-model="categories.well" />
                                        <span class="checkmark"></span>
                                        Well Data
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" v-model="categories.seismic" />
                                        <span class="checkmark"></span>
                                        Seismic Data
                                    </label>
                                    <label class="checkbox-item">
                                        <input type="checkbox" v-model="categories.geological" />
                                        <span class="checkmark"></span>
                                        Geological Data
                                    </label>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Description</label>
                                <textarea 
                                    v-model="description" 
                                    placeholder="Add a description for this published dataset..."
                                    class="form-textarea"
                                    rows="4"
                                ></textarea>
                            </div>

                            <div class="form-group">
                                <label>Tags</label>
                                <input 
                                    type="text" 
                                    v-model="tags" 
                                    placeholder="Enter tags separated by commas"
                                    class="form-input"
                                />
                            </div>
                        </div>

                        <div class="publication-notifications" v-if="!isPublished">
                            <h4>Notifications</h4>
                            <div class="checkbox-group">
                                <label class="checkbox-item">
                                    <input type="checkbox" v-model="notifications.email" />
                                    <span class="checkmark"></span>
                                    Send email notifications to stakeholders
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" v-model="notifications.api" />
                                    <span class="checkmark"></span>
                                    Trigger API webhooks
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" v-model="notifications.dashboard" />
                                    <span class="checkmark"></span>
                                    Show in organization dashboard
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Publication Summary Panel -->
                <div class="summary-panel">
                    <div class="panel-card">
                        <h2>Publication Summary</h2>
                        
                        <div class="dataset-overview">
                            <div class="overview-stats">
                                <div class="stat-card">
                                    <div class="stat-icon">📊</div>
                                    <div class="stat-info">
                                        <div class="stat-value">3</div>
                                        <div class="stat-label">Files</div>
                                    </div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-icon">💾</div>
                                    <div class="stat-info">
                                        <div class="stat-value">6.3 MB</div>
                                        <div class="stat-label">Total Size</div>
                                    </div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-icon">🏢</div>
                                    <div class="stat-info">
                                        <div class="stat-value">BAKER HUGHES</div>
                                        <div class="stat-label">Company</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="files-summary">
                            <h4>Files to be Published</h4>
                            <div class="files-list">
                                <div v-for="file in files" :key="file.id" class="file-item">
                                    <div class="file-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </div>
                                    <div class="file-info">
                                        <div class="file-name">{{ file.name }}</div>
                                        <div class="file-details">
                                            <span class="file-size">{{ file.size }}</span>
                                            <span class="file-type">{{ file.type }}</span>
                                        </div>
                                    </div>
                                    <div class="file-status">
                                        <span class="ready">Ready</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="isPublished" class="publication-success">
                            <div class="success-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" fill="#22c55e"/>
                                    <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <h3>Dataset Successfully Published!</h3>
                            <p>Your dataset is now available and accessible to authorized users.</p>
                            
                            <div class="success-actions">
                                <button class="btn btn-outline" @click="viewPublishedDataset">
                                    View Published Dataset
                                </button>
                                <button class="btn btn-ghost" @click="copyDatasetUrl">
                                    Copy Dataset URL
                                </button>
                            </div>
                        </div>

                        <div v-if="!isPublished" class="pre-publish-checklist">
                            <h4>Pre-Publication Checklist</h4>
                            <div class="checklist">
                                <div class="checklist-item completed">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span>Data preparation completed</span>
                                </div>
                                <div class="checklist-item completed">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span>Files loaded successfully</span>
                                </div>
                                <div class="checklist-item completed">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span>Quality checks passed</span>
                                </div>
                                <div class="checklist-item completed">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <span>Dataset approved</span>
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import WorkflowProgress from '../Components/WorkflowProgress.vue';

const router = useRouter();

// Publication state
const isPublished = ref(false);
const publishedDate = ref('');
const publishedBy = ref('recall_controller');
const publishedUrl = ref('');

// Form data
const visibility = ref('public');
const description = ref('');
const tags = ref('well-data, baker-hughes, osdu');

const categories = ref({
    well: true,
    seismic: false,
    geological: false
});

const notifications = ref({
    email: true,
    api: true,
    dashboard: true
});

// Mock files data
const files = ref([
    {
        id: 1,
        name: 'WLC_PETRO_COMPUTED_INPUT_1-1100.LAS',
        size: '101.7 KB',
        type: 'LOG'
    },
    {
        id: 2,
        name: 'FM_PRESS_COMPUTED_MWD_1-1100.LAS',
        size: '1.7 KB',
        type: 'LOG'
    },
    {
        id: 3,
        name: '15_5.IF-11.6_03.LWD_EWL_MWD_REPORT_1-11...',
        size: '6.2 MB',
        type: 'BOREHOLE FILE'
    }
]);

// Computed
const canPublish = computed(() => {
    return !isPublished.value && description.value.trim() !== '';
});

// Methods
const publishDataset = () => {
    if (!canPublish.value) return;
    
    // Simulate publication process
    isPublished.value = true;
    publishedDate.value = new Date().toLocaleString();
    publishedUrl.value = `https://osdu.example.com/datasets/OSDU_Demo_${Date.now()}`;
    
    console.log('Dataset published successfully!');
};

const goToDashboard = () => {
    router.push('/');
};

const viewPublishedDataset = () => {
    window.open(publishedUrl.value, '_blank');
};

const copyDatasetUrl = () => {
    navigator.clipboard.writeText(publishedUrl.value);
    console.log('Dataset URL copied to clipboard');
};
</script>

<style scoped>
.data-publication-content {
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

.publication-main {
    padding: 2rem 1rem;
    max-width: 95vw;
    margin: 0 auto;
}

.publication-grid {
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

.publication-status {
    margin-bottom: 2rem;
}

.publication-status.published {
    border: 2px solid #22c55e;
    border-radius: 8px;
    padding: 1rem;
    background: #f0fdf4;
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

.status-badge.ready {
    background: #dbeafe;
    color: #1e40af;
}

.status-badge.published {
    background: #dcfce7;
    color: #166534;
}

.published-meta {
    display: grid;
    gap: 0.5rem;
}

.meta-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e5e7eb;
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

.meta-item .link {
    color: #3b82f6;
    text-decoration: underline;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    color: #374151;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
}

.form-input,
.form-select,
.form-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    background: white;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
    resize: vertical;
    min-height: 80px;
}

.checkbox-group {
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

.publication-options h4,
.publication-notifications h4 {
    color: #1f2937;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.overview-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.stat-icon {
    font-size: 1.5rem;
}

.stat-value {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
}

.stat-label {
    font-size: 0.75rem;
    color: #6b7280;
}

.files-summary h4 {
    color: #1f2937;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
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
    color: #6b7280;
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

.file-status .ready {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: 500;
    background: #dbeafe;
    color: #1e40af;
}

.publication-success {
    text-align: center;
    padding: 2rem;
    border: 2px solid #22c55e;
    border-radius: 12px;
    background: #f0fdf4;
}

.success-icon {
    margin-bottom: 1rem;
}

.publication-success h3 {
    color: #166534;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.publication-success p {
    color: #16a34a;
    margin-bottom: 1.5rem;
}

.success-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
}

.pre-publish-checklist h4 {
    color: #1f2937;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.checklist {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.checklist-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #166534;
    font-size: 0.875rem;
}

.checklist-item.completed svg {
    color: #22c55e;
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
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
}

.btn-primary:hover {
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    background: #9ca3af;
}

.btn-outline {
    background: white;
    color: #3b82f6;
    border: 2px solid #3b82f6;
}

.btn-outline:hover {
    background: #3b82f6;
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

@media (max-width: 1024px) {
    .publication-grid {
        grid-template-columns: 1fr;
    }
    
    .overview-stats {
        grid-template-columns: 1fr;
    }
}
</style> 
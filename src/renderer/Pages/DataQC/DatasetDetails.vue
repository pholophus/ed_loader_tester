<template>
    <div class="details-panel">
        <div class="panel-card">
            <div class="panel-header">
                <h2>Details</h2>
                <button class="expand-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            
            <!-- Details Tabs -->
            <div class="tabs">
                <button class="tab" :class="{ active: detailsTab === 'metadata' }" @click="detailsTab = 'metadata'">
                    Metadata
                </button>
                <button class="tab" :class="{ active: detailsTab === 'event-log' }" @click="detailsTab = 'event-log'">
                    Event Log
                </button>
            </div>
            
            <!-- Metadata Tab -->
            <div v-if="detailsTab === 'metadata'" class="tab-content">
                <div class="metadata-info">
                    <div class="info-row">
                        <label>Data Source:</label>
                        <span>{{ dataSource || 'BAKER HUGHES' }}</span>
                    </div>
                    <div class="info-row">
                        <label>Region:</label>
                        <span>{{ region || '' }}</span>
                    </div>
                    <div class="info-row">
                        <label>Created:</label>
                        <span>{{ createdDate || '2021-03-11 10:57:20' }} by {{ createdBy || 'recall_controller' }}</span>
                    </div>
                    <div class="info-row">
                        <label>Loaded:</label>
                        <span>{{ loadedDate || '2021-03-11 10:57:20' }} by {{ loadedBy || 'recall_controller' }}</span>
                    </div>
                    <div class="info-row">
                        <label>Approved:</label>
                        <span>{{ approvedStatus || 'NotRequired' }}</span>
                    </div>
                    <div class="info-row">
                        <label>Last Updated:</label>
                        <span>{{ lastUpdated || '2021-03-11 10:57:20' }} by {{ lastUpdatedBy || 'recall_controller' }}</span>
                    </div>
                </div>
            </div>
            
            <!-- Event Log Tab -->
            <div v-if="detailsTab === 'event-log'" class="tab-content">
                <div class="event-log-area">
                    <!-- <div class="loading-indicator">
                        <div class="loading-circle">
                            <div class="spinner"></div>
                        </div>
                        <p>Loading...</p>
                    </div> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Props for receiving data from parent component
interface Props {
    dataSource?: string;
    region?: string;
    createdDate?: string;
    createdBy?: string;
    loadedDate?: string;
    loadedBy?: string;
    approvedStatus?: string;
    lastUpdated?: string;
    lastUpdatedBy?: string;
}

const props = withDefaults(defineProps<Props>(), {
    dataSource: 'BAKER HUGHES',
    region: '',
    createdDate: '2021-03-11 10:57:20',
    createdBy: 'recall_controller',
    loadedDate: '2021-03-11 10:57:20',
    loadedBy: 'recall_controller',
    approvedStatus: 'NotRequired',
    lastUpdated: '2021-03-11 10:57:20',
    lastUpdatedBy: 'recall_controller'
});

// Tab management - local to this component
const detailsTab = ref('metadata');
</script>

<style scoped>
.details-panel {
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

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>

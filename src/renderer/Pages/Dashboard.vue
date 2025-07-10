<template>
    <div class="dashboard-content">
        <header class="dashboard-header">
            <h1>ED Loader Data Ingestor</h1>
            <p>Manage your data uploads and processing</p>
        </header>

        <main class="dashboard-main">
            <div class="action-cards">
                <div class="card">
                    <h3>Initiate Ingestion</h3>
                    <p>Choose target from the list below</p>
                    <div class="custom-select-wrapper">
                        <select class="custom-select" v-model="selectedTarget">
                            <option value="" disabled>Select a target</option>
                            <option value="well">Well Data</option>
                            <option value="seismic">Seismic Data</option>
                        </select>
                        <div class="select-arrow">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <!-- <router-link to="/upload" class="btn btn-primary">
                        Start Upload
                    </router-link> -->
                </div>

                <!-- <div class="card">
                    <h3>View Data</h3>
                    <p>Browse and manage your uploaded files</p>
                    <button class="btn btn-secondary" disabled>
                        Coming Soon
                    </button>
                </div>

                <div class="card">
                    <h3>Process Data</h3>
                    <p>Run processing scripts on your data</p>
                    <button class="btn btn-secondary" disabled>
                        Coming Soon
                    </button>
                </div> -->
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '../store/settingsStore';
import { useAuth } from '../Composables/useAuth';
import { useUserStore } from '@/store/userStore';

const router = useRouter();
const settingsStore = useSettingsStore();
const userStore = useUserStore();
const selectedTarget = ref('');

onMounted(() => {
    console.log("Current user from store", userStore.getUser);
});

// Watch for changes in selectedTarget and save to store + navigate to DataPreparation page
watch(selectedTarget, (newTarget) => {
    if (newTarget) {
        // Save to pinia store
        settingsStore.setSelectedTarget(newTarget);

        if(newTarget === 'well') {
            router.push({
                path: '/well/data-preparation',
                query: { target: newTarget }
            });
        } else if(newTarget === 'seismic') {
            router.push({
                path: '/seismic/data-preparation',
                query: { target: newTarget }
            });
        }
    }
});
</script>

<style scoped>
.dashboard-content {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    min-height: calc(100vh - 104px); /* Subtract header and footer height */
    padding: 2rem;
}

.dashboard-header {
    text-align: center;
    color: #1e293b;
    margin-bottom: 3rem;
}

.dashboard-header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #0f172a;
    background: linear-gradient(135deg, #1e293b 0%, #6366f1 50%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.dashboard-header p {
    font-size: 1.2rem;
    opacity: 0.7;
    color: #475569;
}

.dashboard-main {
    max-width: 1200px;
    margin: 0 auto;
}

.action-cards {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
}

.card {
    background: white;
    border-radius: 12px;
    padding: 2.5rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    text-align: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;
    overflow: hidden;
    width: 350px;
    max-width: 90vw;
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1px solid #e2e8f0;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.15);
    border-color: #c4b5fd;
}

.card h3 {
    color: #0f172a;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
}

.card p {
    color: #64748b;
    margin-bottom: 1.5rem;
    line-height: 1.5;
    font-weight: 400;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    display: inline-block;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
}

.btn-primary:hover {
    background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
}

.btn-secondary {
    background: #e5e7eb;
    color: #6b7280;
}

.btn-secondary:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.custom-select-wrapper {
    position: relative;
    margin-bottom: 1.5rem;
}

.custom-select {
    width: 100%;
    padding: 1rem 3rem 1rem 1.25rem;
    font-size: 1rem;
    font-weight: 500;
    color: #1e293b;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.custom-select:hover {
    border-color: #c4b5fd;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);
}

.custom-select:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.custom-select option {
    padding: 0.75rem;
    font-weight: 500;
    background: white;
    color: #1e293b;
}

.custom-select option:disabled {
    color: #94a3b8;
    font-style: italic;
}

.select-arrow {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #64748b;
    transition: all 0.2s ease;
}

.custom-select:hover + .select-arrow {
    color: #8b5cf6;
}

.custom-select:focus + .select-arrow {
    color: #6366f1;
    transform: translateY(-50%) rotate(180deg);
}

/* Enhanced card styling when containing the select */
.card:has(.custom-select:focus) {
    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.2);
    transform: translateY(-6px);
    border-color: #8b5cf6;
}

/* Enhanced card styling */
.card::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 13px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
}

.card:hover::before {
    opacity: 0.08;
}
</style>
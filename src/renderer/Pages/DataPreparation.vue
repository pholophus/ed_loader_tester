<template>
    <div class="data-ingest-content">
        <!-- Header -->
        <header class="page-header">
            <div class="header-nav">
                <router-link to="/" class="back-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Back to Dashboard
                </router-link>
                <div class="header-actions">
                    <!-- <button class="btn btn-ghost" @click="resetForm">Reset</button> -->
                    <button class="btn btn-primary" @click="saveDataset" :disabled="!isFormValid">Save</button>
                    <button class="btn btn-primary" @click="prepareDataset" :disabled="!canPrepareDataset">Prepare</button>
                </div>
            </div>
            <div class="header-title">
                <h1>{{ selectedTarget === 'well' ? 'Well Data' : 'Seismic Data' }} Ingest</h1>
                <p>Configure your dataset properties and upload files</p>
            </div>
            
            <!-- Workflow Progress -->
            <!-- <WorkflowProgress 
                :current-stage="'preparation'"
                :completed-stages="[]"
            /> -->
        </header>

        <main class="ingest-main">
            <div class="ingest-grid">
                <!-- Properties Panel -->
                <div class="properties-panel">
                    <div class="panel-card">
                        <h2>Properties</h2>
                        
                        <!-- <div class="form-group">
                            <div class="form-row">
                                <label>Dataset Name</label>
                                <input 
                                    type="text" 
                                    v-model="datasetName" 
                                    placeholder="Enter dataset name"
                                    class="form-input"
                                />
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="form-row">
                                <label>Dataset ID</label>
                                <input 
                                    type="text" 
                                    v-model="datasetId" 
                                    placeholder="Auto-generated"
                                    class="form-input"
                                    readonly
                                />
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="form-row">
                                <label>Description</label>
                                <textarea 
                                    v-model="description" 
                                    placeholder="Enter description"
                                    class="form-textarea"
                                    rows="3"
                                ></textarea>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="form-row">
                                <label>Data Source</label>
                                <input 
                                    type="text" 
                                    v-model="dataSource" 
                                    placeholder="e.g., BAKER HUGHES"
                                    class="form-input"
                                />
                            </div>
                        </div> -->

                        <div class="form-group" v-if="selectedTarget === 'well'">
                            <div class="form-row">
                                <label>Target Well</label>
                                <div class="select-with-search">
                                    <select v-model="targetWell" class="form-select">
                                        <option value="">Select a Well</option>
                                        <option value="well-001">Well 001</option>
                                        <option value="well-002">Well 002</option>
                                        <option value="well-003">Well 003</option>
                                    </select>
                                    <button class="search-btn" @click="searchWells">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                                            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- <div class="form-group" v-if="selectedTarget === 'well'">
                            <div class="form-row">
                                <label>Wellbore</label>
                                <select v-model="wellbore" class="form-select">
                                    <option value="">Select a Wellbore</option>
                                    <option value="wellbore-001">Wellbore 001</option>
                                    <option value="wellbore-002">Wellbore 002</option>
                                </select>
                            </div>
                        </div> -->

                        <div class="metadata-section">
                            <div class="metadata-header">
                                <label>Metadata File</label>
                                <div class="metadata-actions">
                                    <button class="btn btn-outline btn-sm" @click="browseMetadata">
                                        Browse
                                    </button>
                                    <button class="btn btn-link btn-sm" @click="downloadTemplate">
                                        Download template
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="options-section">
                            <h3>Options</h3>
                            <div class="checkbox-group">
                                <label class="checkbox-item">
                                    <input type="checkbox" v-model="options.extractFiles" />
                                    <span class="checkmark"></span>
                                    Extract files from archive (.zip, .rar, .tar)
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" v-model="options.loadDirectlyToDBAfterExtract" />
                                    <span class="checkmark"></span>
                                    Load files directly to staging database after registration
                                </label>
                                <label class="checkbox-item">
                                    <input type="checkbox" v-model="options.publishAuto" />
                                    <span class="checkmark"></span>
                                    Publish files automatically after loading and QC
                                </label>
                            </div>

                            <div class="form-group my-2">
                                <label>If faulty files are found during processing</label>
                                <div class="radio-group">
                                    <label class="radio-item">
                                        <input type="radio" value="quarantine" v-model="faultyFileAction" />
                                        <span class="radio-mark"></span>
                                        Quarantine faulty files and continue processing
                                    </label>
                                    <label class="radio-item">
                                        <input type="radio" value="stop" v-model="faultyFileAction" />
                                        <span class="radio-mark"></span>
                                        Stop processing and mark dataset as failed
                                    </label>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Process Priority</label>
                                <select v-model="processPriority" class="form-select">
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Files Panel -->
                <div class="files-panel">
                    <div class="panel-card">
                        <div class="files-header">
                            <h2>Files</h2>
                            <p>Select or drag and drop files to add to dataset</p>
                            <div class="files-actions">
                                <button class="btn btn-outline" @click="selectFiles">
                                    Select Files
                                </button>
                                <button 
                                    class="btn btn-ghost btn-sm" 
                                    @click="removeSelectedFiles"
                                    :disabled="selectedFiles.length === 0"
                                >
                                    Remove Selected ({{ selectedFiles.length }})
                                </button>
                            </div>
                        </div>

                        <div class="files-table-header">
                            <div class="col-select">
                                <input 
                                    type="checkbox" 
                                    :checked="selectAllChecked"
                                    @change="toggleSelectAll"
                                    class="select-checkbox"
                                    :indeterminate="selectAllIndeterminate"
                                />
                            </div>
                            <div class="col-filename">File Name</div>
                            <div class="col-size">Size</div>
                            <div class="col-progress">Upload Progress</div>
                        </div>

                        <div class="files-upload-area" @drop="onDrop" @dragover="onDragOver" @dragleave="onDragLeave">
                            <div class="upload-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <h3>Drag and drop files to upload</h3>
                            <p>or click to browse</p>
                        </div>

                        <div v-if="uploadedFiles.length > 0" class="files-list">
                            <div v-for="file in uploadedFiles" :key="file.id" class="file-item">
                                <div class="file-select">
                                    <input 
                                        type="checkbox" 
                                        :value="file.id"
                                        v-model="selectedFiles"
                                        class="select-checkbox"
                                    />
                                </div>
                                <div class="file-info">
                                    <span class="file-name">{{ file.name }}</span>
                                </div>
                                <div class="file-size">{{ formatFileSize(file.size) }}</div>
                                <div class="file-progress">
                                    <div class="progress-bar" v-if="file.progress < 100">
                                        <div class="progress-fill" :style="{ width: file.progress + '%' }"></div>
                                    </div>
                                    <div v-if="file.progress < 100" class="progress-text">{{ file.progress }}%</div>
                                    <div v-else class="upload-complete">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="check-icon">
                                            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                        <span>Upload complete</span>
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
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFileStore } from '../store/fileStore';
import WorkflowProgress from '../Components/WorkflowProgress.vue';

const route = useRoute();
const router = useRouter();
const fileStore = useFileStore();

// Get selected target from route params or query
const selectedTarget = ref(route.query.target as string || 'well');

// Form data
const datasetName = ref('');
const datasetId = ref('');
const description = ref('');
const dataSource = ref('');
const targetWell = ref('');
const wellbore = ref('');
const processPriority = ref('normal');
const faultyFileAction = ref('quarantine');

// Options
const options = ref({
    extractFiles: true,
    loadDirectlyToDBAfterExtract: false,
    publishAuto: false
});

// Files
const uploadedFiles = ref<Array<{
    id: string;
    name: string;
    size: number;
    progress: number;
    path?: string;
}>>([]);

// Selected files
const selectedFiles = ref<string[]>([]);

// Computed
const isFormValid = computed(() => {
    return datasetName.value.trim() !== '' && dataSource.value.trim() !== '';
});

const selectAllChecked = computed(() => {
    return uploadedFiles.value.length > 0 && selectedFiles.value.length === uploadedFiles.value.length;
});

const selectAllIndeterminate = computed(() => {
    return selectedFiles.value.length > 0 && selectedFiles.value.length < uploadedFiles.value.length;
});

const canPrepareDataset = computed(() => {
    return uploadedFiles.value.length > 0;
});

// Methods
const generateDatasetId = () => {
    datasetId.value = Math.random().toString(36).substr(2, 8).toUpperCase();
};

// const resetForm = () => {
//     datasetName.value = '';
//     description.value = '';
//     dataSource.value = '';
//     targetWell.value = '';
//     wellbore.value = '';
//     uploadedFiles.value = [];
//     selectedFiles.value = [];
//     generateDatasetId();
// };

const saveDataset = () => {
    if (!isFormValid.value) return;
    // Save logic here
    // console.log('Saving dataset...');
};

const selectFiles = async () => {
    try {
        const result = await (window as any).electronAPI.openFile();
        if (!result.canceled && result.filePaths.length > 0) {
            // Read file information for each selected file
            const filePromises = result.filePaths.map(async (filePath: string) => {
                try {
                    const stats = await (window as any).electronAPI.getFileStats(filePath);
                    return {
                        name: stats.name,
                        path: stats.path,
                        size: stats.size
                    };
                } catch (error) {
                    console.error('Error reading file stats:', filePath, error);
                    const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || filePath;
                    return {
                        name: fileName,
                        path: filePath,
                        size: 0
                    };
                }
            });
            
            const fileInfos = await Promise.all(filePromises);
            addFilesFromPaths(fileInfos);
        }
    } catch (error) {
        console.error('Error selecting files:', error);
    }
};

const addFiles = (files: File[]) => {
    files.forEach(file => {
        uploadedFiles.value.push({
            id: Math.random().toString(36),
            name: file.name,
            size: file.size,
            progress: 100, // Simulate completed upload
            path: (file as any).path || (file as any).webkitRelativePath || file.name // Capture file path if available
        });
    });
};

const addFilesFromPaths = (fileInfos: Array<{name: string, path: string, size: number}>) => {
    fileInfos.forEach(fileInfo => {
        uploadedFiles.value.push({
            id: Math.random().toString(36),
            name: fileInfo.name,
            size: fileInfo.size,
            progress: 100, // Simulate completed upload
            path: fileInfo.path
        });
    });
};

const removeSelectedFiles = () => {
    uploadedFiles.value = uploadedFiles.value.filter(file => !selectedFiles.value.includes(file.id));
    selectedFiles.value = [];
};

const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files) {
        // Note: Drag and drop files won't have full file paths due to browser security restrictions
        // Only the file name will be available
        console.warn('Note: Files added via drag-and-drop may not have full file paths available');
        addFiles(Array.from(files));
    }
};

const onDragOver = (e: DragEvent) => {
    e.preventDefault();
};

const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const searchWells = () => {
    // console.log('Searching wells...');
};

const browseMetadata = () => {
    // console.log('Browse metadata...');
};

const downloadTemplate = () => {
    // console.log('Download template...');
};

const toggleSelectAll = () => {
    if (selectAllChecked.value) {
        selectedFiles.value = uploadedFiles.value.map(file => file.id);
    } else {
        selectedFiles.value = [];
    }
};

const prepareDataset = () => {
    if (!canPrepareDataset.value) return;
    
    // Store selected files in data store
    const filesToStore = uploadedFiles.value.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        progress: file.progress,
        path: file.path || file.name
    }));

    console.log('[DataPreparation] Files to store:', filesToStore);
    
    fileStore.setSelectedFiles(filesToStore);
    
    // Navigate to DataQC page with form data
    router.push({
        path: '/data-loading',
        query: {
            datasetName: datasetName.value,
            datasetId: datasetId.value,
            company: dataSource.value, // Using dataSource as company
            createdBy: 'recall_controller',
            uploadedDate: new Date().toLocaleString(),
            totalSize: calculateTotalSize(),
            description: description.value,
            dataSource: dataSource.value
        }
    });
};

const calculateTotalSize = () => {
    if (uploadedFiles.value.length === 0) return '0 MB';
    const totalBytes = uploadedFiles.value.reduce((sum, file) => sum + file.size, 0);
    return formatFileSize(totalBytes);
};

// Lifecycle
onMounted(() => {
    generateDatasetId();
});
</script>

<style scoped>
.data-ingest-content {
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
    color: #8b5cf6;
    background: #faf5ff;
    transform: translateX(-2px);
}

.header-actions {
    display: flex;
    gap: 0.75rem;
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

.ingest-main {
    padding: 2rem 1rem;
    max-width: 95vw;
    margin: 0 auto;
}

.ingest-grid {
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
    transition: all 0.2s ease;
}

.panel-card:hover {
    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.08);
    border-color: #e9d5ff;
}

.panel-card h2 {
    color: #0f172a;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-row {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.form-group label {
    display: block;
    color: #374151;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.8rem;
}

.form-row label {
    margin-bottom: 0;
    padding-top: 0.75rem;
}

.form-input,
.form-select,
.form-textarea {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.85rem;
    background: white;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-input:hover, .form-textarea:hover, .form-select:hover {
    border-color: #c4b5fd;
}

.form-textarea {
    resize: vertical;
    min-height: 80px;
}

.select-with-search {
    display: flex;
    gap: 0.5rem;
    flex: 1;
}

.search-btn {
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    background: white;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;
}

.search-btn:hover {
    border-color: #8b5cf6;
    background: #faf5ff;
    color: #8b5cf6;
}

.metadata-section {
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    background: #f9fafb;
    transition: all 0.2s ease;
}

.metadata-section:hover {
    border-color: #c4b5fd;
    background: #faf5ff;
}

.metadata-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.metadata-actions {
    display: flex;
    gap: 0.5rem;
}

.options-section h3 {
    color: #1f2937;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.checkbox-group, .radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.checkbox-item, .radio-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    color: #374151;
    font-size: 0.75rem;
    margin-bottom: 0.75rem;
    cursor: pointer;
    line-height: 1.4;
}

.checkbox-item:hover, .radio-item:hover {
    background: #faf5ff;
}

.checkbox-item input, .radio-item input {
    margin: 0;
    accent-color: #8b5cf6;
}

.files-header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.files-header h2 {
    color: #0f172a;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.files-header p {
    color: #64748b;
    font-size: 0.8rem;
    margin-bottom: 1rem;
}

.files-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
}

.files-table-header {
    display: grid;
    grid-template-columns: 40px 2fr 100px 120px 100px 80px;
    gap: 1rem;
    padding: 0.6rem 1rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    font-weight: 600;
    font-size: 0.75rem;
    color: #374151;
}

.files-upload-area {
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    padding: 3rem 2rem;
    text-align: center;
    transition: all 0.2s ease;
    cursor: pointer;
    margin: 1rem 0;
    background: #fafbfc;
}

.files-upload-area:hover {
    border-color: #8b5cf6;
    background: #faf5ff;
}

.upload-icon {
    color: #9ca3af;
    margin-bottom: 1rem;
    transition: color 0.2s ease;
}

.files-upload-area:hover .upload-icon {
    color: #8b5cf6;
}

.files-upload-area h3 {
    color: #374151;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.files-upload-area p {
    color: #6b7280;
    font-size: 0.9rem;
}

.files-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
}

.file-item {
    display: grid;
    grid-template-columns: 40px 1fr 100px 150px;
    gap: 1rem;
    padding: 0.75rem;
    border-bottom: 1px solid #f3f4f6;
    align-items: center;
    background: white;
}

.file-item:last-child {
    border-bottom: none;
}

.file-item:hover {
    background: #faf5ff;
}

.file-name {
    font-weight: 500;
    color: #1f2937;
    font-size: 0.8rem;
}

.file-size {
    color: #6b7280;
    font-size: 0.7rem;
}

.file-type {
    font-size: 0.75rem;
    color: #6b7280;
}

.progress-bar {
    background: #e5e7eb;
    border-radius: 3px;
    height: 6px;
    overflow: hidden;
    margin-bottom: 0.25rem;
}

.progress-fill {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    height: 100%;
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
}

.upload-complete {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #16a34a;
    font-size: 0.85rem;
    font-weight: 500;
}

.check-icon {
    width: 16px;
    height: 16px;
    color: #16a34a;
}

.btn {
    padding: 0.4rem 0.8rem;
    border: none;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
}

.btn-primary:hover {
    background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
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
    color: #374151;
    border: 2px solid #e5e7eb;
}

.btn-outline:hover {
    border-color: #8b5cf6;
    background: #faf5ff;
    color: #8b5cf6;
}

.btn-ghost {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
}

.btn-ghost:hover {
    background: #faf5ff;
    color: #8b5cf6;
    border-color: #c4b5fd;
}

.btn-link {
    background: none;
    color: #8b5cf6;
    text-decoration: underline;
    padding: 0.25rem 0.5rem;
}

.btn-link:hover {
    color: #7c3aed;
}

.btn-sm {
    padding: 0.3rem 0.6rem;
    font-size: 0.7rem;
}

.col-select,
.file-select {
    display: flex;
    justify-content: center;
    align-items: center;
}

.select-checkbox {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #8b5cf6;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #9ca3af;
    color: white;
}

@media (max-width: 1024px) {
    .ingest-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    
    .files-table-header,
    .file-item {
        grid-template-columns: 30px 1fr 80px 120px;
        font-size: 0.8rem;
    }
}
</style> 
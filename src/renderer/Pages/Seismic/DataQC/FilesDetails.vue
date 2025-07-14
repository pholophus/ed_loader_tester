<template>
    <div class="files-details-panel">
        <div class="panel-card">
            <div class="panel-header">
                <h2>Details</h2>
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
                <div class="header-actions">
                    <button class="btn btn-primary btn-sm">Update</button>
                    <button class="btn btn-outline btn-sm">Reset</button>
                </div>
                <div class="file-metadata">
                    <!-- Selected Row Info -->
                    <!-- <div v-if="selectedRowIndex !== null" class="form-group">
                        <label>Selected Row Index</label>
                        <span class="form-value">{{ selectedRowIndex }}</span>
                    </div> -->

                    <div v-if="selectedMetadata" class="form-group">
                        <label>File Name</label>
                        <span class="form-value">{{ selectedMetadata.name || 'N/A' }}</span>
                    </div>

                    <div v-if="selectedMetadata" class="form-group">
                        <label>File Size</label>
                        <span class="form-value">{{ selectedMetadata?.size ? formatFileSize(selectedMetadata.size) : 'N/A' }}</span>
                    </div>

                    <div v-if="selectedMetadata" class="form-group">
                        <label>File Path</label>
                        <span class="form-value">{{ selectedMetadata?.path || 'N/A' }}</span>
                    </div>

                    <div v-if="selectedMetadata" class="form-group">
                        <label>File Format</label>
                        <span class="form-value">{{ selectedMetadata?.fileFormat || 'N/A' }}</span>
                    </div>

                    <div v-if="selectedMetadata && seismicStore.data.isForUploadingFileForExistingSeismic" class="form-group">
                        <label>Line ID</label>
                        <span class="form-value">{{ selectedMetadata?.lineId || 'N/A' }}</span>
                    </div>

                    <div v-if="selectedMetadata" class="form-group">
                        <label>Data Type</label>
                        <span class="form-value">{{ selectedMetadata?.dataTypeName || 'Not selected' }}</span>
                    </div>

                    <div v-if="selectedMetadata" class="form-group">
                        <label>Sub Data Type</label>
                        <span class="form-value">{{ selectedMetadata?.subDataTypeName || 'Not selected' }}</span>
                    </div>

                    <!-- Seismic-specific fields -->
                    <div v-if="selectedMetadata?.first_field_file" class="form-group">
                        <label>First Field File</label>
                        <span class="form-value">{{ selectedMetadata.first_field_file }}</span>
                    </div>

                    <div v-if="selectedMetadata?.last_field_file" class="form-group">
                        <label>Last Field File</label>
                        <span class="form-value">{{ selectedMetadata.last_field_file }}</span>
                    </div>

                    <div v-if="selectedMetadata?.first_shot_point" class="form-group">
                        <label>First Shot Point</label>
                        <span class="form-value">{{ selectedMetadata.first_shot_point }}</span>
                    </div>

                    <div v-if="selectedMetadata?.last_shot_point" class="form-group">
                        <label>Last Shot Point</label>
                        <span class="form-value">{{ selectedMetadata.last_shot_point }}</span>
                    </div>

                    <div v-if="selectedMetadata?.first_cdp" class="form-group">
                        <label>First CDP</label>
                        <span class="form-value">{{ selectedMetadata.first_cdp }}</span>
                    </div>

                    <div v-if="selectedMetadata?.last_cdp" class="form-group">
                        <label>Last CDP</label>
                        <span class="form-value">{{ selectedMetadata.last_cdp }}</span>
                    </div>

                    <div v-if="selectedMetadata?.inline" class="form-group">
                        <label>Inline</label>
                        <span class="form-value">{{ selectedMetadata.inline }}</span>
                    </div>

                    <div v-if="selectedMetadata?.crossline" class="form-group">
                        <label>Crossline</label>
                        <span class="form-value">{{ selectedMetadata.crossline }}</span>
                    </div>

                    <div v-if="selectedMetadata" class="form-group">
                        <label>Created By</label>
                        <span class="form-value">{{ userStore.user?.data.name }}</span>
                    </div>

                    <div v-if="selectedMetadata" class="form-group">
                        <label>Edited By</label>
                        <span class="form-value">{{ userStore.user?.data.name }}</span>
                    </div>

                    <div v-if="!selectedMetadata && props.selectedFile" class="form-group">
                        <label>Status</label>
                        <span class="form-value error">No metadata found for file {{ props.selectedFile.name }}</span>
                    </div>

                    <div v-if="!props.selectedFile" class="form-group">
                        <label>Status</label>
                        <span class="form-value">Please select a file from the table</span>
                    </div>
                </div>
            </div>

            <!-- Preview Tab -->
            <div v-if="detailsTab === 'preview'" class="tab-content">
                <div class="preview-area">
                    <div class="preview-content">
                        <div v-if="isLoadingPreview" class="loading-preview">
                            <div class="loading-spinner"></div>
                            <p>Loading preview...</p>
                        </div>
                        
                        <div v-else-if="previewData?.error" class="preview-error">
                            <p>{{ previewData.error }}</p>
                        </div>
                        
                        <div v-else-if="previewData" class="preview-data">
                            <!-- EBCDIC Header Section for SEGY files -->
                            <div v-if="'isEbcdicHeader' in previewData && previewData.isEbcdicHeader" class="ebcdic-header-section">
                                <div class="ebcdic-header">
                                    <h4>EBCDIC Header</h4>
                                    <div class="ebcdic-content">
                                        <pre>{{ previewData.asciiText }}</pre>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Metadata Section -->
                            <div v-if="previewData.metadata && Object.keys(previewData.metadata).length > 0" class="preview-metadata">
                                <h4>Seismic File Information</h4>
                                <div class="metadata-grid">
                                    <div v-if="(previewData.metadata as any).firstFieldFile" class="metadata-item">
                                        <label>First Field File:</label>
                                        <span>{{ (previewData.metadata as any).firstFieldFile }}</span>
                                    </div>
                                    <div v-if="(previewData.metadata as any).lastFieldFile" class="metadata-item">
                                        <label>Last Field File:</label>
                                        <span>{{ (previewData.metadata as any).lastFieldFile }}</span>
                                    </div>
                                    <div v-if="(previewData.metadata as any).firstShotPoint" class="metadata-item">
                                        <label>First Shot Point:</label>
                                        <span>{{ (previewData.metadata as any).firstShotPoint }}</span>
                                    </div>
                                    <div v-if="(previewData.metadata as any).lastShotPoint" class="metadata-item">
                                        <label>Last Shot Point:</label>
                                        <span>{{ (previewData.metadata as any).lastShotPoint }}</span>
                                    </div>
                                    <div v-if="(previewData.metadata as any).firstCDP" class="metadata-item">
                                        <label>First CDP:</label>
                                        <span>{{ (previewData.metadata as any).firstCDP }}</span>
                                    </div>
                                    <div v-if="(previewData.metadata as any).lastCDP" class="metadata-item">
                                        <label>Last CDP:</label>
                                        <span>{{ (previewData.metadata as any).lastCDP }}</span>
                                    </div>
                                    <div v-if="(previewData.metadata as any).inline" class="metadata-item">
                                        <label>Inline:</label>
                                        <span>{{ (previewData.metadata as any).inline }}</span>
                                    </div>
                                    <div v-if="(previewData.metadata as any).crossline" class="metadata-item">
                                        <label>Crossline:</label>
                                        <span>{{ (previewData.metadata as any).crossline }}</span>
                                    </div>
                                    <!-- LAS-specific fields (for backward compatibility) -->
                                    <div v-if="'wellName' in previewData.metadata && previewData.metadata.wellName" class="metadata-item">
                                        <label>Well Name:</label>
                                        <span>{{ previewData.metadata.wellName }}</span>
                                    </div>
                                    <div v-if="'location' in previewData.metadata && previewData.metadata.location" class="metadata-item">
                                        <label>Location:</label>
                                        <span>{{ previewData.metadata.location }}</span>
                                    </div>
                                    <div v-if="'uwi' in previewData.metadata && previewData.metadata.uwi" class="metadata-item">
                                        <label>UWI:</label>
                                        <span>{{ previewData.metadata.uwi }}</span>
                                    </div>
                                    <div v-if="'startDepth' in previewData.metadata && previewData.metadata.startDepth" class="metadata-item">
                                        <label>Start Depth:</label>
                                        <span>{{ previewData.metadata.startDepth }}</span>
                                    </div>
                                    <div v-if="'stopDepth' in previewData.metadata && previewData.metadata.stopDepth" class="metadata-item">
                                        <label>Stop Depth:</label>
                                        <span>{{ previewData.metadata.stopDepth }}</span>
                                    </div>
                                    <div v-if="'step' in previewData.metadata && previewData.metadata.step" class="metadata-item">
                                        <label>Step:</label>
                                        <span>{{ previewData.metadata.step }}</span>
                                    </div>
                                    <div v-if="'curveCount' in previewData.metadata && previewData.metadata.curveCount" class="metadata-item">
                                        <label>Curve Count:</label>
                                        <span>{{ previewData.metadata.curveCount }}</span>
                                    </div>
                                </div>
                                
                                <!-- Curves List (for LAS files) -->
                                <div v-if="'curves' in previewData.metadata && previewData.metadata.curves && previewData.metadata.curves.length > 0" class="curves-section">
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
                        
                        <div v-else-if="selectedMetadata" class="no-preview">
                            <p>No preview available for this file</p>
                        </div>
                        
                        <div v-else class="no-selection">
                            <p>Select a file to view preview</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSeismicStore } from '../../../store/seismicStore';
import ExtendedFileData from '../../../../schemas/ExtendedFileData';
import { 
    parseLasFileForPreview, 
    isLasFile, 
    extractLasMetadata,
    extractLasComprehensiveData,
    extractLasMetadataForDisplay,
    parseLasToWellioJson,
    type LasPreviewData,
    type LasMetadata,
    type LasComprehensiveData
} from '../../../../services/lasService';
import { parseSegyFileForPreview, type SegyPreviewData, isSegyFile } from '../../../../services/segyService';
import { useUserStore } from '../../../store/userStore';

// Props for receiving data from parent component
interface Props {
    selectedFile?: ExtendedFileData | null;
}

const props = withDefaults(defineProps<Props>(), {
    selectedFile: null,
});

// Access seismic store
const seismicStore = useSeismicStore();
const userStore = useUserStore();

// Computed property to get metadata based on selected file
const selectedMetadata = computed(() => {
    if (!props.selectedFile) {
        return null;
    }
    
    // Find the corresponding metadata in the seismic store
    const metadata = seismicStore.data.seismicMetadatas.find(m => m.id === props.selectedFile?.id);
    console.log('Selected metadata from seismic store:', metadata);
    return metadata || null;
});

// Utility function to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Local reactive data
const detailsTab = ref('metadata');
const previewData = ref<LasPreviewData | SegyPreviewData | null>(null);
const isLoadingPreview = ref(false);

// Utility function to get file extension
const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
};

// Method to load file preview
const loadFilePreview = async () => {
    if (!selectedMetadata.value) return;
    
    isLoadingPreview.value = true;
    previewData.value = null;
    
    try {
        if (isLasFile(selectedMetadata.value.name || '')) {
            // For .las files, use the LAS preview service
            const filePath = selectedMetadata.value.path;
            if (filePath) {
                previewData.value = await parseLasFileForPreview(filePath);
            } else {
                previewData.value = {
                    asciiText: '',
                    metadata: {},
                    error: 'File path not available'
                };
            }
        } else if (isSegyFile(selectedMetadata.value.name || '')) {
            // For SEGY files, use the SEGY preview service
            const filePath = selectedMetadata.value.path;
            if (filePath) {
                previewData.value = await parseSegyFileForPreview(filePath);
            } else {
                previewData.value = {
                    asciiText: '',
                    metadata: {},
                    error: 'File path not available'
                };
            }
        } else {
            // For other seismic file types, show basic file information
            const fileExtension = getFileExtension(selectedMetadata.value.name || '').toUpperCase();
            const seismicMetadata: any = {};
            
            // Add seismic-specific metadata if available
            if (selectedMetadata.value.first_field_file) {
                seismicMetadata.firstFieldFile = selectedMetadata.value.first_field_file;
            }
            if (selectedMetadata.value.last_field_file) {
                seismicMetadata.lastFieldFile = selectedMetadata.value.last_field_file;
            }
            if (selectedMetadata.value.first_shot_point) {
                seismicMetadata.firstShotPoint = selectedMetadata.value.first_shot_point;
            }
            if (selectedMetadata.value.last_shot_point) {
                seismicMetadata.lastShotPoint = selectedMetadata.value.last_shot_point;
            }
            if (selectedMetadata.value.first_cdp) {
                seismicMetadata.firstCDP = selectedMetadata.value.first_cdp;
            }
            if (selectedMetadata.value.last_cdp) {
                seismicMetadata.lastCDP = selectedMetadata.value.last_cdp;
            }
            if (selectedMetadata.value.inline) {
                seismicMetadata.inline = selectedMetadata.value.inline;
            }
            if (selectedMetadata.value.crossline) {
                seismicMetadata.crossline = selectedMetadata.value.crossline;
            }
            
            previewData.value = {
                asciiText: `Seismic File Preview\n\nFile: ${selectedMetadata.value.name}\nType: ${fileExtension}\nSize: ${formatFileSize(selectedMetadata.value.size || 0)}\n\nThis is a ${fileExtension} seismic file.\nDetailed preview is not available for this file type.`,
                metadata: seismicMetadata,
            };
        }
    } catch (error) {
        console.error('[FilesDetails] Error loading file preview:', error);
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
watch(detailsTab, (newTab) => {
    if (newTab === 'preview' && selectedMetadata.value && !previewData.value) {
        loadFilePreview();
    }
});

// Watch for selected metadata changes to clear preview data
watch(selectedMetadata, () => {
    previewData.value = null;
    if (detailsTab.value === 'preview' && selectedMetadata.value) {
        loadFilePreview();
    }
});

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
    justify-content: flex-end;
    margin-bottom: 1rem;
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

.form-group {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 1rem;
    align-items: center;
    padding: 0.5rem 0;
}

.form-group label {
    color: #64748b;
    font-weight: 500;
    font-size: 0.8rem;
    margin: 0;
}

.form-value {
    color: #1f2937;
    font-size: 0.8rem;
    padding: 0;
    margin: 0;
}

.form-value.error {
    color: #dc2626;
    font-weight: 500;
}

.metadata-row {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
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

/* Preview styles */
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

.no-selection {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #6b7280;
    font-style: italic;
}

.loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* EBCDIC Header Styles */
.ebcdic-header-section {
    margin-bottom: 1.5rem;
}

.ebcdic-header {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
    background: #ffffff;
}

.ebcdic-header h4 {
    margin: 0;
    padding: 0.75rem 1rem;
    background: #1e40af;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    border-bottom: 1px solid #1e40af;
}

.ebcdic-content {
    max-height: 500px;
    overflow-y: auto;
    background: #ffffff;
}

.ebcdic-content pre {
    margin: 0;
    padding: 1rem;
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
    line-height: 1.4;
    color: #374151;
    white-space: pre;
    overflow-x: auto;
    background: #ffffff;
}

/* Custom scrollbar for EBCDIC content */
.ebcdic-content::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.ebcdic-content::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
}

.ebcdic-content::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}

.ebcdic-content::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>

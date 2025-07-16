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
                <h1>Seismic Data Ingest</h1>
                <p>Configure your dataset properties and upload files</p>
            </div>
            
            <!-- Workflow Progress -->
            <WorkflowProgress 
                :current-stage="seismicStore.data.currentStage"
                :completed-stages="seismicStore.data.completedStages"
            />
        </header>

        <main class="ingest-main">
            <div class="ingest-grid">
                <!-- Properties Panel -->
                <div class="properties-panel">
                    <div class="panel-card">
                        <h2>Properties</h2>

                        <div class="form-group">
                            <label>Choose Option</label>
                            <div class="radio-group">
                                <label class="radio-item">
                                    <input type="radio" value="new" v-model="uploadOption" />
                                    <span class="radio-mark"></span>
                                    Create new survey/seismic
                                </label>
                                <label class="radio-item">
                                    <input type="radio" value="existing" v-model="uploadOption" />
                                    <span class="radio-mark"></span>
                                    Upload files for existing seismic
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="form-row">
                                <label>Target Seismic</label>
                                <div class="input-with-button">
                                    <div class="searchable-select">
                                        <input 
                                            type="text" 
                                            v-model="selectedSeismicDisplay"
                                            @focus="showTargetSeismicDropdown = true"
                                            @blur="hideTargetSeismicDropdown"
                                            @input="filterTargetSeismics"
                                            :placeholder="(seismicsLoading ? 'Loading seismics...' : 'Search or type seismic name...')"
                                            class="form-input"
                                            :disabled="seismicsLoading"
                                        />
                                        <div v-if="showTargetSeismicDropdown && filteredTargetSeismics.length > 0" class="dropdown-list">
                                            <div 
                                                v-for="seismic in filteredTargetSeismics" 
                                                :key="seismic._id"
                                                @mousedown="selectTargetSeismic(seismic)"
                                                class="dropdown-item"
                                            >
                                                <span class="seismic-name">{{ seismic.name || `Seismic ${seismic._id}` }}</span>
                                                <span class="seismic-details">{{ seismic.country ? `Country: ${seismic.country}` : '' }} {{ seismic.dimension ? `Dimension: ${seismic.dimension}` : '' }}</span>
                                            </div>
                                        </div>
                                        <div v-if="showTargetSeismicDropdown && filteredTargetSeismics.length === 0 && selectedSeismicDisplay.length > 0" class="dropdown-list">
                                            <div class="dropdown-item no-results">No seismics found</div>
                                        </div>
                                    </div>
                                    <button class="btn btn-outline btn-sm add-seismic-btn" @click="openSeismicModal" v-if="uploadOption === 'new'">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                        </svg>
                                        Add Survey
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="form-group" v-if="uploadOption === 'new'">
                            <div class="form-row">
                                <label>Coordinate Reference System (CRS)</label>
                                <div class="select-with-search">
                                    <div class="searchable-select">
                                        <input 
                                            type="text" 
                                            v-model="crsSearchQuery"
                                            @focus="showCrsDropdown = true"
                                            @blur="hideCrsDropdown"
                                            @input="filterCrs"
                                            :placeholder="(crsLoading ? 'Loading CRS...' : 'Search coordinate reference systems...')"
                                            class="form-input"
                                            :class="{ 'has-selection': selectedCrsId }"
                                            :disabled="crsLoading"
                                        />
                                        <div v-if="showCrsDropdown && filteredCrs.length > 0" class="dropdown-list">
                                            <div 
                                                v-for="crs in filteredCrs" 
                                                :key="crs._id"
                                                @mousedown="selectCrs(crs)"
                                                class="dropdown-item"
                                            >
                                                <span class="crs-name">{{ crs.name || crs.code || `CRS ${crs._id}` }}</span>
                                                <span class="crs-details">{{ crs.code ? `Code: ${crs.code}` : '' }} {{ crs.authority ? `Authority: ${crs.authority}` : '' }}</span>
                                            </div>
                                        </div>
                                        <div v-if="showCrsDropdown && filteredCrs.length === 0 && crsSearchQuery.length > 0" class="dropdown-list">
                                            <div class="dropdown-item no-results">No CRS found</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- <div class="options-section">
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
                        </div> -->
                    </div>
                </div>

                <!-- Files Panel -->
                <div class="files-panel">
                    <div class="panel-card">
                        <div class="files-header">
                            <h2>Files</h2>
                            <p>Select multiple files, choose a folder, or drag and drop files to add to dataset</p>
                            <div class="files-actions">
                                <button class="btn btn-outline" @click="selectFiles">
                                    Select Files
                                </button>
                                <button class="btn btn-outline" @click="selectFolder">
                                    Select Folder
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

        <!-- Seismic Selection Modal -->
        <div v-if="showSeismicModal" class="modal-overlay" @click="closeSeismicModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Add Survey</h3>
                    <button class="modal-close" @click="closeSeismicModal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div>
                        <div class="form-group">
                            <label>Survey Name</label>
                            <input 
                                type="text" 
                                v-model="newSurveyName" 
                                placeholder="Enter survey name"
                                class="form-input"
                            />
                        </div>

                        <div class="form-group">
                            <label>Survey Country</label>
                            <div class="searchable-select">
                                <input 
                                    type="text" 
                                    v-model="newSurveyCountry" 
                                    @focus="showCountryDropdown = true"
                                    @blur="hideCountryDropdown"
                                    @input="filterCountries"
                                    :placeholder="(countriesLoading ? 'Loading countries...' : 'Search or type country name...')"
                                    class="form-input"
                                    :disabled="countriesLoading"
                                />
                                <div v-if="showCountryDropdown && filteredCountries.length > 0" class="dropdown-list">
                                    <div 
                                        v-for="country in filteredCountries" 
                                        :key="country._id"
                                        @mousedown="selectCountry(country)"
                                        class="dropdown-item"
                                    >
                                        <span class="country-name">{{ country.name }}</span>
                                        <span class="country-code">{{ country.code }}</span>
                                    </div>
                                </div>
                                <div v-if="showCountryDropdown && filteredCountries.length === 0 && newSurveyCountry.length > 0" class="dropdown-list">
                                    <div class="dropdown-item no-results">No countries found</div>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Survey Dimension</label>
                            <select v-model="newSurveyDimension" class="form-select">
                                <option value="">Select dimension</option>
                                <option value="2D">2D</option>
                                <option value="3D">3D</option>
                            </select>
                        </div>

                        <div class="form-group" v-if="newSurveyDimension === '3D'">
                            <div class="coordinates-header">
                                <label>Survey Coordinates</label>
                                <button type="button" class="btn btn-outline btn-sm" @click="addCoordinateRow">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                    </svg>
                                    Add Row
                                </button>
                            </div>
                            <div class="coordinates-table-container">
                                <div class="coordinates-table">
                                    <div class="coordinates-table-header">
                                        <div class="coord-col-corner">Corner</div>
                                        <div class="coord-col-inlines">INLINES</div>
                                        <div class="coord-col-crossline">CROSSLINE</div>
                                        <div class="coord-col-x">X coordinate</div>
                                        <div class="coord-col-y">Y coordinate</div>
                                        <div class="coord-col-actions">Actions</div>
                                    </div>
                                    <div class="coordinates-table-body">
                                        <div 
                                            v-for="(coord, index) in surveyCornerPoints" 
                                            :key="coord.id"
                                            class="coordinate-row"
                                        >
                                            <div class="coord-col-corner">
                                                <p>{{ coord.corner }}</p>
                                            </div>
                                            <div class="coord-col-inlines">
                                                <input 
                                                    type="number" 
                                                    v-model.number="coord.inline" 
                                                    class="coord-input"
                                                    step="1"
                                                />
                                            </div>
                                            <div class="coord-col-crossline">
                                                <input 
                                                    type="number" 
                                                    v-model.number="coord.xline" 
                                                    class="coord-input"
                                                    step="1"
                                                />
                                            </div>
                                            <div class="coord-col-x">
                                                <input 
                                                    type="number" 
                                                    v-model.number="coord.latitude" 
                                                    class="coord-input"
                                                    step="0.1"
                                                />
                                            </div>
                                            <div class="coord-col-y">
                                                <input 
                                                    type="number" 
                                                    v-model.number="coord.longitude" 
                                                    class="coord-input"
                                                    step="0.1"
                                                />
                                            </div>
                                            <div class="coord-col-actions">
                                                <button 
                                                    type="button" 
                                                    class="btn btn-ghost btn-sm remove-coord-btn"
                                                    @click="removeCoordinateRow(index)"
                                                    :disabled="surveyCornerPoints.length <= 1"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-ghost" @click="closeSeismicModal">Cancel</button>
                    <button class="btn btn-primary" @click="createSurvey">Confirm</button>
                </div>
            </div>
        </div>

        <!-- Notification Modal -->
        <NotificationModal
            v-model="showNotificationModal"
            :type="notificationType"
            :title="notificationTitle"
            :message="notificationMessage"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// import { useFileStore } from '../store/fileStore';
import { useSeismicStore } from '../../store/seismicStore';
import { useSeismicSurvey } from '../../Composables/useSeismicSurvey';
import { useCountry } from '../../Composables/useCountry';
import { useCRS } from '../../Composables/useCRS';
import WorkflowProgress from '../../Components/WorkflowProgress.vue';
import NotificationModal from '../../Components/NotificationModal.vue';
import { useSurveyCornerPoints } from '@/Composables/useSurveyCornerPoints';
import { useSeismicLine } from '@/Composables/useSeismicLine';

const route = useRoute();
const router = useRouter();
// const fileStore = useFileStore();
const seismicStore = useSeismicStore();
const { fetch: fetchSurveys, insert: insertSurvey, createEmptySurvey } = useSeismicSurvey();
const { fetch: fetchCountries } = useCountry();
const { fetch: fetchCrs } = useCRS();
const { createBulkBySurvey } = useSurveyCornerPoints();

// Get selected target from route params or query

// Form data
const datasetName = ref('');
const datasetId = ref('');
const description = ref('');
const dataSource = ref('');
const targetSeismic = ref('');
const seismicbore = ref('');
const processPriority = ref('normal');
const faultyFileAction = ref('quarantine');
const uploadOption = ref('new');

// New survey form data
const newSurveyName = ref('');
const newSurveyCountry = ref('');
const newSurveyDimension = ref('');

// Survey coordinates data
const surveyCornerPoints = ref([
    { id: 1, corner: 1, inline: 0, xline: 0, latitude: 0, longitude: 0 },
    { id: 2, corner: 2, inline: 0, xline: 0, latitude: 0, longitude: 0 },
    { id: 3, corner: 3, inline: 0, xline: 0, latitude: 0, longitude: 0 },
    { id: 4, corner: 4, inline: 0, xline: 0, latitude: 0, longitude: 0 }
]);

// Seismics data
const seismics = ref<any[]>([]);
const seismicsLoading = ref(false);
const seismicSearchQuery = ref('');
const filteredSeismics = ref<any[]>([]);
const showSeismicDropdown = ref(false);
const selectedSeismicName = ref('');

// Target seismic dropdown data
const filteredTargetSeismics = ref<any[]>([]);
const showTargetSeismicDropdown = ref(false);

// Modal data
const showSeismicModal = ref(false);
const selectedSeismicDisplay = ref('');

// Notification modal data
const showNotificationModal = ref(false);
const notificationType = ref<'success' | 'error' | 'info'>('info');
const notificationTitle = ref('');
const notificationMessage = ref('');

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

// Countries data
const countries = ref<any[]>([]);
const countriesLoading = ref(false);
const filteredCountries = ref<any[]>([]);
const showCountryDropdown = ref(false);
const selectedCountry = ref<any | null>(null);

// CRS data
const crs = ref<any[]>([]);
const crsLoading = ref(false);
const crsSearchQuery = ref('');
const filteredCrs = ref<any[]>([]);
const showCrsDropdown = ref(false);
const selectedCrsId = ref('');

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
    if(uploadOption.value == "new"){
        return uploadedFiles.value.length > 0 && selectedCrsId.value !== '';
    }else if(uploadOption.value == "existing"){
        return uploadedFiles.value.length > 0;
    }
});

// Watch for uploadOption changes and update store
watch(uploadOption, (newValue) => {
    seismicStore.setUploadOption(newValue as 'new' | 'existing');
}, { immediate: true });

// Methods
const generateDatasetId = () => {
    datasetId.value = Math.random().toString(36).substr(2, 8).toUpperCase();
};

// const resetForm = () => {
//     datasetName.value = '';
//     description.value = '';
//     dataSource.value = '';
//     targetSeismic.value = '';
//     seismicbore.value = '';
//     uploadedFiles.value = [];
//     selectedFiles.value = [];
//     generateDatasetId();
// };

const saveDataset = () => {
    if (!isFormValid.value) return;
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

const selectFolder = async () => {
    try {
        const result = await (window as any).electronAPI.pickFolder();
        if (!result.canceled && result.filePaths.length > 0) {
            const folderPath = result.filePaths[0];
            
            // Read all files in the selected folder
            const fileNames = await (window as any).electronAPI.readDirectory(folderPath);
            
            // Filter only files (not directories) and get their stats
            const filePromises = fileNames.map(async (fileName: string) => {
                const filePath = folderPath + (folderPath.endsWith('/') || folderPath.endsWith('\\') ? '' : '/') + fileName;
                try {
                    const stats = await (window as any).electronAPI.getFileStats(filePath);
                    // Only include files, not directories
                    if (stats.isFile) {
                        return {
                            name: stats.name,
                            path: stats.path,
                            size: stats.size
                        };
                    }
                    return null;
                } catch (error) {
                    console.error('Error reading file stats:', filePath, error);
                    return null;
                }
            });
            
            const fileInfos = (await Promise.all(filePromises)).filter(file => file !== null);
            addFilesFromPaths(fileInfos);
        }
    } catch (error) {
        console.error('Error selecting folder:', error);
    }
};

// const addFiles = (files: File[]) => {
//     files.forEach(file => {
//         uploadedFiles.value.push({
//             id: Math.random().toString(36),
//             name: file.name,
//             size: file.size,
//             progress: 100,
//             path: (file as any).path || (file as any).webkitRelativePath || file.name // Capture file path if available
//         });
//     });
// };

const addFilesFromPaths = (fileInfos: Array<{name: string, path: string, size: number}>) => {
    fileInfos.forEach(fileInfo => {
        uploadedFiles.value.push({
            id: Math.random().toString(36),
            name: fileInfo.name,
            size: fileInfo.size,
            progress: 100,
            path: fileInfo.path
        });
    });
};

const removeSelectedFiles = () => {
    uploadedFiles.value = uploadedFiles.value.filter(file => !selectedFiles.value.includes(file.id));
    selectedFiles.value = [];
};

// const onDrop = (e: DragEvent) => {
//     e.preventDefault();
//     const files = e.dataTransfer?.files;
//     if (files) {
//         console.warn('Note: Files added via drag-and-drop may not have full file paths available');
//         addFiles(Array.from(files));
//     }
// };

// const onDragOver = (e: DragEvent) => {
//     e.preventDefault();
// };

// const onDragLeave = (e: DragEvent) => {
//     e.preventDefault();
// };

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// const filterSeismics = () => {
//     if (!seismicSearchQuery.value.trim()) {
//         filteredSeismics.value = seismics.value;
//         return;
//     }
    
//     const query = seismicSearchQuery.value.toLowerCase();
//     filteredSeismics.value = seismics.value.filter(seismic => {
//         const name = (seismic.name || '').toLowerCase();
//         // const country = (seismic.country || '').toLowerCase();
//         // const block = (seismic.block || '').toLowerCase();
//         // const area = (seismic.area || '').toLowerCase();
//         // const shotBy = (seismic.shotBy || '').toLowerCase();
//         // const recordedBy = (seismic.recordedBy || '').toLowerCase();
        
//         return name.includes(query)
//             //    country.includes(query) || 
//             //    block.includes(query) ||
//             //    area.includes(query) ||
//             //    shotBy.includes(query) ||
//             //    recordedBy.includes(query);
//     });
// };

// const selectSeismic = (seismic: any) => {
//     targetSeismic.value = seismic._id;
//     selectedSeismicName.value = seismic.name || `Seismic ${seismic._id}`;
//     seismicSearchQuery.value = '';
//     showSeismicDropdown.value = false;

//     seismicStore.addSurveyData({
//         surveyId: seismic._id,
//         name: seismic.name || `Seismic ${seismic._id}`,
//         country: seismic.country || '',
//         dimension: seismic.dimension || ''
//         // block: seismic.block || ''
//     });
// };

// const hideSeismicDropdown = () => {
//     setTimeout(() => {
//         showSeismicDropdown.value = false;
//     }, 200); // Delay to allow click event to fire
// };

const searchSeismics = async () => {
    try {
        seismicsLoading.value = true;
        seismics.value = await fetchSurveys() || [];

        console.log('seismics.value ', seismics.value);
        // console.log('seismics.value ', seismics.value)
        filteredSeismics.value = seismics.value;
        filteredTargetSeismics.value = seismics.value;
    } catch (error) {
        console.error('Error searching seismics:', error);
    } finally {
        console.log("finally")
        seismicsLoading.value = false;
    }
};

const toggleSelectAll = () => {
    if (selectAllChecked.value) {
        selectedFiles.value = [];
    } else {
        selectedFiles.value = uploadedFiles.value.map(file => file.id);
    }
};

const prepareDataset = async () => {
    // console.log("uploadedFiles.value.length ", uploadedFiles.value.length)
    
    if (!canPrepareDataset.value) return;

    // Store selected files in data store
    const filesToStore = uploadedFiles.value.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        progress: file.progress,
        path: file.path || file.name
    }));
    
    seismicStore.setSelectedFiles(filesToStore);

    // seismicStore.setCRS({
    //     proj4: selectedCrsId.value,
    //     srid: selectedCrsId.value
    // });
    
    // Advance workflow to loading stage and mark preparation as completed
    seismicStore.advanceWorkflow('loading', 'preparation');

    seismicStore.setUploadOption(uploadOption.value as 'new' | 'existing');

    if(uploadOption.value === 'existing') {
        seismicStore.emptyLinesData();
        
        const seismicLinesBySurveyId = await useSeismicLine().getBySurveyId(seismicStore.data.survey.surveyId);
        // console.log("seismicLinesBySurveyId", seismicLinesBySurveyId);

        for(const seismicLine of seismicLinesBySurveyId.data) {
            seismicStore.addLineData({
                lineId: seismicLine._id,
                name: seismicLine.name,
                firstField: seismicLine.firstField,
                lastField: seismicLine.lastField,
                firstShot: seismicLine.firstShotPoint,
                lastShot: seismicLine.lastShotPoint,
                firstCDP: seismicLine.firstCDP,
                lastCDP: seismicLine.lastCDP,
                firstTrace: seismicLine.firstTrace ? seismicLine.firstTrace.toString() : null,
                lastTrace: seismicLine.lastTrace ? seismicLine.lastTrace.toString() : null,
                inLine: seismicLine.inLine ? seismicLine.inLine.toString() : null,
                crossLine: seismicLine.crossLine ? seismicLine.crossLine.toString() : null,
                metadata: []
            });
        }

        // console.log("seismicStore.data ", seismicStore.data);
        
    }

    // return;

    // Store selected CRS data
    // seismicStore.setCRS(selectedCrsId.value);

    // console.log('seismicStore.data ', seismicStore.data)
    
    // Navigate to DataQC page with form data
    router.push({
        path: '/seismic/data-loading',
    });
};

const openSeismicModal = () => {
    showSeismicModal.value = true;
    // Reset form values when opening modal
    uploadOption.value = 'new';
    seismicSearchQuery.value = '';
    selectedSeismicName.value = '';
    newSurveyName.value = '';
    newSurveyCountry.value = '';
    newSurveyDimension.value = '';
    selectedCountry.value = null;
    
    // Reset coordinates to default values
    surveyCornerPoints.value = [
        { id: 1, corner: 1, inline: 0, xline: 0, latitude: 0, longitude: 0 },
        { id: 2, corner: 2, inline: 0, xline: 0, latitude: 0, longitude: 0 },
        { id: 3, corner: 3, inline: 0, xline: 0, latitude: 0, longitude: 0 },
        { id: 4, corner: 4, inline: 0, xline: 0, latitude: 0, longitude: 0 }
    ];
    
    // Load countries if not already loaded
    if (countries.value.length === 0) {
        loadCountries();
    }
};

const closeSeismicModal = () => {
    showSeismicModal.value = false;
};

const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    notificationType.value = type;
    notificationTitle.value = title;
    notificationMessage.value = message;
    showNotificationModal.value = true;
};

const createSurvey = async () => {
    // Validate form data
    if (!newSurveyName.value.trim() || !newSurveyCountry.value.trim() || !newSurveyDimension.value) {
        showNotification('error', 'Validation Error', 'Please fill in all required fields');
        return;
    }

    try {
        // Create empty survey and populate with form data
        const newSurvey = createEmptySurvey();
        newSurvey.name = newSurveyName.value.trim();
        newSurvey.country = newSurveyCountry.value.trim();
        newSurvey.dimension = newSurveyDimension.value;

        // Insert the new survey
        const createdSurvey = await insertSurvey(newSurvey);

        if(newSurveyDimension.value === '3D') {
            const surveyCornerPointsData = surveyCornerPoints.value.map(coord => ({
                inline: coord.inline,
                xline: coord.xline,
                latitude: coord.latitude,
                longitude: coord.longitude
            }));

            seismicStore.setSurveyCornerPoints(surveyCornerPointsData);

                const surveyCornerPointsBodyRequest = {
                    cornerPoints: surveyCornerPoints.value || [],
                    surveyName: createdSurvey.name,
                    type: createdSurvey.dimension,
                }

                console.log('[QC] surveyCornerPointsBodyRequest', surveyCornerPointsBodyRequest);

                const createdBulkSurveyCornerPointsResponse = await createBulkBySurvey(surveyCornerPointsBodyRequest);
                console.log('[QC] createdBulkSurveyCornerPointsResponse', createdBulkSurveyCornerPointsResponse);
        }
        
        // Update the target seismic display and selection
        selectedSeismicDisplay.value = `${newSurvey.name} (${newSurveyDimension.value})`;
        targetSeismic.value = createdSurvey._id || '';

        // Add to seismic store
        seismicStore.addSurveyData({
            surveyId: createdSurvey._id || '',
            name: createdSurvey.name || newSurvey.name,
            country: newSurveyCountry.value.trim(),
            dimension: createdSurvey.dimension || newSurveyDimension.value
        });

        // Refresh the seismics list to include the new survey
        await searchSeismics();

        // Show success notification
        showNotification('success', 'Survey Created Successfully', `Survey "${newSurvey.name}" has been created successfully.`);
        
        // console.log('Survey created successfully:', createdSurvey);
        console.log('seismicStore.data ', seismicStore.data)
        
    } catch (error) {
        console.error('Error creating survey:', error);
        showNotification('error', 'Creation Failed', `Failed to create survey: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    closeSeismicModal();
};

const filterTargetSeismics = () => {
    if (!selectedSeismicDisplay.value.trim()) {
        filteredTargetSeismics.value = seismics.value;
        return;
    }
    
    const query = selectedSeismicDisplay.value.toLowerCase();
    filteredTargetSeismics.value = seismics.value.filter(seismic => {
        const name = (seismic.name || '').toLowerCase();
        return name.includes(query);
    });
};

const selectTargetSeismic = (seismic: any) => {
    targetSeismic.value = seismic._id;
    selectedSeismicDisplay.value = seismic.name || `Seismic ${seismic._id}`;
    showTargetSeismicDropdown.value = false;

    seismicStore.addSurveyData({
        surveyId: seismic._id,
        name: seismic.name || `Seismic ${seismic._id}`,
        country: seismic.country || '',
        dimension: seismic.dimension || ''
    });
};

const hideTargetSeismicDropdown = () => {
    setTimeout(() => {
        showTargetSeismicDropdown.value = false;
    }, 200); // Delay to allow click event to fire
};

// Countries methods
const filterCountries = () => {
    if (!newSurveyCountry.value.trim()) {
        filteredCountries.value = countries.value;
        return;
    }
    
    const query = newSurveyCountry.value.toLowerCase();
    filteredCountries.value = countries.value.filter(country => {
        const name = (country.name || '').toLowerCase();
        const code = (country.code || '').toLowerCase();
        return name.includes(query) || code.includes(query);
    });
};

const selectCountry = (country: any) => {
    newSurveyCountry.value = country.name;
    showCountryDropdown.value = false;
    selectedCountry.value = country;
};

const hideCountryDropdown = () => {
    setTimeout(() => {
        showCountryDropdown.value = false;
    }, 200); // Delay to allow click event to fire
};

const loadCountries = async () => {
    try {
        countriesLoading.value = true;
        countries.value = await fetchCountries();
        filteredCountries.value = countries.value;
    } catch (error) {
        console.error('Error loading countries:', error);
    } finally {
        countriesLoading.value = false;
    }
};

// CRS methods
const filterCrs = () => {
    if (!crsSearchQuery.value.trim()) {
        filteredCrs.value = crs.value;
        return;
    }
    
    const query = crsSearchQuery.value.toLowerCase();
    filteredCrs.value = crs.value.filter(crsItem => {
        const name = (crsItem.name || '').toLowerCase();
        
        return name.includes(query) 
    });
};

const selectCrs = (crsItem: any) => {
    selectedCrsId.value = crsItem._id;
    crsSearchQuery.value = crsItem.name || crsItem.code || `CRS ${crsItem._id}`;
    showCrsDropdown.value = false;
    
    // Store selected CRS data if needed
    seismicStore.setCRS({
        proj4: crsItem.proj4,
        srid: crsItem.srid
    });
};

const hideCrsDropdown = () => {
    setTimeout(() => {
        showCrsDropdown.value = false;
    }, 200);
};

const searchCrs = async () => {
    try {
        crsLoading.value = true;
        crs.value = await fetchCrs();
        filteredCrs.value = crs.value;
    } catch (error) {
        console.error('Error searching CRS:', error);
    } finally {
        crsLoading.value = false;
    }
};

// Survey coordinates methods
const addCoordinateRow = () => {
    const newId = Math.max(...surveyCornerPoints.value.map(c => c.id)) + 1;
    const lastCorner = surveyCornerPoints.value.length > 0 ? surveyCornerPoints.value[surveyCornerPoints.value.length - 1].corner : 0;
    
    surveyCornerPoints.value.push({
        id: newId,
        corner: lastCorner + 1,
        inline: 0,
        xline: 0,
        latitude: 0,
        longitude: 0
    });
};

const removeCoordinateRow = (index: number) => {
    if (surveyCornerPoints.value.length > 1) {
        surveyCornerPoints.value.splice(index, 1);
        surveyCornerPoints.value.forEach((coord, idx) => {
            coord.corner = idx + 1;
        });
    }
};

// Lifecycle
onMounted(() => {
    generateDatasetId();
    searchSeismics();
    loadCountries();
    searchCrs();
    
    // Initialize workflow at preparation stage
    seismicStore.setCurrentStage('preparation');
    seismicStore.setCompletedStages([]);
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

.form-input.has-selection {
    color: #000000;
    font-weight: 500;
}

.form-input.has-selection::placeholder {
    color: #969696;
    font-weight: 500;
    opacity: 1;
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

.searchable-select {
    position: relative;
    flex: 1;
}

.dropdown-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
}

.dropdown-item {
    padding: 0.75rem;
    cursor: pointer;
    border-bottom: 1px solid #f3f4f6;
    transition: background-color 0.2s ease;
}

.dropdown-item:last-child {
    border-bottom: none;
}

.dropdown-item:hover {
    background: #faf5ff;
}

.dropdown-item.no-results {
    color: #6b7280;
    cursor: default;
    font-style: italic;
}

.dropdown-item.no-results:hover {
    background: white;
}

.seismic-name {
    display: block;
    font-weight: 500;
    color: #080a0b;
    font-size: 0.85rem;
}

.seismic-details {
    display: block;
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
}

.country-name {
    display: block;
    font-weight: 500;
    color: #080a0b;
    font-size: 0.85rem;
}

.country-code {
    display: block;
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
}

.crs-name {
    display: block;
    font-weight: 500;
    color: #080a0b;
    font-size: 0.85rem;
}

.crs-details {
    display: block;
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
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

/* Seismics list styles */
.seismics-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #fafafa;
}

.seismic-item {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f3f4f6;
    background: white;
    transition: background-color 0.2s ease;
}

.seismic-item:last-child {
    border-bottom: none;
}

.seismic-item:hover {
    background: #faf5ff;
}

.seismic-item .seismic-name {
    font-weight: 500;
    color: #1f2937;
    font-size: 0.9rem;
}

.seismics-container {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    background: #fafafa;
}

.seismics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.seismics-count {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #6b7280;
    font-weight: 500;
}

.seismics-icon {
    width: 16px;
    height: 16px;
}

.clear-seismics-btn {
    background: none;
    color: #8b5cf6;
    text-decoration: underline;
    padding: 0;
    font-size: 0.75rem;
}

.seismics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
}

.seismic-card {
    background: white;
    border-radius: 8px;
    padding: 0.75rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
}

.seismic-card:hover {
    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.08);
    border-color: #e9d5ff;
}

.seismic-card-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.seismic-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.seismic-card-icon {
    width: 14px;
    height: 14px;
}

.seismic-details {
    display: flex;
    flex-direction: column;
}

.seismic-name {
    font-weight: 500;
    color: #1f2937;
    font-size: 0.8rem;
}

.seismic-uwi {
    font-size: 0.7rem;
    color: #6b7280;
}

.remove-seismic-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
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
}

.modal-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    max-width: 500px;
    width: 90vw;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #0f172a;
}

.modal-close {
    background: none;
    border: none;
    cursor: pointer;
    color: #64748b;
    padding: 0.25rem;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.modal-close:hover {
    background: #f1f5f9;
    color: #475569;
}

.modal-body {
    padding: 2rem;
}

.modal-footer {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    padding: 1.5rem 2rem;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 0 0 12px 12px;
}

/* Input with button styles */
.input-with-button {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.input-with-button .form-input {
    flex: 1;
}

.add-seismic-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
    padding: 0.5rem 0.75rem;
}

.add-seismic-btn svg {
    width: 16px;
    height: 16px;
}

/* Coordinates table styles */
.coordinates-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.coordinates-table-container {
    position: relative;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow-x: auto;
    overflow-y: hidden;
    background: white;
    /* Add smooth scrolling */
    scroll-behavior: smooth;
    /* Custom scrollbar styling */
    scrollbar-width: thin;
    scrollbar-color: #d1d5db #f8fafc;
}

.coordinates-table-container::-webkit-scrollbar {
    height: 8px;
}

.coordinates-table-container::-webkit-scrollbar-track {
    background: #f8fafc;
    border-radius: 4px;
}

.coordinates-table-container::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
    transition: background-color 0.2s ease;
}

.coordinates-table-container::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}

.coordinates-table {
    min-width: 650px; /* Set minimum width to ensure horizontal scrolling */
    width: 100%;
    background: white;
}

.coordinates-table-header {
    display: grid;
    grid-template-columns: 80px 100px 110px 140px 140px 80px;
    gap: 0;
    background: #f8fafc;
    border-bottom: 1px solid #e5e7eb;
    font-weight: 600;
    font-size: 0.75rem;
    color: #374151;
}

.coordinates-table-header > div {
    padding: 0.75rem 0.5rem;
    text-align: center;
    border-right: 1px solid #e5e7eb;
}

.coordinates-table-header > div:last-child {
    border-right: none;
}

.coordinate-row {
    display: grid;
    grid-template-columns: 80px 100px 110px 140px 140px 80px;
    gap: 0;
    border-bottom: 1px solid #f3f4f6;
    background: white;
    transition: background-color 0.2s ease;
}

.coordinate-row:hover {
    background: #fafbfc;
}

.coordinate-row:last-child {
    border-bottom: none;
}

.coordinate-row > div {
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #f3f4f6;
}

.coordinate-row > div:last-child {
    border-right: none;
}

.coord-input {
    width: 100%;
    padding: 0.375rem 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.75rem;
    text-align: center;
    background: white;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.coord-input:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
}

.coord-input:hover {
    border-color: #c4b5fd;
}

.remove-coord-btn {
    padding: 0.25rem;
    min-width: auto;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
}

.remove-coord-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.remove-coord-btn svg {
    width: 12px;
    height: 12px;
}

/* Add subtle gradient to indicate scrollable content */
.coordinates-table-container::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 20px;
    background: linear-gradient(to left, rgba(255, 255, 255, 0.8), transparent);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.coordinates-table-container:hover::after {
    opacity: 1;
}

/* Responsive adjustments for coordinates table */
@media (max-width: 768px) {
    .coordinates-table {
        min-width: 550px; /* Reduce minimum width on mobile */
    }
    
    .coordinates-table-header,
    .coordinate-row {
        grid-template-columns: 60px 80px 90px 110px 110px 60px;
        font-size: 0.7rem;
    }
    
    .coord-input {
        font-size: 0.7rem;
        padding: 0.25rem 0.375rem;
    }
    
    .coordinates-table-header > div,
    .coordinate-row > div {
        padding: 0.375rem 0.25rem;
    }
}


</style> 
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
                <h1>Well Data Ingest</h1>
                <p>Configure your dataset properties and upload files</p>
            </div>
            
            <!-- Workflow Progress -->
            <WorkflowProgress 
                :current-stage="wellStore.data.currentStage"
                :completed-stages="wellStore.data.completedStages"
            />
        </header>

        <main class="ingest-main">
            <div class="ingest-grid">
                <!-- Properties Panel -->
                <div class="properties-panel">
                    <div class="panel-card">
                        <h2>Properties</h2>

                        <div class="form-group">
                            <div class="form-row">
                                <label>Target Well</label>
                                <div class="select-with-search">
                                    <div class="searchable-select">
                                        <input 
                                            type="text" 
                                            v-model="wellSearchQuery"
                                            @focus="showWellDropdown = true"
                                            @blur="hideWellDropdown"
                                            @input="filterWells"
                                            :placeholder="(wellsLoading ? 'Loading wells...' : 'Search wells...')"
                                            class="form-input"
                                            :class="{ 'has-selection': selectedWellName }"
                                            :disabled="wellsLoading"
                                        />
                                        <div v-if="showWellDropdown && filteredWells.length > 0" class="dropdown-list">
                                            <div 
                                                v-for="well in filteredWells" 
                                                :key="well._id"
                                                @mousedown="selectWell(well)"
                                                class="dropdown-item"
                                            >
                                                <span class="well-name">{{ well.name || well.UWI || well.wellboreId || `Well ${well._id}` }}</span>
                                                <!-- <span class="well-details">{{ well.UWI ? `UWI: ${well.UWI}` : '' }} {{ well.field ? `Field: ${well.field}` : '' }}</span> -->
                                            </div>
                                        </div>
                                        <div v-if="showWellDropdown && filteredWells.length === 0 && wellSearchQuery.length > 0" class="dropdown-list">
                                            <div class="dropdown-item no-results">No wells found</div>
                                        </div>
                                    </div>
                                    <button class="btn btn-outline btn-sm add-well-btn" @click="openCreateWellModal" title="Create new well">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
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

                        <!-- Wells from Store -->
                        <div class="form-group" v-if="wellStore.data.well.length > 0">
                            <div class="form-row">
                                <label>Selected Wells</label>
                                <div class="wells-container">
                                    <div class="wells-header">
                                        <div class="wells-count">
                                            {{ wellStore.data.well.length }} well{{ wellStore.data.well.length !== 1 ? 's' : '' }} selected
                                        </div>
                                        <button 
                                            class="btn btn-link btn-sm clear-wells-btn"
                                            @click="clearAllWells"
                                            v-if="wellStore.data.well.length > 0"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                    <div class="wells-grid">
                                        <div 
                                            v-for="well in wellStore.data.well" 
                                            :key="well.wellId"
                                            class="well-card"
                                        >
                                            <div class="well-card-content">
                                                <div class="well-info">
                                                    <div class="well-details">
                                                        <span class="well-name">{{ well.wellName }}</span>
                                                        <!-- <span class="well-uwi" v-if="well.UWI">{{ well.UWI }}</span> -->
                                                    </div>
                                                </div>
                                                <button 
                                                    class="remove-well-btn"
                                                    @click="removeWell(well.wellId)"
                                                    title="Remove well"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
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

        <!-- Create Well Modal -->
        <div v-if="showCreateWellModal" class="modal-overlay" @click="closeCreateWellModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Create New Well</h3>
                    <button class="modal-close" @click="closeCreateWellModal">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>
                
                <div class="modal-body">
                    <form @submit.prevent="createWell">
                        <div class="form-group">
                            <label>Well Name *</label>
                            <input 
                                type="text" 
                                v-model="newWell.name" 
                                placeholder="Enter well name"
                                class="form-input"
                                required
                            />
                        </div>

                        <!-- <div class="form-group">
                            <label>Coordinate Reference System (CRS) *</label>
                            <div class="searchable-select">
                                <input 
                                    type="text" 
                                    v-model="newWellCrsSearchQuery"
                                    @focus="showNewWellCrsDropdown = true"
                                    @blur="hideNewWellCrsDropdown"
                                    @input="filterNewWellCrs"
                                    :placeholder="(crsLoading ? 'Loading CRS...' : 'Search coordinate reference systems...')"
                                    class="form-input"
                                    :class="{ 'has-selection': newWell.crsId }"
                                    :disabled="crsLoading"
                                    required
                                />
                                <div v-if="showNewWellCrsDropdown && filteredNewWellCrs.length > 0" class="dropdown-list">
                                    <div 
                                        v-for="crsItem in filteredNewWellCrs" 
                                        :key="crsItem._id"
                                        @mousedown="selectNewWellCrs(crsItem)"
                                        class="dropdown-item"
                                    >
                                        <span class="crs-name">{{ crsItem.name || crsItem.code || `CRS ${crsItem._id}` }}</span>
                                        <span class="crs-details">{{ crsItem.code ? `Code: ${crsItem.code}` : '' }} {{ crsItem.authority ? `Authority: ${crsItem.authority}` : '' }}</span>
                                    </div>
                                </div>
                                <div v-if="showNewWellCrsDropdown && filteredNewWellCrs.length === 0 && newWellCrsSearchQuery.length > 0" class="dropdown-list">
                                    <div class="dropdown-item no-results">No CRS found</div>
                                </div>
                            </div>
                        </div> -->

                        <div class="form-group">
                            <label>Country *</label>
                            <div class="searchable-select">
                                <input 
                                    type="text" 
                                    v-model="countrySearchQuery"
                                    @focus="showCountryDropdown = true"
                                    @blur="hideCountryDropdown"
                                    @input="filterCountries"
                                    :placeholder="(countriesLoading ? 'Loading countries...' : 'Search countries...')"
                                    class="form-input"
                                    :class="{ 'has-selection': newWell.countryId }"
                                    :disabled="countriesLoading"
                                    required
                                />
                                <div v-if="showCountryDropdown && filteredCountries.length > 0" class="dropdown-list">
                                    <div 
                                        v-for="country in filteredCountries" 
                                        :key="country._id"
                                        @mousedown="selectCountry(country)"
                                        class="dropdown-item"
                                    >
                                        <span class="country-name">{{ country.name }}</span>
                                        <span class="country-details">{{ country.code ? `Code: ${country.code}` : '' }}</span>
                                    </div>
                                </div>
                                <div v-if="showCountryDropdown && filteredCountries.length === 0 && countrySearchQuery.length > 0" class="dropdown-list">
                                    <div class="dropdown-item no-results">No countries found</div>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Operator *</label>
                            <div class="searchable-select">
                                <input 
                                    type="text" 
                                    v-model="newWell.operator" 
                                    placeholder="Enter operator"
                                    class="form-input"
                                    required
                                />
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Coordinate X *</label>
                                <input 
                                    type="number" 
                                    v-model.number="newWell.coordinateX" 
                                    placeholder="Enter X coordinate"
                                    class="form-input"
                                    step="any"
                                    required
                                />
                            </div>
                            <div class="form-group">
                                <label>Coordinate Y *</label>
                                <input 
                                    type="number" 
                                    v-model.number="newWell.coordinateY" 
                                    placeholder="Enter Y coordinate"
                                    class="form-input"
                                    step="any"
                                    required
                                />
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-ghost" @click="closeCreateWellModal">Cancel</button>
                    <button type="button" class="btn btn-primary" @click="createWell" :disabled="!isCreateWellFormValid || creatingWell">
                        {{ creatingWell ? 'Creating...' : 'Create Well' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// import { useFileStore } from '../store/fileStore';
import { useWellStore } from '../../store/wellStore';
import { useWell } from '../../Composables/useWell';
import { useCRS } from '../../Composables/useCRS';
import { useCountry } from '../../Composables/useCountry';
import WorkflowProgress from '../../Components/WorkflowProgress.vue';
import { FileFilter } from '../../../utils/fileFilter';

const route = useRoute();
const router = useRouter();
const wellStore = useWellStore();
const { fetch: fetchWells, insert: createWellAPI } = useWell();
const { fetch: fetchCrs } = useCRS();
const { fetch: fetchCountries } = useCountry();

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

// Wells data
const wells = ref<any[]>([]);
const wellsLoading = ref(false);
const wellSearchQuery = ref('');
const filteredWells = ref<any[]>([]);
const showWellDropdown = ref(false);
const selectedWellName = ref('');

// CRS data
const crs = ref<any[]>([]);
const crsLoading = ref(false);
const crsSearchQuery = ref('');
const filteredCrs = ref<any[]>([]);
const showCrsDropdown = ref(false);
const selectedCrsId = ref('');

// Countries data
const countries = ref<any[]>([]);
const countriesLoading = ref(false);
const countrySearchQuery = ref('');
const filteredCountries = ref<any[]>([]);
const showCountryDropdown = ref(false);

// Create Well Modal
const showCreateWellModal = ref(false);
const creatingWell = ref(false);
const newWell = ref({
    name: '',
    crsId: '',
    countryId: '',
    operator: '',
    coordinateX: null as number | null,
    coordinateY: null as number | null
});

// New Well CRS data
// const newWellCrsSearchQuery = ref('');
const filteredNewWellCrs = ref<any[]>([]);
const showNewWellCrsDropdown = ref(false);

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

const isCreateWellFormValid = computed(() => {
    return newWell.value.name.trim() !== '' && 
           newWell.value.countryId !== '' && 
           newWell.value.operator.trim() !== '' && 
           newWell.value.coordinateX !== null && 
           newWell.value.coordinateY !== null;
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

// Create Well Modal Methods
const openCreateWellModal = () => {
    showCreateWellModal.value = true;
    // Reset form
    newWell.value = {
        name: '',
        crsId: '',
        countryId: '',
        operator: '',
        coordinateX: null,
        coordinateY: null
    };
    // newWellCrsSearchQuery.value = '';
    countrySearchQuery.value = '';
};

const closeCreateWellModal = () => {
    showCreateWellModal.value = false;
};

const createWell = async () => {
    if (!isCreateWellFormValid.value || creatingWell.value) return;
    
    try {
        creatingWell.value = true;

        let wellData = useWell().createEmptyWell();

        wellData.name = newWell.value.name;
        wellData.country = newWell.value.countryId;
        wellData.latitude = newWell.value.coordinateX || 0;
        wellData.longitude = newWell.value.coordinateY || 0;
        wellData.operator = newWell.value.operator;

        // console.log("wellData body request", wellData);

        // return;
        
        const createdWell = await createWellAPI(wellData);
        
        // Add the new well to the wells list
        wells.value.unshift(createdWell);
        filteredWells.value = wells.value;
        
        // Auto-select the newly created well
        selectWell(createdWell);
        
        // Close modal
        closeCreateWellModal();
        
        console.log('Well created successfully:', createdWell);
    } catch (error) {
        console.error('Error creating well:', error);
        // You might want to show an error message to the user here
    } finally {
        creatingWell.value = false;
    }
};

// New Well CRS Methods
// const filterNewWellCrs = () => {
//     if (!newWellCrsSearchQuery.value.trim()) {
//         filteredNewWellCrs.value = crs.value;
//         return;
//     }
    
//     const query = newWellCrsSearchQuery.value.toLowerCase();
//     filteredNewWellCrs.value = crs.value.filter(crsItem => {
//         const name = (crsItem.name || '').toLowerCase();
//         return name.includes(query);
//     });
// };

// const selectNewWellCrs = (crsItem: any) => {
//     newWell.value.crsId = crsItem._id;
//     newWellCrsSearchQuery.value = crsItem.name || crsItem.code || `CRS ${crsItem._id}`;
//     showNewWellCrsDropdown.value = false;
// };

const hideNewWellCrsDropdown = () => {
    setTimeout(() => {
        showNewWellCrsDropdown.value = false;
    }, 200);
};

// Country Methods
const filterCountries = () => {
    if (!countrySearchQuery.value.trim()) {
        filteredCountries.value = countries.value;
        return;
    }
    
    const query = countrySearchQuery.value.toLowerCase();
    filteredCountries.value = countries.value.filter(country => {
        const name = (country.name || '').toLowerCase();
        const code = (country.code || '').toLowerCase();
        return name.includes(query) || code.includes(query);
    });
};

const selectCountry = (country: any) => {
    newWell.value.countryId = country._id;
    countrySearchQuery.value = country.name || `Country ${country._id}`;
    showCountryDropdown.value = false;
};

const hideCountryDropdown = () => {
    setTimeout(() => {
        showCountryDropdown.value = false;
    }, 200);
};

const saveDataset = () => {
    if (!isFormValid.value) return;
};

const selectFiles = async () => {
    try {
        const extensions = FileFilter.getExtensions('well').map(ext => ext.substring(1)); // Remove the dot
        const result = await (window as any).electronAPI.openFile(extensions);
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
            progress: 100,
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
            progress: 100,
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

const filterWells = () => {
    if (!wellSearchQuery.value.trim()) {
        filteredWells.value = wells.value;
        return;
    }
    
    const query = wellSearchQuery.value.toLowerCase();
    filteredWells.value = wells.value.filter(well => {
        const name = (well.name || '').toLowerCase();
        const uwi = (well.UWI || '').toLowerCase();
        const wellboreId = (well.wellboreId || '').toLowerCase();
        const field = (well.field || '').toLowerCase();
        const operator = (well.operator || '').toLowerCase();
        
        return name.includes(query) || 
               uwi.includes(query) || 
               wellboreId.includes(query) || 
               field.includes(query) || 
               operator.includes(query);
    });
};

const selectWell = (well: any) => {

    let wellData = "data" in well ? well.data : well;

    targetWell.value = wellData._id;
    selectedWellName.value = wellData.name;
    wellSearchQuery.value = '';
    showWellDropdown.value = false;

    wellStore.addWellData({
        wellId: wellData._id,
        wellName: wellData.name,
        UWI: wellData.UWI || '',
        coordx: wellData.latitude,
        coordy: wellData.longitude,
    });
};

const hideWellDropdown = () => {
    setTimeout(() => {
        showWellDropdown.value = false;
    }, 200); // Delay to allow click event to fire
};

const searchWells = async () => {
    try {
        wellsLoading.value = true;
        wells.value = await fetchWells();
        filteredWells.value = wells.value;
    } catch (error) {
        console.error('Error searching wells:', error);
    } finally {
        wellsLoading.value = false;
    }
};

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

    // console.log("crsItem chosen", crsItem);

    // console.log("crsItem.proj4", crsItem.proj4);
    // console.log("crsItem.srid", crsItem.srid);
    
    // Store selected CRS data if needed
    wellStore.setCRS({
        proj4: crsItem.proj4,
        srid: crsItem.srid
    });

    // console.log("wellStore.data.CRS", wellStore.data.CRS);
    // console.log("wellStore.data.CRS.proj4", wellStore.data.CRS.proj4);
    // console.log("wellStore.data.CRS.srid", wellStore.data.CRS.srid);
};

const hideCrsDropdown = () => {
    setTimeout(() => {
        showCrsDropdown.value = false;
    }, 200); // Delay to allow click event to fire
};

const searchCrs = async () => {
    try {
        crsLoading.value = true;
        crs.value = await fetchCrs();
        filteredCrs.value = crs.value;
        filteredNewWellCrs.value = crs.value; // Initialize for new well modal
    } catch (error) {
        console.error('Error searching CRS:', error);
    } finally {
        crsLoading.value = false;
    }
};

const searchCountries = async () => {
    try {
        countriesLoading.value = true;
        countries.value = await fetchCountries();
        filteredCountries.value = countries.value;
    } catch (error) {
        console.error('Error searching countries:', error);
    } finally {
        countriesLoading.value = false;
    }
};

const toggleSelectAll = () => {
    if (selectAllChecked.value) {
        selectedFiles.value = uploadedFiles.value.map(file => file.id);
    } else {
        selectedFiles.value = [];
    }
};

const prepareDataset = () => {
    console.log("uploadedFiles.value.length ", uploadedFiles.value.length)
    
    if (!canPrepareDataset.value) return;
    
    // Set well data if a well is selected
    // if (targetWell.value) {
    //     const selectedWell = wells.value.find(well => well._id === targetWell.value);
    //     if (selectedWell) {
            
    //     }
    // }
    
    // Store selected files in data store
    const filesToStore = uploadedFiles.value.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        progress: file.progress,
        path: file.path || file.name
    }));

    // console.log('[DataPreparation] Files to store:', filesToStore);
    
    wellStore.setSelectedFiles(filesToStore);
    
    // Advance workflow to loading stage and mark preparation as completed
    wellStore.advanceWorkflow('loading', 'preparation');

    // wellStore.setCRS(selectedCrsId.value);
    
    // Navigate to DataQC page with form data
    router.push({
        path: '/well/data-loading',
    });
};

const calculateTotalSize = () => {
    if (uploadedFiles.value.length === 0) return '0 MB';
    const totalBytes = uploadedFiles.value.reduce((sum, file) => sum + file.size, 0);
    return formatFileSize(totalBytes);
};

const clearAllWells = () => {
    wellStore.clearAllWells();
};

const removeWell = (wellId: string) => {
    wellStore.removeWell(wellId);
};

// Lifecycle
onMounted(() => {
    generateDatasetId();
    searchWells();
    searchCrs();
    searchCountries();
    
    // Initialize workflow at preparation stage
    wellStore.setCurrentStage('preparation');
    wellStore.setCompletedStages([]);
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

/* Make the well search input shorter */
.searchable-select .form-input {
    width: 300px;
    max-width: 100%;
}

/* Ensure the button stays beside the input */
.select-with-search {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    flex-wrap: nowrap;
}

.select-with-search .searchable-select {
    flex: 0 0 auto;
}

.select-with-search .add-well-btn {
    flex: 0 0 auto;
    align-self: flex-start;
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

.well-name {
    display: block;
    font-weight: 500;
    color: #080a0b;
    font-size: 0.85rem;
}

.well-details {
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

/* Wells list styles */
.wells-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #fafafa;
}

.well-item {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f3f4f6;
    background: white;
    transition: background-color 0.2s ease;
}

.well-item:last-child {
    border-bottom: none;
}

.well-item:hover {
    background: #faf5ff;
}

.well-item .well-name {
    font-weight: 500;
    color: #1f2937;
    font-size: 0.9rem;
}

.wells-container {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    background: #fafafa;
}

.wells-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.wells-count {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #6b7280;
    font-weight: 500;
}

.wells-icon {
    width: 16px;
    height: 16px;
}

.clear-wells-btn {
    background: none;
    color: #8b5cf6;
    text-decoration: underline;
    padding: 0;
    font-size: 0.75rem;
}

.wells-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
}

.well-card {
    background: white;
    border-radius: 8px;
    padding: 0.75rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
}

.well-card:hover {
    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.08);
    border-color: #e9d5ff;
}

.well-card-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.well-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.well-card-icon {
    width: 14px;
    height: 14px;
}

.well-details {
    display: flex;
    flex-direction: column;
}

.well-name {
    font-weight: 500;
    color: #1f2937;
    font-size: 0.8rem;
}

.well-uwi {
    font-size: 0.7rem;
    color: #6b7280;
}

.remove-well-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
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

.add-well-btn {
    min-width: 40px;
    height: 38px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-color: #8b5cf6;
    color: #8b5cf6;
}

.add-well-btn:hover {
    background: #8b5cf6;
    color: white;
}

/* Modal styles */
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
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
    color: #0f172a;
    font-size: 1.25rem;
    font-weight: 600;
}

.modal-close {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: #64748b;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.modal-close:hover {
    background: #f1f5f9;
    color: #374151;
}

.modal-body {
    padding: 2rem;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.5rem 2rem;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
}

.country-name {
    display: block;
    font-weight: 500;
    color: #080a0b;
    font-size: 0.85rem;
}

.country-details {
    display: block;
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
}
</style> 
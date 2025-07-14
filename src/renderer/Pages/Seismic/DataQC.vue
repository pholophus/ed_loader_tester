<template>
    <div class="data-qc-content">
        <!-- Header -->
        <header class="page-header">
            <div class="header-nav">
                <router-link to="/seismic/data-loading" class="back-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                    Back
                </router-link>
                <div class="header-actions">
                    <button v-if="seismicStore.data.currentStage !== 'publication'" class="btn btn-primary"
                        @click="proceedToQualityCheck">
                        Quality Check
                    </button>
                    <button
                        v-if="seismicStore.data.currentStage == 'publication' && seismicStore.data.approval.isApproved"
                        class="btn btn-primary" @click="proceedToPublish">
                        Publish
                    </button>
                </div>
            </div>
            <div class="header-info">
                <div class="dataset-title">
                    <h1>{{ datasetName || 'OSDU_Demo' }}</h1>
                    <div class="dataset-meta">
                        <span class="company">Company: - </span>
                        <span class="created-by">Created By: - </span>
                        <span class="uploaded">Uploaded: {{ uploadedDate }}</span>
                        <span class="size">Size: {{ totalSeismicFileSize }}</span>
                    </div>
                </div>
            </div>

            <!-- Workflow Progress -->
            <WorkflowProgress :current-stage="seismicStore.data.currentStage"
                :completed-stages="seismicStore.data.completedStages" />

            <!-- Approval Notice -->
            <div v-if="settingsStore.options.publishAuto == false && seismicStore.data.currentStage == 'approval'"
                class="approval-notice">
                <div class="approval-content">
                    <span class="approval-text">Publication of this dataset requires your approval</span>
                    <div class="approval-actions">
                        <button class="btn btn-approve" @click="showApprovalModal">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            Approve Dataset
                        </button>
                        <!-- <button class="btn btn-reject" @click="rejectDataset">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            Reject Dataset
                        </button> -->
                    </div>
                </div>
            </div>


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
                                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        </div>

                        <!-- Tabs -->
                        <div class="tabs">
                            <button class="tab" :class="{ active: activeTab === 'dataset' }"
                                @click="activeTab = 'dataset'">
                                Dataset
                            </button>
                            <button class="tab" :class="{ active: activeTab === 'files' }" @click="activeTab = 'files'">
                                Files ({{ selectedLineId ? seismicStore.getSeismicFileCount(selectedLineId) :
                                    files.length }})
                            </button>
                            <!-- <button class="tab" :class="{ active: activeTab === 'logs' }" @click="activeTab = 'logs'">
                                Logs ({{ logs.length }})
                            </button>
                            <button class="tab" :class="{ active: activeTab === 'curves' }"
                                @click="activeTab = 'curves'">
                                Curves ({{ curves.length }})
                            </button> -->
                        </div>

                        <!-- Dataset Tab Content -->
                        <div v-if="activeTab === 'dataset'" class="tab-content">
                            <div class="dataset-info">
                                <!-- Wells List -->
                                <div class="info-section">
                                    <!-- <h3>Wells ({{ wellStore.data.well.length }})</h3> -->
                                    <!-- <div v-if="wellStore.data.well.length === 0" class="no-wells">
                                        No wells available
                                    </div>
                                    <div v-else class="wells-table-container">
                                        <table class="wells-table">
                                            <thead>
                                                <tr>
                                                    <th>Well Name</th>
                                                    <th>Well ID</th>
                                                    <th>UWI</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="well in wellStore.data.well" 
                                                    :key="well.wellId"
                                                    :class="{ 'selected-well': selectedLineId === well.wellId }"
                                                    @click="selectLine(well.wellId)">
                                                    <td class="well-name">{{ well.wellName }}</td>
                                                    <td class="well-id-cell">{{ well.wellId }}</td>
                                                    <td class="well-uwi">{{ well.UWI || 'N/A' }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div class="wells-count">
                                            {{ wellStore.data.well.length }} well{{ wellStore.data.well.length !== 1 ? 's' : '' }}
                                            <span v-if="selectedLineId" class="selected-well-indicator">
                                                • {{ getSelectedLineName() }} selected
                                            </span>
                                        </div>
                                    </div> -->
                                    <!-- <div v-if="seismicStore.data.line.length === 0" class="no-lines">
                                        No lines available
                                    </div>
                                    <div v-else class="lines-table-container">
                                        <table class="lines-table">
                                            <thead>
                                                <tr>
                                                    <th>Line Name</th>
                                                    <th>Line ID</th>
                                                    <th>Survey</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="line in seismicStore.data.line" 
                                                    :key="line.lineId"
                                                    :class="{ 'selected-line': selectedLineId === line.lineId }"
                                                    @click="selectLine(line.lineId)">
                                                    <td class="line-name">{{ line.name }}</td>
                                                    <td class="line-id-cell">{{ line.lineId }}</td>
                                                    <td class="line-survey">{{ seismicStore.data.survey.name || 'N/A' }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div class="lines-count">
                                            {{ seismicStore.data.line.length }} line{{ seismicStore.data.line.length !== 1 ? 's' : '' }}
                                            <span v-if="selectedLineId" class="selected-line-indicator">
                                                • {{ getSelectedLineName() }} selected
                                            </span>
                                        </div>
                                    </div> -->
                                    <div v-if="seismicStore.data.isForCreatingNewSeismic">
                                        <div class="survey-details">
                                            <!-- <h3>Survey Details</h3> -->
                                            <div class="survey-info">
                                                <div class="info-row">
                                                    <label>Survey Name:</label>
                                                    <span>{{ seismicStore.data.survey.name || 'Not specified' }}</span>
                                                </div>
                                                <div class="info-row">
                                                    <label>Country:</label>
                                                    <span>{{ seismicStore.data.survey.country || 'Not specified'
                                                    }}</span>
                                                </div>
                                                <div class="info-row">
                                                    <label>Dimension:</label>
                                                    <span>{{ seismicStore.data.survey.dimension || 'Not specified'
                                                    }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- File Info -->
                                <!-- <div class="info-row">
                                    <label>Total File Size:</label>
                                    <span>{{ totalWellFileSize }}</span>
                                </div> -->
                                <!-- File Info -->
                                <div class="info-row">
                                    <label>Total File Size:</label>
                                    <span>{{ totalSeismicFileSize }}</span>
                                </div>
                            </div>

                            <!-- Status Summary -->
                            <!-- <div class="status-summary">
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
                            </div> -->
                        </div>

                        <!-- Files Tab Content -->
                        <div v-if="activeTab === 'files'" class="tab-content">
                            <div v-if="seismicStore.data.isForUploadingFileForExistingSeismic && !selectedLineId"
                                class="no-well-selected">
                                <div class="no-well-message">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" class="no-well-icon">
                                        <path d="M9 12L11 14L15 10" stroke="#9ca3af" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                        <circle cx="12" cy="12" r="10" stroke="#9ca3af" stroke-width="2" fill="none" />
                                    </svg>
                                    <h3>Select a Well</h3>
                                    <p>Please select a well from the Dataset tab to view its files.</p>
                                </div>
                            </div>

                            <div v-else>
                                <div class="files-actions">
                                    <button class="btn btn-outline btn-sm" @click="removeSelectedFiles"
                                        :disabled="checkedFiles.size === 0">
                                        Remove{{ checkedFiles.size > 0 ? ` (${checkedFiles.size})` : '' }}
                                    </button>
                                </div>

                                <div class="table-container">
                                    <div class="table-scroll-wrapper">
                                        <table class="components-table">
                                            <thead>
                                                <tr>
                                                    <th><input type="checkbox" :checked="allFilesChecked"
                                                            :indeterminate="someFilesChecked"
                                                            @change="toggleAllFiles" /></th>
                                                    <th>File Name</th>
                                                    <th>Size</th>
                                                    <th v-if="seismicStore.data.isForUploadingFileForExistingSeismic">
                                                        Line</th>
                                                    <th>Category</th>
                                                    <th>Sub Category</th>
                                                    <th>First Field File</th>
                                                    <th>Last Field File</th>
                                                    <th>FSP</th>
                                                    <th>LSP</th>
                                                    <th>First CDP</th>
                                                    <th>Last CDP</th>
                                                    <th>InLine</th>
                                                    <th>XLine</th>
                                                    <th>Validation Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="file in paginatedFiles" :key="file.id" :class="{
                                                    selected: selectedFile?.id === file.id,
                                                    'validation-error': getValidationStatus(file.id) === 'error',
                                                    'validation-success': getValidationStatus(file.id) === 'success'
                                                }" @click="selectFile(file)">
                                                    <td><input type="checkbox" :checked="isFileChecked(file.id)"
                                                            @click="toggleFileCheck(file.id, $event)" /></td>
                                                    <td class="file-name">{{ file.name }}</td>
                                                    <td>{{ formatFileSize(file.size) }}</td>
                                                    <td v-if="seismicStore.data.isForUploadingFileForExistingSeismic">
                                                        <select class="entity-select"
                                                            v-model="(file as SeismicDataQCFileData).wellId">
                                                            <option value="">Select Line</option>
                                                            <option v-for="line in seismicStore.data.lines"
                                                                :key="line.lineId" :value="line.lineId">
                                                                {{ line.name }}
                                                            </option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <select class="entity-select" v-model="file.selectedDataTypeId"
                                                            @change="onDataTypeChange(file, file.selectedDataTypeId || '')">
                                                            <option value="">Select Category</option>
                                                            <option v-for="dataType in activeDataTypes"
                                                                :key="dataType._id" :value="dataType._id">
                                                                {{ dataType.displayName }}
                                                            </option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <select class="entity-select"
                                                            v-model="file.selectedSubDataTypeId"
                                                            :disabled="!file.selectedDataTypeId"
                                                            @change="onSubDataTypeChange(file, file.selectedSubDataTypeId || '')">
                                                            <option value="">Select Sub Category</option>
                                                            <option
                                                                v-for="subDataType in getFilteredSubDataTypes(file.selectedDataTypeId || '')"
                                                                :key="subDataType._id" :value="subDataType._id">
                                                                {{ subDataType.displayName }}
                                                            </option>
                                                        </select>
                                                    </td>
                                                    <td>{{ getExtractedValue(file, 'first_trace', 'Ffid') }}</td>
                                                    <td>{{ getExtractedValue(file, 'last_trace', 'Ffid') }}</td>
                                                    <td>{{ getExtractedValue(file, 'first_trace', 'Sp') }}</td>
                                                    <td>{{ getExtractedValue(file, 'last_trace', 'Sp') }}</td>
                                                    <td>{{ getExtractedValue(file, 'first_trace', 'Cdp') }}</td>
                                                    <td>{{ getExtractedValue(file, 'last_trace', 'Cdp') }}</td>
                                                    <td>{{ getExtractedValue(file, 'first_trace', 'Il') }}</td>
                                                    <td>{{ getExtractedValue(file, 'first_trace', 'Xl') }}</td>
                                                    <td>
                                                        <div class="status-icon" :class="{
                                                            success: getValidationStatus(file.id) === 'success',
                                                            error: getValidationStatus(file.id) === 'error'
                                                        }">
                                                            <span
                                                                v-if="getValidationStatus(file.id) === 'success'">✓</span>
                                                            <span
                                                                v-else-if="getValidationStatus(file.id) === 'error'">✗</span>
                                                            <span v-else>-</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div class="table-footer">
                                        <div class="footer-left">
                                            <span>{{ paginationInfo }}</span>
                                            <div class="items-per-page">
                                                <label>Show:</label>
                                                <select v-model="itemsPerPage" class="items-select">
                                                    <option :value="5">5</option>
                                                    <option :value="10">10</option>
                                                    <option :value="25">25</option>
                                                    <option :value="50">50</option>
                                                </select>
                                                <span>per page</span>
                                            </div>
                                        </div>
                                        <div class="pagination">
                                            <button class="page-btn" @click="goToPreviousPage"
                                                :disabled="!canGoToPreviousPage">‹</button>
                                            <span class="page-info">Page {{ currentPage }} of {{ totalPages || 1
                                            }}</span>
                                            <button class="page-btn" @click="goToNextPage"
                                                :disabled="!canGoToNextPage">›</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>



                        <!-- Process Status -->
                        <!-- <div class="process-status">
                            <div class="process-stage"
                                :class="{ active: currentStage === 'preparation', completed: stageCompleted('preparation') }">
                                <div class="stage-icon">
                                    <svg v-if="stageCompleted('preparation')" width="32" height="32" viewBox="0 0 24 24"
                                        fill="none">
                                        <circle cx="12" cy="12" r="10" fill="#22c55e" />
                                        <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </div>
                                <div class="stage-label">
                                    <h3>Preparation</h3>
                                    <p>100%</p>
                                </div>
                            </div>

                            <div class="process-stage"
                                :class="{ active: currentStage === 'loading', completed: stageCompleted('loading') }">
                                <div class="stage-icon">
                                    <div v-if="currentStage === 'loading'" class="loading-circle">
                                        <div class="spinner"></div>
                                    </div>
                                    <svg v-else-if="stageCompleted('loading')" width="32" height="32"
                                        viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" fill="#22c55e" />
                                        <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
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
                        </div> -->
                    </div>
                </div>

                <!-- Details Panel -->
                <DatasetDetails v-if="activeTab === 'dataset'" />
                <FilesDetails v-if="activeTab === 'files' && selectedFile !== null" :selected-file="selectedFile" />
            </div>
        </main>

        <!-- Approval Modal -->
        <div v-if="showApprovalModalDialog" class="modal-overlay" @click.self="closeApprovalModal">
            <div class="modal-container">
                <div class="modal-header">
                    <h3>Approval Confirmation</h3>
                    <button class="modal-close" @click="closeApprovalModal">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
                <div class="modal-body">
                    <label for="approval-comments" class="modal-label">By approving this means you acknowledge that the data is ready to be published.</label>
                    <!-- <textarea id="approval-comments" v-model="approvalComments" class="modal-textarea"
                        placeholder="Enter your approval comments here..." rows="4"></textarea> -->
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" @click="closeApprovalModal">
                        Cancel
                    </button>
                    <button class="btn btn-approve" @click="approveDataset">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                        Approve
                    </button>
                </div>
            </div>
        </div>

        <!-- Success Modal -->
        <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeSuccessModal">
            <div class="success-modal-container">
                <div class="success-modal-content">
                    <div class="success-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="#22c55e" />
                            <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <h3 class="success-title">Dataset Approved</h3>
                    <button class="btn btn-primary success-btn" @click="closeSuccessModal">
                        Done
                    </button>
                </div>
            </div>
        </div>

        <!-- Publish Modal -->
        <div v-if="showPublishModal" class="modal-overlay">
            <div class="publish-modal-container">
                <div class="publish-modal-content">
                    <div v-if="publishStatus === 'uploading'" class="upload-progress">
                        <div class="upload-icon">
                            <div class="spinner-large"></div>
                        </div>
                        <h3 class="upload-title">Uploading Files</h3>
                        <p class="upload-subtitle">Uploading files to FTP server...</p>
                        <div class="progress-bar">
                            <div class="progress-fill" :style="{ width: publishProgress + '%' }"></div>
                        </div>
                        <div class="progress-info">
                            <span class="progress-percent">{{ Math.round(publishProgress) }}%</span>
                            <span v-if="currentUploadingFile" class="current-file">{{ currentUploadingFile }}</span>
                        </div>
                    </div>

                    <div v-if="publishStatus === 'completed'" class="upload-success">
                        <div class="success-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" fill="#22c55e" />
                                <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <h3 class="success-title">Files Uploaded</h3>
                        <p class="success-subtitle">All files have been successfully uploaded to the FTP server.</p>
                    </div>

                    <div v-if="publishStatus === 'error'" class="upload-error">
                        <div class="error-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" fill="#ef4444" />
                                <path d="M15 9L9 15M9 9L15 15" stroke="white" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <h3 class="error-title">Upload Failed</h3>
                        <p class="error-subtitle">{{ publishError }}</p>

                        <!-- Detailed error list -->
                        <div v-if="debugErrorDetails.length > 0" class="error-details">
                            <h4 class="error-details-title">File Errors:</h4>
                            <div class="error-files-list">
                                <div v-for="(errorDetail, index) in debugErrorDetails" :key="index"
                                    class="error-file-item">
                                    <div class="error-file-name">{{ errorDetail.fileName }}</div>
                                    <div class="error-file-message">{{ errorDetail.error }}</div>
                                </div>
                            </div>
                        </div>

                        <button class="btn btn-primary" @click="closePublishModal">
                            Close
                        </button>
                    </div>
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
import DatasetDetails from './DataQC/DatasetDetails.vue';
import FilesDetails from './DataQC/FilesDetails.vue';
import WorkflowProgress from '../../Components/WorkflowProgress.vue';
import NotificationModal from '../../Components/NotificationModal.vue';
// import { useWellStore, ValidationResult } from '../../store/wellStore';
import { useSeismicStore, ValidationResult } from '../../store/seismicStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useDataType } from '../../Composables/useDataType';
import { useSubDataType } from '../../Composables/useSubDataType';
import { useFileData } from '../../Composables/useFileData';
import { segySchema } from '../../../schemas/qc/segy';
import ExtendedFileData from '../../../schemas/ExtendedFileData';
import { useSeismicSurvey } from '../../Composables/useSeismicSurvey';
import { useSeismicLine } from '../../Composables/useSeismicLine';

// Extended interface for seismic data QC with additional properties
interface SeismicDataQCFileData extends ExtendedFileData {
    // Survey and seismic identification
    surveyId?: string;
    seismicId?: string;
    seismicName?: string;

    // File properties
    dimension?: string;
    description?: string;
    itemRemarks?: string;

    // Seismic trace data
    firstFieldFile?: number;
    lastFieldFile?: number;
    fsp?: number;
    lsp?: number;
    fcdp?: number;
    lcdp?: number;
    inline?: number;
    xline?: number;

    // Trace information
    firstTrc?: number;
    lastTrc?: number;
    ntraces?: number;

    // Sample data
    sampleType?: string;
    sampleRate?: number;
    sampleRateUom?: string;
    recordLength?: number;
    recordLengthUom?: string;

    // File paths
    fileWindowsPath?: string;
    fileUnixPath?: string;

    // Bin spacing
    binSpacing?: number;

    // Well/Line ID (reusing wellId for line selection in seismic context)
    wellId?: string;
}

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
} from '../../../services/lasService';
import { useGeoFile } from '@/Composables/useGeoFile';
import { useUserStore } from '@/store/userStore';
import { useSeismicCoordinate } from '@/Composables/useSeismicCoordinate';

const route = useRoute();
const router = useRouter();
// const wellStore = useWellStore();
const seismicStore = useSeismicStore();
const settingsStore = useSettingsStore();

// Composables
const { items: dataTypes, fetch: fetchDataTypes } = useDataType();
const { items: subDataTypes, fetch: fetchSubDataTypes } = useSubDataType();
const {
    fileDataMap,
    initializeFileData,
    getFilesByLineId,
    updateFileData,
    removeFile
} = useFileData({ includeQCFields: true, defaultQualityStatus: 'success', storeType: 'seismic' });

const { createBulk: createBulkSeismicLine } = useSeismicLine();
const { createBulkByLine } = useSeismicCoordinate();
const { createBulk: createBulkGeoFile } = useGeoFile();

// Data from route or default values
const datasetName = ref(route.query.datasetName as string || 'OSDU_Demo');
// const datasetId = ref(route.query.datasetId as string || '1051');
// const company = ref(route.query.company as string || 'BAKER HUGHES');
// const createdBy = ref(route.query.createdBy as string || 'recall_controller');
const uploadedDate = ref(route.query.uploadedDate as string || new Date().toISOString().slice(0, 19).replace('T', ' '));
// const totalSize = ref(route.query.totalSize as string || '6.3 MB');
// const description = ref(route.query.description as string || '');
// const dataSource = ref(route.query.dataSource as string || 'BAKER HUGHES');

// Additional metadata fields
// const region = ref('');
// const createdDate = ref('2021-03-11 10:57:20');
// const loadedDate = ref('2021-03-11 10:57:20');
// const loadedBy = ref('recall_controller');
// const approvedStatus = ref('NotRequired');
// const lastUpdated = ref('2021-03-11 10:57:20');
// const lastUpdatedBy = ref('recall_controller');

// Tab management
const activeTab = ref('dataset');

// Modal management
const showApprovalModalDialog = ref(false);
const approvalComments = ref('');
const showSuccessModal = ref(false);

// Publish modal management
const showPublishModal = ref(false);

// Notification modal management
const showNotificationModal = ref(false);
const notificationType = ref<'success' | 'error' | 'info'>('info');
const notificationTitle = ref('');
const notificationMessage = ref('');

// File management
const checkedFiles = ref<Set<string>>(new Set());
const selectAllFiles = ref(false);
const selectedRowIndex = ref<number | null>(null);
const selectedFile = ref<SeismicDataQCFileData | null>(null);
const editableFileName = ref('');

// Well selection management
const selectedLineId = ref<string>('');

// Pagination state
const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(10);

const publishStatus = ref<'uploading' | 'completed' | 'error'>('uploading');
const publishProgress = ref(0);
const currentUploadingFile = ref('');
const publishError = ref('');
const publishErrorDetails = ref<Array<{ fileName: string, error: string, index?: number }>>([]);

// Computed properties
const files = computed(() => {
    // If a well is selected, filter files by wellId
    if (selectedLineId.value) {
        return getFilesByLineId(selectedLineId.value);
    }

    // Otherwise return all files
    return Array.from(fileDataMap.value.values());
});

// Computed properties for filtered data
const activeDataTypes = computed(() => {
    if (!dataTypes.value) {
        return [];
    }

    const filtered = dataTypes.value.filter((dt: any) => {
        return dt.isActive;
    });

    return filtered;
});

const getFilteredSubDataTypes = (dataTypeId: string) => {
    const filtered = subDataTypes.value?.filter((sdt: any) => {
        return sdt.isActive && sdt.dataTypeId === dataTypeId;
    }) || [];

    return filtered;
};

// Computed properties for checkbox management
const allFilesChecked = computed(() => {
    return files.value.length > 0 && files.value.every(file => checkedFiles.value.has(file.id));
});

const someFilesChecked = computed(() => {
    return checkedFiles.value.size > 0 && !allFilesChecked.value;
});

// Debug computed property to track publishErrorDetails
const debugErrorDetails = computed(() => {
    return publishErrorDetails.value;
});

// const logs = ref([]);
// const curves = ref(Array(14).fill(null));

// const statusCounts = computed(() => ({
//     logs: 1,
//     logFiles: 2,
//     wellFiles: 0,
//     boreholeFiles: 1
// }));

// Calculate total file size from well store
// const totalWellFileSize = computed(() => {
//     const totalBytes = wellStore.data.wellMetadatas.reduce((total, metadata) => {
//         return total + (metadata.size || 0);
//     }, 0);

//     // Convert bytes to human readable format
//     if (totalBytes === 0) return '0 B';
//     const k = 1024;
//     const sizes = ['B', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(totalBytes) / Math.log(k));
//     return parseFloat((totalBytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
// });

// Calculate total file size from seismic store
const totalSeismicFileSize = computed(() => {
    const totalBytes = seismicStore.data.seismicMetadatas.reduce((total, metadata) => {
        return total + (metadata.size || 0);
    }, 0);

    // Convert bytes to human readable format
    if (totalBytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(totalBytes) / Math.log(k));
    return parseFloat((totalBytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
});

// Utility Methods
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
};

// File Management Methods
const selectRow = (index: number) => {
    selectedRowIndex.value = index;
};

const toggleFileCheck = (fileId: string, event: Event) => {
    event.stopPropagation(); // Prevent row selection when clicking checkbox

    if (checkedFiles.value.has(fileId)) {
        checkedFiles.value.delete(fileId);
    } else {
        checkedFiles.value.add(fileId);
    }

    updateSelectAllState();
};

const isFileChecked = (fileId: string) => {
    return checkedFiles.value.has(fileId);
};

const toggleAllFiles = (event: Event) => {
    const target = event.target as HTMLInputElement;

    if (target.checked) {
        files.value.forEach(file => {
            checkedFiles.value.add(file.id);
        });
    } else {
        checkedFiles.value.clear();
    }

    selectAllFiles.value = target.checked;
};

const updateSelectAllState = () => {
    if (files.value.length === 0) {
        selectAllFiles.value = false;
    } else if (checkedFiles.value.size === files.value.length) {
        selectAllFiles.value = true;
    } else {
        selectAllFiles.value = false;
    }
};

const removeSelectedFiles = () => {
    if (checkedFiles.value.size === 0) return;

    checkedFiles.value.forEach(fileId => {
        removeFile(fileId);
    });

    checkedFiles.value.clear();
    selectAllFiles.value = false;
};

const onDataTypeChange = (file: ExtendedFileData, dataTypeId: string) => {
    updateFileData(file.id, {
        selectedDataTypeId: dataTypeId,
        selectedSubDataTypeId: '',
    });
};

const onSubDataTypeChange = (file: ExtendedFileData, subDataTypeId: string) => {
    updateFileData(file.id, {
        selectedSubDataTypeId: subDataTypeId,
    });
};

// Well selection methods
const selectLine = (lineId: string) => {
    selectedLineId.value = lineId;
    // Clear file selection when switching wells
    checkedFiles.value.clear();
    selectedRowIndex.value = null;
};

const getSelectedLineName = (wellId: string | undefined): string => {
    if (!wellId) return '';
    // In seismic context, wellId maps to lineId
    const line = seismicStore.data.lines.find(l => l.lineId === wellId);
    return line?.name || '';
};

// Validation Methods
const validateFileData = async (file: SeismicDataQCFileData): Promise<void> => {
    console.log('[DataQC] Validating file:', file.name);

    if (!file.path) {
        console.error('[DataQC] No file path provided for validation');
        return;
    }

    const seismicFile = file as SeismicDataQCFileData;

    try {
        // Prepare validation data
        const validationData = {
            file_name: file.name,
            edafy_seismic_id: seismicFile.seismicId, // Use seismicId property
            seismic_name: seismicFile.seismicName, // Use seismicName property
            extensionType: file.fileFormat || getFileExtension(file.name).toUpperCase(),
            category: file.selectedDataTypeId,
            subcategory: file.selectedSubDataTypeId,
            dimension: seismicFile.dimension,
            description: seismicFile.description,
            item_remarks: seismicFile.itemRemarks,
            createdFor: file.createdFor,
            createdBy: file.createdBy,
            createdDate: file.createdDate,
            first_field_file: seismicFile.firstFieldFile,
            last_field_file: seismicFile.lastFieldFile,
            fsp: seismicFile.fsp,
            lsp: seismicFile.lsp,
            fcdp: seismicFile.fcdp,
            lcdp: seismicFile.lcdp,
            inline: seismicFile.inline,
            xline: seismicFile.xline,
            bin_spacing: seismicFile.binSpacing,
            first_trc: seismicFile.firstTrc,
            last_trc: seismicFile.lastTrc,
            ntraces: seismicFile.ntraces,
            sample_type: seismicFile.sampleType,
            sample_rate: seismicFile.sampleRate,
            sample_rate_uom: seismicFile.sampleRateUom,
            record_length: seismicFile.recordLength,
            record_length_uom: seismicFile.recordLengthUom,
            file_windows_path: seismicFile.fileWindowsPath,
            file_unix_path: seismicFile.fileUnixPath,
            file_size_bytes: file.size
        };

        const result = segySchema.safeParse(validationData);

        if (result.success) {
            console.log('[Validation] File passed validation:', file.name);
            // Store validation result in seismic store
            seismicStore.updateFileValidationResult(file.id, {
                isValid: true,
                errors: []
            });
        } else {
            console.log('[Validation] File failed validation:', file.name, result.error.issues);
            // Store validation result in seismic store
            seismicStore.updateFileValidationResult(file.id, {
                isValid: false,
                errors: result.error.issues.map(issue => ({
                    title: issue.path.join('.') || 'Validation Error',
                    message: issue.message,
                    type: 'error'
                }))
            });
        }
    } catch (error) {
        console.error('[Validation] Error validating file:', file.name, error);
        // Store validation result in seismic store
        seismicStore.updateFileValidationResult(file.id, {
            isValid: false,
            errors: [{
                title: 'General Error',
                message: 'Validation error occurred',
                type: 'error'
            }]
        });
    }
};

// const getFileValidationResult = (fileId: string): ValidationResult | null => {
//     return validationResults.value.get(fileId) || null;
// };

const runValidationForAllFiles = () => {
    console.log('[QC] Starting quality check validation...');

    Array.from(fileDataMap.value.values()).forEach(file => {
        validateFileData(file);
    });
};

const proceedToQualityCheck = async () => {
    console.log('[QC] Starting quality check process...');

    try {
        // Run validation for all files
        await runValidationForAllFiles();

        // Set that QC has been done
        seismicStore.setHasDoneQC(true);

        // Advance workflow to approval stage and mark quality-check as completed
        seismicStore.advanceWorkflow('approval', 'quality-check');

        console.log('[QC] Stage updated to approval, completed stages:', seismicStore.data.completedStages);

        // Navigate to approval page
        // router.push('/data-approval');
    } catch (error) {
        console.error('[QC] Error during quality check:', error);
    }
};

const proceedToPublish = async () => {
    console.log('[QC] Starting publish process...');

    try {
        /**JANGAN LUPA UNCOMMENT */
        showPublishModal.value = true;
        publishStatus.value = 'uploading';
        publishProgress.value = 0;
        publishError.value = '';
        publishErrorDetails.value = [];

        let createBulkGeoFileResponse = null;

        if (seismicStore.data.uploadOption === 'new') {
            const seismicLines = seismicStore.data.seismicMetadatas.map(metadata => ({
                firstField: metadata.first_field_file,
                lastField: metadata.last_field_file,
                firstShotPoint: metadata.first_shot_point,
                lastShotPoint: metadata.last_shot_point,
                firstCDP: metadata.first_cdp,
                lastCDP: metadata.last_cdp,
                firstInline: metadata.inline,
                lastInline: undefined, // Not present in Metadata, set as undefined
                firstXline: undefined, // Not present in Metadata, set as undefined
                lastXline: undefined, // Not present in Metadata, set as undefined
                binSpacing: undefined, // Not present in Metadata, set as undefined
                firstTRC: undefined, // Not present in Metadata, set as undefined
                lastTRC: undefined, // Not present in Metadata, set as undefined
                numberOfTraces: undefined, // Not present in Metadata, set as undefined
                sampleType: undefined, // Not present in Metadata, set as undefined
                sampleRate: undefined, // Not present in Metadata, set as undefined
                sampleRateUom: undefined, // Not present in Metadata, set as undefined
                recordLength: undefined, // Not present in Metadata, set as undefined
                recordLengthUom: undefined, // Not present in Metadata, set as undefined
                name: metadata.name,
                surveyIds: [seismicStore.data.survey.surveyId]
            }));

            const seismicLineBodyRequest = {
                seismicLines: seismicLines
            }

            /**JANGAN LUPA UNCOMMENT */
            const createdBulkSeismicLineResponse = await createBulkSeismicLine(seismicLineBodyRequest);
            console.log('[QC] createdBulkSeismicLineResponse', createdBulkSeismicLineResponse);
            const createdBulkSeismicLines = createdBulkSeismicLineResponse.data.seismicLines;
            // const { update: updateSeismic, getById } = useSeismic();
            const user = useUserStore().user;


            /**JANGAN LUPA UNCOMMENT */
            const geoFiles = seismicStore.data.seismicMetadatas.map(metadata => {
                const matched = createdBulkSeismicLines.find(
                    (line: any) => line.name === metadata.name
                );

                if (!matched) {
                    throw new Error(`No matching createdBulkSeismicLine for name: ${metadata.name}`);
                }

                return {
                    id: metadata.id || '',
                    fileName: metadata.name || '',
                    fileFormatId: metadata.fileFormat || '',
                    dataTypeId: metadata.dataTypeId || '',
                    subDataTypeId: metadata.subDataTypeId || '',
                    type: 'seismic',
                    description: (metadata as any).description || '',
                    title: (metadata as any).title || metadata.name || '',
                    remarks: (metadata as any).remarks || '',
                    createdFor: metadata.createdFor || 'test',
                    createdBy: user.data?.name,
                    createdDate: metadata.createdDate ? new Date(metadata.createdDate) : new Date(),
                    fileLocation: '/homes/public/ed_loader_test/' + metadata.name || '',
                    fileSize: metadata.size || 0,
                    status: 'Raw',
                    ownership: '',
                    interpretedBy: metadata.editedBy || '',
                    interpretedOn: metadata.createdDate ? new Date(metadata.createdDate) : new Date(),
                    approvedBy: user.data?.name,
                    approvedOn: new Date(),
                    version: '1.0',
                    comment: '',
                    spudDate: new Date(),
                    completionDate: new Date(),
                    recordedBy: user.data?.name,
                    recordedOn: new Date(),
                    changedBy: null,
                    changedOn: null,
                    ids: matched._id, 
                };
            });


            const geoFileBodyRequest = {
                geoFiles: geoFiles
            };

            /**JANGAN LUPA UNCOMMENT */
            createBulkGeoFileResponse = await createBulkGeoFile(geoFileBodyRequest);

            // Coordinate conversion for SEG-Y files
            const segyFiles = seismicStore.data.seismicMetadatas.map(metadata => metadata.path);  

            if (seismicStore.data.survey.dimension === '2D' && segyFiles.length > 0 && seismicStore.data?.CRS?.srid && seismicStore.data?.CRS?.proj4) {
                    // Validate and clean the data
                    const validFiles = segyFiles.filter(path => path && path.trim() !== '');
                    const sridNumber = parseInt(seismicStore.data.CRS.srid);
                    
                    if (validFiles.length > 0 && !isNaN(sridNumber) && seismicStore.data.CRS.proj4.trim()) {
                        const convertRequestBody = {
                            segy_files: validFiles,
                            srid: sridNumber,
                            proj4: seismicStore.data.CRS.proj4.trim(),
                            byte_header_x: 73,
                            byte_header_y: 77
                        };

                        const response = await fetch('http://localhost:5001/api/convert_coordinates', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(convertRequestBody)
                        });

                        let conversionResult = null;

                        if (response.ok) {
                            conversionResult = await response.json();
                            console.log('[QC] Coordinate conversion successful:', conversionResult);
                        } else {
                            const errorDetails = await response.json().catch(() => ({ error: 'Unknown error' }));
                            throw new Error(`[QC] Coordinate conversion failed: ${JSON.stringify(errorDetails)}`);
                        }

                        console.log('[QC] conversionResult', conversionResult);

                        // Traverse the results object from the conversionResult
                        Object.entries(conversionResult.results).forEach(async ([filename, result]) => {
                            const createBulkByLineDataBody = {
                                coordinates: Array.isArray(result.converted_coordinates)
                                    ? result.converted_coordinates.map((coord: any) => ({
                                        latitude: coord[0],
                                        longitude: coord[1]
                                    }))
                                    : [],
                                lineName: filename,
                                type: seismicStore.data.survey.dimension,
                                fileName: filename
                            }

                            console.log('[QC] createBulkByLineDataBody', createBulkByLineDataBody);

                            const responseCreateBulkByLine = await createBulkByLine(createBulkByLineDataBody);
                            if (responseCreateBulkByLine && responseCreateBulkByLine.error) {
                                throw new Error(`[QC] createBulkByLine error: ${responseCreateBulkByLine.error}`);
                            }

                            console.log('[QC] responseCreateBulkByLine', responseCreateBulkByLine);
                        });
                    }
            }

        } else {
            // update existing seismic
        }

        /**JANGAN LUPA UNCOMMENT */
        if (!createBulkGeoFileResponse.success) {
            publishStatus.value = 'error';
            publishError.value = createBulkGeoFileResponse.message || 'Failed to create GeoFiles';
            publishErrorDetails.value = createBulkGeoFileResponse.errors || [];
            return;
        }

        const filesToUpload = Array.from(fileDataMap.value.values());

        const ftpStatus = await window.electronAPI.getFtpStatus();
        if (!ftpStatus.configured || !ftpStatus.enabled) {
            publishStatus.value = 'error';
            publishError.value = 'FTP is not configured or enabled';
            publishErrorDetails.value = [];
            return;
        }

        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload[i];
            currentUploadingFile.value = file.name;

            try {
                // Check if file path exists
                if (!file.path) {
                    throw new Error(`File path is missing for ${file.name || 'unknown file'}`);
                }

                // Simple upload - the main process handles all events automatically
                const result = await window.electronAPI.uploadFile(file.path, file.name || 'unknown');

                if (!result.success) {
                    throw new Error(result.error || 'Upload failed');
                }

                // Update progress
                publishProgress.value = ((i + 1) / filesToUpload.length) * 100;
                // console.log(`[QC] Upload complete for: ${file.name}`);

            } catch (error: any) {
                // console.error(`[QC] Upload failed for ${file.name}:`, error);
                publishStatus.value = 'error';
                publishError.value = `Failed to upload ${file.name}: ${error.message || error}`;
                publishErrorDetails.value = [];
                return;
            }
        }

        // Mark as completed
        publishStatus.value = 'completed';
        publishProgress.value = 100;

        // Update workflow: mark publication as completed
        seismicStore.addCompletedStage('publication');

        // setTimeout(() => {
        //     closePublishModal();
        //     // Show success notification
        //     showNotification('success', 'Publication Complete', 'Dataset has been successfully published to the FTP server.');
        // }, 2000);

        // Redirect to Dashboard after successful publication
        setTimeout(() => {
            closePublishModal();
            showNotification('success', 'Publication Complete', 'Dataset has been successfully published to the FTP server.');
            // Redirect to Dashboard
            router.push({ path: '/' });
        }, 2000);

    } catch (error: any) {
        console.error('[QC] Error during publish process:', error);
        publishStatus.value = 'error';
        publishError.value = error.message || 'Unknown error during publishing';
        publishErrorDetails.value = [];
    }
    };

    const showApprovalModal = () => {
        approvalComments.value = seismicStore.data.approval.comments || '';
        showApprovalModalDialog.value = true;
    };

    const closeApprovalModal = () => {
        showApprovalModalDialog.value = false;
        approvalComments.value = '';
    };

    const approveDataset = () => {
        seismicStore.approveDataset(approvalComments.value);
        closeApprovalModal();

        // Show success modal after approval
        setTimeout(() => {
            showSuccessModal.value = true;
        }, 300);
    };

    const closeSuccessModal = () => {
        showSuccessModal.value = false;
    };

    const closePublishModal = () => {
    showPublishModal.value = false;
    // Reset states
    publishStatus.value = 'uploading';
    publishProgress.value = 0;
    currentUploadingFile.value = '';
    publishError.value = '';
    publishErrorDetails.value = [];
};

const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    notificationType.value = type;
    notificationTitle.value = title;
    notificationMessage.value = message;
    showNotificationModal.value = true;
};

    const rejectDataset = () => {
        console.log('[QC] Rejecting dataset...');
        seismicStore.rejectDataset();
        console.log('[QC] Dataset rejected, isApproved:', seismicStore.data.approval.isApproved);
        console.log('[QC] Current stage:', seismicStore.data.currentStage);
    };

    // const toggleSelectAllFiles = () => {
    //     files.value.forEach(file => {
    //         file.selected = selectAllFiles.value;
    //     });
    // };

    // Computed properties for pagination
    const paginatedFiles = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value;
        const end = start + itemsPerPage.value;
        return files.value.slice(start, end);
    });

    const totalPages = computed(() => {
        return Math.ceil(files.value.length / itemsPerPage.value);
    });

    const canGoToPreviousPage = computed(() => {
        return currentPage.value > 1;
    });

    const canGoToNextPage = computed(() => {
        return currentPage.value < totalPages.value;
    });

    const paginationInfo = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value + 1;
        const end = Math.min(currentPage.value * itemsPerPage.value, files.value.length);
        return files.value.length > 0 ? `${start} - ${end} of ${files.value.length}` : '0';
    });

    // Pagination methods
    const goToNextPage = () => {
        if (canGoToNextPage.value) {
            currentPage.value++;
        }
    };

    const goToPreviousPage = () => {
        if (canGoToPreviousPage.value) {
            currentPage.value--;
        }
    };

    // File selection methods
    const selectFile = (file: ExtendedFileData) => {
        selectedFile.value = file;
    };

    // Validation status method
    const getValidationStatus = (fileId: string): 'success' | 'error' | 'pending' => {
        const file = seismicStore.data.seismicMetadatas.find(f => f.id === fileId);
        if (!file?.validationResult) return 'pending';
        return file.validationResult.isValid ? 'success' : 'error';
    };

    // Extracted value method for seismic data
    const getExtractedValue = (file: ExtendedFileData, trace: string, field: string): string => {
        // Find the file metadata in the seismic store
        const fileMetadata = seismicStore.data.seismicMetadatas.find(f => f.id === file.id);
        if (!fileMetadata) return '';

        // Map the trace and field combination to the flattened property names
        const fieldMap: Record<string, string> = {
            'first_trace_Ffid': 'first_field_file',
            'last_trace_Ffid': 'last_field_file',
            'first_trace_Sp': 'first_shot_point',
            'last_trace_Sp': 'last_shot_point',
            'first_trace_Cdp': 'first_cdp',
            'last_trace_Cdp': 'last_cdp',
            'first_trace_Il': 'inline',
            'first_trace_Xl': 'crossline'
        };

        const key = `${trace}_${field}`;
        const propertyName = fieldMap[key];

        if (propertyName && fileMetadata[propertyName as keyof typeof fileMetadata] !== undefined) {
            return fileMetadata[propertyName as keyof typeof fileMetadata]?.toString() || '';
        }

        return '';
    };

    // Lifecycle
    onMounted(async () => {

        // Initialize file data from store
        initializeFileData();

        // Fetch data types and sub data types
        try {
            await fetchDataTypes();
            await fetchSubDataTypes();
        } catch (error) {
            console.error('[QC] Error fetching data:', error);
        }

        // Set the current stage to quality-check if coming from loading
        if (seismicStore.data.currentStage === 'loading') {
            seismicStore.setCurrentStage('quality-check');
            if (!seismicStore.data.completedStages.includes('loading')) {
                seismicStore.addCompletedStage('loading');
            }
        }

        setTimeout(() => {
            if (seismicStore.data.currentStage === 'preparation') {
                seismicStore.setCurrentStage('loading');
                seismicStore.addCompletedStage('preparation');
            }
        }, 1000);
    });

    // Watch for activeTab changes to auto-select first file when files tab is activated
    watch(activeTab, (newTab) => {
        if (newTab === 'files' && selectedLineId.value && files.value.length > 0) {
            // Auto-select the first file when files tab is clicked
            selectedRowIndex.value = 0;
        }
    });

    // Watch for selectedLineId changes to auto-select first file when a well is selected
    watch(selectedLineId, (newLineId) => {
        if (newLineId && activeTab.value === 'files' && files.value.length > 0) {
            // Auto-select the first file when a well is selected and files tab is active
            selectedRowIndex.value = 0;
        }
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
    /* Equal width for both panels */
    gap: 1.5rem;
}

.components-panel {
    width: 100%;
    /* Full width of its grid column */
    overflow-x: auto;
    /* Enable horizontal scrolling */
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
    width: 100%;
    overflow: hidden;
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

.table-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    margin-bottom: 1rem;
    width: 100%;
}

.table-scroll-wrapper {
    flex: 1;
    overflow-x: auto;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px 8px 0 0;
    border-bottom: none;
    background: white;
    max-height: calc(100% - 60px);
    /* Account for footer height */
    width: 100%;
}

/* Custom scrollbar styling */
.table-scroll-wrapper::-webkit-scrollbar {
    height: 8px;
    width: 8px;
}

.table-scroll-wrapper::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
}

.table-scroll-wrapper::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}

.table-scroll-wrapper::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

.components-table {
    width: 100%;
    font-size: 0.75rem;
    border-collapse: collapse;
    min-width: 1600px;
    /* Increased minimum width to accommodate all seismic columns */
    background: white;
    border: none;
}

.components-table th {
    background: #f8fafc;
    padding: 1rem 1.25rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
    font-size: 0.8rem;
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 10;
    min-width: 120px;
    /* Ensure consistent minimum column width */
}

.components-table th:first-child {
    min-width: 50px;
    /* Smaller width for checkbox column */
}

.components-table th:nth-child(2) {
    min-width: 200px;
    /* File name column gets more space */
}

.components-table td {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.8rem;
    vertical-align: middle;
    white-space: nowrap;
    min-width: 120px;
}

.components-table td:first-child {
    min-width: 50px;
}

.components-table td:nth-child(2) {
    min-width: 200px;
}

.components-table tbody tr {
    transition: all 0.2s ease;
}

.components-table tbody tr:hover {
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.components-table tr.selected {
    background: #dbeafe;
    border-left: 3px solid #3b82f6;
}

.components-table tr.selected:hover {
    background: #bfdbfe;
}

.components-table tr.validation-error {
    background: #fef2f2 !important;
    border-left: 3px solid #ef4444;
}

.components-table tr.validation-error:hover {
    background: #fee2e2 !important;
}

.components-table tr.validation-success {
    background: #f0fdf4 !important;
    border-left: 3px solid #22c55e;
}

.components-table tr.validation-success:hover {
    background: #dcfce7 !important;
}

.file-name {
    font-weight: 500;
    color: #1f2937;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.entity-select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.8rem;
    width: 140px;
    background: white;
    transition: all 0.2s ease;
}

.entity-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.entity-select:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
}

.table-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border: 1px solid #e5e7eb;
    border-top: none;
    font-size: 0.875rem;
    color: #6b7280;
    background: #f8fafc;
    border-radius: 0 0 8px 8px;
    min-height: 60px;
    flex-shrink: 0;
}

.footer-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.items-per-page {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.items-select {
    padding: 0.25rem 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
    background: white;
    color: #374151;
    min-width: 60px;
}

.pagination {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.page-btn {
    padding: 0.25rem 0.5rem;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.875rem;
    color: #374151;
    transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #9ca3af;
}

.page-btn:disabled {
    background: #f9fafb;
    color: #d1d5db;
    cursor: not-allowed;
}

.status-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    font-size: 0.75rem;
    font-weight: bold;
}

.status-icon.success {
    background: #22c55e;
    color: white;
}

.status-icon.error {
    background: #ef4444;
    color: white;
}

.mini-select {
    width: 100%;
    padding: 0.2rem;
    border: 1px solid #d1d5db;
    border-radius: 3px;
    font-size: 0.7rem;
    background: white;
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

.approval-notice {
    background: #e0f2fe;
    border: 1px solid #b3e5fc;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
}

.approval-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.approval-text {
    color: #0f172a;
    font-size: 0.875rem;
    font-weight: 500;
}

.approval-actions {
    display: flex;
    gap: 0.75rem;
}

.btn-approve {
    background: #22c55e;
    color: white;
    border: 1px solid #16a34a;
}

.btn-approve:hover {
    background: #16a34a;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.btn-reject {
    background: #ef4444;
    color: white;
    border: 1px solid #dc2626;
}

.btn-reject:hover {
    background: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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
    backdrop-filter: blur(4px);
}

.modal-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
    transform: scale(1);
    transition: all 0.3s ease;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
    margin: 0;
    color: #0f172a;
    font-size: 1.2rem;
    font-weight: 600;
}

.modal-close {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-close:hover {
    color: #ef4444;
    background: #fef2f2;
}

.modal-body {
    padding: 1.5rem;
}

.modal-label {
    display: block;
    color: #374151;
    font-weight: 500;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
}

.modal-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #374151;
    background: white;
    resize: vertical;
    min-height: 100px;
    transition: all 0.2s ease;
    font-family: inherit;
    line-height: 1.5;
}

.modal-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-textarea::placeholder {
    color: #9ca3af;
}

.modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
}

.modal-footer .btn {
    min-width: 100px;
    justify-content: center;
}

/* Success Modal Styles */
.success-modal-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 320px;
    overflow: hidden;
    transform: scale(1);
    transition: all 0.3s ease;
}

.success-modal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1.5rem 1.5rem 1.5rem;
    text-align: center;
}

.success-icon {
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.success-title {
    color: #0f172a;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
}

.success-btn {
    min-width: 120px;
    padding: 0.75rem 1.5rem;
}

/* Publish Modal Styles */
.publish-modal-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 400px;
    overflow: hidden;
    transform: scale(1);
    transition: all 0.3s ease;
}

.publish-modal-content {
    padding: 2rem 1.5rem 1.5rem 1.5rem;
    text-align: center;
}

.upload-progress,
.upload-success,
.upload-error {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.upload-icon {
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.spinner-large {
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.upload-title,
.success-title,
.error-title {
    color: #0f172a;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
}

.upload-subtitle,
.success-subtitle,
.error-subtitle {
    color: #6b7280;
    font-size: 0.9rem;
    margin: 0 0 1.5rem 0;
    line-height: 1.4;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 1rem;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
}

.progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    font-size: 0.8rem;
}

.progress-percent {
    font-weight: 600;
    color: #374151;
}

.current-file {
    color: #6b7280;
    font-style: italic;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.error-icon {
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.error-details {
    width: 100%;
    max-width: 100%;
    margin: 1.5rem 0;
    text-align: left;
}

.error-details-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 1rem 0;
    text-align: center;
}

.error-files-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #fecaca;
    border-radius: 8px;
    background: #fef2f2;
}

.error-file-item {
    padding: 0.75rem;
    border-bottom: 1px solid #fecaca;
}

.error-file-item:last-child {
    border-bottom: none;
}

.error-file-name {
    font-weight: 600;
    color: #991b1b;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
    word-break: break-all;
}

.error-file-message {
    color: #7f1d1d;
    font-size: 0.8rem;
    line-height: 1.4;
}

/* Wells List Styles */
.info-section {
    margin-bottom: 1.5rem;
}

.info-section h3 {
    color: #374151;
    font-size: 0.85rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
}

/* Survey Details Styles */
.survey-details {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
}

.survey-details h3 {
    color: #374151;
    font-size: 0.85rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.survey-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.survey-info .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0;
}

.survey-info .info-row label {
    color: #64748b;
    font-weight: 500;
    font-size: 0.8rem;
    min-width: 100px;
}

.survey-info .info-row span {
    color: #1f2937;
    font-size: 0.8rem;
    font-weight: 500;
    text-align: right;
    flex: 1;
}

.no-wells {
    color: #6b7280;
    font-style: italic;
    text-align: center;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
    font-size: 0.8rem;
}

.wells-table-container {
    overflow-x: auto;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
}

.wells-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
}

.wells-table th,
.wells-table td {
    padding: 0.5rem 0.75rem;
    text-align: left;
    border-bottom: 1px solid #f3f4f6;
}

.wells-table th {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
    font-size: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
}

.wells-table tbody tr:hover {
    background: #f8fafc;
    cursor: pointer;
}

.wells-table tbody tr.selected-well {
    background: #dbeafe !important;
    border-left: 3px solid #3b82f6;
}

.wells-table tbody tr.selected-well:hover {
    background: #bfdbfe !important;
}

.wells-table tbody tr:last-child td {
    border-bottom: none;
}

.well-name {
    font-weight: 500;
    color: #1e293b;
}

.well-id-cell {
    font-weight: 500;
    color: #64748b;
    font-family: monospace;
}

.well-uwi {
    font-weight: 400;
    color: #6b7280;
    font-family: monospace;
}

.wells-count {
    margin-top: 0.5rem;
    text-align: right;
    font-size: 0.75rem;
    color: #6b7280;
    padding: 0.5rem 0.75rem;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
}

.selected-well-indicator {
    font-weight: 500;
    color: #3b82f6;
}

/* No well selected styles */
.no-well-selected {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
}

.no-well-message {
    text-align: center;
    color: #6b7280;
}

.no-well-icon {
    margin: 0 auto 1rem;
    opacity: 0.5;
}

.no-well-message h3 {
    color: #374151;
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
}

.no-well-message p {
    color: #6b7280;
    font-size: 0.9rem;
    margin: 0;
}

@media (max-width: 1024px) {
    .qc-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .components-panel {
        width: 100%;
        /* Full width on mobile */
        overflow-x: auto;
        /* Keep horizontal scrolling */
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

    .modal-container {
        width: 95%;
        margin: 1rem;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
        padding: 1rem;
    }

    .modal-footer {
        flex-direction: column;
        gap: 0.5rem;
    }

    .modal-footer .btn {
        width: 100%;
    }

    .success-modal-container {
        width: 95%;
        max-width: 300px;
    }

    .success-modal-content {
        padding: 1.5rem 1rem;
    }

    .success-title {
        font-size: 1.1rem;
    }
}
</style>
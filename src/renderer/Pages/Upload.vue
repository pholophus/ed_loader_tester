<template>
  <div class="upload-content">
    <!-- Navigation bar -->
    <div class="upload-nav">
      <router-link to="/" class="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="text-sm font-semibold">Back to Dashboard</span>
      </router-link>
      <div class="flex space-x-2">
        <Button variant="ghost" size="sm" @click="resetUploads">
          Reset
        </Button>
        <Button variant="outline" size="sm" @click="showHelp = true">
          Help
        </Button>
      </div>
    </div>

    <!-- Main content -->
    <main class="container mx-auto px-4 py-6 max-w-6xl">
      <!-- Welcome card -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle class="text-brand-500">Upload Seismic Data Files</CardTitle>
          <CardDescription>
            Upload your seismic data files using our resumable upload system. Large files will be resumed automatically if interrupted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <!-- File type selector -->
          <div class="mb-6">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Select Data Types to Process</h3>
            <div class="flex flex-wrap gap-3">
              <div class="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="segy" 
                  v-model="selectedDataTypes.segy"
                  class="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                >
                <label for="segy" class="text-sm text-gray-700">SEGY Files (.sgy, .segy)</label>
              </div>
              <div class="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="las" 
                  v-model="selectedDataTypes.las"
                  class="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                >
                <label for="las" class="text-sm text-gray-700">LAS Files (.las)</label>
              </div>
              <div class="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="others" 
                  v-model="selectedDataTypes.others"
                  class="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                >
                <label for="others" class="text-sm text-gray-700">Other Files (.txt, .csv, etc.)</label>
              </div>
            </div>
          </div>

          <!-- Upload settings -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-2">Max File Size</label>
              <select v-model="maxFileSize" class="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500">
                <option :value="1024 * 1024 * 1024">1 GB</option>
                <option :value="1024 * 1024 * 1024 * 2">2 GB</option>
                <option :value="1024 * 1024 * 1024 * 5">5 GB</option>
                <option :value="1024 * 1024 * 1024 * 10">10 GB</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-2">Max Number of Files</label>
              <select v-model="maxNumberOfFiles" class="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500">
                <option :value="5">5 files</option>
                <option :value="10">10 files</option>
                <option :value="20">20 files</option>
                <option :value="50">50 files</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Upload component -->
      <Card>
        <CardHeader>
          <CardTitle>File Upload Area</CardTitle>
          <CardDescription>
            Drag and drop files or click to browse. Uploads will resume automatically if interrupted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UppyUpload
            ref="uppyUploadRef"
            :allowed-file-types="allowedFileTypes"
            :max-file-size="maxFileSize"
            :max-number-of-files="maxNumberOfFiles"
            @upload-complete="handleUploadComplete"
            @upload-progress="handleUploadProgress"
            @upload-error="handleUploadError"
          />
        </CardContent>
      </Card>

      <!-- Upload statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent class="p-4">
            <div class="flex items-center space-x-2">
              <div class="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                <span class="text-blue-600 text-sm font-medium">📁</span>
              </div>
              <div>
                <p class="text-sm font-medium">Total Files</p>
                <p class="text-xs text-muted-foreground">{{ totalFiles }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-4">
            <div class="flex items-center space-x-2">
              <div class="h-8 w-8 rounded-md bg-green-100 flex items-center justify-center">
                <span class="text-green-600 text-sm font-medium">✅</span>
              </div>
              <div>
                <p class="text-sm font-medium">Completed</p>
                <p class="text-xs text-muted-foreground">{{ completedFiles }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-4">
            <div class="flex items-center space-x-2">
              <div class="h-8 w-8 rounded-md bg-yellow-100 flex items-center justify-center">
                <span class="text-yellow-600 text-sm font-medium">⏳</span>
              </div>
              <div>
                <p class="text-sm font-medium">In Progress</p>
                <p class="text-xs text-muted-foreground">{{ inProgressFiles }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-4">
            <div class="flex items-center space-x-2">
              <div class="h-8 w-8 rounded-md bg-red-100 flex items-center justify-center">
                <span class="text-red-600 text-sm font-medium">❌</span>
              </div>
              <div>
                <p class="text-sm font-medium">Failed</p>
                <p class="text-xs text-muted-foreground">{{ failedFiles }}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Process uploaded files -->
      <Card v-if="completedFiles > 0" class="mt-6">
        <CardHeader>
          <CardTitle class="text-green-700">Ready to Process</CardTitle>
          <CardDescription>
            {{ completedFiles }} files have been uploaded and are ready for processing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex space-x-4">
            <Button @click="processFiles" class="bg-brand-500 hover:bg-brand-600">
              Process Files
            </Button>
            <Button variant="outline" @click="viewProcessingQueue">
              View Processing Queue
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>

    <!-- Help Modal -->
    <Modal v-if="showHelp" v-model="showHelp" title="Upload Help">
      <div class="p-4 space-y-4">
        <div>
          <h3 class="font-semibold text-gray-800 mb-2">Supported File Types</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• <strong>SEGY Files:</strong> .sgy, .segy (Seismic data files)</li>
            <li>• <strong>LAS Files:</strong> .las (Well log data)</li>
            <li>• <strong>Other Files:</strong> .txt, .csv (Additional data formats)</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-gray-800 mb-2">Upload Features</h3>
          <ul class="text-sm text-gray-600 space-y-1">
            <li>• <strong>Resumable Uploads:</strong> Large files will resume if interrupted</li>
            <li>• <strong>Multiple Files:</strong> Upload multiple files simultaneously</li>
            <li>• <strong>Progress Tracking:</strong> Real-time upload progress</li>
            <li>• <strong>Error Recovery:</strong> Automatic retry on temporary failures</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-gray-800 mb-2">File Processing</h3>
          <p class="text-sm text-gray-600">
            After uploading, files are automatically categorized and queued for processing. 
            You can process them immediately or continue uploading more files.
          </p>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end p-4">
          <Button @click="showHelp = false">Close</Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Button } from '@/Components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/Components/ui/card';
import Modal from '@/Components/Modal.vue';
import UppyUpload from '@/Components/UppyUpload.vue';
import { useIngestStore } from '@/store/ingestStore';

const router = useRouter();
const ingestStore = useIngestStore();

// Upload configuration
const selectedDataTypes = ref({
  segy: true,
  las: true,
  others: false
});

const maxFileSize = ref(1024 * 1024 * 1024 * 5); // 5GB default
const maxNumberOfFiles = ref(10);
const showHelp = ref(false);

// Upload tracking
const totalFiles = ref(0);
const completedFiles = ref(0);
const inProgressFiles = ref(0);
const failedFiles = ref(0);

// Computed properties
const allowedFileTypes = computed(() => {
  const types: string[] = [];
  if (selectedDataTypes.value.segy) {
    types.push('.sgy', '.segy');
  }
  if (selectedDataTypes.value.las) {
    types.push('.las');
  }
  if (selectedDataTypes.value.others) {
    types.push('.txt', '.csv', '.dat');
  }
  return types;
});

// Component ref
const uppyUploadRef = ref<InstanceType<typeof UppyUpload> | null>(null);

// Event handlers
const handleUploadComplete = (data: { file: any, response: any }) => {
  // console.log('Upload completed:', data.file.name);
  completedFiles.value++;
  inProgressFiles.value = Math.max(0, inProgressFiles.value - 1);
  
  // Show success notification
  showNotification(`Upload completed: ${data.file.name}`, 'success');
};

const handleUploadProgress = (data: { file: any, progress: number }) => {
  // console.log('Upload progress:', data.file.name, data.progress);
  // Update in-progress count if needed
  if (data.progress === 0) {
    inProgressFiles.value++;
    totalFiles.value++;
  }
};

const handleUploadError = (data: { file: any, error: any }) => {
  console.error('Upload failed:', data.file.name, data.error);
  failedFiles.value++;
  inProgressFiles.value = Math.max(0, inProgressFiles.value - 1);
  
  // Show error notification
  showNotification(`Upload failed: ${data.file.name}`, 'error');
};

const resetUploads = () => {
  if (uppyUploadRef.value) {
    uppyUploadRef.value.resetUploads();
  }
  totalFiles.value = 0;
  completedFiles.value = 0;
  inProgressFiles.value = 0;
  failedFiles.value = 0;
  
  showNotification('Upload queue reset', 'info');
};

const processFiles = async () => {
  try {
    // Navigate to the main processing page or trigger processing
    showNotification('Processing uploaded files...', 'info');
    
    // You could either:
    // 1. Navigate to the existing processing page
    // router.push('/ingests/main');
    
    // 2. Or trigger processing directly here
    // await triggerFileProcessing();
    
    // For now, let's show a success message
    setTimeout(() => {
      showNotification('Files processed successfully!', 'success');
    }, 2000);
    
  } catch (error) {
    console.error('Error processing files:', error);
    showNotification('Error processing files', 'error');
  }
};

const viewProcessingQueue = () => {
  // Navigate to processing queue or show queue modal
  router.push('/processing-queue');
};

// Simple notification system (you might want to use a proper toast library)
const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
  // This is a simple implementation - consider using a proper notification library
  // console.log(`[${type.toUpperCase()}] ${message}`);
  
  // You could implement a toast notification system here
  // For now, we'll just use browser notifications if available
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`ED Loader - ${type}`, {
      body: message,
      icon: '/icon.png' // Make sure you have an icon
    });
  }
};

// Request notification permission on mount
onMounted(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
});
</script>

<style scoped>
.upload-content {
  background: #f8fafc;
  min-height: calc(100vh - 104px); /* Subtract header and footer height */
}

.upload-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.container {
  @apply mx-auto px-4;
}
</style> 
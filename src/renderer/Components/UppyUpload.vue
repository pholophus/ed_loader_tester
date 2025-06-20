<template>
  <div class="uppy-upload-container">
    <!-- Debug info -->
    <div class="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
      <p><strong>Instructions:</strong> Add files, then click the "Upload" button in the dashboard below.</p>
      <p><strong>Debug:</strong> Check the browser console for detailed logs.</p>
      <button 
        @click="testTusServer" 
        class="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
      >
        Test TUS Server
      </button>
    </div>
    
    <div id="uppy-dashboard" class="uppy-dashboard"></div>
    
    <!-- Upload Progress -->
    <div v-if="uploadProgress.length > 0" class="mt-4 space-y-2">
      <h3 class="text-lg font-semibold text-gray-700">Upload Progress</h3>
      <div v-for="file in uploadProgress" :key="file.id" class="bg-gray-50 rounded-lg p-3">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-700">{{ file.name }}</span>
          <span class="text-sm text-gray-500">{{ file.progress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            :style="{ width: file.progress + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Completed Uploads -->
    <div v-if="completedUploads.length > 0" class="mt-4">
      <h3 class="text-lg font-semibold text-green-700">Completed Uploads</h3>
      <div class="space-y-1">
        <div v-for="file in completedUploads" :key="file.id" 
             class="flex items-center text-sm text-green-600">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          {{ file.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import Tus from '@uppy/tus';

// Import Uppy CSS
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';

const emit = defineEmits(['upload-complete', 'upload-progress', 'upload-error']);

const props = defineProps({
  allowedFileTypes: {
    type: Array as () => string[],
    default: () => ['.sgy', '.segy', '.las', '.txt', '.csv']
  },
  maxFileSize: {
    type: Number,
    default: 1024 * 1024 * 1024 * 5 // 5GB default
  },
  maxNumberOfFiles: {
    type: Number,
    default: 10
  }
});

const uppy = ref<any>(null);
const uploadProgress = ref<Array<{ id: string; name: string; progress: number }>>([]);
const completedUploads = ref<Array<{ id: string; name: string; path: string }>>([]);

onMounted(async () => {
  try {
    // Get Tus server URL from main process
    const tusServerUrl = await window.electronAPI.getTusServerUrl();
    console.log('🔗 TUS Server URL:', tusServerUrl);
    
    // Initialize Uppy
    uppy.value = new Uppy({
      debug: true, // Always enable debug for troubleshooting
      autoProceed: false,
      allowMultipleUploads: true,
      restrictions: {
        maxFileSize: props.maxFileSize,
        maxNumberOfFiles: props.maxNumberOfFiles,
        allowedFileTypes: props.allowedFileTypes
      }
    });

    console.log('🎛️ Uppy initialized with restrictions:', {
      maxFileSize: props.maxFileSize,
      maxNumberOfFiles: props.maxNumberOfFiles,
      allowedFileTypes: props.allowedFileTypes
    });

    // Add Dashboard plugin
    uppy.value.use(Dashboard, {
      target: '#uppy-dashboard',
      inline: true,
      width: '100%',
      height: 350,
      theme: 'light',
      proudlyDisplayPoweredByUppy: false,
      showProgressDetails: true,
      note: `Upload large seismic files (${props.allowedFileTypes.join(', ')}). Files are resumed automatically if interrupted.`
    });

    console.log('📋 Dashboard plugin added');

    // Add Tus plugin for resumable uploads
    uppy.value.use(Tus, {
      endpoint: `${tusServerUrl}/files`,
      resume: true,
      retryDelays: [0, 1000, 3000, 5000]
    });

    console.log('🔄 TUS plugin added with endpoint:', `${tusServerUrl}/files`);

    // Set metadata for each file before upload
    uppy.value.on('file-added', (file: any) => {
      console.log('📄 File added:', file.name, file.type, file.size);
      uppy.value.setFileMeta(file.id, {
        filename: file.name,
        filetype: file.type
      });
    });

    // Add upload start event for debugging
    uppy.value.on('upload', (data: any) => {
      console.log('🚀 Upload started:', data);
    });

    // Upload progress event
    uppy.value.on('upload-progress', (file: any, progress: any) => {
      const progressPercent = Math.round((progress.bytesUploaded / progress.bytesTotal) * 100);
      console.log('📊 Upload progress:', file.name, progressPercent + '%');
      
      const existingIndex = uploadProgress.value.findIndex(f => f.id === file.id);
      const progressItem = {
        id: file.id,
        name: file.name,
        progress: progressPercent
      };

      if (existingIndex >= 0) {
        uploadProgress.value[existingIndex] = progressItem;
      } else {
        uploadProgress.value.push(progressItem);
      }

      emit('upload-progress', { file, progress: progressPercent });
    });

    // Upload success event
    uppy.value.on('upload-success', async (file: any, response: any) => {
      console.log('✅ Upload success:', file.name, response);
      
      // Remove from progress tracking
      uploadProgress.value = uploadProgress.value.filter(f => f.id !== file.id);
      
      // Add to completed uploads
      completedUploads.value.push({
        id: file.id,
        name: file.name,
        path: response.uploadURL || ''
      });

      // Process the uploaded file through main process
      try {
        const result = await window.electronAPI.processUploadedFile(
          response.uploadURL,
          file.name,
          file.meta || {}
        );
        
        if (result.success) {
          console.log(`File processed as ${result.fileType} type`);
        }
      } catch (error) {
        console.error('Error processing uploaded file:', error);
      }

      emit('upload-complete', { file, response });
    });

    // Upload error event
    uppy.value.on('upload-error', (file: any, error: any) => {
      console.error('❌ Upload error:', file.name, error);
      
      // Remove from progress tracking
      uploadProgress.value = uploadProgress.value.filter(f => f.id !== file.id);
      
      emit('upload-error', { file, error });
    });

    // Add restriction failed event for debugging
    uppy.value.on('restriction-failed', (file: any, error: any) => {
      console.error('🚫 Restriction failed:', file?.name, error);
    });

    // Listen for upload events from main process
    window.electronAPI.onUploadComplete((file: any) => {
      console.log('Upload completed (from main process):', file.originalName);
      // This event comes from the Tus server when upload is complete
    });

    window.electronAPI.onUploadProgress((data: { file: any; progress: number }) => {
      console.log('Upload progress (from main process):', data.file.metadata?.filename, data.progress);
      // This event comes from the Tus server during upload
    });

    console.log('🎯 Uppy setup complete');

  } catch (error) {
    console.error('❌ Error initializing Uppy:', error);
  }
});

onUnmounted(() => {
  // Clean up
  if (uppy.value) {
    uppy.value.destroy();
  }
  
  // Remove upload listeners
  window.electronAPI.removeUploadListeners();
});

// Expose methods for parent components
const resetUploads = () => {
  uploadProgress.value = [];
  completedUploads.value = [];
  if (uppy.value) {
    uppy.value.cancelAll();
  }
};

const pauseAll = () => {
  if (uppy.value) {
    uppy.value.pauseAll();
  }
};

const resumeAll = () => {
  if (uppy.value) {
    uppy.value.resumeAll();
  }
};

defineExpose({
  resetUploads,
  pauseAll,
  resumeAll
});

// Test TUS server function
const testTusServer = async () => {
  try {
    const tusServerUrl = await window.electronAPI.getTusServerUrl();
    console.log('🧪 Testing TUS Server at:', tusServerUrl);
    
    // Test with a simple OPTIONS request
    const response = await fetch(`${tusServerUrl}/files`, {
      method: 'OPTIONS',
      headers: {
        'Tus-Resumable': '1.0.0'
      }
    });
    
    console.log('🧪 TUS Server test response:', response.status, response.headers);
    
    if (response.ok) {
      alert('✅ TUS Server is working! Status: ' + response.status);
    } else {
      alert('❌ TUS Server test failed! Status: ' + response.status);
    }
  } catch (error) {
    console.error('🧪 TUS Server test error:', error);
    alert('❌ TUS Server test error: ' + error);
  }
};
</script>

<style scoped>
.uppy-upload-container {
  @apply max-w-full;
}

/* Custom Uppy styling to match the app theme */
:deep(.uppy-Dashboard) {
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-family: inherit;
}

:deep(.uppy-Dashboard-inner) {
  border-radius: 0.5rem;
}

:deep(.uppy-Dashboard-AddFiles-title) {
  color: #374151;
  font-weight: 600;
}

:deep(.uppy-Dashboard-note) {
  color: #6b7280;
}

:deep(.uppy-u-reset.uppy-c-btn.uppy-c-btn-primary.uppy-Dashboard-upload) {
  background-color: #7c3aed;
  border-color: #7c3aed;
}

:deep(.uppy-u-reset.uppy-c-btn.uppy-c-btn-primary.uppy-Dashboard-upload:hover) {
  background-color: #6d28d9;
  border-color: #6d28d9;
}
</style> 
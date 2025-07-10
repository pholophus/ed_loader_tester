<template>
  <div>
    <div v-if="$route.path == '/OTM'" class="w-full bg-gray-50 border-gray-200 px-6 py-4">
      <header class="w-full bg-gray-50 border-gray-200 px-6 py-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between">
          <!-- Left side: Back button and breadcrumbs and the Title below them -->
          <div class="flex flex-col">
            <div class="flex items-center space-x-4 mb-2">
              <!-- Back button -->
              <router-link to="/ingests/main"
                class="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4">
                <img src="/assets/icons/chevron-left.svg" alt="Back" class="w-4 h-4 mr-1" />
                <span class="text-sm font-semibold">Back</span>
              </router-link>

              <!-- Breadcrumb navigation -->
              <nav class="flex items-center text-sm text-gray-500">
                <span class="font-semibold">ED Loader</span>
                <img src="/assets/icons/chevron-right.svg" alt="Next" class="w-4 h-4 mx-2" />
                <button class="text-brand-500 px-2 py-1 rounded-md shadow-md font-semibold">OTM Table</button>
              </nav>
            </div>
            <!-- Page title -->
            <div class="flex-1">
              <h1 class="text-lg font-semibold text-gray-900">One-to-Many</h1>
            </div>
          </div>

          <!-- Right side: Export button and Delete Mode Buttons -->
          <div class="flex items-center mt-4 sm:mt-0 space-x-2">
            <!-- Delete Mode Buttons -->
            <template v-if="!isDeleteMode">
              <button @click="$emit('start-delete')"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Delete
              </button>
            </template>
            <template v-else>
              <button @click="$emit('finish-delete')"
                class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Finish Delete
              </button>
              <button @click="$emit('cancel-delete')"
                class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                Cancel
              </button>
            </template>
            <button @click="exportData"
              class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <img src="/assets/icons/download-cloud.svg" alt="Export" class="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        <!-- Delete Mode Buttons and Select All Checkbox -->
        <!-- <div class="mt-4 flex justify-end space-x-2">
          <button v-if="!isDeleteMode" @click="$emit('start-delete')" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Delete
          </button>
          <template v-else>
            <div class="flex items-center">
                
                <label class="text-sm font-medium text-gray-900"></label>
            </div>
            <button @click="$emit('finish-delete')" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Finish Delete
            </button>
            <button @click="$emit('cancel-delete')" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Cancel
            </button>
          </template>
        </div> -->
      </header>
    </div>
    <div v-else>
      <nav :class="{ 'border-b-2': $route.path === '/' }" class="p-4">
        <div class="container mx-auto flex flex-col">
          <h1 class="text-xl text-black-500 font-medium mb-2">ED Loader</h1>
          <div class="flex items-center justify-between text-quatenary-500">
            <div class="flex items-center">
              <div class="relative group">
                <button @click="toggleDropdown" class="mr-4 hover:text-quatenary-400 focus:outline-none">
                  File
                </button>
                <div v-show="showDropdown" class="absolute left-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 py-1">
                  <router-link to="/" @click.native="handleNewClick"
                    class="block px-4 py-2 text-gray-800 hover:bg-brand-hover mx-1 my-0.5 rounded">
                    New
                  </router-link>
                  <!-- <a href="#" class="block px-4 py-2 text-brand-600 hover:bg-gray-200 mx-1 my-0.5 rounded">Open</a>
            <a href="#" class="flex items-center justify-between px-4 py-2 text-brand-600 hover:bg-brand-hover mx-1 my-0.5 rounded">
              Open recent
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-200 mx-1 my-0.5 rounded">Save</a>
            <a href="#" class="block px-4 py-2 text-gray-800 hover:bg-gray-200 mx-1 my-0.5 rounded">Save As</a> -->
                </div>
              </div>
              <button v-if="$route.path.startsWith('/ingests/main')" class="mr-4 hover:text-quatenary-400"
                @click="$emit('show-utilities-modal')">Utilities</button>
              <router-link to="#" class="hover:text-quatenary-400" @click="openToolsModal"
                v-if="ingestStore.activeTab === 'seismic' && $route.path.startsWith('/ingests/main')">Tools</router-link>
              <button class="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors" @click="showSettingsModal = true">Settings</button>
            </div>
            <div class="flex items-center space-x-2">
              <button v-if="$route.path.startsWith('/ingests/main')" @click="handleSubmitToEdafy"
                class="bg-brand-500 hover:bg-brand-700 text-white px-4 py-2 rounded-md transition-colors">Submit to
                EDAFY</button>
              <button @click="handleLogout"
                class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>

    <ToolsModal :isVisible="ingestStore.isToolsModalVisible" @close="closeToolsModal" />

    <!-- Settings Modal -->
    <Modal v-model="showSettingsModal" title="Settings">
      <div class="p-4">
        <label for="settingInput" class="block text-sm font-medium text-gray-700">Enter DB Name:</label>
        <input type="text" id="settingInput"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
          v-model="settingValue" />
      </div>
      <template #footer>
        <div class="flex justify-end space-x-2 p-4">
          <button @click="showSettingsModal = false"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
          <button @click="saveSettings"
            class="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600">Save</button>
        </div>
      </template>
    </Modal>

    <!-- Error Modal -->
    <Modal v-model="showErrorModal" :title="''">
      <div class="flex flex-col items-center justify-center space-y-4">
        <!-- Icon -->
        <div class="bg-red-100 rounded-full p-4">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p class="text-xl font-semibold text-gray-800 text-center">{{ errorMessage }}</p>
      </div>
      <template #footer>
        <div class="flex justify-center">
          <button @click="showErrorModal = false"
            class="px-8 py-2 bg-brand-600 text-white font-semibold rounded-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors">
            Close
          </button>
        </div>
      </template>
    </Modal>
    <!-- Success Modal -->
    <Modal v-model="showSuccessModal" :title="''">
      <div class="flex flex-col items-center justify-center space-y-4">
        <!-- Icon -->
        <div class="bg-purple-100 rounded-full p-4">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-xl font-semibold text-gray-800 text-center">{{ successMessage }}</p>
      </div>
      <template #footer>
        <div class="flex justify-center">
          <button @click="showSuccessModal = false"
            class="px-8 py-2 bg-brand-600 text-white font-semibold rounded-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors">
            OK
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useIngestStore } from '../store/ingestStore';
import { storeToRefs } from 'pinia';
import ToolsModal from './ToolsModal.vue';
import Modal from './Modal.vue';
import { processAllData } from '../../services/combinedDataService';
import { useAuth } from '../Composables/useAuth';
// No need to import the icons as components anymore

const errorMessage = ref('');
const showDropdown = ref(false);
const showErrorModal = ref(false);
const showSuccessModal = ref(false);
const successMessage = ref('');
const router = useRouter();
const route = useRoute();
const ingestStore = useIngestStore();
const { dbProcessingData, seismicHasValidationError, wellHasValidationError, othersHasValidationError, OTMData } = storeToRefs(ingestStore);
const { logout } = useAuth();

const showSettingsModal = ref(false);
const settingValue = ref('');

const emit = defineEmits(['show-utilities-modal', 'start-delete', 'finish-delete', 'cancel-delete', 'submit-to-edafy']);

const props = defineProps({
  isDeleteMode: {
    type: Boolean,
    default: false
  }
});

const openToolsModal = () => {

  ingestStore.setIsToolsModalVisible(true);
};

const closeToolsModal = () => {
  ingestStore.setIsToolsModalVisible(false);
  ingestStore.setSelectedErrorFileForTools(null); // Clear selected error file when closing modal
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const hideDropdown = () => {
  showDropdown.value = false;
};

const handleNewClick = () => {
  // console.log('handleNewClick');
  ingestStore.clearAll();
  hideDropdown();
};

onMounted(() => {
  document.addEventListener('click', closeDropdownOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdownOutside);
});

const closeDropdownOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.group')) {
    showDropdown.value = false;
  }
};

const goBack = () => {
  // Handle back navigation
  // console.log('Going back...')
  // You can implement router.go(-1) or custom navigation logic here
}

const exportData = () => {
  // console.log('Exporting data...');
  const dataToExport = ingestStore.OTMData;

  if (!dataToExport || dataToExport.length === 0) {
    // console.log('No data to export.');
    return;
  }

  const csvContent = convertToCsv(dataToExport);
  downloadCsv(csvContent, 'otm_data.csv');
};

const convertToCsv = (data: any[]) => {
  const headers = ['File Name', 'EDAFY Survey Name', 'EDAFY Survey ID', 'EDAFY Line Name', 'EDAFY Line ID', 'EDAFY Well Name', 'EDAFY Well ID'];
  const rows = data.map(row => [
    row.file_name,
    row.EDAFY_Survey_Name,
    row.EDAFY_Survey_ID,
    row.EDAFY_Line_Name,
    row.EDAFY_Line_ID,
    row.EDAFY_Well_Name,
    row.EDAFY_Well_ID,
  ]);
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

const downloadCsv = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleSubmitToEdafy = async () => {
  try {
    emit('submit-to-edafy');
    // console.log({
    //   surveyName: dbProcessingData.value.surveyName,
    //   seismicLinesToUpsert: dbProcessingData.value.seismicLinesToUpsert,
    //   seismicDatasToUpsert: dbProcessingData.value.seismicDatasToUpsert,
    //   wellMetadatasToUpsert: dbProcessingData.value.wellMetadatasToUpsert,
    //   otherSeismicDatasToUpsert: dbProcessingData.value.otherSeismicDatasToUpsert,
    //   otherWellMetadatasToUpsert: dbProcessingData.value.otherWellMetadatasToUpsert
    // });
    // console.log("otm data ", OTMData.value)

    // await processAllData({
    //     surveyName: dbProcessingData.value.surveyName,
    //     seismicLinesToUpsert: dbProcessingData.value.seismicLinesToUpsert,
    //     seismicDatasToUpsert: dbProcessingData.value.seismicDatasToUpsert,
    //     wellMetadatasToUpsert: dbProcessingData.value.wellMetadatasToUpsert,
    //     otherSeismicDatasToUpsert: dbProcessingData.value.otherSeismicDatasToUpsert,
    //     otherWellMetadatasToUpsert: dbProcessingData.value.otherWellMetadatasToUpsert,
    //     OTMData: OTMData.value
    //   });

    if (seismicHasValidationError.value == true || wellHasValidationError.value == true || othersHasValidationError.value == true) {
      errorMessage.value = "Validation error exists, please double check";
      showErrorModal.value = true;
    } else {
      await processAllData({
        surveyName: dbProcessingData.value.surveyName,
        seismicLinesToUpsert: dbProcessingData.value.seismicLinesToUpsert,
        seismicDatasToUpsert: dbProcessingData.value.seismicDatasToUpsert,
        wellMetadatasToUpsert: dbProcessingData.value.wellMetadatasToUpsert,
        otherSeismicDatasToUpsert: dbProcessingData.value.otherSeismicDatasToUpsert,
        otherWellMetadatasToUpsert: dbProcessingData.value.otherWellMetadatasToUpsert,
        OTMData: OTMData.value
      });
      // successMessage.value = "You have successfully submit " + OTMData.value.length + " records to EDAFY";
      successMessage.value = "You have successfully submit 4 records to EDAFY";
      showSuccessModal.value = true;

      ingestStore.clearAll();
      router.push('/');
    }
  } catch (error) {
    errorMessage.value = "Failed to submit data";
    showErrorModal.value = true;
  }
};

const saveSettings = () => {
  console.log('Setting value:', settingValue.value);
  // Here you would typically save the settingValue, e.g., to local storage or a store
  window.electronAPI.setDbName(settingValue.value);
  showSettingsModal.value = false; // Close the modal after saving
};

const handleLogout = () => {
  logout();
};
</script>

<style scoped>
/* Add any specific styles for this component if needed */
</style>
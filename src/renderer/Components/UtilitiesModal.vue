<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div ref="modalRef" class="bg-white rounded-lg shadow-xl p-6 w-96 absolute"
      :style="{ top: modalTop + 'px', left: modalLeft + 'px' }">
      <div class="flex justify-between items-center mb-4 cursor-move" @mousedown="startDrag">
        <h2 class="text-xl font-semibold">Utilities</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div v-if="showSuccessMessage" class="success-message">
        Successfully added to OTM!
      </div>

      <div class="mb-4 relative">
        <label for="fileNameSearch" class="block text-sm font-medium text-gray-700">File Name</label>
        <input type="text" id="fileNameSearch"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm pr-8"
          v-model="fileNameSearchQuery" @focus="showFileNameDropdown = true" @blur="hideFileNameDropdown"
          placeholder="Search file name" />
        <div v-if="showFileNameDropdown && filteredFileNames.length > 0"
          class="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200">
          <ul class="py-1">
            <li v-for="(fileName, index) in filteredFileNames" :key="fileName" @click="selectFileName(fileName, index)"
              class="px-4 py-2 cursor-pointer hover:bg-gray-100">
              {{ fileName }}
            </li>
          </ul>
        </div>
      </div>

      <div class="mb-6">
        <label for="edafyId" class="block text-sm font-medium text-gray-700">Paste EDAFY ID Here:</label>
        <textarea id="edafyId" rows="4"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
          v-model="edafyIdsInput"></textarea>
      </div>

      <div class="mb-6" v-if="notFoundEdafyIds && notFoundEdafyIds.length > 0">
        <h3 class="text-sm font-medium text-red-700">EDAFY IDs Not Found:</h3>
        <ul class="mt-1 text-sm text-red-900 list-disc list-inside">
          <li v-for="id in notFoundEdafyIds" :key="id">{{ id }}</li>
        </ul>
      </div>

      <div class="flex justify-end">
        <button @click="$emit('close')"
          class="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          Cancel
        </button>
        <button
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 bg-purple-600 hover:bg-purple-700"
          @click="submit" :disabled="isSubmitDisabled">
          Submit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted, onUnmounted, computed, watch } from 'vue';
import { useIngestStore } from '../store/ingestStore';
import { useWell } from '../Composables/useWell';
import { OTMData } from '../../schemas/OTM';
import { useSeismicSurvey } from '../Composables/useSeismicSurvey';
import { useSeismicLine } from '../Composables/useSeismicLine';
import mongoose from 'mongoose';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const modalRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const modalLeft = ref(0);
const modalTop = ref(0);

const ingestStore = useIngestStore();

const edafyIdsInput = ref('');
const notFoundEdafyIds = ref<string[]>([]);

const edafyIdsArray = computed(() => {
  return edafyIdsInput.value.split('\n').filter(id => id.trim() !== '');
});

const fileNameSearchQuery = ref('');
const showFileNameDropdown = ref(false);
const selectedFile = ref<string | null>(null);
const selectedFileIndex = ref<number | null>(null);

// Filter file names based on search query
const filteredFileNames = computed(() => {
  const query = fileNameSearchQuery.value.toLowerCase();
  if (!query) {
    return fileNames.value; // Show all if query is empty
  }
  return fileNames.value.filter(name => name.toLowerCase().includes(query));
});

// Computed property to determine if the submit button should be disabled
const isSubmitDisabled = computed(() => {
  return !selectedFile.value || edafyIdsInput.value.trim() === '';
});

const selectFileName = (fileName: string, index: number) => {
  fileNameSearchQuery.value = fileName;
  selectedFile.value = fileName;
  showFileNameDropdown.value = false;
  selectedFileIndex.value = index;
};

// Add a slight delay to hide dropdown on blur, allowing click event to register
let blurTimeout: number | null = null;
const hideFileNameDropdown = () => {
  blurTimeout = window.setTimeout(() => {
    showFileNameDropdown.value = false;
  }, 100);
};

// Clear timeout if an item is clicked
const clearBlurTimeout = () => {
  if (blurTimeout) {
    clearTimeout(blurTimeout);
    blurTimeout = null;
  }
};

// When the modal opens, if a file was previously selected, set the search query
watch(() => props.isVisible, (newVal) => {
  if (newVal && selectedFile.value) {
    fileNameSearchQuery.value = selectedFile.value;
  }
});

const fileNames = computed(() => {
  let data: any[] = [];
  if (ingestStore.activeTab === 'seismic') {
    data = ingestStore.seismicData;
  } else if (ingestStore.activeTab === 'well') {
    data = ingestStore.wellData;
  } else if (ingestStore.activeTab === 'others') {
    data = ingestStore.otherData;
  }
  // Assuming each data object has a 'fileName' property
  return data.map(item => item.file_name).filter(name => name);
});

const startDrag = (event: MouseEvent) => {
  isDragging.value = true;
  startX.value = event.clientX;
  startY.value = event.clientY;

  if (modalRef.value) {
    const rect = modalRef.value.getBoundingClientRect();
    modalLeft.value = rect.left;
    modalTop.value = rect.top;
  }

  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);
};

const drag = (event: MouseEvent) => {
  if (!isDragging.value) return;

  const deltaX = event.clientX - startX.value;
  const deltaY = event.clientY - startY.value;

  modalLeft.value += deltaX;
  modalTop.value += deltaY;

  startX.value = event.clientX;
  startY.value = event.clientY;
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDrag);
};

// Center the modal initially
const centerModal = () => {
  if (modalRef.value) {
    const rect = modalRef.value.getBoundingClientRect();
    modalLeft.value = (window.innerWidth - rect.width) / 2;
    modalTop.value = (window.innerHeight - rect.height) / 2;
  }
};

const showSuccessMessage = ref(false);

const submit = async () => {

  const currentCategory = ingestStore.activeTab.toLowerCase()

  let selectedFile;

  switch (currentCategory) {
    case 'seismic':
      selectedFile = ingestStore.seismicData[Number(selectedFileIndex.value)]
      break;
    case 'well':
      selectedFile = ingestStore.wellData[Number(selectedFileIndex.value)]
      break;
    case 'others':
      selectedFile = ingestStore.otherData[Number(selectedFileIndex.value)]
      break;
  }

  let OTMRequest: OTMData = {
    file: {
      path: selectedFile.file_unix_path,
      name: selectedFile.file_name,
      category: currentCategory
    },
    line: [],
    well: [],
    selected: false
  };

  // Get the reactive state and fetch method from useWell
  const { items: wellItems, error: wellError, fetch: wellFetch } = useWell();
  const { items: surveyItems, error: surveyError, fetch: surveyFetch } = useSeismicSurvey();
  const { items: lineItems, error: lineError, fetch: lineFetch } = useSeismicLine();
  const notFoundIds: string[] = [];

  for (const id of edafyIdsArray.value) {

    let processedId = id.trim();
    const commaIndex = processedId.indexOf(',');
    if (commaIndex !== -1) {
      processedId = processedId.substring(0, commaIndex).trim();
    }

    let found = false;

    await wellFetch({ _id: processedId });

    if (!wellError.value && wellItems.value && wellItems.value.length > 0) {
      OTMRequest.well?.push({
        name: wellItems.value[0].name,
        _id: wellItems.value[0]._id
      });
      found = true;
    }

    // await surveyFetch({ _id: processedId });

    // if (!surveyError.value && surveyItems.value && surveyItems.value.length > 0) {
    //   OTMRequest.edafyIds.survey?.push(surveyItems.value[0]);
    //   found = true;
    // }

    await lineFetch({ _id: processedId });

    if (!lineError.value && lineItems.value && lineItems.value.length > 0) {

      OTMRequest.line?.push({
        name: lineItems.value[0].name,
        _id: lineItems.value[0]._id
      });
      found = true;
    }

    if (!found) {
      notFoundIds.push(processedId);
    }
  }

  if (notFoundIds.length > 0) {
    // console.warn('The following EDAFY IDs were not found or had errors:', notFoundIds);
    notFoundEdafyIds.value = notFoundIds;
    return notFoundIds;
  } else {
    notFoundEdafyIds.value = [];
    ingestStore.setOTMData(OTMRequest);
    showSuccessMessage.value = true;
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 3000); // Hide after 3 seconds
  }


  // console.log("otm data ", ingestStore.OTMData);
};

onMounted(() => {
  centerModal();
  window.addEventListener('resize', centerModal);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('resize', centerModal);
});

// Recenter when visibility changes
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    centerModal();
  } else {
    // Also clear the form fields
    fileNameSearchQuery.value = '';
    edafyIdsInput.value = '';
    selectedFile.value = null;
    selectedFileIndex.value = null;
    notFoundEdafyIds.value = [];
  }
}, { immediate: true });

</script>

<style scoped>
/* Add any specific styles here */
.success-message {
  color: #4CAF50;
  background-color: #E8F5E9;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  text-align: center;
}
</style>
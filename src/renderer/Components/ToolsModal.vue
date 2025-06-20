<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal-container" ref="modalContainer">
      <div class="modal-header" @mousedown="startDrag">
        <h2 class="modal-title">Tools</h2>
        <button class="modal-close-button" @click="closeModal">×</button>
      </div>
      <div class="modal-content">
        <div class="warning-message" v-if="warningMessage.length > 0">
          <p v-for="(message, index) in warningMessage" :key="index">{{ message }}</p>
        </div>
        <div class="dimension-selection">
          <span class="dimension-label">Dimension <span class="text-red-500">*</span> :</span>
          <label class="radio-label">
            <input type="radio" value="2D" v-model="dimension" /> 2D
          </label>
          <label class="radio-label">
            <input type="radio" value="3D" v-model="dimension" /> 3D
          </label>
        </div>

        <div class="checkbox-option">
          <label>
            <input type="checkbox" v-model="ignoreNullCoordinate" /> Ignore trace with
            <span class="font-bold">null(0,0)</span> coordinate
          </label>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Trace Header</th>
                <th>Byte Post</th>
                <th>Format</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input type="number" placeholder="x-coordinate" v-model="xCoordinateValue"></td>
                <td><input type="checkbox" v-model="xCoordinateBytePost" /></td>
                <td>
                  <select v-model="xCoordinateFormat">
                    <option value="">Select</option>
                    <option value="2-bit">2-bit</option>
                    <option value="4-bit">4-bit</option>
                    <option value="IEEE">IEEE</option>
                    <option value="IBM">IBM</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td><input type="number" placeholder="y-coordinate" v-model="yCoordinateValue"></td>
                <td><input type="checkbox" v-model="yCoordinateBytePost" /></td>
                <td>
                  <select v-model="yCoordinateFormat">
                    <option value="">Select</option>
                    <option value="2-bit">2-bit</option>
                    <option value="4-bit">4-bit</option>
                    <option value="IEEE">IEEE</option>
                    <option value="IBM">IBM</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="navigation-source">
          Navigation source : SEGY Trace Coordinate
        </div>
      </div>
      <div class="modal-footer">
        <button class="cancel-button" @click="closeModal">Cancel</button>
        <button class="apply-button" @click="applySettings">Apply</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useIngestStore } from '../store/ingestStore';
import { storeToRefs } from 'pinia';
import { headerByteConfig, manualTraceHeaderExtractRequest } from '../../schemas/SegyTable';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);

const ingestStore = useIngestStore();
const { selectedErrorFileForTools, seismicData, seismicErrors } = storeToRefs(ingestStore);

const dimension = ref("2D");
const ignoreNullCoordinate = ref(false);
const xCoordinateValue = ref<number | null>(null);
const xCoordinateBytePost = ref(false);
const xCoordinateFormat = ref("4byte/2byte");
const yCoordinateValue = ref<number | null>(null);
const yCoordinateBytePost = ref(false);
const yCoordinateFormat = ref("4byte/2byte");

const warningMessage = ref<string[]>([]);

const modalContainer = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const initialX = ref(0);
const initialY = ref(0);
const xOffset = ref(0);
const yOffset = ref(0);

const headerByteConfig = ref<headerByteConfig>({
  FFID: null,
  FFID_checked: false,
  Inline: null,
  Inline_checked: false,
  Xline: null,
  Xline_checked: false,
  ShotPoint: null,
  ShotPoint_checked: false,
  CDP: null,
  CDP_checked: false,
  SR: null,
  RL: null
});

// Watch for changes in isVisible prop to update modal visibility in store
watch(() => props.isVisible, (newVal) => {
  ingestStore.setIsToolsModalVisible(newVal);
});

const startDrag = (e: MouseEvent) => {
  isDragging.value = true;
  initialX.value = e.clientX - xOffset.value;
  initialY.value = e.clientY - yOffset.value;
  document.addEventListener('mousemove', dragModal);
  document.addEventListener('mouseup', stopDrag);
};

const dragModal = (e: MouseEvent) => {
  if (isDragging.value && modalContainer.value) {
    e.preventDefault();
    xOffset.value = e.clientX - initialX.value;
    yOffset.value = e.clientY - initialY.value;
    modalContainer.value.style.transform = `translate(${xOffset.value}px, ${yOffset.value}px)`;
  }
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', dragModal);
  document.removeEventListener('mouseup', stopDrag);
};

const closeModal = () => {
  warningMessage.value = []; // Clear warning message
  emit("close");
};

const applySettings = async () => {
  // console.log(" selectedErrorFileForTools ", selectedErrorFileForTools.value?.data)

  warningMessage.value = []; // Clear previous warnings

  if (selectedErrorFileForTools.value == null) {
    warningMessage.value.push("Please choose a file first.");
  }

  if (xCoordinateBytePost.value === true && xCoordinateValue.value === null) {
    warningMessage.value.push("x-coordinate is empty");
  }

  if (yCoordinateBytePost.value === true && yCoordinateValue.value === null) {
    warningMessage.value.push("y-coordinate is empty");
  }

  if (warningMessage.value.length > 0) {
    return; // Stop further execution if there are any warnings
  }

  // Logic to apply settings
  // console.log("Applied Settings:", {
  //   dimension: dimension.value,
  //   ignoreNullCoordinate: ignoreNullCoordinate.value,
  //   xCoordinateValue: xCoordinateValue.value,
  //   xCoordinateBytePost: xCoordinateBytePost.value,
  //   xCoordinateFormat: xCoordinateFormat.value,
  //   yCoordinateValue: yCoordinateValue.value,
  //   yCoordinateBytePost: yCoordinateBytePost.value,
  //   yCoordinateFormat: yCoordinateFormat.value,
  //   selectedErrorFile: selectedErrorFileForTools.value ? selectedErrorFileForTools.value.data : null,
  // });

  const serializableRows = [
    {
      index: selectedErrorFileForTools.value?.index,
      filePath: selectedErrorFileForTools.value?.data.file_unix_path
    }
  ];

  const manualTraceHeaderExtractRequest: manualTraceHeaderExtractRequest = {
    segyRows: serializableRows,
    headerByteConfig: JSON.parse(JSON.stringify(headerByteConfig.value)),
    sampleFormat: '4-bit',
    coordinateConfig: {
      srcx_value: xCoordinateBytePost.value === true ? xCoordinateValue.value : null,
      srcy_value: yCoordinateBytePost.value === true ? yCoordinateValue.value : null,
      srcx_format: xCoordinateBytePost.value === true ? xCoordinateFormat.value : null,
      srcy_format: yCoordinateBytePost.value === true ? yCoordinateFormat.value : null
    }
  }

  // @ts-ignore
  const extractedContent = await window.electronAPI.extractSEGYFilesContent(manualTraceHeaderExtractRequest);
  const result = extractedContent[0];
  // console.log('Result received:', result);


  if (result && typeof result === 'object') {

    const resultCompositeFileName = result.composite_file_name;

    if (result.error.type == null) {
      const errorIndex = seismicErrors.value.findIndex(
        (item: any) => item.composite_file_name === resultCompositeFileName
      );
      if (errorIndex !== -1) {
        seismicErrors.value.splice(errorIndex, 1);
      }

      // Add to seismicData if it does not already exist
      const dataExists = seismicData.value.some(
        (item: any) => item.composite_file_name === resultCompositeFileName
      );
      if (!dataExists) {
        seismicData.value.push(result);
      }
    } else {
      // Check if result exists in seismicData, if exists, remove it
      const dataIndex = seismicData.value.findIndex(
        (item: any) => item.composite_file_name === resultCompositeFileName
      );
      if (dataIndex !== -1) {
        seismicData.value.splice(dataIndex, 1);
      }

      // Add to seismicError if it does not already exist
      const errorExists = seismicErrors.value.some(
        (item: any) => item.composite_file_name === resultCompositeFileName
      );
      if (!errorExists) {
        seismicErrors.value.push(result);
      }

      warningMessage.value.push(result.error.message);
      return;
    }
  }

  closeModal();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* background-color: rgba(0, 0, 0, 0.5); */
  /* Removed black backdrop */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  pointer-events: none;
  /* Allow clicks to pass through the overlay */
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  border: 0.1px solid rgb(225, 225, 225);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.modal-close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
}

.modal-content {
  padding: 16px;
  flex-grow: 1;
}

.warning-message {
  color: red;
  margin-bottom: 10px;
  font-weight: bold;
}

.dimension-selection {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.dimension-label {
  margin-right: 16px;
  font-weight: bold;
}

.radio-label {
  margin-right: 16px;
}

.checkbox-option {
  margin-bottom: 16px;
}

.table-container {
  margin-bottom: 16px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.data-table th {
  background-color: #f2f2f2;
}

.data-table select {
  width: 100%;
  padding: 4px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.navigation-source {
  font-size: 0.9rem;
  color: #555;
  margin-top: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid #eee;
}

.cancel-button {
  background-color: #ccc;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  margin-right: 8px;
}

.apply-button {
  background-color: #7e22ce;
  /* Purple color from image */
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
</style>
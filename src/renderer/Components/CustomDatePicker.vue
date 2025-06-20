<template>
  <div class="relative inline-block w-full min-w-48">
    <div
      class="w-full py-1 px-2 border-2 border-gray-300 rounded-md bg-white text-sm cursor-pointer font-bold transition-all duration-300 ease-in-out focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 flex items-center justify-between"
      :class="{ 'border-blue-500 ring ring-blue-200 ring-opacity-50': isOpen }"
      @click="toggleCalendar">
      <span class="text-gray-900">{{ formattedDate }}</span>
      <svg
        class="w-4 h-4 text-gray-700 transition-transform duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
    </div>

    <div
      v-if="isOpen"
      class="absolute z-20 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3"
      @click.stop
    >
      <!-- Calendar Header -->
      <div class="flex justify-between items-center mb-2">
        <button @click="prevMonth" class="px-2 py-1 rounded hover:bg-gray-100">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <span class="font-semibold text-gray-800">{{ currentMonthYear }}</span>
        <button @click="nextMonth" class="px-2 py-1 rounded hover:bg-gray-100">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>

      <!-- Days of the week -->
      <div class="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 mb-1">
        <span v-for="day in daysOfWeek" :key="day">{{ day }}</span>
      </div>

      <!-- Days in month -->
      <div class="grid grid-cols-7 text-center text-sm">
        <span
          v-for="blankDay in startingDayOfWeek"
          :key="`blank-${blankDay}`"
          class="py-1"
        ></span>
        <span
          v-for="day in daysInMonth"
          :key="day"
          class="py-1 cursor-pointer rounded-full transition-colors duration-100"
          :class="{
            'bg-blue-500 text-white': isSelectedDate(day),
            'hover:bg-gray-200': !isSelectedDate(day),
            'text-gray-400': isFutureMonthDay(day)
          }"
          @click="selectDate(day)"
        >{{ day }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps<{
  modelValue: string | null; // Expected format: 'YYYY-MM-DD'
}>();

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const currentDate = ref(props.modelValue ? new Date(props.modelValue) : new Date());

// Watch for changes in modelValue and update currentDate
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    currentDate.value = new Date(newValue);
  }
});

const formattedDate = computed(() => {
  if (!props.modelValue) return 'Select date';
  const date = new Date(props.modelValue);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
});

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
});

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const startingDayOfWeek = computed(() => {
  const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1);
  return date.getDay(); // 0 for Sunday, 1 for Monday, etc.
});

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const numDays = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: numDays }, (_, i) => i + 1);
});

const toggleCalendar = () => {
  isOpen.value = !isOpen.value;
};

const selectDate = (day: number) => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const selected = new Date(year, month, day);

  // Prevent selecting future dates
  if (isFutureMonthDay(day)) {
    return; 
  }

  emit('update:modelValue', selected.toISOString().split('T')[0]);
  isOpen.value = false;
};

const isSelectedDate = (day: number) => {
  if (!props.modelValue) return false;
  const selected = new Date(props.modelValue);
  return (
    selected.getDate() === day &&
    selected.getMonth() === currentDate.value.getMonth() &&
    selected.getFullYear() === currentDate.value.getFullYear()
  );
};

const isFutureMonthDay = (day: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date to start of day

  const dateToCheck = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day);
  dateToCheck.setHours(0, 0, 0, 0); // Normalize date to check to start of day

  return dateToCheck > today; // Check if the date is in the future
};

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};

const nextMonth = () => {
  const nextMonthDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
  const today = new Date();

  // Prevent navigating to months in the future
  if (nextMonthDate.getMonth() > today.getMonth() && nextMonthDate.getFullYear() >= today.getFullYear()) {
    return;
  }

  currentDate.value = nextMonthDate;
};

const handleClickOutside = (event: MouseEvent) => {
  if (!event.target || !(event.target as HTMLElement).closest('.relative.inline-block')) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Scoped styles for CustomDatePicker */
</style> 
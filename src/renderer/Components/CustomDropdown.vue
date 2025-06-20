<template>
  <div class="relative inline-block w-full min-w-64">
    <div
      class="w-full py-1 px-1 border-2 border-gray-300 rounded-md bg-white text-sm cursor-pointer font-bold transition-all duration-300 ease-in-out focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 flex items-center justify-between"
      :class="{ 'border-blue-500 ring ring-blue-200 ring-opacity-50': isOpen }"
      @click="toggleDropdown">
      <span :class="selectedValueClass">{{ selectedLabel }}</span>
      <svg
        class="w-4 h-4 text-gray-700 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </div>

    <div
      v-if="isOpen"
      class="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg py-1 max-h-60 overflow-auto min-w-64"
      @click.stop
    >
      <div
        v-for="option in options"
        :key="option.value"
        class="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
        :class="{ 'bg-blue-50 text-blue-700 font-semibold': modelValue === option.value }"
        @click="selectOption(option.value)"
      >
        <span>{{ option.label }}</span>
        <svg v-if="modelValue === option.value" class="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  modelValue: string | number | null;
  options: Array<{ value: string | number; label: string }>;
}>();

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);

const selectedLabel = computed(() => {
  const selected = props.options.find(option => option.value === props.modelValue);
  return selected ? selected.label : 'Select value';
});

const selectedValueClass = computed(() => {
  if (props.modelValue === 'active') return 'text-green-600';
  if (props.modelValue === 'inactive') return 'text-red-600';
  if (props.modelValue === 'pending') return 'text-orange-600';
  return 'text-gray-900';
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (value: string | number) => {
  emit('update:modelValue', value);
  isOpen.value = false;
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
/* No specific styles needed here as Tailwind CSS is used directly in the template. */
</style> 
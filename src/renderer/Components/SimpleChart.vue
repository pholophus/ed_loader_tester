<template>
  <Card class="w-full">
    <CardHeader v-if="title || description">
      <CardTitle v-if="title" :class="titleClass">{{ title }}</CardTitle>
      <CardDescription v-if="description">{{ description }}</CardDescription>
    </CardHeader>
    <CardContent>
      <div :style="{ height: height }">
        <component 
          :is="chartComponent"
          :data="chartData"
          :options="chartOptions"
        />
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed, defineProps, withDefaults } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut, Pie } from 'vue-chartjs'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/Components/ui/card'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Props interface
interface Props {
  type: 'line' | 'bar' | 'doughnut' | 'pie'
  data: any
  title?: string
  description?: string
  height?: string
  titleClass?: string
  options?: any
}

// Props with defaults
const props = withDefaults(defineProps<Props>(), {
  height: '300px',
  titleClass: 'text-brand-500',
  options: () => ({})
})

// Chart component mapping
const chartComponents = {
  line: Line,
  bar: Bar,
  doughnut: Doughnut,
  pie: Pie
}

// Computed properties
const chartComponent = computed(() => chartComponents[props.type])

const chartData = computed(() => props.data)

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: '#793E94',
      borderWidth: 1
    }
  },
  scales: props.type === 'line' || props.type === 'bar' ? {
    y: {
      beginAtZero: true,
      grid: {
        color: '#f1f5f9'
      }
    },
    x: {
      grid: {
        color: '#f1f5f9'
      }
    }
  } : undefined,
  ...props.options
}))
</script> 
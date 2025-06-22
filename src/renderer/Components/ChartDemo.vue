<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">Chart.js + vue-chartjs Demo</h1>
      <Button @click="refreshData" variant="outline">
        <span class="mr-2">🔄</span>
        Refresh Data
      </Button>
    </div>

    <!-- Chart Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Line Chart -->
      <Card>
        <CardHeader>
          <CardTitle class="text-brand-500">Performance Over Time</CardTitle>
          <CardDescription>Monthly performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="h-64">
            <Line
              :data="lineChartData"
              :options="lineChartOptions"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Bar Chart -->
      <Card>
        <CardHeader>
          <CardTitle class="text-brand-500">Project Status</CardTitle>
          <CardDescription>Current project distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="h-64">
            <Bar
              :data="barChartData"
              :options="barChartOptions"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Doughnut Chart -->
      <Card>
        <CardHeader>
          <CardTitle class="text-brand-500">Resource Allocation</CardTitle>
          <CardDescription>How resources are distributed</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="h-64">
            <Doughnut
              :data="doughnutChartData"
              :options="doughnutChartOptions"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Radar Chart -->
      <Card>
        <CardHeader>
          <CardTitle class="text-brand-500">Skills Assessment</CardTitle>
          <CardDescription>Team capabilities overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="h-64">
            <Radar
              :data="radarChartData"
              :options="radarChartOptions"
            />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Interactive Controls -->
    <Card>
      <CardHeader>
        <CardTitle>Chart Controls</CardTitle>
        <CardDescription>Interact with the charts above</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Chart Theme</label>
            <select 
              v-model="selectedTheme" 
              @change="updateTheme"
              class="w-full p-2 border rounded-md"
            >
              <option value="brand">Brand Colors</option>
              <option value="blue">Blue Theme</option>
              <option value="green">Green Theme</option>
              <option value="purple">Purple Theme</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Animation</label>
            <div class="flex items-center space-x-2">
              <input 
                type="checkbox" 
                v-model="enableAnimation" 
                @change="updateAnimation"
                class="rounded"
              >
              <span class="text-sm">Enable Animations</span>
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Data Points</label>
            <Button @click="addDataPoint" size="sm" class="w-full">
              Add Random Data
            </Button>
          </div>
        </div>

        <!-- Statistics -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div class="text-center p-3 bg-muted rounded-lg">
            <div class="text-2xl font-bold text-brand-500">{{ totalProjects }}</div>
            <div class="text-xs text-muted-foreground">Total Projects</div>
          </div>
          <div class="text-center p-3 bg-muted rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ completedProjects }}</div>
            <div class="text-xs text-muted-foreground">Completed</div>
          </div>
          <div class="text-center p-3 bg-muted rounded-lg">
            <div class="text-2xl font-bold text-yellow-600">{{ inProgressProjects }}</div>
            <div class="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div class="text-center p-3 bg-muted rounded-lg">
            <div class="text-2xl font-bold text-red-600">{{ pendingProjects }}</div>
            <div class="text-xs text-muted-foreground">Pending</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut, Radar } from 'vue-chartjs'
import { Button } from '@/Components/ui/button'
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
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Reactive data
const selectedTheme = ref('brand')
const enableAnimation = ref(true)

// Brand colors from your Tailwind config
const brandColors = {
  primary: '#793E94',
  primaryLight: '#A68AC9',
  primaryDark: '#50276A',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6'
}

const colorSchemes = {
  brand: [brandColors.primary, brandColors.primaryLight, brandColors.success, brandColors.warning],
  blue: ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'],
  green: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
  purple: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE']
}

// Chart data
const lineChartData = reactive({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Performance',
      backgroundColor: brandColors.primary + '20',
      borderColor: brandColors.primary,
      data: [65, 59, 80, 81, 56, 55],
      fill: true,
      tension: 0.4
    },
    {
      label: 'Target',
      backgroundColor: brandColors.success + '20',
      borderColor: brandColors.success,
      data: [70, 65, 75, 85, 60, 65],
      fill: false,
      borderDash: [5, 5]
    }
  ]
})

const barChartData = reactive({
  labels: ['Completed', 'In Progress', 'Pending', 'On Hold'],
  datasets: [
    {
      label: 'Projects',
      backgroundColor: colorSchemes.brand,
      data: [12, 8, 5, 3]
    }
  ]
})

const doughnutChartData = reactive({
  labels: ['Development', 'Design', 'Testing', 'Documentation'],
  datasets: [
    {
      data: [40, 25, 20, 15],
      backgroundColor: colorSchemes.brand,
      borderWidth: 2,
      borderColor: '#ffffff'
    }
  ]
})

const radarChartData = reactive({
  labels: ['Vue.js', 'TypeScript', 'Electron', 'Chart.js', 'Tailwind', 'shadcn'],
  datasets: [
    {
      label: 'Team Skills',
      data: [90, 85, 75, 80, 95, 88],
      backgroundColor: brandColors.primary + '20',
      borderColor: brandColors.primary,
      pointBackgroundColor: brandColors.primary
    },
    {
      label: 'Required Level',
      data: [80, 90, 70, 85, 90, 85],
      backgroundColor: brandColors.success + '20',
      borderColor: brandColors.success,
      pointBackgroundColor: brandColors.success
    }
  ]
})

// Chart options
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    }
  }
}

const lineChartOptions = reactive({
  ...commonOptions,
  scales: {
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
  }
})

const barChartOptions = reactive({
  ...commonOptions,
  scales: {
    y: {
      beginAtZero: true
    }
  }
})

const doughnutChartOptions = reactive({
  ...commonOptions,
  cutout: '60%'
})

const radarChartOptions = reactive({
  ...commonOptions,
  scales: {
    r: {
      beginAtZero: true,
      max: 100
    }
  }
})

// Computed properties for statistics
const totalProjects = computed(() => 
  barChartData.datasets[0].data.reduce((a, b) => a + b, 0)
)

const completedProjects = computed(() => barChartData.datasets[0].data[0])
const inProgressProjects = computed(() => barChartData.datasets[0].data[1])
const pendingProjects = computed(() => barChartData.datasets[0].data[2])

// Methods
const refreshData = () => {
  // Update line chart
  lineChartData.datasets[0].data = lineChartData.datasets[0].data.map(() => 
    Math.floor(Math.random() * 100)
  )
  
  // Update bar chart
  barChartData.datasets[0].data = barChartData.datasets[0].data.map(() => 
    Math.floor(Math.random() * 20) + 1
  )
  
  // Update doughnut chart
  doughnutChartData.datasets[0].data = doughnutChartData.datasets[0].data.map(() => 
    Math.floor(Math.random() * 50) + 10
  )
  
  // console.log('Chart data refreshed!')
}

const updateTheme = () => {
  const colors = colorSchemes[selectedTheme.value as keyof typeof colorSchemes]
  
  // Update all chart colors
  barChartData.datasets[0].backgroundColor = colors
  doughnutChartData.datasets[0].backgroundColor = colors
  
  // console.log(`Theme changed to: ${selectedTheme.value}`)
}

const updateAnimation = () => {
  // This would update chart animation settings
  // console.log(`Animation ${enableAnimation.value ? 'enabled' : 'disabled'}`)
}

const addDataPoint = () => {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const randomMonth = months[Math.floor(Math.random() * months.length)]
  
  if (!lineChartData.labels.includes(randomMonth)) {
    lineChartData.labels.push(randomMonth)
    lineChartData.datasets[0].data.push(Math.floor(Math.random() * 100))
    lineChartData.datasets[1].data.push(Math.floor(Math.random() * 100))
  }
  
  // console.log('Added new data point!')
}

onMounted(() => {
  // console.log('Chart.js + vue-chartjs demo loaded successfully!')
})
</script>

<style scoped>
/* Custom styles for select element to match shadcn design */
select {
  background-color: transparent;
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius) - 2px);
}

select:focus {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
</style> 
<template>
  <div class="bg-tertiary-500 flex flex-col min-h-screen">
    <!-- Header with shadcn components -->
    <header class="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center px-4">
        <div class="mr-4 flex">
          <h1 class="text-lg font-semibold">ED Loader App</h1>
        </div>
        <div class="flex flex-1 items-center space-x-2 justify-end">
          <Button variant="ghost" size="sm">
            Settings
          </Button>
          <Button variant="outline" size="sm">
            Help
          </Button>
        </div>
      </div>
    </header>

    <!-- Main content area -->
    <main class="flex-1 p-6">
      <!-- Welcome card -->
      <Card class="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle class="text-brand-500">Welcome to ED Loader</CardTitle>
          <CardDescription>
            Your Electron app with Vue 3, TypeScript, and shadcn/vue components
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Project Name</label>
              <Input 
                v-model="projectName" 
                placeholder="Enter project name"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Status</label>
              <div class="flex items-center space-x-2">
                <div class="h-3 w-3 rounded-full bg-green-500"></div>
                <span class="text-sm text-muted-foreground">Ready</span>
              </div>
            </div>
          </div>
          
          <!-- Action buttons -->
          <div class="flex flex-wrap gap-2 pt-4">
            <Button @click="handleNewProject" class="bg-brand-500 hover:bg-brand-600">
              New Project
            </Button>
            <Button variant="outline" @click="handleOpenProject">
              Open Project
            </Button>
            <Button variant="secondary" @click="handleRecentProjects">
              Recent Projects
            </Button>
          </div>

          <!-- Demo message -->
          <div v-if="projectName" class="mt-4 p-3 rounded-md bg-muted">
            <p class="text-sm text-muted-foreground">
              Project "{{ projectName }}" - shadcn/vue components are working! ✅
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Quick stats with cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 max-w-2xl mx-auto">
        <Card>
          <CardContent class="p-4">
            <div class="flex items-center space-x-2">
              <div class="h-8 w-8 rounded-md bg-brand-100 flex items-center justify-center">
                <span class="text-brand-600 text-sm font-medium">📁</span>
              </div>
              <div>
                <p class="text-sm font-medium">Projects</p>
                <p class="text-xs text-muted-foreground">{{ projectCount }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-4">
            <div class="flex items-center space-x-2">
              <div class="h-8 w-8 rounded-md bg-green-100 flex items-center justify-center">
                <span class="text-green-600 text-sm font-medium">⚡</span>
              </div>
              <div>
                <p class="text-sm font-medium">Status</p>
                <p class="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-4">
            <div class="flex items-center space-x-2">
              <div class="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                <span class="text-blue-600 text-sm font-medium">🎨</span>
              </div>
              <div>
                <p class="text-sm font-medium">Theme</p>
                <p class="text-xs text-muted-foreground">Light</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Chart Example -->
      <div class="max-w-2xl mx-auto mt-6">
        <SimpleChart
          type="line"
          :data="chartData"
          title="Weekly Activity"
          description="Your activity over the past week"
          height="250px"
        />
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-12 items-center justify-between px-4">
        <p class="text-xs text-muted-foreground">
          ED Loader v1.0.0 - Built with Vue 3 + Electron + shadcn/vue
        </p>
        <div class="flex items-center space-x-2">
          <Button variant="ghost" size="sm" @click="showDemo">
            View Demo
          </Button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue';
import { Button } from '@/Components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import SimpleChart from '@/Components/SimpleChart.vue';

const projectName = ref('');
const projectCount = ref(3);

// Chart data for the weekly activity chart
const chartData = ref({
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Activities',
      backgroundColor: '#793E94' + '20',
      borderColor: '#793E94',
      data: [12, 19, 15, 22, 18, 25, 20],
      fill: true,
      tension: 0.4
    }
  ]
});

const handleNewProject = () => {
  console.log('Creating new project...');
  // Add your logic here
};

const handleOpenProject = () => {
  console.log('Opening project...');
  // Add your logic here
};

const handleRecentProjects = () => {
  console.log('Showing recent projects...');
  // Add your logic here
};

const showDemo = () => {
  console.log('Showing shadcn demo...');
  // You could navigate to the ShadcnDemo component here
};
</script>

<style scoped>
/* Add any specific styles here */
/* main { */
  /* z-index: 10; */
  /* margin-top: 1rem; Adjust this value as needed */
/* } */
</style> 
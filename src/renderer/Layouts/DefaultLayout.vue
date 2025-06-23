<template>
  <div class="bg-tertiary-500 flex flex-col min-h-screen">
    <!-- Header with shadcn components -->
    <header class="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center px-4">
        <div class="mr-4 flex">
          <h1 class="text-base font-semibold">ED Loader App</h1>
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

    <!-- Main content area - using slot for router content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-12 items-center justify-between px-4">
        <p class="text-xs text-muted-foreground">
          ED Loader v1.0.0
        </p>
        <!-- <div class="flex items-center space-x-2">
          <Button variant="ghost" size="sm" @click="showDemo">
            View Demo
          </Button>
        </div> -->
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/Components/ui/button';

const showDemo = () => {
  // console.log('Showing shadcn demo...');
  // You could navigate to the ShadcnDemo component here
};
</script>

<style scoped>
/* Add any specific styles here */
</style> 
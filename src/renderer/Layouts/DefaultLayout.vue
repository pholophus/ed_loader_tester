<template>
  <div class="bg-tertiary-500 flex flex-col min-h-screen">
    <!-- Header with shadcn components - hidden on login page -->
    <header 
      v-if="!isLoginPage"
      class="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div class="w-full flex h-14 items-center justify-between pl-4 pr-4">
        <div class="flex">
          <h1 class="text-base font-semibold">ED Loader App</h1>
        </div>
        <div class="flex items-center space-x-2 pr-2">
          <Button variant="ghost" size="sm">
            Settings
          </Button>
          <Button variant="outline" size="sm">
            Help
          </Button>
          <Button 
            v-if="isAuthenticated" 
            variant="destructive" 
            size="sm"
            @click="handleLogout"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>

    <!-- Main content area - using slot for router content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <!-- <footer class="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-12 items-center justify-between px-4">
        <p class="text-xs text-muted-foreground">
          ED Loader v1.0.0
        </p>
        <div class="flex items-center space-x-2">
          <Button variant="ghost" size="sm" @click="showDemo">
            View Demo
          </Button>
        </div>
      </div>
    </footer> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { Button } from '@/Components/ui/button';
import { useAuth } from '../Composables/useAuth';

const route = useRoute();
const { isAuthenticated, logout } = useAuth();

// Check if current route is login page
const isLoginPage = computed(() => route.path === '/login');

const showDemo = () => {
  // You could navigate to the ShadcnDemo component here
};

const handleLogout = () => {
  logout();
};
</script>

<style scoped>
/* Add any specific styles here */
</style> 
<template>
  <DefaultLayout>
    <router-view />
  </DefaultLayout>
</template>

<script setup lang="ts">
// Remove the unused import
import DefaultLayout from './Layouts/DefaultLayout.vue';
</script>

<style>
html, body {
  height: 100%;
  margin: 0;
}

</style> 
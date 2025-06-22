import { createRouter, createWebHashHistory } from 'vue-router';

// Import your page components
import Dashboard from '../Pages/Dashboard.vue';
import Upload from '../Pages/Upload.vue';
import DataPreparation from '../Pages/DataPreparation.vue';
import DataQC from '../Pages/DataQC.vue';
import DataLoading from '@/Pages/DataLoading.vue';

const routes = [
  { path: '/', component: Dashboard },
  { path: '/upload', component: Upload },
  { path: '/data-preparation', component: DataPreparation },
  { path: '/data-loading', component: DataLoading },
  { path: '/data-qc', component: DataQC },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
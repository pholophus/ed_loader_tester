import { createRouter, createWebHashHistory } from 'vue-router';

// Import your page components
import Dashboard from '../Pages/Dashboard.vue';
import Upload from '../Pages/Upload.vue';

const routes = [
  { path: '/', component: Dashboard },
  { path: '/upload', component: Upload },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
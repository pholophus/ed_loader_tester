import { createRouter, createWebHashHistory } from 'vue-router';

// Import your page components
import Dashboard from '../Pages/Dashboard.vue';
const routes = [
  { path: '/', component: Dashboard },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
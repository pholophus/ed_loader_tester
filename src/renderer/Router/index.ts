import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuth } from '../Composables/useAuth';

// Import your page components
import Login from '../Pages/Login.vue';
import Dashboard from '../Pages/Dashboard.vue';
import Upload from '../Pages/Upload.vue';
import WellDataPreparation from '../Pages/Well/DataPreparation.vue';
import SeismicDataPreparation from '../Pages/Seismic/DataPreparation.vue';
import WellDataQC from '../Pages/Well/DataQC.vue';
import SeismicDataQC from '../Pages/Seismic/DataQC.vue';
import WellDataLoading from '../Pages/Well/DataLoading.vue';
import SeismicDataLoading from '../Pages/Seismic/DataLoading.vue';

const routes = [
  { 
    path: '/login', 
    component: Login,
    meta: { requiresGuest: true }
  },
  { 
    path: '/', 
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  { 
    path: '/upload', 
    component: Upload,
    meta: { requiresAuth: true }
  },
  { 
    path: '/well/data-preparation', 
    component: WellDataPreparation,
    meta: { requiresAuth: true }
  },
  { 
    path: '/well/data-loading', 
    component: WellDataLoading,
    meta: { requiresAuth: true }
  },
  { 
    path: '/well/data-qc', 
    component: WellDataQC,
    meta: { requiresAuth: true }
  },
  { 
    path: '/seismic/data-preparation', 
    component: SeismicDataPreparation,
    meta: { requiresAuth: true }
  },
  { 
    path: '/seismic/data-loading', 
    component: SeismicDataLoading,
    meta: { requiresAuth: true }
  },
  { 
    path: '/seismic/data-qc', 
    component: SeismicDataQC,
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const { validateAndLoadUser } = useAuth();
  
  // For login page, check if already authenticated
  if (to.meta.requiresGuest) {
    const isValid = await validateAndLoadUser();
    if (isValid) {
      // Valid token and user loaded, redirect to dashboard
      next('/');
      return;
    }
    // No valid token, allow access to login page
    next();
    return;
  }
  
  // For protected routes, validate authentication
  if (to.meta.requiresAuth) {
    const isValid = await validateAndLoadUser();
    if (!isValid) {
      // Invalid token or failed to load user, redirect to login
      next('/login');
      return;
    }
    
    // Valid token and user loaded, allow access
    next();
    return;
  }
  
  // Route doesn't require auth, allow access
  next();
});

export default router;
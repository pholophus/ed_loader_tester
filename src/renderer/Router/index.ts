import { createRouter, createWebHashHistory } from 'vue-router';

// Import your page components
import Dashboard from '../Pages/Dashboard.vue';
import Upload from '../Pages/Upload.vue';
import WellDataPreparation from '../Pages/Well/DataPreparation.vue';
import SeismicDataPreparation from '../Pages/Seismic/DataPreparation.vue';
import WellDataQC from '../Pages/Well/DataQC.vue';
import SeismicDataQC from '../Pages/Seismic/DataQC.vue';
import WellDataLoading from '../Pages/Well/DataLoading.vue';
import SeismicDataLoading from '../Pages/Seismic/DataLoading.vue';

const routes = [
  { path: '/', component: Dashboard },
  { path: '/upload', component: Upload },
  { path: '/well/data-preparation', component: WellDataPreparation },
  { path: '/well/data-loading', component: WellDataLoading },
  { path: '/well/data-qc', component: WellDataQC },
  { path: '/seismic/data-preparation', component: SeismicDataPreparation },
  { path: '/seismic/data-loading', component: SeismicDataLoading },
  { path: '/seismic/data-qc', component: SeismicDataQC },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
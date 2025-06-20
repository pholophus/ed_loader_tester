import { createApp } from 'vue';
import App from './App.vue';
import './index.css';
import * as luxon from 'luxon';
import router from './Router/index';
import { createPinia } from 'pinia';

(window as any).luxon = luxon;

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.mount('#app'); 
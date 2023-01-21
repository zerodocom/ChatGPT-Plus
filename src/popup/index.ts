import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import {ChatSquare,CollectionTag,Opportunity,Setting} from "@element-plus/icons-vue";
import './style.css';
import App from './Popup.vue';

const app = createApp(App);
app.component("ChatSquare", ChatSquare);
app.component("CollectionTag", CollectionTag);
app.component("Opportunity", Opportunity);
app.component("Setting", Setting);
app.use(ElementPlus).mount('#app');

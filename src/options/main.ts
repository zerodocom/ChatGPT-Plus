import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './style.css';
import {ChatSquare,CollectionTag,Opportunity,Setting} from "@element-plus/icons-vue";
import App from './App.vue';
import { createWebHashHistory, createRouter } from "vue-router";
import Conversation from "./Conversation.vue";
import Prompt from "./Prompt.vue";
import Settings from "./Settings.vue";
import Shortcut from "./Shortcut.vue";
import Home from "./Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/conversation",
    name: "Conversation",
    component: Conversation,
  },
  {
    path: "/prompt",
    name: "Prompt",
    component: Prompt,
  },
  {
    path: "/shortcut",
    name: "Shortcut",
    component: Shortcut,
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
});

const app = createApp(App);
app.component("ChatSquare", ChatSquare);
app.component("CollectionTag", CollectionTag);
app.component("Opportunity", Opportunity);
app.component("Setting", Setting);
app.use(router);
// app.use()
app.use(ElementPlus).mount('#app');

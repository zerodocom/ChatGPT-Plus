import { createApp, reactive } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './style.css';
import {ChatSquare,CollectionTag,Opportunity,Setting} from "@element-plus/icons-vue";
import App from './index.vue';
import { createWebHashHistory, createRouter } from "vue-router";
import Chat from "./chat.vue";
import Prompt from "./prompt.vue";
import Settings from "./settings.vue";
import Shortcut from "./shortcut.vue";

const routes = [
    {
        path: "/chat",
        name: "Chat",
        component: Chat,
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
app.use(ElementPlus).mount('#app');

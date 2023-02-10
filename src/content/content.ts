
import { createApp } from 'vue';
import App from "./ChatCard.vue";
import ElementPlus from "element-plus";

// let selectionStores:{[key:string]:any} = {};
let respLayerOrigin = document.createElement("chatgpt-plus-layer");
let respLayer = respLayerOrigin.attachShadow({mode: 'open'});

// let a = import("../assets/chat-card.css");

let head = document.createElement("head");
respLayer.appendChild(head);
let body = document.createElement("body");
respLayer.appendChild(body);

let link = document.createElement("link");
link.rel = "stylesheet";
link.href= "@/assets/chat-card.css";
head.appendChild(link);

// let respBox = document.createElement("div");
// respBox.style.width = "800px";
// respBox.style.position = "absolute";
// respBox.style.left = "10px";
// respBox.style.top = "10px";
// respBox.style.background = "#FFF";
// respBox.style.border = "1px solid #dee2e5";
// respBox.style.borderRadius = "5px";
// respBox.style.boxShadow = "0px 2px 16px rgb(0 0 0 / 16%)";
// respBox.style.zIndex="99999999";
// body.appendChild(respBox);

let html = document.createElement("html");
respLayer.appendChild(html);

function layerDisplay(){
    console.log("try !!to enable response-layer");
    document.getElementsByTagName("html")[0].appendChild(respLayerOrigin);
    // let layer = document.querySelector("response-layer");
    // if(layer === null){
    //     document.getElementsByTagName("html")[0].appendChild(respLayer);
    //     layer = respLayer;
    // }
    // let position = window!.getSelection()!.getRangeAt(0).getBoundingClientRect();
    // console.log(position);
    // respBox.style.top = (window.scrollY + position.top + position.height + 5) + "px";
    // respBox.style.left = position.left + "px";
    // respBox.style.display = "block";

}

layerDisplay();

const app = createApp(App);
app.use(ElementPlus).mount(body);

export {};
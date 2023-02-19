import {createApp} from 'vue';
import App from "./ChatCard.vue";
import ElementPlus from "element-plus";
import {request, RequestTarget, Server} from "../apiServer";

// let selectionStores:{[key:string]:any} = {};
// let respLayerOrigin = document.createElement("chatgpt-plus-layer");
// let respLayer = respLayerOrigin.attachShadow({mode: 'open'});
//
// let head = document.createElement("head");
// respLayer.appendChild(head);
// let body = document.createElement("body");
// respLayer.appendChild(body);
//
// let linkContent = document.createElement("link");
// linkContent.rel = "stylesheet";
// linkContent.href= "chrome-extension://" + chrome.runtime.id + "/content.css";
// head.appendChild(linkContent);
//
// let linkOptions = document.createElement("link");
// linkOptions.rel = "stylesheet";
// linkOptions.href= "chrome-extension://" + chrome.runtime.id + "/options.css";
// head.appendChild(linkOptions);

let respLayer:ShadowRoot;
let respLayerOrigin: HTMLElement;

function layerInit(){

    respLayerOrigin = document.createElement("chatgpt-plus-layer");
    respLayer = respLayerOrigin.attachShadow({mode: 'open'});

    let head = document.createElement("head");
    respLayer.appendChild(head);
    let body = document.createElement("body");
    respLayer.appendChild(body);

    let linkContent = document.createElement("link");
    linkContent.rel = "stylesheet";
    linkContent.href= "chrome-extension://" + chrome.runtime.id + "/content.css";
    head.appendChild(linkContent);

    let linkOptions = document.createElement("link");
    linkOptions.rel = "stylesheet";
    linkOptions.href= "chrome-extension://" + chrome.runtime.id + "/options.css";
    head.appendChild(linkOptions);

    console.log("try !!to enable response-layer");
    document.getElementsByTagName("html")[0].appendChild(respLayerOrigin);
    const app = createApp(App);
    app.use(ElementPlus).mount(body);

    document.addEventListener("click", function(event){
        let chatCard = respLayer.querySelector<HTMLElement>(".chat-card")!;
        if(chatCard !== null){
            if(event.target === respLayerOrigin || event.target === chatCard || chatCard.contains(event.target as HTMLInputElement)){
                // click in respBox
            }else{
                chatHide();
            }
        }
    });
}

function chatDisplay(){
    let chatCard = respLayer.querySelector<HTMLElement>(".chat-card")!;
    let position = window!.getSelection()!.getRangeAt(0).getBoundingClientRect();
    console.log(chatCard);
    chatCard.style.top = (window.scrollY + position.top + position.height + 5) + "px";
    chatCard.style.left = position.left + "px";
    chatCard.style.display = "block";
}

function chatHide(){
    let chatCard = respLayer.querySelector<HTMLElement>(".chat-card")!;
    chatCard.style.display = "none";
}


let contentApi = new Server();
class ContentAPI {
    @contentApi.route("/api/v1/content/openChat", "POST")
    public async openChat(data:any) {
        let layer = document.querySelector("chatgpt-plus-layer");
        if(layer === null) {
            layerInit();
        }
        chatDisplay();
        return {"result": true};
    }
}

contentApi.run();
new ContentAPI();

async function chatgptPage(){
    console.log("start sync");
    await request(RequestTarget.Background, "/api/v1/chatgpt/conversations/sync", "POST", {});
    await request(RequestTarget.Background, "/api/v1/chatgpt/conversations/shortcut/sync", "POST", {});
    const refreshResult = await request(RequestTarget.Background, "/api/v1/chatgpt/session/refresh", "POST", {});
    console.log(refreshResult);
    console.log("do sync!");
}

// when https://chat.openai.com/chat is open, do something
if (window.location.hostname === "chat.openai.com" && window.location.pathname.startsWith("/chat")){

    // const newChatElement = document!.querySelector("nav")!.children[0] as HTMLElement;
    // newChatElement.style.width = '70%';
    // let searchElement = document.createElement("div");
    // searchElement.className = "text-white";
    // searchElement.innerText = "Search";
    // searchElement.style.width = "30%";
    // searchElement.style.right = "0px";
    // searchElement.style.paddingLeft = "10px";
    // searchElement.style.paddingTop = "5px";
    // searchElement.style.cursor = "pointer";
    // searchElement.style.position = "absolute";
    // newChatElement.after(searchElement);

    chatgptPage().then(function (){
        console.log("chatgpt page done!");
    });
}

export {};
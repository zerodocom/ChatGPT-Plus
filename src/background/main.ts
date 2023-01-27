/// <reference types="chrome"/>

import {marked} from "marked";
// let CreateProperties = chrome.contextMenus.CreateProperties;
import {Server} from "../apiServer";

function uuid(): string {
  let s:any = [];
  const hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  return s.join("");
}

console.log('this is background', uuid());


async function delay(ms: number): Promise<unknown> {
  // return await for better async stack trace support in case of errors.
  return await new Promise(resolve => setTimeout(resolve, ms));
}

async function getAccessToken(): Promise<any> {
  const resp = await fetch('https://chat.openai.com/api/auth/session');
  if (resp.status === 403) {
    return null;
  }
  const data = await resp.json().catch(() => ({}))
  if (!data.accessToken) {
    return null;
  }
  return data.accessToken;
}

// Retrieve list of entries and render into user's right-click menu.
let menuList:chrome.contextMenus.CreateProperties[] = [{
  "id": "default",
  "type": "normal",
  "title": "ChatGPT Prompt",
  "contexts":["selection"],
}]

menuList.forEach(function(menu){
  chrome.contextMenus.create(menu);
});


// method: bindSelection
//         content-script save the DOM with selectionId
//
//
let promptReader: any = null;
let promptTabId: any = null;

async function queryStarter(info: any){

  let selectionData = {
    id: uuid()
  };

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs:any) {
    promptTabId = tabs[0].id;
    chrome.tabs.sendMessage(promptTabId, {
      method: "openPrompt",
      selectionData: selectionData,
      clickInfo: info,
      inputText: info.selectionText,
    })
  });

  let accessToken = await getAccessToken();
  console.log(accessToken);
  if(accessToken === null){
    await chrome.tabs.sendMessage(promptTabId, {
      method: "loginWarning",
    });
    return;
  }

  fetch('https://chat.openai.com/backend-api/conversation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: "Bearer " + accessToken,
    },
    body: JSON.stringify({
      action: 'next',
      messages: [
        {
          id: uuid(),
          role: 'user',
          content: {
            content_type: 'text',
            parts: [info.selectionText],
          },
        },
      ],
      model: 'text-davinci-002-render',
      parent_message_id: uuid(),
    }),
  }).then(function(response){
    console.log(response.body);
    if(response.body) {
      promptReader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    }else{
      chrome.tabs.sendMessage(promptTabId, {
        method: "errorWarning",
      });
    }
  });
}

async function queryReceiver() {

  while (true){
    if(promptReader !== null){
      while (true){
        const { value, done } = await promptReader.read();
        if (done){
          promptReader = null;
          promptTabId = null;
          break;
        }
        try{
          let data = JSON.parse(value.slice(5));
          if(promptTabId !== null){
            let html = marked.parse(data.message.content.parts[0]);
            await chrome.tabs.sendMessage(promptTabId, {
              method: "receivePrompt",
              data: data,
              html: html,
            });
          }
        }catch(err) {
          console.log(err);
        }
      }
    }
    await delay(1000);
  }

}

chrome.contextMenus.onClicked.addListener(async (info:any, tab:any) => {
  if (info.menuItemId === "default") {
    await queryStarter(info);
  }else{
    console.log("Unknown menuId", info.menuItemId);
  }
});

queryReceiver();

let server = new Server();

class API {
  @server.route("/api/v1/settings", "GET")
  public async settingsGet(data:any) {
    data["kkk"] = "aa1s22sss";
    return data;
  }

  @server.route("/api/v1/settings", "POST")
  public async settingsSet(data:any) {
    return {"a":"baa"};
  }
}

server.run();
let api = new API();
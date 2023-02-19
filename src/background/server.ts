/// <reference types="chrome"/>

import {Server,request, RequestTarget} from "../apiServer";
import { v4 as uuid } from 'uuid';
import {getAllConversations, getAccessToken, getConversation} from "./chatgpt";

async function storageSet(key:string, value:any){
  return await chrome.storage.local.set({[key]: value});
}

async function storageGet(key:string){
  const result = await chrome.storage.local.get([key]);
  console.log(result);
  return result[key];
}

async function delay(ms: number): Promise<unknown> {
  // return await for better async stack trace support in case of errors.
  return await new Promise(resolve => setTimeout(resolve, ms));
}

let promptReader: any = null;
let promptTabId: any = null;

async function queryReceiver() {

  while (true){
    if(promptReader !== null){
      while (true){
        const { value, done } = await promptReader.read();
        if (done){
          promptReader = null;
          promptTabId = null;
          await request(promptTabId, "/api/v1/content/chatDone", "POST", {});
          break;
        }
        try{
          console.log(value);
          for (const rawData of value.trim().split("\n")) {
            if(rawData.trim() == "") {
              console.log("empty data");
              continue;
            }
            let raw = rawData.slice(5);
            if(raw.trim() == ""){
              console.log("empty data");
              continue;
            }
            if(raw.trim() == "[DONE]"){
              console.log("read stream done");
              await request(promptTabId, "/api/v1/content/chatDone", "POST", {});
              break;
            }
            let data = JSON.parse(raw);
            console.log(data);
            await request(promptTabId, "/api/v1/content/chatReceive", "POST", data);
          }
        }catch(err) {
          console.log(value);
          console.error(err);
        }
      }
    }
    await delay(1000);
  }

}

chrome.contextMenus.onClicked.addListener(async (info:any, tab:any) => {

  console.log("info from contextMenus click", info, tab);

  const shortcutInfo = await getShortcutById(info.menuItemId);
  if(shortcutInfo){
    const sessionInfo = await getLocalSession();
    const content = shortcutInfo.promptTemplate.replace("#delimiting text#", info.selectionText);

    promptTabId = tab.id;
    if(shortcutInfo.conversation == "new"){
      await chatgptConversation(content, sessionInfo.accessToken);
    }else{
      const conversationInfo = await getShortcutConversation(shortcutInfo.conversation);
      await chatgptConversation(content, sessionInfo.accessToken, shortcutInfo.conversation, conversationInfo.current_node);

    }

    await request(promptTabId, "/api/v1/content/openChat", "POST", {});
    await request(promptTabId, "/api/v1/content/chatClear", "POST", {});
    await request(promptTabId, "/api/v1/content/chatStart", "POST", {
      "content": content,
      "userImage": sessionInfo.user.image,
    });

  }

});

queryReceiver().then(function(){

});

async function chatgptConversation(content:string, accessToken:string, conversationId:string|null = null, parentMessageId:string|null = null){

  let payload = new Map();

  payload.set("action", "next");
  payload.set("messages", [
    {
      id: uuid(),
      role: 'user',
      content: {
        content_type: 'text',
        parts: [content],
      },
    },
  ]);

  payload.set("model",'text-davinci-002-render-sha');
  // payload.set("model", 'ext-davinci-002-render-paid');
  // payload.set("parent_message_id", uuid());

  if(conversationId){
    payload.set("conversation_id", conversationId);
    payload.set("parent_message_id", parentMessageId);
  }else{
    payload.set("parent_message_id", uuid());
  }

  fetch('https://chat.openai.com/backend-api/conversation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': "Bearer " + accessToken,
    },
    body: JSON.stringify(Object.fromEntries(payload)),
  }).then(function(response){
    if(response.status == 200 && response.body) {
      promptReader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    }else{
      response.text().then(function(result:string) {
        let errorInfo:string;
        try{
          errorInfo = JSON.parse(result).detail;
        }catch (err){
          errorInfo = result;
        }
        request(promptTabId, "/api/v1/content/chatReceive", "POST", {errorMessage: errorInfo})
      });
    }
  });

}

async function getShortcuts():Promise<any[]>{
  let shortcutData = await chrome.storage.local.get(["shortcuts"]);
  if(Array.isArray(shortcutData.shortcuts)){
    return shortcutData["shortcuts"];
  }else{
    const initData = {
      "name": "ChatGPT Prompt",
      "id": uuid(),
      "target": "chat.openai.com",
      "conversation": "new",
      "promptTemplate": "#delimiting text#",
    };
    contextMenuAdd(initData);
    await storageSet("shortcuts", [initData]);
    return [initData];
  }
}

async function getShortcutById(itemId:string){
  const result = (await getShortcuts()).filter((item) => { return item.id == itemId});
  if(result.length > 0){
    return result[0];
  }
}

async function getLocalSession(){
  const sessionData = await chrome.storage.local.get(["chatgpt-session"]);
  return sessionData["chatgpt-session"];
}

function contextMenuAdd(item:any){
  chrome.contextMenus.create({
    "id": item.id,
    "type": "normal",
    "title": item.name,
    "contexts":["selection"],
  });
}

function contextMenuUpdate(item:any){
  chrome.contextMenus.update(item.id, {
    title: item.name
  })
}

async function getShortcutConversation(conversationId:string){
  const result = await storageGet("shortcut-conversations");
  return result[conversationId];
}

getShortcuts().then(function(menuList:any[]){
  menuList.forEach(function(menu:any){
    contextMenuAdd(menu);
  });
});

async function _syncChatGptConversationsShortcut(){
  const shortcuts = await getShortcuts();
  let details:any = {};
  for (const shortcut of shortcuts) {
    if(shortcut.conversation && shortcut.conversation != "new"){
      details[shortcut.conversation] = await getConversation(shortcut.conversation);
    }
  }
  console.log("chatgpt shortcut conversations sync done");
  await storageSet("shortcut-conversations", details);
}

let server = new Server();
const apiVersion = "/api/v1";

class API {
  // @server.route(apiVersion + "/settings", "GET")
  // public async settingsGet(data: any) {
  //   data["kkk"] = "aa1s22sss";
  //   return data;
  // }

  // @server.route(apiVersion + "/chatgpt/conversations", "GET")
  // public async getChatGptConversations(data: any) {
  //   let conversations = getAllConversations();
  //   return conversations;
  // }

  @server.route(apiVersion + "/chatgpt/conversations/sync", "POST")
  public async syncChatGptConversations(data: any) {
    const lastSyncTime = await chrome.storage.local.get(["last-sync-conversation-time"]);
    if(lastSyncTime["last-sync-conversation-time"]){
      const passSeconds = (new Date()).getTime()/1000 - (new Date(lastSyncTime["last-sync-conversation-time"])).getTime()/1000 - (new Date()).getTime()/1000;
      if (passSeconds < 3600){
        return {"result": false, "message": "No need to sync conversations in 1 hour"};
      }
    }
    console.log(lastSyncTime);
    let conversations = await getAllConversations();
    if (conversations !== null) {
      await storageSet("chatgpt-conversations", conversations);
    }
    await storageSet("last-sync-conversation-time", (new Date()).toISOString());
    console.log("chatgpt conversations sync done");
    return {"result": true};
  }

  @server.route(apiVersion + "/chatgpt/conversations/syncLock/clear", "POST")
  public async conversationsSyncLockClear(data: any){
    await chrome.storage.local.remove("last-sync-conversation-time");
  }

  @server.route(apiVersion + "/chatgpt/conversations/shortcut/sync", "POST")
  public async syncChatGptConversationsShortcut(data: any) {
    await _syncChatGptConversationsShortcut();
  }


  @server.route(apiVersion + "/chatgpt/conversations/lastSyncTime", "GET")
  public async chatGptConversationsLastSyncTime(data: any) {
    const lastSyncTime = await chrome.storage.local.get(["last-sync-conversation-time"]);
    return {
      "time": lastSyncTime["last-sync-conversation-time"]
    };
  }

  @server.route(apiVersion + "/local/conversations/chatgpt", "GET")
  public async getLocalChatGptConversations(data: any) {
    const storageData = await chrome.storage.local.get(["chatgpt-conversations"]);
    if (storageData['chatgpt-conversations'] && Array.isArray(storageData['chatgpt-conversations'])) {
      return storageData['chatgpt-conversations'];
    } else {
      return [];
    }
  };

  @server.route(apiVersion + "/shortcuts", "GET")
  public async getShortcuts(data: any){
    return await getShortcuts();
  }

  @server.route(apiVersion + "/shortcuts", "POST")
  public async createShortcut(data: any){
    let shortcuts = await getShortcuts();
    shortcuts.push({
      "name": data.name,
      "id": data.id,
      "target": data.target,
      "conversation": data.conversation,
      "promptTemplate": data.promptTemplate,
    });
    contextMenuAdd(data);
    await storageSet("shortcuts", shortcuts);
    await _syncChatGptConversationsShortcut();
    return data;
  }

  @server.route(apiVersion + "/shortcut/update", "POST")
  public async updateShortcut(data: any){
    let shortcuts = await getShortcuts();
    shortcuts.forEach(function(shortcut:any){
      if(shortcut.id != data.id){
        return;
      }
      shortcut.name = data.name;
      shortcut.target = data.target;
      shortcut.conversation = data.conversation;
      shortcut.promptTemplate = data.promptTemplate;
    });
    contextMenuUpdate(data);
    await storageSet("shortcuts", shortcuts);
    await _syncChatGptConversationsShortcut();
    return data;
  }

  @server.route(apiVersion + "/shortcut", "DELETE")
  public async deleteShortcut(data: any){
    let shortcuts = await getShortcuts();
    await storageSet("shortcuts",
      shortcuts.filter(function(shortcut:any){
        if(shortcut.id == data.id){
          return false;
        }else{
          return true;
        }
      })
    );
    chrome.contextMenus.remove(data.id);
    return data;
  }

  @server.route(apiVersion + "/chatgpt/session/refresh", "POST")
  public async sessionRefresh(data: any){
    const localSessionData = await chrome.storage.local.get(["chatgpt-session"]);
    if(localSessionData["chatgpt-session"] && localSessionData["chatgpt-session"]["expires"] != ""){
      const leftSeconds = (new Date(localSessionData["chatgpt-session"]["expires"])).getTime()/1000 - (new Date()).getTime()/1000
      if (leftSeconds / 86400 > 28){
        return {"result": false, "message": "No need to refresh the access token."};
      }
    }
    const resp = await fetch('https://chat.openai.com/api/auth/session');
    if (resp.status === 403) {
      return {"result": false, "message": "Please login first."};
    }
    const sessionData = await resp.json().catch(() => ({}));
    if (sessionData.accessToken){
      await storageSet("chatgpt-session", sessionData);
      return {"result":true, "message": "Refresh success."};
    }
    return {"result":false, "message": "Refresh failed." };
  }

  @server.route(apiVersion + "/chatgpt/session", "GET")
  public async sessionGet(data: any){
    const sessionData = await chrome.storage.local.get(["chatgpt-session"]);
    return sessionData["chatgpt-session"];
  }

  @server.route(apiVersion + "/chatgpt/session/clear", "POST")
  public async sessionClear(data: any){
    await chrome.storage.local.remove("chatgpt-session");
  }

  @server.route(apiVersion + "/open/shortcut", "GET")
  public async openShortcut(data: any){
    await chrome.tabs.create({ url: 'chrome-extension://' + chrome.runtime.id + '/options.html#/shortcut' });
  }


}

new API();
server.run();
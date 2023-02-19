
<template>
    <div class="chat-card">
      <el-row class="chat-item-me">
        <el-col :span="2">
          <img v-if="data.startPrompt.userImage" :src="data.startPrompt.userImage" class="chat-icon"/>
<!--          <div class="chat-icon"></div>-->
        </el-col>
        <el-col :span="22">{{data.startPrompt.content}}</el-col>
      </el-row>
      <el-row class="chat-item-ai">
        <el-col :span="2">
          <div class="chat-icon" style="background-color: rgb(16, 163, 127);"></div>
        </el-col>
        <el-col v-if="data.aiResponse.content != ''" :span="22">
          <div v-html="data.aiResponse.content" />
        </el-col>
        <el-col v-if="data.aiResponse.errorMessage" :span="22">
          <div class="chat-error">{{data.aiResponse.errorMessage}}</div>
        </el-col>
        <el-col v-if="data.conversationId != '' && data.chatDone">
          <div style="float:right">
            <a class="settings" @click="openShortcutSettings">Shortcut settings</a>
            <a class="continue-btn" :href="'https://chat.openai.com/chat/' + data.conversationId" target="_blank">
              <el-button>Continue conversation</el-button>
            </a>
          </div>
        </el-col>
      </el-row>

<!--      <el-row class="chat-item-me">-->
<!--        <el-col :span="2">-->
<!--          <div class="chat-icon"></div>-->
<!--        </el-col>-->
<!--        <el-col :span="22">正文。。。。。。。。。。。。</el-col>-->
<!--      </el-row>-->
    </div>
</template>


<style src="/src/assets/chat-card.css"></style>

<script lang="ts" setup>

import {reactive} from 'vue'
import {request, RequestTarget, Server} from "../apiServer";
import {marked} from "marked";

const data = reactive({
  "startPrompt":{
    "content": "",
    "userImage": null
  },
  "aiResponse":{
    "content": "",
    "errorMessage": null
  },
  "conversationId": "",
  "chatDone": false,
  "chromeRuntimeId": chrome.runtime.id,
});

let chatApi = new Server();
class ChatAPI {
  @chatApi.route("/api/v1/content/chatReceive", "POST")
  public async chatReceive(receiveData:any) {
    console.log(receiveData);
    if(receiveData.errorMessage){
      data.aiResponse.content = "";
      data.aiResponse.errorMessage = receiveData.errorMessage;
    }else{
      data.conversationId = receiveData.conversation_id;
      data.aiResponse.content = marked.parse(receiveData.message.content.parts[0]);
      data.aiResponse.errorMessage = null;
    }
  }

  @chatApi.route("/api/v1/content/chatStart", "POST")
  public async chatStart(receiveData:any) {
    data.startPrompt.content = receiveData.content;
    data.startPrompt.userImage = receiveData.userImage;
  }
  @chatApi.route("/api/v1/content/chatClear", "POST")
  public async chatClear(receiveData:any) {
    data.startPrompt.content = "";
    data.startPrompt.userImage = null;
    data.aiResponse.content = "";
    data.aiResponse.errorMessage = null;
    data.conversationId = "";
    data.chatDone = false;
  }

  @chatApi.route("/api/v1/content/chatDone", "POST")
  public async chatDone(receiveData:any) {
    data.chatDone = true;
  }
}

async function openShortcutSettings(){
  await request(RequestTarget.Background, "/api/v1/open/shortcut", "GET",{});
}

chatApi.run();
new ChatAPI();

</script>
<template>
  <el-main>
    <el-card>
      <div v-if="data.session && data.session.user" class="person-info">
        <img :src="data.session.user.image" class="chat-icon"/>
        <div class="person-info-text">
          <div>{{ data.session.user.name }}</div>
          <div>{{ data.session.user.email }}</div>
        </div>
      </div>
      <div v-if="data.session && data.session.user" class="person-ak-update-time">
        AccessToken expires: {{ data.session.expires }} <a target="_blank" href="https://chat.openai.com/chat"><el-button @click="sessionClear()">Refresh</el-button></a>
      </div>
      <div v-if="!(data.session && data.session.user)" class="person-login">
        chat.openai.com <a target="_blank" href="https://chat.openai.com/chat"><el-button>Login</el-button></a>
      </div>
    </el-card>
  </el-main>
</template>

<script lang="ts" setup>
import {onMounted, reactive} from 'vue';
import { request, RequestTarget } from "../apiServer";

let sessionData:any = {};

const data = reactive({
  session: sessionData,
});

// // do not use same name with ref
// const form = reactive({
//   language: ''
// })

// enhance capability
// Add a one-click copy button
async function getSessionInfo() {
  const sessionData = await request(RequestTarget.Background,"/api/v1/chatgpt/session", "GET", {});
  data.session = sessionData;
  console.log(sessionData);
};

onMounted(function (){
  getSessionInfo();
});

async function sessionClear(){
  await request(RequestTarget.Background, "/api/v1/chatgpt/session/clear", "POST", {});
}

// async function onSubmit() {
//   // console.log(form);
//   console.log('submit!')
//   let res = await request(RequestTarget.Background, "/api/v1/settings", "GET", {"kk":"ccc11"});
//   console.log("get background response:", res);
// }
</script>

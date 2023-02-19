<template>
  <el-main>
    <el-collapse v-model="data.activeItemId" accordion>

      <el-collapse-item v-for="shortcutItem in data.shortcutItems" :name="shortcutItem.id">
        <template #title>
          <span>{{ shortcutItem.name }}</span>
          <span class="shortcut-item-target-desc">{{ shortcutItem.target }}</span>
        </template>
        <div>
          <el-form :model="shortcutItem" label-width="300px" :rules="shortcutItem.rules" :ref="(el:any) => getFormRef(el, shortcutItem)">
            <el-form-item label="Name" prop="name">
              <el-input v-model="shortcutItem.name" placeholder="Text displayed by right click" />
            </el-form-item>
            <el-form-item label="Target site">
                <el-radio-group v-model="shortcutItem.target">
                  <el-radio-button label="chat.openai.com" value="chat.openai.com"/>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="Target conversation" prop="conversation">
              <el-select v-model="shortcutItem.conversation" filterable placeholder="Target conversation" style="width: 500px">
                <el-option
                    v-for="item in data.conversations"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Prompt template" prop="promptTemplate">
              <el-input v-model="shortcutItem.promptTemplate" type="textarea" />
            </el-form-item>
            <el-form-item>
              <el-button v-if="!shortcutItem.canUpdate" type="primary" @click="createShortcut(shortcutItem)">Create</el-button>
              <el-button v-if="shortcutItem.canUpdate" type="primary" @click="updateShortcut(shortcutItem)">Update</el-button>
              <el-popconfirm title="Are you sure to delete this?" width="300" @confirm="deleteShortcut(shortcutItem)">
                <template #reference>
                  <el-button type="danger">Delete</el-button>
                </template>
              </el-popconfirm>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-item>
    </el-collapse>
    <el-card v-if="!data.insertOpen" class="new-shortcut" shadow="never" @click="newShortcut"> +  New Shortcut </el-card>
  </el-main>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue';
import {request, RequestTarget} from "@/apiServer";
import { v4 as uuid } from 'uuid';

let conversations:any[] = [];
let shortcutItems:any[] = [];
let formRefMap = new Map();
let shortcutItemNames:string[] = [];

function getFormRef(el:any, item:any){
  formRefMap.set(item.id, el);
}

const data = reactive({
  shortcutItems: shortcutItems,
  conversations: conversations,
  insertOpen: false,
  activeItemId: "",
})

async function load(){
  let shortcuts = Array.from(await request(RequestTarget.Background, "/api/v1/shortcuts", "GET", {}));
  data.shortcutItems = shortcuts.map(function(item:any){
    return item;
  });

  shortcutItemNames = shortcuts.map(function(item:any){
    item.canUpdate = true;
    item.rules = {
      name: [{ validator: checkName, trigger: 'blur', sourceName: item.name }],
      promptTemplate: [{ validator: checkPromptTemplate, trigger: 'blur' }],
      conversation: [{ validator: checkConversation, trigger: 'blur' }],
    };
    return item.name;
  });

  data.insertOpen = false;
  data.activeItemId = "";

  let items = Array.from(await request(RequestTarget.Background,"/api/v1/local/conversations/chatgpt", "GET", {}));
  data.conversations = items.map(function(item:any){
    return {
      "value": item.id,
      "label": item.title
    };
  });

  data.conversations.unshift({
    "value": "new",
    "label": '*Always create a new conversation*'
  })
}

onMounted(async function (){
  await load();
});

async function createShortcut(item:any){
  const form = formRefMap.get(item.id);
  if(!form){
    console.error("not found form");
    return;
  }
  await form.validate();
  await request(RequestTarget.Background, "/api/v1/shortcuts", "POST", item);
  await load();
}

async function updateShortcut(item:any){
  const form = formRefMap.get(item.id);
  if(!form){
    console.error("not found form");
    return;
  }
  await form.validate();
  await request(RequestTarget.Background, "/api/v1/shortcut/update", "POST", item);
  await load();
}

async function deleteShortcut(item:any){
  const result = await request(RequestTarget.Background, "/api/v1/shortcut", "DELETE", item);
  await load();
}

function newShortcut(){
  const itemId = uuid();
  data.insertOpen = true;
  data.shortcutItems.push({
    "id": itemId,
    "name": "",
    "target": "chat.openai.com",
    "conversation": "",
    "promptTemplate": "#delimiting text#",
    "rules": {
      name: [{validator: checkName, trigger: 'blur'}],
      promptTemplate: [{validator: checkPromptTemplate, trigger: 'blur'}],
      conversation: [{validator: checkConversation, trigger: 'blur'}],
    }
  });
  data.activeItemId = itemId;
}

function checkName(rule: any, value: any, callback: any, source: any, options: any){
  let pattern = /^[\u4e00-\u9fa5a-zA-Z0-9\.\_\-\s]+$/;
  if(value == ""){
    return callback(new Error('Name is a required field.'));
  }else if(!pattern.test(value)){
    return callback(new Error('Name can only contain letters(a-zA-Z), numbers(0-9), Chinese characters or common characters(./ /-/_)'));
  }else{
    const checkItems = shortcutItemNames.filter((name) => {
      if (rule.sourceName && rule.sourceName == name) {
        return false;
      } else {
        return true;
      }
    });
    if(checkItems.indexOf(value) >= 0){
      return callback(new Error('Name cannot be duplicated with other item.'));
    }else{
      return callback();
    }
  }
}

function checkPromptTemplate(rule: any, value: any, callback: any){
  if(value.search("#delimiting text#") < 0){
    return callback(new Error('The placeholder (#delimiting text#) must be contained in the template.'));
  }else{
    return callback();
  }
}

function checkConversation(rule: any, value: any, callback: any){
  if(value == ""){
    return callback(new Error('The target conversation is a required field.'));
  }else{
    return callback();
  }
}

</script>

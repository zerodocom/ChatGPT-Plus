<template>
  <div class="demo-collapse">
    <el-collapse accordion>

      <el-collapse-item v-for="shortcutItem in data.shortcutItems">
        <template #title>
          <span>{{ shortcutItem.name }}</span>
          <span class="shortcut-item-target-desc">{{ shortcutItem.target }}</span>
        </template>
        <div>
          <el-form :model="shortcutItem" label-width="300px">
            <el-form-item label="Name">
              <el-input v-model="shortcutItem.name" placeholder="Text displayed by right click" />
            </el-form-item>
            <el-form-item label="Target site">

                <el-radio-group v-model="shortcutItem.target">
                  <el-radio-button label="chat.openai.com" value="chat.openai.com"/>
                </el-radio-group>

            </el-form-item>
            <el-form-item label="Target conversation">
              <el-select v-model="shortcutItem.conversation" filterable placeholder="Target conversation" style="width: 500px">
                <el-option
                    v-for="item in data.conversations"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Prompt template">
              <el-input v-model="shortcutItem.promptTemplate" type="textarea" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">Save</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { reactive,onMounted } from 'vue'
import {request, RequestTarget} from "@/apiServer";

let shortcutItems:any[] = [{
  "name": "test",
  "target": "chat.openai.com",
  "conversation": "aaa",
  "promptTemplate": "#delimiting text# 怎么样"
},{
  "name": "test2"
}];

let conversations:any[] = [];

const data = reactive({
  shortcutItems: shortcutItems,
  conversations: conversations
})

onMounted(async function (){
  let items = Array.from(await request(RequestTarget.Background,"/api/v1/local/conversations/chatgpt", "GET", {}));
  data.conversations = items.map(function(item:any){
      return {
        "value": item.id,
        "label": item.title
      };
  });
});

const onSubmit = () => {
  console.log('submit!')
}

</script>

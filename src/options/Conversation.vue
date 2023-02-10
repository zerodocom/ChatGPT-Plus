<template>
  <el-row>
    <el-col :span="4" :offset="20">
      最后同步时间 xxx
    </el-col>
  </el-row>
  <el-input v-model="data.searchKey" placeholder="Please input" @input="searchInput"/>
  <el-table :data="data.tableData" style="width: 100%" class="conversation-table">
    <el-table-column prop="id" label="ID" width="350" />
    <el-table-column prop="create_time" label="CreateTime" width="300" />
    <el-table-column prop="title" label="Title" />
    <el-table-column label="Operations" width="180">
      <template #default="scope">
        <a :href="'https://chat.openai.com/chat/' +  scope.row.id" target="_blank">
          <el-button>Continue conversation</el-button>
        </a>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>

import { reactive,onMounted } from 'vue'
import {request, RequestTarget} from "@/apiServer";

let tableData:any[] = [];

const data = reactive({
  tableData: tableData,
  searchKey: ""
});

async function searchInput(inputData:any){
  let items = Array.from(await request(RequestTarget.Background,"/api/v1/local/conversations/chatgpt", "GET", {}));
  data.tableData = items.filter(function (item:any){
    if(item["title"]){
      return item.title.toLocaleLowerCase().includes(inputData.toLocaleLowerCase());
    }
  });
}

onMounted(function (){
  searchInput("");
});

// async function getTableData(){
//   return await request(RequestTarget.Background,"/api/v1/local/conversations/chatgpt", "GET", {});
// }
// request(RequestTarget.Background,"/api/v1/local/conversations/chatgpt", "GET", {}).then(function(data){
//   tableData = data;
//   console.log(data);
// })

// let tableData = [];
//
// chrome.storage.sync.get(["chatgpt-conversations"], function(data){
//   let loadData = [];
//   if(data['chatgpt-conversations'] && Array.isArray(data['chatgpt-conversations'])){
//     data['chatgpt-conversations'].
//   }
//   console.log(data);
// });

// const tableData = [
//   {
//     date: '2016-05-03',
//     name: 'Tom',
//     address: 'No. 189, Grove St, Los Angeles',
//   },
//   {
//     date: '2016-05-02',
//     name: 'Tom',
//     address: 'No. 189, Grove St, Los Angeles',
//   },
//   {
//     date: '2016-05-04',
//     name: 'Tom',
//     address: 'No. 189, Grove St, Los Angeles',
//   },
//   {
//     date: '2016-05-01',
//     name: 'Tom',
//     address: 'No. 189, Grove St, Los Angeles',
//   },
// ]
</script>

<!--<script lang="ts" setup>-->

<!--// import {getConversations} from "../background/chatgpt";-->
<!--import {request, RequestTarget} from "@/apiServer";-->

<!--// let res = await request(RequestTarget.Background, "/api/v1/chatgpt/conversations", "GET",{});-->
<!--// console.log(res);-->

<!--</script>-->
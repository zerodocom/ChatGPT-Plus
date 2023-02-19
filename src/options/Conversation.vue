<template>
  <el-main style="display: flex; flex-direction: column;">
    <div>
      <div style="margin-bottom: 10px; color: #aaa;">
        <div>{{ data.counts.total}} conversations in total, displaying {{data.counts.filter}} based on filters.</div>
        <div style="float:right; position: relative; top: -16px;">
          Last sync time {{ data.lastSyncTime }}
          <a target="_blank" href="https://chat.openai.com/chat" style="text-decoration: none;"><el-button @click="syncLockClear()">Resync</el-button></a>
        </div>
      </div>
<!--      <el-col :span="4" :offset="20">-->
<!--        Last sync time xxx-->
<!--      </el-col>-->
      <el-input v-model="data.searchKey" placeholder="Please input the keywords to search conversation" @input="searchInput"/>
    </div>
    <div style="flex: 1;">
      <el-auto-resizer>
        <template #default="{ height, width }">
          <el-table-v2
              :columns="data.columns"
              :data="data.tableData"
              :width="width"
              :height="height"
              fixed
              class="conversation-table"
              @column-sort="onSort"
          />
        </template>
      </el-auto-resizer>
    </div>
  </el-main>
</template>

<script lang="ts" setup>

import { reactive,onMounted,h,ref } from 'vue'
import {request, RequestTarget} from "@/apiServer";
import {ElButton, TableV2SortOrder} from 'element-plus';
import type { SortBy } from 'element-plus';
import {timeFormat}  from "../utils";

let tableData:any[] = [];

const data = reactive({
  tableData: tableData,
  searchKey: "",
  columns: [{
    key: "id",
    dataKey: "id",
    title: "ID",
    width: 350,
  },{
    key: "createDate",
    dataKey: "createDate",
    title: "CreateTime",
    width: 200,
    sortable: true,
  },{
    key: "title",
    dataKey: "title",
    title: "Title",
    width: 500,
  },{
    key: 'operations',
    title: 'Operations',
    dataKey: 'id',
    width: 200,
    cellRenderer: function(cellData:any){

      return h("a", {
        target: "_blank",
        href: 'https://chat.openai.com/chat/' + cellData.rowData.id
      }, h(ElButton, "Continue conversation"));

    },
  }],
  counts:{
    total: 0,
    filter: 0,
  },
  lastSyncTime: "",
});

async function searchInput(inputData:any){
  let items = Array.from(await request(RequestTarget.Background,"/api/v1/local/conversations/chatgpt", "GET", {}));
  data.counts.total = items.length;
  data.tableData = items.filter(function (item:any){
    if(item["title"]){
      return item.title.toLocaleLowerCase().includes(inputData.toLocaleLowerCase());
    }
  });
  data.tableData.forEach(function(item:any){
    item.createDate = timeFormat(item.create_time);
  })
  data.counts.filter = data.tableData.length;
}

async function lastSyncTime(){
  const result = await request(RequestTarget.Background,"/api/v1/chatgpt/conversations/lastSyncTime", "GET", {});
  data.lastSyncTime = timeFormat(result.time);
}

async function syncLockClear(){
  await request(RequestTarget.Background,"/api/v1/chatgpt/conversations/syncLock/clear", "POST", {});
}

onMounted(function (){
  searchInput("");
  lastSyncTime();
});

const sortState = ref<SortBy>({
  key: 'create_time',
  order: TableV2SortOrder.ASC,
});

const onSort = (sortBy: SortBy) => {
  console.log(sortBy)
  data.tableData = data.tableData.reverse()
  sortState.value = sortBy
}

</script>


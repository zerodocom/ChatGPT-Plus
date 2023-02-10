<template>
  <el-form :model="form" label-width="120px">
    <el-form-item label="界面语言">
      <el-select v-model="form.language" placeholder="please select the language">
        <el-option label="简体中文" value="zh-cn" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">保存</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { request,RequestTarget } from "../apiServer";

// do not use same name with ref
const form = reactive({
  language: ''
})

// 增加能力增强页签
// 里面有增加一键复制按钮

async function onSubmit() {
  console.log(form);
  console.log('submit!')
  let res = await request(RequestTarget.Background, "/api/v1/settings", "GET", {"kk":"ccc11"});
  console.log("get background response:", res);
}
</script>

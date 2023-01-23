<template>
  <el-container>
    <el-aside class="sidebar">
      <el-menu background-color="#202123" text-color="#fff" class="menu" router="true">
        <el-menu-item index="1" route="/chat">
          <el-icon><ChatSquare /></el-icon>
          <span>聊天会话</span>
        </el-menu-item>
        <el-menu-item index="2" route="/prompt">
          <el-icon><CollectionTag /></el-icon>
          <span>语料收藏</span>
        </el-menu-item>
        <el-menu-item index="3" route="/shortcut">
          <el-icon><Opportunity /></el-icon>
          <span>快捷路径</span>
        </el-menu-item>
        <el-menu-item index="4" route="/settings">
          <el-icon><Setting /></el-icon>
          <span>全局设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>

      </el-header>
      <el-main>
        <router-view />
      </el-main>
      <el-footer></el-footer>
    </el-container>
  </el-container>
</template>
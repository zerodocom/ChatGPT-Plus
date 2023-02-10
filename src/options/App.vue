<template>
  <el-container class="options-container">
    <el-aside class="sidebar">
      <el-menu
        class="menu"
        router="true"
        background-color="#202123"
        text-color="#fff"
        active-text-color="#13a27e">
        <el-menu-item index="1" route="/conversation">
          <el-icon><ChatSquare /></el-icon>
          <span>Conversations</span>
        </el-menu-item>
<!--        <el-menu-item index="2" route="/prompt">-->
<!--          <el-icon><CollectionTag /></el-icon>-->
<!--          <span>语料收藏</span>-->
<!--        </el-menu-item>-->
        <el-menu-item index="3" route="/shortcut">
          <el-icon><Opportunity /></el-icon>
          <span>Shortcuts</span>
        </el-menu-item>
        <el-menu-item index="4" route="/settings">
          <el-icon><Setting /></el-icon>
          <span>Settings</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
<!--      <el-header>-->

<!--      </el-header>-->
      <el-main>
        <router-view />
      </el-main>
      <el-footer></el-footer>
    </el-container>
  </el-container>
</template>
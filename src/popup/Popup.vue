<script setup lang="ts">
import { ref } from 'vue'

const crx = ref('create-chrome-ext')
</script>

<template>
  <div>
    <el-container>
      <el-aside class="sidebar">
        <el-menu background-color="#202123" text-color="#fff" class="menu">
          <el-menu-item index="1">
            <el-icon><ChatSquare /></el-icon>
          </el-menu-item>
          <el-menu-item index="2">
            <el-icon><CollectionTag /></el-icon>
          </el-menu-item>
          <el-menu-item index="3">
            <el-icon><Opportunity /></el-icon>
          </el-menu-item>
          <el-menu-item index="4">
            <el-icon><Setting /></el-icon>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          aaa
        </el-header>
        <el-main>
          <el-row class="mb-4">
            <el-button>Default</el-button>
            <el-button type="primary"><ChatSquare style="width: 1em; height: 1em; margin-right: 8px"  />Primary</el-button>
            <el-button type="success">Success</el-button>
            <el-button type="info">Info</el-button>
            <el-button type="warning">Warning</el-button>
            <el-button type="danger">Danger</el-button>
          </el-row>
            <p>
              with extra class <b>is-loading</b>, your icon is able to rotate 360 deg in 2
              seconds, you can also override this
            </p>
            <ChatSquare style="width: 1em; height: 1em; margin-right: 8px"  />
            <el-icon color="#409EFC" class="no-inherit">
              <Share />
            </el-icon>
            <el-icon>
              <Delete />
            </el-icon>
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <el-button type="primary">
              <el-icon style="vertical-align: middle">
                <Search />
              </el-icon>
              <span style="vertical-align: middle"> Search </span>
            </el-button>
        </el-main>
        <el-footer>Footer</el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
main {
  text-align: center;
  padding: 1em;
  margin: 0 auto;
}

h3 {
  color: #42b983;
  text-transform: uppercase;
  font-size: 1.5rem;
  font-weight: 200;
  line-height: 1.2rem;
  margin: 2rem auto;
}

h6 {
  font-size: 0.5rem;
  color: #999999;
  margin: 0.5rem;
}

a {
  font-size: 0.5rem;
  margin: 0.5rem;
  color: #cccccc;
  text-decoration: none;
}

@media (min-width: 480px) {
  h3 {
    max-width: none;
  }
}

@media (prefers-color-scheme: light) {
  a:hover {
    color: #747bff;
  }

  h6 {
    color: #333333;
  }
}
</style>

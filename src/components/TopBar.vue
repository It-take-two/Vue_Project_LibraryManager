<script setup>
import { CloseBold, Expand } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';

const showMenu = ref(false)
const navIcon = computed(() => showMenu.value ? CloseBold : Expand )
</script>

<template>
  <div class="topbar">
    <el-button :icon="navIcon" circle @click="showMenu = !showMenu" />
    <h2>你好，</h2>
  </div>
  <el-menu :default-active="$route.path" v-show="showMenu">
    <el-menu-item index="3" disabled>Info</el-menu-item>
  </el-menu>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
}
</style>
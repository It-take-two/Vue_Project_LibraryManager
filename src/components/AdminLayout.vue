<template>
  <div class="layout">
    <header class="topbar">
      <div class="left">
        <el-button :icon="navIcon" circle @click="toggleSidebar" />
        <h2 class="title">管理员后台</h2>
      </div>
      <div class="right">
        <span class="greeting">你好, {{ username }}</span>
        <el-button type="primary" @click="router.push('/admin/profile')">个人中心</el-button>
        <el-button type="danger" @click="handleLogout">退出登录</el-button>
      </div>
    </header>

    <div class="main">
      <aside class="sidebar" v-show="showSidebar">
        <el-menu
          :default-active="$route.path"
          router
          class="menu"
          background-color="#f5f5f5"
        >
          <el-menu-item index="/admin/dashboard">首页</el-menu-item>
          <el-menu-item index="/admin/records">借阅记录管理</el-menu-item>
          <el-menu-item index="/admin/books">书库管理</el-menu-item>
          <el-menu-item index="/admin/users">用户管理</el-menu-item>
          <el-menu-item v-if="isRootAdmin" index="/admin/admins">管理员管理</el-menu-item>
          <el-menu-item index="/admin/report">借阅报表</el-menu-item>
        </el-menu>
      </aside>

      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Expand, CloseBold } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../repositories/auth'
import { useUserRepository } from '../repositories/user'

const { logout } = useAuth()
const { getUserInfo } = useUserRepository()
const router = useRouter()

const showSidebar = ref(true)
const navIcon = computed(() => (showSidebar.value ? CloseBold : Expand))
const toggleSidebar = () => { showSidebar.value = !showSidebar.value }

const handleLogout = async () => {
  await logout()
  router.push('/login')
}


const isRootAdmin = ref(false)
const username = ref('')

onMounted(async () => {
  try {
    const res = await getUserInfo()
    const userInfo = res.data
    username.value = userInfo.username || ''
    isRootAdmin.value = (userInfo.username === 'root' || userInfo.role === 'root')
  } catch (err) {
    console.error('获取用户信息失败:', err)
    username.value = ''
    isRootAdmin.value = false
  }
})
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e4e4e4;
}
.topbar .left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.topbar .title {
  font-size: 1.25rem;
  margin: 0;
}
.topbar .right {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.greeting {
  font-size: 1rem;
  color: #333;
}
.main {
  display: flex;
  flex: 1;
  height: calc(100% - 60px);
  overflow: hidden;
}
.sidebar {
  width: 200px;
  flex-shrink: 0;
  height: 100%;
  background-color: #f9f9f9;
  border-right: 1px solid #e4e4e4;
}
.menu {
  height: 100%;
  border-right: none;
}
.content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background-color: #f5f5f5;
}
</style>

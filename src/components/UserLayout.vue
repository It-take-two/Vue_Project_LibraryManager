<template>
  <div class="layout">
    <!-- 顶部导航 -->
    <header class="topbar">
      <div class="left">
        <el-button :icon="navIcon" circle @click="toggleSidebar" />
        <h2 class="title">图书借阅系统</h2>
      </div>
      <div class="right">
        <el-button type="primary" @click="router.push('/profile')">个人中心</el-button>
        <el-button type="danger" @click="handleLogout">退出登录</el-button>
      </div>
    </header>

    <!-- 主体布局 -->
    <div class="main">
      <aside class="sidebar" v-show="showSidebar">
        <el-menu
          :default-active="$route.path"
          router
          class="menu"
          background-color="#f5f5f5"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/borrow">我要借书</el-menu-item>
          <el-menu-item index="/borrowed">我的借阅记录</el-menu-item>
        </el-menu>
      </aside>

      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
  <el-dialog
    v-model="overdueDialogVisible"
    title="逾期提醒"
    width="640px"
  >
    <el-alert
      title="您有以下图书已逾期未归还，请尽快处理！"
      type="error"
      show-icon
      style="margin-bottom: 16px;"
    />

    <el-table :data="overdueList" border size="small">
      <el-table-column prop="bookName" label="书名" />
      <el-table-column label="应还时间">
        <template #default="{ row }">
          {{ formatDate(row.returnDeadline) }}
        </template>
      </el-table-column>
      <el-table-column label="逾期天数">
        <template #default="{ row }">
          {{ calculateOverdueDays(row.returnDeadline) }} 天
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button type="primary" @click="overdueDialogVisible = false">知道了</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Expand, CloseBold } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../repositories/auth'
import { useBorrowRepository } from '../repositories/borrow'
import { useCollectionRepository } from '../repositories/collection'

const { logout } = useAuth()
const router = useRouter()

const showSidebar = ref(true)
const navIcon = computed(() => (showSidebar.value ? CloseBold : Expand))
const toggleSidebar = () => { showSidebar.value = !showSidebar.value }

const overdueDialogVisible = ref(false)
const overdueList = ref([])
const { getMyOverdueBorrows } = useBorrowRepository()
const { getCollectionById } = useCollectionRepository()


onMounted(async () => {
  try {
    const borrowRes = await getMyOverdueBorrows()
    const records = borrowRes.data || []

    const withBookNames = await Promise.all(
      records.map(async (record) => {
        try {
          const { data } = await getCollectionById(record.collectionId)
          return {
            ...record,
            bookName: data.name || `ID#${record.collectionId}`,
          }
        } catch {
          return {
            ...record,
            bookName: `ID#${record.collectionId}`,
          }
        }
      })
    )

    overdueList.value = withBookNames
    if (withBookNames.length > 0) overdueDialogVisible.value = true
  } catch {
    console.warn('逾期信息加载失败')
  }
})


const handleLogout = async () => {
  await logout()
}

const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

const calculateOverdueDays = (deadline) => {
  if (!deadline) return 0
  const due = new Date(deadline)
  const now = new Date()
  const days = Math.floor((now - due) / (1000 * 60 * 60 * 24))
  return days > 0 ? days : 0
}
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
  padding: 0; /* 移除左右内边距 */
  background-color: #f5f5f5;
}
</style>
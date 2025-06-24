<template>
  <el-card class="user-manage-page">
    <h2>用户管理</h2>

    <!-- 搜索与添加 -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <div style="display: flex; gap: 8px;">
        <el-input
          v-model="searchNumber"
          placeholder="请输入学号/工号搜索"
          style="max-width: 240px;"
          @keyup.enter="searchUser"
          clearable
          @clear="fetchUsers"
        />
        <el-button type="primary" @click="searchUser">搜索</el-button>
      </div>
      <el-button type="primary" @click="openAddDialog">新增用户</el-button>
    </div>

    <!-- 用户表格 -->
    <el-table :data="users" border style="width: 100%">
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="userNumber" label="学号/工号" />
      <el-table-column label="角色">
        <template #default="{ row }">{{ roleMap[row.roleName] || row.roleName }}</template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="phone" label="电话" />
      <el-table-column label="操作" width="280">
        <template #default="{ row }">
          <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" @click="handleResetPassword(row.userId)">重置密码</el-button>
          <el-popconfirm title="确认删除该用户？" @confirm="handleDeleteUser(row.userId)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      layout="prev, pager, next"
      :total="total"
      :current-page="page"
      :page-size="12"
      @current-change="fetchUsers"
      style="margin-top: 16px; text-align: right;"
    />

    <!-- 添加/编辑用户弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEditing ? '编辑用户' : '新增用户'">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名"><el-input v-model="form.username" :readonly="isEditing"/></el-form-item>
        <el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roleName" placeholder="请选择角色">
            <el-option v-for="role in roles" :key="role" :label="roleMap[role]" :value="role" />
          </el-select>
        </el-form-item>
        <el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="学号"><el-input v-model="form.userNumber" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUser">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserRepository } from '../repositories/user'

const {
  getUserList,
  getUserByUserNumber,
  addUser,
  updateUser,
  deleteUser,
  resetPassword
} = useUserRepository()

const users = ref([])
const total = ref(0)
const page = ref(1)
const dialogVisible = ref(false)
const searchNumber = ref('')

const roles = ['teacher', 'vocational', 'undergraduate', 'master', 'phd']
const roleMap = {
  teacher: '教师',
  vocational: '专科生',
  undergraduate: '本科生',
  master: '研究生',
  phd: '博士研究生'
}

const form = ref({
  username: '',
  name: '',
  roleName: '',
  phone: '',
  userNumber: ''
})

const isEditing = ref(false)
const editingUserId = ref(null)

const resetForm = () => {
  Object.assign(form.value, {
    name: '',
    roleName: '',
    phone: '',
    userNumber: ''
  })
  isEditing.value = false
  editingUserId.value = null
}

const fetchUsers = async (newPage = 1) => {
  page.value = newPage
  try {
    const res = await getUserList(page.value)
    users.value = res.data.records
    total.value = res.data.total
  } catch {
    ElMessage.error('加载用户列表失败')
  }
}

const searchUser = async () => {
  if (!searchNumber.value) return fetchUsers(1)
  try {
    const res = await getUserByUserNumber(searchNumber.value)
    if (res.data) {
      users.value = [res.data]
      total.value = 1
    }
  } catch {
    ElMessage.error('搜索失败，请检查学号/工号是否正确')
  }
}

const openAddDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEditing.value = true
  editingUserId.value = row.userId
  Object.assign(form.value, row)
  dialogVisible.value = true
}

const submitUser = async () => {
  try {
    if (isEditing.value) {
      await updateUser(editingUserId.value, form.value)
      ElMessage.success('用户信息已更新')
    } else {
      await addUser(form.value)
      ElMessage.success('用户添加成功')
    }
    dialogVisible.value = false
    resetForm()
    fetchUsers(page.value)
  } catch {
    ElMessage.error(isEditing.value ? '更新用户失败' : '添加用户失败')
  }
}

const handleResetPassword = async (userId) => {
  try {
    await resetPassword(userId)
    ElMessage.success('密码已重置为默认')
    fetchUsers(page.value)
  } catch {
    ElMessage.error('重置密码失败')
  }
}

const handleDeleteUser = async (userId) => {
  try {
    await deleteUser(userId)
    ElMessage.success('用户删除成功')
    fetchUsers(page.value)
  } catch {
    ElMessage.error('删除用户失败')
  }
}

onMounted(() => fetchUsers())
</script>

<style scoped>
.user-manage-page {
  max-width: 960px;
  margin: auto;
  padding: 24px;
}
</style>
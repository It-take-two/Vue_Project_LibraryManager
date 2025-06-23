<template>
  <el-card class="user-manage-page">
    <h2>管理员管理</h2>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <el-button type="primary" @click="dialogVisible = true">新增管理员</el-button>
    </div>

    <el-table :data="admins" border style="width: 100%">
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="phone" label="电话" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="handleResetPassword(row.userId)">重置密码</el-button>
          <el-popconfirm title="确认删除该管理员？" @confirm="handleDeleteAdmin(row.userId)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      layout="prev, pager, next"
      :total="total"
      :current-page="page"
      :page-size="12"
      @current-change="fetchAdmins"
      style="margin-top: 16px; text-align: right;"
    />

    <el-dialog v-model="dialogVisible" title="新增管理员">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名"><el-input v-model="form.username" /></el-form-item>
        <el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdmin">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserRepository } from '../repositories/user'

const {
  getAdminList,
  addUser,
  deleteUser,
  resetPassword
} = useUserRepository()

const admins = ref([])
const total = ref(0)
const page = ref(1)
const dialogVisible = ref(false)

const form = ref({
  username: '',
  name: '',
  phone: '',
  roleName: 'admin'
})

const fetchAdmins = async (newPage = page.value) => {
  page.value = newPage
  try {
    const res = await getAdminList(newPage)
    admins.value = res.data.records
    total.value = res.data.total
  } catch {
    ElMessage.error('加载管理员列表失败')
  }
}

const submitAdmin = async () => {
  try {
    await addUser(form.value)
    ElMessage.success('管理员添加成功')
    dialogVisible.value = false
    Object.assign(form.value, {
      username: '',
      name: '',
      phone: '',
      roleName: 'admin'
    })
    fetchAdmins(1)
  } catch {
    ElMessage.error('添加管理员失败')
  }
}

const handleResetPassword = async (userId) => {
  try {
    await resetPassword(userId)
    ElMessage.success('密码已重置')
    fetchAdmins(page.value)
  } catch {
    ElMessage.error('重置密码失败')
  }
}

const handleDeleteAdmin = async (userId) => {
  try {
    await deleteUser(userId)
    ElMessage.success('管理员删除成功')
    fetchAdmins(page.value)
  } catch {
    ElMessage.error('删除失败')
  }
}

onMounted(() => fetchAdmins())
</script>

<style scoped>
.user-manage-page {
  max-width: 960px;
  margin: auto;
  padding: 24px;
}
</style>
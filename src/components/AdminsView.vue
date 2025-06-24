<template>
  <el-card class="user-manage-page">
    <h2>管理员管理</h2>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <el-button type="primary" @click="openAddDialog">新增管理员</el-button>
    </div>

    <el-table :data="admins" border style="width: 100%">
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="phone" label="电话" />
      <el-table-column label="操作" width="260">
        <template #default="{ row }">
          <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button
            size="small"
            type="primary"
            @click="handleResetPassword(row.userId)"
          >
            重置密码
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDeleteAdmin(row.userId)"
          >
            删除
          </el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEditing ? '编辑管理员' : '新增管理员'" width="400px">
      <el-form :model="form" :rules="adminRules" ref="adminFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :readonly="isEditing" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" placeholder="请输入电话号码" />
        </el-form-item>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserRepository } from '../repositories/user'

const {
  getAdminList,
  addUser,
  updateUser,
  deleteUser,
  resetPassword
} = useUserRepository()

const admins = ref([])
const total = ref(0)
const page = ref(1)
const dialogVisible = ref(false)
const isEditing = ref(false)
const editingUserId = ref(null)

const form = ref({
  username: '',
  name: '',
  phone: '',
  roleName: 'admin'
})
const adminRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ]
}

const adminFormRef = ref(null)

const resetForm = () => {
  Object.assign(form.value, {
    username: '',
    name: '',
    phone: '',
    roleName: 'admin'
  })
  isEditing.value = false
  editingUserId.value = null
}

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

const submitAdmin = async () => {
  adminFormRef.value.validate(async valid => {
    if (!valid) return
    try {
      if (isEditing.value) {
        await updateUser(editingUserId.value, form.value)
        ElMessage.success('管理员更新成功')
      } else {
        await addUser(form.value)
        ElMessage.success('管理员添加成功')
      }
      dialogVisible.value = false
      resetForm()
      fetchAdmins(page.value)
    } catch {
      ElMessage.error(isEditing.value ? '管理员更新失败' : '添加管理员失败')
    }
  })
}

const handleResetPassword = async (userId) => {
  try {
    await ElMessageBox.confirm(
      '确认重置该管理员密码？重置后密码将变为123456。',
      '提示',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    await resetPassword(userId)
    ElMessage.success('密码已重置')
    fetchAdmins(page.value)
  } catch (error) {
  }
}

const handleDeleteAdmin = async (userId) => {
  try {
    await ElMessageBox.confirm(
      '确认删除该管理员？',
      '提示',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    await deleteUser(userId)
    ElMessage.success('管理员删除成功')
    fetchAdmins(page.value)
  } catch (error) {
  }
}

onMounted(() => fetchAdmins())
</script>

<style scoped>
.user-manage-page {
  max-width: 960px;
  margin: auto;
  padding: 24px;
  margin-top: 24px;
  margin-bottom: 24px;
}
</style>

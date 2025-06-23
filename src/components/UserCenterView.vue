<template>
  <div class="user-center">
    <el-card v-loading="loading" class="profile-card">
      <h2>个人资料</h2>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ user.username }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ user.name }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ user.userNumber }}</el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ user.phone || '—' }}
          <el-button text type="primary" size="small" @click="editingPhone = true">编辑</el-button>
        </el-descriptions-item>
        <el-descriptions-item label="所属班级 ID">{{ className || '—' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatDate(user.createAt) }}</el-descriptions-item>
        <el-descriptions-item label="身份">
          <el-tag type="success">{{ roleMap[user.roleName] || '未知' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作">
          <el-button size="small" type="warning" @click="passwordDialogVisible = true">修改密码</el-button>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 修改手机号弹窗 -->
    <el-dialog v-model="editingPhone" title="修改手机号" width="400px">
      <el-input v-model="newPhone" placeholder="请输入新手机号" />
      <template #footer>
        <el-button @click="editingPhone = false">取消</el-button>
        <el-button type="primary" @click="submitPhoneUpdate">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="400px">
      <el-form :model="passwordForm" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPasswordUpdate">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserRepository } from '../repositories/user'
import { useClassRepository } from '../repositories/class'

const { getUserInfo, updateMyUser, updateMyPassword } = useUserRepository()
const { getClassById } = useClassRepository()

const user = ref({})
const className = ref('')
const loading = ref(false)

const editingPhone = ref(false)
const newPhone = ref('')

const passwordDialogVisible = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: ''
})
const formRef = ref()

const roleMap = {
  admin: '管理员',
  teacher: '教师',
  vocational: '中职生',
  undergraduate: '本科生',
  master: '硕士生',
  phd: '博士生'
}

const rules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }]
}

const formatDate = val => (val ? new Date(val).toLocaleString() : '—')

const loadUser = async () => {
  loading.value = true
  const res = await getUserInfo()
  user.value = res.data
  newPhone.value = res.data.phone || ''
  loading.value = false
}

const loadClassName = async () => {
  if (user.value.classId) {
    const res = await getClassById(user.value.classId)
    className.value = res.data.name
  }
}

const submitPhoneUpdate = async () => {
  if (!newPhone.value) return ElMessage.warning('请输入手机号')
  const res = await updateMyUser(newPhone.value)
  if (res.success !== false) {
    ElMessage.success('手机号更新成功')
    user.value.phone = newPhone.value
    editingPhone.value = false
  } else {
    ElMessage.error('更新失败')
  }
}

const submitPasswordUpdate = async () => {
  formRef.value.validate(async valid => {
    if (!valid) return
    const { oldPassword, newPassword } = passwordForm.value
    const res = await updateMyPassword(oldPassword, newPassword)
    if (res.data !== false) {
      ElMessage.success('密码修改成功')
      passwordDialogVisible.value = false
      passwordForm.value.oldPassword = ''
      passwordForm.value.newPassword = ''
    } else {
      ElMessage.error('密码修改失败')
    }
  })
}

onMounted(async () => {
  await loadUser()
  await loadClassName()
})
</script>

<style scoped>
.user-center {
  padding: 2rem;
}
.profile-card {
  max-width: 800px;
  margin: 0 auto;
}
</style>
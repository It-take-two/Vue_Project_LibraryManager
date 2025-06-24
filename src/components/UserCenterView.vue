<template>
  <div class="user-center">
    <el-card v-loading="loading" class="profile-card">
      <h2>个人资料</h2>
      <el-descriptions :column="2" border label-width="120px">
        <el-descriptions-item label="用户名">{{ user.username }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ user.name }}</el-descriptions-item>
        <el-descriptions-item label="学号/工号">{{ user.userNumber }}</el-descriptions-item>
        <el-descriptions-item label="手机号">
          <div class="phone-container">
            <span>{{ user.phone || '—' }}</span>
            <el-button text type="primary" size="small" @click="editingPhone = true">编辑</el-button>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="班级">{{ className || '—' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatDate(user.createAt) }}</el-descriptions-item>
        <el-descriptions-item label="身份">
          <el-tag type="success">{{ roleMap[user.roleName] || '未知' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作">
          <el-button size="small" type="warning" @click="passwordDialogVisible = true">修改密码</el-button>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-dialog v-model="editingPhone" title="修改手机号" width="400px">
      <el-form :model="phoneForm" :rules="phoneRules" ref="phoneFormRef" label-width="80px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="phoneForm.phone" placeholder="请输入新手机号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editingPhone = false">取消</el-button>
        <el-button type="primary" @click="submitPhoneUpdate">保存</el-button>
      </template>
    </el-dialog>

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
import { ref, onMounted, watch } from 'vue'
import { useUserRepository } from '../repositories/user'
import { useClassRepository } from '../repositories/class'
import { ElMessage } from 'element-plus'

const { getUserInfo, updateMyUser, updateMyPassword } = useUserRepository()
const { getClassById } = useClassRepository()

const user = ref({})
const className = ref('')
const loading = ref(false)

const editingPhone = ref(false)
const phoneForm = ref({ phone: '' })
const phoneRules = {
  phone: [{ required: true, message: '请输入新手机号', trigger: 'blur' }]
}
const phoneFormRef = ref(null)

const passwordDialogVisible = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: ''
})
const formRef = ref(null)

const roleMap = {
  admin: '管理员',
  teacher: '教师',
  vocational: '高职',
  undergraduate: '本科',
  master: '硕士研究生',
  phd: '博士研究生'
}

const rules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }]
}

const formatDate = val => (val ? new Date(val).toLocaleString() : '—')

const loadUser = async () => {
  loading.value = true
  try {
    const res = await getUserInfo()
    user.value = res.data
    phoneForm.value.phone = res.data.phone || ''
  } catch (error) {
    console.warn('加载用户信息失败', error)
  }
  loading.value = false
}

const loadClassName = async () => {
  const classId = user.value.classId
  if (classId) {
    try {
      const res = await getClassById(classId)
      className.value = res.data.className || '—'
    } catch (err) {
      console.warn('获取班级信息失败', err)
      className.value = '—'
    }
  } else {
    className.value = '—'
  }
}

watch(user, () => {
  loadClassName()
})

const submitPhoneUpdate = async () => {
  phoneFormRef.value.validate(async valid => {
    if (!valid) return
    const res = await updateMyUser(phoneForm.value.phone)
    if (res.success !== false) {
      ElMessage.success('手机号更新成功')
      user.value.phone = phoneForm.value.phone
      editingPhone.value = false
    } else {
      ElMessage.error('更新失败')
    }
  })
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

.el-descriptions__label {
  white-space: nowrap;
}

.phone-container {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

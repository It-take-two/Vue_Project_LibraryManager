<template>
  <div class="user-center">
    <el-card class="profile-card" v-loading="loading">
      <h2>个人资料</h2>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ user.username }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ user.name }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ user.userNumber }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ user.phone || '—' }}</el-descriptions-item>
        <el-descriptions-item label="所属班级 ID">{{ className || '—' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatDate(user.createAt) }}</el-descriptions-item>
        <el-descriptions-item label="身份">
          <el-tag type="success">{{ roleMap[user.roleName] || '未知' }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserRepository } from '../repositories/user'
import { useClassRepository } from '../repositories/class'

const { getUserInfo } = useUserRepository()
const { getClassById } = useClassRepository()

const roleMap = {
  teacher: '教师',
  vocational: '中职生',
  undergraduate: '本科生',
  master: '硕士生',
  phd: '博士生',
}

const className = ref('')

const loadClassName = async () => {
  if (user.value.classId) {
    const res = await getClassById(user.value.classId)
    className.value = res.data.name
  }
}

const user = ref({})
const loading = ref(false)

const formatDate = (val) => {
  if (!val) return '—'
  const date = new Date(val)
  return date.toLocaleString()
}

const loadUser = async () => {
  loading.value = true
  const res = await getUserInfo()
  user.value = res.data
  loading.value = false
}

onMounted( () => {
    loadUser()
    loadClassName()
})
</script>

<style scoped>
</style>
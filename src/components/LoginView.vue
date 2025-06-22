<template>
  <div class="login-container">
    <h2>登录</h2>
    <el-form @submit.prevent="handleLogin" :model="form">
      <el-form-item label="用户名">
        <el-input v-model="form.name" autocomplete="username" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input type="password" v-model="form.password" autocomplete="current-password" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin" :loading="loading">登录</el-button>
      </el-form-item>
    </el-form>
    <el-alert v-if="error" :title="error" type="error" show-icon />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../repositories/auth'

const router = useRouter()
const { login } = useAuth()

const form = ref({
  name: '',
  password: '',
})

const loading = ref(false)
const error = ref(null)

const handleLogin = async () => {
  error.value = null
  loading.value = true
  try {
    await login(form.value.name, form.value.password)
    router.push('/')
  } catch (err) {
    error.value = '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 100px auto;
  padding: 2rem;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
</style>
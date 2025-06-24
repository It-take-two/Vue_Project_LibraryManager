<template>
  <div class="login-wrapper">
    <div class="background-layer"></div>
    <div class="login-container">
      <h2 class="login-title">登录</h2>
      <el-form @submit.prevent="handleLogin" :model="form" class="login-form" label-position="top">
        <el-form-item label="用户名" class="form-item">
          <el-input v-model="form.name" autocomplete="username" placeholder="请输入用户名" :prefix-icon="UserFilled" class="full-input" />
        </el-form-item>
        <el-form-item label="密码" class="form-item">
          <el-input v-model="form.password" type="password" autocomplete="current-password" placeholder="请输入密码" :prefix-icon="Lock" class="full-input" />
        </el-form-item>
        <div class="button-container">
          <el-button type="primary" @click="handleLogin" :loading="loading" class="login-button">
            登录
          </el-button>
        </div>
      </el-form>
      <el-alert v-if="error" :title="error" type="error" show-icon class="alert-message" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../repositories/auth'
import { UserFilled, Lock } from '@element-plus/icons-vue'

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
    const role = localStorage.getItem('roleName')
    if (role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/')
    }
  } catch (err) {
    error.value = '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  overflow: hidden;
}
.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('https://picsum.photos/1920/1080') no-repeat center center;
  background-size: cover;
  filter: blur(10px);
  z-index: -1;
}
.login-container {
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  padding: 40px 30px;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  backdrop-filter: blur(5px);
}
.login-title {
  text-align: center;
  font-size: 26px;
  margin-bottom: 20px;
  font-weight: bold;
  color: #333;
}
.login-form .form-item {
  margin-bottom: 20px;
}
.full-input {
  width: 100%;
}
.button-container {
  text-align: center;
}
.login-button {
  font-size: 16px;
  height: 36px;
  padding: 0 16px;
}
.alert-message {
  margin-top: 20px;
}
</style>

<style>
html, body {
  overflow: hidden;
  height: 100%;
  margin: 0;
}
</style>

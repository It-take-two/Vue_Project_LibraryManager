<template>
    <router-view />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  router.push('/login')
}

onMounted(() => {
  window.addEventListener('app-logout', handleLogout)
})

onUnmounted(() => {
  window.removeEventListener('app-logout', handleLogout)
})
</script>

<style>

html, body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}
#app {
  height: 100%;
  width: 100%;
  max-width: none !important;
  padding: 0;
  margin: 0;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.2);
  border-radius: 3px;
}
</style>


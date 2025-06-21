<script setup>
import { ref, computed } from 'vue';
import { auth } from "../repositories/auth";
import TopBar from './TopBar.vue';
const { state, register, login, logout } = auth();
</script>

<template>
    <TopBar/>
</template>
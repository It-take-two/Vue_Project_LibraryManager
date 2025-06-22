<template>
    <router-view />
</template>

<style>

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  height: 100%;
  width: 100%;
}


/* 滚动条美化（可选） */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.2);
  border-radius: 3px;
}
</style>


<template>
  <main class="flex-1 overflow-hidden bg-login">
    <RouterView />
  </main>
</template>

<style scoped>
.bg-login {
  background-image: url('@/assets/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>

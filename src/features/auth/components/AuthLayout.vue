<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="w-full max-w-md lg:max-w-lg mx-auto">
      <img
        class="w-40 mb-4 ml-8"
        src="/images/logo.png"
        alt="Logo"
      />

      <div class="bg-gray-50 rounded-2xl shadow-2xl px-6 py-12">
        <slot />
      </div>
    </div>
  </div>
</template>

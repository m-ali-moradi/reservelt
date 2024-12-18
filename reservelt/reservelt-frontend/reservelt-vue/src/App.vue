<script setup>
</script>

<template>
  <div id="app">
    <!-- Router View will render the route components -->
    <router-view />

    <!-- Vite and Vue Logos -->
    <!-- <div class="logos">
      <a href="https://vite.dev" target="_blank">
        <img src="/vite.svg" class="logo" alt="Vite logo" />
      </a>
      <a href="https://vuejs.org/" target="_blank">
        <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
      </a>
    </div> -->

    <!-- HelloWorld Component -->
    <!-- <HelloWorld msg="Vite + Vue" /> -->
  </div>
</template>

<style scoped>
#app {
  text-align: center;
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

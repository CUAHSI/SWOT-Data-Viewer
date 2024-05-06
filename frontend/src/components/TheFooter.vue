<template>
  <v-footer height="50" v-if="!$route.meta.hideNavigation" fixed app color="navbar" class="d-flex flex-column">
    <div class="d-flex align-end full-height align-center w-100">
      <v-spacer></v-spacer>
      <router-link :to="{ path: `/` }" class="logo">
        <img src="@/assets/cuahsi-logo.png" alt="home" />
      </router-link>
      <!-- <ThemeButton /> -->
    </div>
  </v-footer>
</template>

<script setup>
// import ThemeButton from './ThemeButton.vue';
import { RouterLink } from 'vue-router'

</script>

<style lang="scss" scoped>
.logo {
  height: 100%;
  cursor: pointer;

  img {
    height: 100%;
  }
}
</style>
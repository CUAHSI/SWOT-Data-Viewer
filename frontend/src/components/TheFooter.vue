<template>
  <v-footer
    height="50"
    v-if="!$route.meta.hideNavigation"
    fixed
    app
    color="navbar"
    class="d-flex flex-column"
  >
    <div class="d-flex align-end full-height align-center w-100">
      <v-spacer></v-spacer>
      <v-btn color="secondary" href="https://www.cuahsi.org/" target="_blank">
        <v-img :src="imgUrl" cover width="10rem"></v-img>
      </v-btn>
      <!-- <ThemeButton /> -->
    </div>
  </v-footer>
</template>

<script setup>
// import ThemeButton from './ThemeButton.vue';
import imgUrl from '@/assets/cuahsi-logo.png'
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

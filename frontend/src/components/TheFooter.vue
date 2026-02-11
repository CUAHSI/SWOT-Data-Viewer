<template>
  <v-footer v-if="!$route.meta.hideNavigation" app color="navbar" class="d-flex flex-column">
    <div class="d-flex w-100 position-relative">
      <v-spacer />
      <div class="poweredbycontainer">
        <v-card
          href="https://cuahsi.org"
          class="mx-auto float-left"
          rel="noopener"
          target="_blank"
          subtitle="Powered by"
          min-width="
          16rem"
        >
          <template #append>
            <v-img :src="imgUrl" cover width="8rem" />
          </template>
        </v-card>
      </div>
    </div>
  </v-footer>
</template>

<script setup>
// import ThemeButton from './ThemeButton.vue';
import imgUrl from '@/assets/cuahsi-logo.png'
</script>

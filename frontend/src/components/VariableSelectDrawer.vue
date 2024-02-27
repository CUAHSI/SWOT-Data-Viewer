<template>
  <v-navigation-drawer location="left" width="auto" :model-value="show" temporary>
    <v-btn v-if="!show" size="large" color="primary" class="ma-0 pa-2 drawer-handle" @click="hydrologicStore.toggleVariableSelectDrawer">
      <v-icon :icon="mdiGlobeModel"></v-icon>
      <span>Select Variables</span>
    </v-btn>
    <v-sheet class="mx-auto" elevation="8" :width="mdAndDown ? '100vw' : '30vw'">
      <h2 class="ma-2 text-center">Variable Selector</h2>
        <v-container fluid>
          <v-checkbox v-for="variable in variables" v-model="hydrologicStore.selectedVariables" :label="variable.name" :value="variable" :key="variable.abbreviation"></v-checkbox>
        </v-container>
    </v-sheet>
  </v-navigation-drawer>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useHydrologicStore } from '@/stores/hydrologic'
import { mdiGlobeModel } from '@mdi/js'
import { ref } from 'vue'

const hydrologicStore = useHydrologicStore();
const variables = hydrologicStore.hydroVariables
let show = ref(hydrologicStore.showVariableDrawer)

const { mdAndDown } = useDisplay()

hydrologicStore.$subscribe((mutation, state) => {
    show.value = state.showVariableDrawer
})
</script>

<style scoped>
.drawer-handle {
  position: absolute;
  bottom: 30%;
  left: 110%;
}
</style>
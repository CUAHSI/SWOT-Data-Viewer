<template>
  <v-card>
    <h2 class="ma-2 text-center">Select Variables</h2>
    <v-container fluid>
      <v-checkbox v-for="variable in variables" v-model="hydrologicStore.selectedVariables" :label="variable.name"
        :value="variable" :key="variable.abbreviation"></v-checkbox>
    </v-container>
  </v-card>
</template>

<script setup>
import { useHydrologicStore } from '@/stores/hydrologic'

const hydrologicStore = useHydrologicStore();
const variables = hydrologicStore.hydroVariables

</script>
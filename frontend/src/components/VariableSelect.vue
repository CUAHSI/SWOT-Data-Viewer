<template>
  <v-card>
    <h2 class="ma-2 text-center">Select Variables</h2>
    <v-container fluid>
      <v-checkbox
        v-for="variable in hydrologicStore.selectableVariables"
        :key="variable.abbreviation"
        v-model="hydrologicStore.selectedVariables"
        :label="variable.name"
        :value="variable"
      />
    </v-container>
  </v-card>
</template>

<script setup>
import { useHydrologicStore } from '@/stores/hydrologic'

const hydrologicStore = useHydrologicStore()
</script>

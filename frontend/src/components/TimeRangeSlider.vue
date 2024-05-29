<template>
  <v-range-slider v-model="range" :min="featuresStore.minTime" :max="featuresStore.maxTime" class="align-center" hide-details>
    <template v-slot:prepend>
      <v-text-field
        v-model="range[0]"
        density="compact"
        type="date"
        variant="outlined"
        hide-details
        single-line
      ></v-text-field>
    </template>
    <template v-slot:append>
      <v-text-field
        v-model="range[1]"
        density="compact"
        type="date"
        variant="outlined"
        hide-details
        single-line
      ></v-text-field>
    </template>
  </v-range-slider>
  {{ range }}
</template>

<script setup>
import { ref } from 'vue'
import { useFeaturesStore } from '../stores/features';

const featuresStore = useFeaturesStore()
const range = ref(featuresStore.timeRange)

// TODO: convert so that the range is an array of floats (decimal years?) instead of strings
// https://vuetifyjs.com/en/components/range-sliders/#slots

</script>
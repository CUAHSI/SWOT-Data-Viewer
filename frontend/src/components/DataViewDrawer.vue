<template>
  <v-navigation-drawer
    v-if="featureStore.activeFeature"
    location="right"
    width="auto"
    v-model="show"
    order="1"
  >
    <v-container v-if="featureStore.activeFeature">
      <v-btn
        v-if="featureStore.activeFeature"
        @click="show = !show"
        location="left"
        order="0"
        postition="absolute"
        :style="{ bottom: '30%', transform: translate(), position: 'absolute' }"
        :icon="show ? mdiChevronRight : mdiChevronLeft"
      >
      </v-btn>
      <StaticMetadata />
      <v-btn
        v-if="!hasResults()"
        @click="router.push(`/plots/${featureStore.activeFeature.properties.reach_id}`)"
        color="primary"
        class="ma-2"
        :loading="featureStore.querying.hydrocron"
      >
        <v-icon :icon="mdiChartScatterPlot"></v-icon>Plot
      </v-btn>
    </v-container>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { mdiChevronRight, mdiChevronLeft, mdiChartScatterPlot } from '@mdi/js'
import StaticMetadata from './StaticMetadata.vue'
import { useRouter } from 'vue-router'

const featureStore = useFeaturesStore()

let show = ref(false)

const translate = () => {
  if (show.value) {
    return 'translate(-50%, 0)'
  } else {
    return 'translate(-180%, 0)'
  }
}

const router = useRouter()

const hasResults = () => {
  return featureStore?.activeFeature?.results !== undefined
}

featureStore.$subscribe((mutation, state) => {
  if (state.activeFeature !== null) {
    // && typeof mutation.events.newValue === 'object'
    show.value = true
  }
})
</script>

<style scoped>
.v-navigation-drawer--mini-variant,
.v-navigation-drawer {
  overflow: visible !important;
}
</style>

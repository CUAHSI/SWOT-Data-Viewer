<template>
  <v-navigation-drawer
    v-if="featureStore.activeFeature"
    v-model="show"
    location="right"
    :width="drawerWidth"
    :temporary="isMobile"
    order="1"
  >
    <v-container v-if="featureStore.activeFeature">
      <v-btn
        v-if="featureStore.activeFeature && !isMobile"
        location="left"
        order="0"
        :style="{ bottom: '30%', transform: translate(), position: 'absolute' }"
        :icon="show ? mdiChevronRight : mdiChevronLeft"
        @click="show = !show"
      />
      <StaticMetadata />
      <v-btn
        v-if="!hasResults()"
        color="primary"
        class="ma-2"
        :loading="featureStore.querying.hydrocron"
        @click="router.push(`/plots/${featureStore.activeFeature.properties.feature_id}`)"
      >
        <v-icon :icon="mdiChartScatterPlot" />Plot
      </v-btn>
    </v-container>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { mdiChevronRight, mdiChevronLeft, mdiChartScatterPlot } from '@mdi/js'
import StaticMetadata from './StaticMetadata.vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'

const featureStore = useFeaturesStore()

let show = ref(false)
const display = useDisplay()
const isMobile = computed(() => display.smAndDown.value)
const drawerWidth = computed(() => (isMobile.value ? '100%' : 420))

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

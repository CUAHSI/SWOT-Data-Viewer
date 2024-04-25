<template>
  <v-navigation-drawer location="right" width="auto" v-model="show" order="1">
    <v-btn v-if="featureStore.activeFeature" @click="show = !show" location="left" order="0" postition="absolute"
      :style="{ bottom: '30%', transform: translate(), position: 'absolute' }"
      :icon="show ? mdiChevronRight : mdiChevronLeft">
    </v-btn>
    <v-container v-if="featureStore.activeFeature">
      <StaticMetadata />
      <!-- <DynamicData /> -->
      <v-btn v-if="!hasResults()" @click="query" color="primary" :loading="querying">
        <v-icon :icon="mdiChartScatterPlot"></v-icon>Plot
      </v-btn>
    </v-container>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { mdiChevronRight, mdiChevronLeft, mdiChartScatterPlot } from '@mdi/js'
// import DynamicData from '@/components/DynamicData.vue'
import { queryHydroCron } from "../_helpers/hydroCron";
import StaticMetadata from './StaticMetadata.vue'
import { useRouter } from 'vue-router'

const featureStore = useFeaturesStore()

let show = ref(false)


const translate = () => {
  if (show.value) {
    return 'translate(-50%, 0)'
  } else {
    return 'translate(-170%, 0)'
  }
}

let querying = ref(false)
const router = useRouter()

const query = async () => {
  querying.value = true
  await queryHydroCron(featureStore.activeFeature)
  querying.value = false
  router.push('/plots')
}

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
#chart {
  height: 40vh;
}

.v-navigation-drawer--mini-variant,
.v-navigation-drawer {
  overflow: visible !important;
}
</style>
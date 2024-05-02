<template>
  <v-navigation-drawer v-if="featureStore.activeFeature" location="right" width="auto" v-model="show" order="1">
    <v-container v-if="featureStore.activeFeature">
      <v-btn v-if="featureStore.activeFeature" @click="show = !show" location="left" order="0" postition="absolute"
        :style="{ bottom: '30%', transform: translate(), position: 'absolute' }"
        :icon="show ? mdiChevronRight : mdiChevronLeft">
      </v-btn>
      <StaticMetadata />
      <!-- <DynamicData /> -->
      <v-btn v-if="!hasResults()" @click="query" color="primary" class="ma-2" :loading="querying.hydrocron">
        <v-icon :icon="mdiChartScatterPlot"></v-icon>Plot
      </v-btn>
      <!-- <v-btn @click="getNodesInActiveReach" color="primary" class="ma-2" :loading="querying.nodes">
        <v-icon :icon="mdiResistorNodes"></v-icon>Get Nodes
      </v-btn> -->
    </v-container>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { mdiChevronRight, mdiChevronLeft, mdiChartScatterPlot, mdiResistorNodes } from '@mdi/js'
// import DynamicData from '@/components/DynamicData.vue'
import { queryHydroCron, getNodesFromReach } from "../_helpers/hydroCron";
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

let querying = ref({ hydrocron: false, nodes: false })
const router = useRouter()

const query = async () => {
  querying.value.hydrocron = true
  await queryHydroCron(featureStore.activeFeature)
  querying.value.hydrocron = false
  router.push('/plots')
}

const getNodesInActiveReach = async () => {
  querying.value.nodes = true
  const nodes = await getNodesFromReach(featureStore.activeFeature)
  console.log("Nodes", nodes)
  querying.value.nodes = false

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
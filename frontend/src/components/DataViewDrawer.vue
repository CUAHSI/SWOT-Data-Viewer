<template>
  <v-navigation-drawer location="right" width="auto" v-model="show" order="1">
    <v-btn v-if="featureStore.activeFeature" @click="show = !show" location="left" order="0" postition="absolute"
      :style="{ bottom: '30%', transform: translate(), position: 'absolute' }"
      :icon="show ? mdiChevronRight : mdiChevronLeft">
    </v-btn>
    <v-container v-if="featureStore.activeFeature">
      <v-tabs v-model="tab" align-tabs="center">
        <v-tab :value="1">
          Static SWORD Metadata
        </v-tab>
        <v-tab :value="2">
          Query dynamic variables
        </v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item :value="1">
          <StaticMetadata />
        </v-window-item>

        <v-window-item :value="2">
          <DynamicData />
        </v-window-item>
      </v-window>
    </v-container>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue'
import { useFeaturesStore } from '@/stores/features'
import { mdiChevronRight, mdiChevronLeft } from '@mdi/js'
import DynamicData from '@/components/DynamicData.vue'
import StaticMetadata from './StaticMetadata.vue'

const featureStore = useFeaturesStore()

let show = ref(false)
let tab = ref(1)


const translate = () => {
  if (show.value) {
    return 'translate(-50%, 0)'
  } else {
    return 'translate(-170%, 0)'
  }
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
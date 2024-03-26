<template>
  <v-footer v-if="!$route.meta.hideNavigation" app color="navbar" class="d-flex flex-column">
    <div class="d-flex w-100 align-center">
      <ThemeButton />
      <div class="text-center w-100">
        {{ new Date().getFullYear() }} — <strong>Swot-Data-Viewer</strong>
      </div>
      <v-spacer></v-spacer>
      <v-switch v-model="switchValue" @click.stop="toggleSwitch" :label="`${switchValue ? 'Faking Data' : 'Using Real Data'}`"></v-switch>
    </div>
  </v-footer>
</template>

<script setup>
import ThemeButton from './ThemeButton.vue';
import { useFeaturesStore } from '@/stores/features'
import { ref } from 'vue'

const featureStore = useFeaturesStore()

let switchValue = ref(featureStore.shouldFakeData)

const toggleSwitch = () => {
  featureStore.shouldFakeData = !featureStore.shouldFakeData
  switchValue.value = !switchValue.value
}

</script>

<style lang="scss" scoped></style>
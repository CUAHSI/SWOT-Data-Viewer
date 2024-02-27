<template>
  <!-- <ModelSelectDrawer :show="showModelSelect" @toggle="showModelSelect = !showModelSelect" /> -->
  <!-- Actual map component included in base App.vue to allow persistence -->
  <VariableSelectDrawer />
</template>

<script setup>
import VariableSelectDrawer from '../components/VariableSelectDrawer.vue';
// import ModelSelectDrawer from '@/components/ModelSelectDrawer.vue';
// const showModelSelect = ref(true)
</script>

<template>
  <!-- Actual map component included in base App.vue to allow persistence -->
  <VariableSelectDrawer />
  <DataViewDrawer />
</template>

<script setup>
import VariableSelectDrawer from '../components/VariableSelectDrawer.vue';
import DataViewDrawer from '../components/DataViewDrawer.vue';
</script>

<template>
  <v-container fluid fill-height border="md" class="pa-6 mx-auto ma-4" max-width="1200" rounded>
    <StaticMetadata :reachId="$route.params.reachId"/>
  </v-container>
</template>

<script setup>
import StaticMetadata from '@/components/StaticMetadata.vue'

</script>

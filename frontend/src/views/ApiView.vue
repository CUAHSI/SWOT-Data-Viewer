<template>
  <v-theme-provider theme="light" with-background>
    <div id="swagger" class="swagger" />
  </v-theme-provider>
</template>
<script setup>
import { onMounted } from 'vue'
import 'swagger-ui-dist/swagger-ui.css'
import { ENDPOINTS } from '@/constants'
import { SwaggerUIBundle, SwaggerUIStandalonePreset } from 'swagger-ui-dist'

onMounted(() => {
  SwaggerUIBundle({
    url: ENDPOINTS.openapi,
    dom_id: '#swagger',
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset]
  })
})
</script>

<template>
  <v-alert v-show="props.text != ''" class="zlert" :title="props.title" :text="props.text" :closeable="props.closeable" @click:close="closeEvent"></v-alert>
</template>
  
<script setup>
import { useAlertStore } from '@/stores/alerts'
const alertStore = useAlertStore()
const props = defineProps({ text: { type: String, default: "" }, title: { default: "Alert" }, closeable: { default: true } })

const closeEvent = () => {
  alertStore.clearAlert()
}
</script>
  
<style scoped>
.zlert {
  position:fixed;
  z-index:9999;
  width: 100vw;
}
</style>
  
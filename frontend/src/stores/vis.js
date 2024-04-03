import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVisStore = defineStore('vis', () => {
  const visData = ref({})


  const updateVisData = (data) => {
    visData.value = data
  }

  const clearVisData = () => {
    visData.value = {}
  }

  return {
    updateVisData,
    visData,
    clearVisData,
  }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMapStore = defineStore('map', () => {
  const mapObject = ref(new Map())

  const hucsAreSelected = ref(false)
  const boxIsValid = ref(false)

  return { mapObject, hucsAreSelected, boxIsValid }
})

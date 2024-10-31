import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlertStore = defineStore('alerts', () => {
  let displayed = ref({})

  function displayAlert(alert) {
    displayed.value = alert
    setTimeout(function () {
      displayed.value = {}
    }, alert.duration * 1000)
  }

  function clearAlert() {
    displayed.value = {}
  }

  return { displayed, displayAlert, clearAlert }
})

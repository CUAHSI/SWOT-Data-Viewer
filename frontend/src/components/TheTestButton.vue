<template>
    <v-btn v-if="test_mode()" id="test" @click="test()">
        <span>Test API Endpoint</span>
    </v-btn>
</template>

<script setup>
import { APP_API_URL, TEST_MODE } from '@/constants'

const test_mode = () => {
    return TEST_MODE == 'true'
}
const test = () => {
    fetch(`${APP_API_URL}/test`)
    .then(response => response.json())
    .then(data => alert(JSON.stringify(data)))
    .catch(error => console.error(error))
}
</script>
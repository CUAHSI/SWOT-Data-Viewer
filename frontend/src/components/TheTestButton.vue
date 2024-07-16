<template>
    <v-card class="nav-items mr-2 d-flex mr-4" :elevation="2" color="test">
        <v-btn v-if="test_mode()" id="test" @click="test()">
            Test API Endpoint
        </v-btn>
    </v-card>
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
<template>
    <v-card class="nav-items mr-2 d-flex mr-4" :elevation="2" color="test">
        <v-btn v-if="test_mode()" id="test" @click="test()">
            Test convert data
        </v-btn>
    </v-card>
</template>

<script setup>
import { APP_API_URL, TEST_MODE } from '@/constants'
import { useFeaturesStore } from '@/stores/features'
const featureStore = useFeaturesStore()

const test_mode = () => {
    return TEST_MODE == 'true'
}
const test = () => {
    const nodeData = featureStore.nodes
    const singleNodeQuery = nodeData[0].queries[0]
    fetch(`${APP_API_URL}/test/convert`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(singleNodeQuery)
    })
        .then(response => response.json())
        // response contains html
        // pop a window with the html
        .then(data => {
            const newWindow = window.open()
            newWindow.document.write(data)
        })
        .catch(error => console.error(error))
}
</script>
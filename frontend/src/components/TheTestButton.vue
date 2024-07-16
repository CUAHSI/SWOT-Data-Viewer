<template>
    <v-btn v-if="test_mode()" id="test" @click="sendData()" color="test">
        Send data to backend
    </v-btn>
</template>

<script setup>
import { APP_API_URL, TEST_MODE } from '@/constants'
import { useChartsStore } from '@/stores/charts';
const chartStore = useChartsStore()

const test_mode = () => {
    return TEST_MODE == 'true'
}
const sendData = () => {
    let datasets = chartStore.nodeChartData.datasets
    // upate datasets so that is just an array arrays of the datasets.data objects
    datasets = datasets.map(dataset => {
        return dataset.data
    })
    console.log('sending data:', datasets)
    fetch(`${APP_API_URL}/test/convert`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datasets)
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
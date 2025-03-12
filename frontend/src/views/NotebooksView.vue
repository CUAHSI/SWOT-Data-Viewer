<template>
  <v-container>
    <v-card>
      <v-card-title>
        Notebooks
      </v-card-title>
      <v-card-text>
        <p>
          This page provides example notebooks for interacting with SWOT data.
          These notebooks are designed to be run in a Jupyter environment. 
          If you are not familiar with Jupyter, you can learn more about it <a href="https://jupyter.org/">here</a>.
        </p>
        <iframe :src="notebook_url" width="100%" height="600px" frameborder="0"></iframe>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>

let notebook_url = '/notebooks'

// check if this is dev mode, if so use localhost, otherwise use the deployed version
if (process.env.NODE_ENV === 'development') {
  notebook_url = 'https://localhost/notebooks/SWOT_GISshapefiles.html'
}
</script>
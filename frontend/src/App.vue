<template>
  <v-app>
    <v-main>
      <TheAppBar @toggle-mobile-nav="toggleMobileNav" :paths="paths" />
      <AlertPopup v-bind="alertStore.displayed"></AlertPopup>
      <TheMobileNavDrawer
        @toggle-mobile-nav="toggleMobileNav"
        :show="showMobileNavigation"
        :paths="paths"
      />
      <RouterView />
      <!-- The leaflet map kept alive outside of the RouterView -->
      <KeepAlive>
        <TheLeafletMap />
      </KeepAlive>
      <link
        href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900"
        rel="stylesheet"
      />
      <TheFooter />
    </v-main>
  </v-app>
</template>

<script setup>
import { RouterView } from 'vue-router'
import TheAppBar from './components/TheAppBar.vue'
import TheMobileNavDrawer from '@/components/TheMobileNavDrawer.vue'
import AlertPopup from './components/AlertPopup.vue'
import TheFooter from './components/TheFooter.vue'
import { ref } from 'vue'
import { useAlertStore } from './stores/alerts'
import TheLeafletMap from './components/TheLeafletMap.vue'

const alertStore = useAlertStore()

let showMobileNavigation = ref(false)
const paths = [
  {
    attrs: { to: '/map' },
    label: 'Map'
  },
  {
    attrs: { to: '/plots' },
    label: 'Plots'
  },
  // {
  //   attrs: { to: "/dashboard" },
  //   label: "Dashboard",
  // },
  // {
  //   attrs: { to: "/selections" },
  //   label: "Selections",
  // },
  // TODO: enable API page when it is ready
  // {
  //   attrs: { to: "/api" },
  //   label: "API",
  // },
  {
    attrs: { to: '/notebooks' },
    label: 'Notebooks'
  },
  {
    attrs: { to: '/about' },
    label: 'About'
  }
]

function toggleMobileNav() {
  showMobileNavigation.value = !showMobileNavigation.value
}
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>

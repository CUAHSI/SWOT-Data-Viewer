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
      <SnackBar />
      <TheBottomSheet />
      <TheFooter />
    </v-main>
  </v-app>
</template>

<script setup>
import { RouterView } from 'vue-router'
import TheAppBar from './components/TheAppBar.vue'
import TheMobileNavDrawer from '@/components/TheMobileNavDrawer.vue'
import AlertPopup from './components/AlertPopup.vue'
import SnackBar from './components/SnackBar.vue'
import TheFooter from './components/TheFooter.vue'
import { ref } from 'vue'
import { useAlertStore } from './stores/alerts'
import TheBottomSheet from '@/components/TheBottomSheet.vue'
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
.geocoder-control-input{position:absolute;left:0;top:0;background-color:white;background-repeat:no-repeat;background-image:url("img/search.png");background-size:26px;border:none;padding:0;text-indent:6px;font-size:13px;line-height:normal;height:auto;padding-top:5px;padding-bottom:5px;width:100%;background-position:right center;cursor:pointer;box-sizing:border-box}.geocoder-control-input-disabled{background-color:#f4f4f4;background-image:url("img/search-disabled.png")}.geocoder-control{width:26px;height:26px;-webkit-transition:width .175s ease-in;-moz-transition:width .175s ease-in;-ms-transition:width .175s ease-in;-o-transition:width .175s ease-in;transition:width .175s ease-in}.geocoder-control-expanded,.leaflet-touch .geocoder-control-expanded{width:275px}.geocoder-control-input.geocoder-control-loading{background-image:url("img/loading.gif");background-size:26px}@media only screen and (min--moz-device-pixel-ratio: 2),only screen and (-o-min-device-pixel-ratio: 2/1),only screen and (-webkit-min-device-pixel-ratio: 2),only screen and (min-device-pixel-ratio: 2){.geocoder-control-input{background-image:url("img/search@2x.png")}.geocoder-control-input-disabled{background-image:url("img/search@2x-disabled.png")}.geocoder-control-input.geocoder-control-loading{background-image:url("img/loading@2x.gif")}}.geocoder-control-input:focus{outline:none;cursor:text}.geocoder-control-input::-ms-clear{display:none}.geocoder-control-suggestions{width:100%;position:absolute;top:26px;left:0;margin-top:10px;overflow:auto;display:none}.geocoder-control-list+.geocoder-control-header{border-top:1px solid #d5d5d5}.geocoder-control-header{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#444;background:#f2f2f2;border-bottom:1px solid #d5d5d5;display:block;padding:.5em}.geocoder-control-list{list-style:none;margin:0;padding:0}.geocoder-control-suggestions .geocoder-control-suggestion{font-size:13px;padding:7px;background:white;border-top:1px solid #f1f1f1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}.geocoder-control-suggestions .geocoder-control-suggestion:first-child{border:none}.geocoder-control-suggestions .geocoder-control-suggestion.geocoder-control-selected,.geocoder-control-suggestions .geocoder-control-suggestion:hover{background:#7fdfff;border-color:#7fdfff}.leaflet-right .geocoder-control-suggestions{left:auto;right:0}.leaflet-right .geocoder-control-input{left:auto;right:0}.leaflet-bottom .geocoder-control-suggestions{margin-top:0;top:0}.leaflet-touch .geocoder-control{width:34px}.leaflet-touch .geocoder-control.geocoder-control-expanded{width:275px}.leaflet-touch .geocoder-control-input{height:34px;line-height:30px;background-size:30px}.leaflet-touch .geocoder-control-suggestions{top:30px;width:271px}.leaflet-oldie .geocoder-control-input{width:28px;height:28px}.leaflet-oldie .geocoder-control-expanded .geocoder-control-input{width:auto}.leaflet-oldie .geocoder-control-input,.leaflet-oldie .geocoder-control-suggestions{border:1px solid #999}/*# sourceMappingURL=esri-leaflet-geocoder.css.map */
</style>

<template>
  <v-app-bar
    v-if="!$route.meta.hideNavigation"
    color="navbar"
    ref="appBar"
    id="app-bar"
    elevate-on-scroll
    fixed
    app
    height="70"
  >
    <div class="d-flex align-end full-height pa-2 align-center w-100">
      <router-link :to="{ path: `/` }" class="logo">
        <v-img :src="imgUrl" cover width="10rem" class="ma-2"></v-img>
      </router-link>

      <v-spacer></v-spacer>

      <v-card class="nav-items mr-2 d-flex mr-4" :elevation="2" v-if="!smAndDown">
        <nav>
          <v-btn
            v-for="path of paths"
            :key="path.attrs.to || path.attrs.href"
            v-bind="path.attrs"
            :id="`navbar-nav-${path.label.replaceAll(/[\/\s]/g, ``)}`"
            :elevation="0"
            active-class="primary"
            :class="$route.path.includes(path.attrs.to) ? 'v-btn--active' : ''"
          >
            {{ path.label }}
          </v-btn>
        </nav>
      </v-card>
      <v-spacer></v-spacer>
      <v-tooltip text="Share This Page" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" @click="toggleDialog">
            <v-icon :icon="mdiLink"></v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip text="Report an Issue" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" @click="toggleGithubDialog">
            <v-icon :icon="mdiGithub"></v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-app-bar-nav-icon @click="$emit('toggleMobileNav')" v-if="smAndDown" />
    </div>
  </v-app-bar>
  <v-dialog v-model="showCopyUrlDialog" max-width="500">
    <v-card>
      <v-card-title>Share This Page</v-card-title>
      <v-card-text>
        <p class="text-body-1">Copy the link below to share this page with others.</p>
        <v-text-field
          variant="outlined"
          v-on:focus="$event.target.select()"
          ref="clone"
          readonly
          :value="pageUrl"
        />
        <v-btn v-if="!hasCopied" @click="copyUrl">Copy</v-btn>
        <v-btn color="green" v-else @click="copyUrl">Copied to clipboard!</v-btn>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text="Close" @click="toggleDialog"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="showGithubDialog" max-width="500">
    <v-card>
      <v-card-title>Create an Issue</v-card-title>
      <v-card-text class="d-flex flex-wrap justify-center">
        <p class="text-body-1">
          Please report any issues you find with SWOTVIZ to our GitHub repository.
        </p>
        <v-btn
          variant="outlined"
          color="primary"
          class="ma-2"
          :href="'https://github.com/CUAHSI/SWOT-Data-Viewer/issues/new?template=bug_report.md'"
          target="_blank"
        >
          Report a Bug
        </v-btn>
        <v-btn
          variant="outlined"
          color="primary"
          class="ma-2"
          :href="'https://github.com/CUAHSI/SWOT-Data-Viewer/issues/new?template=feature_request.md'"
          target="_blank"
        >
          Request a Feature
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { ref, watch } from 'vue'
import imgUrl from '@/assets/swot-logo-v12-transparent-bkg.png'
import { mdiLink, mdiGithub } from '@mdi/js'

defineProps(['paths'])
defineEmits(['toggleMobileNav'])

const { smAndDown } = useDisplay()

const showCopyUrlDialog = ref(false)
const showGithubDialog = ref(false)
const hasCopied = ref(false)
const route = useRoute()
const pageUrl = ref(window.location.href)

watch(route, () => {
  pageUrl.value = window.location.href
})

const copyUrl = () => {
  navigator.clipboard.writeText(pageUrl.value)
  hasCopied.value = true
}

const toggleDialog = () => {
  showCopyUrlDialog.value = !showCopyUrlDialog.value
  hasCopied.value = false
}

const toggleGithubDialog = () => {
  showGithubDialog.value = !showGithubDialog.value
}
</script>

<style lang="scss" scoped>
.logo {
  cursor: pointer;
}

.v-toolbar.v-app-bar--is-scrolled > .v-toolbar__content > .container {
  align-items: center !important;
  will-change: padding;
  padding-top: 0;
  padding-bottom: 0;
}

.nav-items {
  border-radius: 2rem !important;
  overflow: hidden;

  & > a.v-btn:first-child {
    border-top-left-radius: 2rem !important;
    border-bottom-left-radius: 2rem !important;
  }

  & > a.v-btn:last-child {
    border-top-right-radius: 2rem !important;
    border-bottom-right-radius: 2rem !important;
  }

  .v-btn {
    margin: 0;
    border-radius: 0;
    height: 39px !important;
  }
}

.nav-items .v-btn.is-active,
.mobile-nav-items .v-list-item.is-active,
.v-btn--active {
  background-color: #1976d2 !important;
  color: #fff;
}
</style>

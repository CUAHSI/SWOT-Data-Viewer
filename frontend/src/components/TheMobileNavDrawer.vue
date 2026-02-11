<template>
  <v-navigation-drawer
    v-if="mdAndDown"
    :model-value="props.show"
    class="mobile-nav-items"
    temporary
    app
  >
    <v-list nav dense class="nav-items">
      <v-list class="text-body-1">
        <v-list-item
          v-for="path of paths"
          :id="`drawer-nav-${path.label.replaceAll(/[\/\s]/g, ``)}`"
          :key="path.attrs.to || path.attrs.href"
          active-class="primary darken-3 white--text"
          :class="path.isActive?.() ? 'primary darken-4 white--text' : ''"
          v-bind="path.attrs"
          @click="$emit('toggleMobileNav')"
        >
          <span>{{ path.label }}</span>
        </v-list-item>
      </v-list>
      <v-divider class="my-4" />

      <v-list class="text-body-1" />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const props = defineProps(['show', 'paths'])
defineEmits(['toggleMobileNav'])

const { mdAndDown } = useDisplay()
</script>

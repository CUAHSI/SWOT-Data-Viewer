import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import colors from 'vuetify/lib/util/colors'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

// https://vuetifyjs.com/en/features/theme/#javascript
// https://vuetifyjs.com/en/styles/colors/#javascript-color-pack

const dark = {
  dark: true,
  colors: {
    primary: colors.teal.base,
    secondary: colors.blueGrey.base,
    accent: colors.blue.base,
    error: colors.red.accent3,
    success: colors.teal.accent4,
    info: colors.blueGrey.lighten1,
    navbar: colors.blueGrey.darken4,
  }
}

const light = {
  dark: false,
  colors: {
    primary: colors.blue.darken2,
    secondary: colors.blueGrey.lighten4,
    input: '#f6f6f6',
    accent: colors.blue.base,
    error: colors.red.accent3,
    success: colors.teal.accent4,
    info: colors.blueGrey.base,
    navbar: colors.blueGrey.lighten1,
  }
}

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light,
      dark
    }
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  }
})

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import colors from "vuetify/lib/util/colors";
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
// import colors from 'vuetify/lib/util/colors'

// https://vuetifyjs.com/en/features/theme/#javascript

const dark = {
  dark: true,
  colors:{
    primary: "#009688",
    secondary: "#607D8B",
    accent: "#2196F3",
    error: "#FF1744",
    success: "#00BFA5",
    info: "#607D8B",
    navbar: "#37474F",
  }
}

const light = {
  dark: false,
  colors:{
    primary: "#1976d2",
    secondary: colors.blueGrey.lighten4,
    accent: "#2196F3",
    error: "#FF1744",
    success: "#00BFA5",
    info: "#607D8B",
    navbar: colors.blueGrey.lighten4,
  }
}

export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      light,
      dark,
    }
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})

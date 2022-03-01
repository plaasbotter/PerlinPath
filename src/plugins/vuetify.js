import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import colors from "vuetify/lib/util/colors";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: false,
    themes: {
      light: {
        background: colors.shades.white,
        primary: colors.blueGrey.darken3,
        menus: colors.shades.white,
        navbar: colors.blueGrey.darken3,
        text: colors.grey.lighten2,
      },
      dark: {
        background: "#202124",
        primary: "#3E4C60",//colors.grey.darken1,
        menus: "#35363A",
        navbar: "#35363A",
        text: colors.grey.lighten2,
      },
    },
    options: { customProperties: true },
  },
});
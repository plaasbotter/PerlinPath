<template>
  <v-app>
    <v-app-bar app color="primary">
      <div class="d-flex align-center mainboy">
        <h2 class="title">PERLIN PATH</h2>
        <!--
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          :src="require('./assets/logo1.svg')"
          transition="scale-transition"
          width="66%"
        />
        -->
        </div>
        <v-spacer></v-spacer>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              rounded
              depressed
              v-bind="attrs"
              v-on="on"
              @click="changeTheme()"
            >
              <v-icon> mdi-brightness-6 </v-icon>
            </v-btn>
          </template>
          <span>THEME</span>
        </v-tooltip>
      
    </v-app-bar>

    <v-main>
      <MainView />
    </v-main>
  </v-app>
</template>

<script>
import MainView from "./components/MainView";

export default {
  name: "App",

  components: {
    MainView,
  },

  data: () => ({
    //
  }),
  methods:{
    changeTheme(){
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    }
  }
};
</script>

<style lang="scss" scoped>
.title{
  color: white;
}
</style>
<template>
  <v-app>
    <v-toolbar dark color="primary">
      <v-toolbar-title>
        <span>Ikiliptus <sub style="font-size:8px;font-style:italic;">{{release}}</sub></span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
        <v-btn icon v-bind:to="{name: 'LiveCounter'}">
          <v-icon>alarm</v-icon>
        </v-btn>
        <v-btn icon v-bind:to="{name: 'Settings'}">
          <v-icon>settings</v-icon>
        </v-btn>
    </v-toolbar>
    <router-view/>
  </v-app>
</template>

<script>
import Package from '../package.json'

export default {
  name: 'App',
  data () {
    return {
      release: '0.0.0'
    }
  },
  mounted () {
    this.release = Package.version
  }
}
</script>

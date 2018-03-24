<template>
  <v-app>
    <v-toolbar dark color="primary">
      <v-toolbar-title>
        <span>Ikiliptus</span>
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
export default {
  name: 'App'
}
</script>

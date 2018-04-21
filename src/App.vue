<template>
  <v-app>
    <v-toolbar dark color="primary">
      <v-toolbar-side-icon @click="menu = true"></v-toolbar-side-icon>
      <v-toolbar-title>
        <span>Ikiliptus</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn small icon :to="{name: 'LiveCounter'}">
        <v-icon>alarm</v-icon>
      </v-btn>
      <v-btn small icon :to="{name: 'Analytics'}">
        <v-icon>trending_up</v-icon>
      </v-btn>
      <v-btn small dark flat :to="{name: 'SessionManager'}">
        <v-icon>folder</v-icon>
        <span>&nbsp;{{$sessions.current.name}}</span>
      </v-btn>
    </v-toolbar>

    <v-navigation-drawer absolute temporary v-model="menu">
      <v-toolbar dark color="primary">
        <v-toolbar-title>Ikiliptus <sub>{{release}}</sub></v-toolbar-title>
      </v-toolbar>

      <v-list>

        <v-list-tile :to="{name: 'LiveCounter'}">
          <v-list-tile-action>
            <v-icon>alarm</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ $t('Live Counter') }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile :to="{name: 'Analytics'}">
          <v-list-tile-action>
            <v-icon>trending_up</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ $t('Analytics') }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile :to="{name: 'SessionManager'}">
          <v-list-tile-action>
            <v-icon>folder</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ $t('Session manager') }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-divider></v-divider>

        <v-list-tile :to="{name: 'Settings'}">
          <v-list-tile-action>
            <v-icon>settings</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ $t('Settings') }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile @click="openGithub">
          <v-list-tile-action>
            <v-icon>open_in_new</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ $t('Help') }} (GitHub)</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

      </v-list>
    </v-navigation-drawer>
    <router-view/>
  </v-app>
</template>

<script>
import Package from '../package.json'

export default {
  name: 'App',
  data () {
    return {
      release: '0.0.0',
      menu: false
    }
  },
  mounted () {
    this.release = Package.version
  },
  methods: {
    openGithub () {
      window.open('https://github.com/jimskapt/ikiliptus', '_blank')
    }
  }
}
</script>

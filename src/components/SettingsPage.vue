<template>
  <div>
    <v-container>
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title primary-title dark color="primary">
            <v-btn icon>
              <v-icon>settings</v-icon>
            </v-btn>
            <span>{{ $t("Settings") }}</span>
          </v-card-title>
        </v-toolbar>

        <v-container>
          <v-select
            :items="available_locales"
            item-text="us"
            item-value="value"
            :hint="`${locale.local}`"
            return-object
            v-model="locale"
            :label="$t('Locale') + ' (locale)'"
            prepend-icon="language"
            autocomplete
          ></v-select>
          <v-layout>
            <v-flex xs6>
              <v-subheader>{{ $t('Export your data') }}</v-subheader>
            </v-flex>
            <v-flex xs6>
              <v-btn block color="secondary" @click="$router.push({name:'Save'})">
                <v-icon>save</v-icon>
                <span>{{ $t('Save') }}</span>
              </v-btn>
            </v-flex>
          </v-layout>
          <v-layout>
            <v-flex xs6>
              <v-subheader>{{ $t('Import your data') }}</v-subheader>
            </v-flex>
            <v-flex xs6>
              <v-btn block color="secondary" @click="$router.push({name:'Load'})">
                <v-icon>unarchive</v-icon>
                <span>{{ $t('Load') }}</span>
              </v-btn>
            </v-flex>
          </v-layout>

          <v-container>
            <v-btn dark block color="error" @click="forceRefresh">
              <v-icon>refresh</v-icon>
              <span>{{ $t('Debug : refresh page') }}</span>
            </v-btn>
          </v-container>
        </v-container>

        <v-card-actions>
          <v-btn color="error" @click="$router.go(-1)">
            <v-icon>clear</v-icon>
            <span>{{ $t("Abort") }}</span>
          </v-btn>
          <v-btn color="success" @click="save">
            <v-icon>done</v-icon>
            <span>{{ $t("OK") }}</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'SettingsPage',
  data () {
    return {
      locale: {
        value: this.$settings.locale.get(),
        local: this.$i18n.messages[this.$settings.locale.get()]['local_description'],
        us: this.$i18n.messages[this.$settings.locale.get()]['US_locale_description']
      }
    }
  },
  computed: {
    available_locales () {
      let result = []

      // eslint-disable-next-line
      Object.keys(this.$i18n.messages).forEach(m => {
        let item = {
          value: m
        }

        item.local = this.$i18n.messages[m]['local_description']
        item.us = this.$i18n.messages[m]['US_locale_description']

        result.push(item)
      })

      return result
    }
  },
  methods: {
    save () {
      this.$settings.locale.set(this.locale.value)
      this.$router.go(-1)
    },
    forceRefresh () {
      location.reload()
    }
  }
}
</script>

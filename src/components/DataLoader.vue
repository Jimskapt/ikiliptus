<template>
  <div>
    <v-container>
      <v-btn large block v-on:click="$router.go(-1)" color="red">
        <v-icon>keyboard_arrow_left</v-icon>
        <span>{{ $t('Go back') }}</span>
      </v-btn>
    </v-container>
    <v-container>
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title primary-title dark color="primary">
            <v-btn icon>
              <v-icon>unarchive</v-icon>
            </v-btn>
            <span>{{ $t("Load") }}</span>
          </v-card-title>
        </v-toolbar>

        <v-container>
          <v-alert type="info" v-bind:value="true">
            {{ $t('Please paste your data in the following field and click on the LOAD button, in order to load them in this app') }}.
          </v-alert>

          <v-text-field multi-line v-model="input"></v-text-field>
        </v-container>
      </v-card>
    </v-container>
    <v-container>
      <v-btn large block v-on:click="save" color="green">
        <v-icon>unarchive</v-icon>
        <span>{{ $t('Load') }}</span>
      </v-btn>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'DataLoader',
  data () {
    return {
      input: ''
    }
  },
  methods: {
    save () {
      let that = this
      let data = JSON.parse(this.input)

      data.forEach(e => delete e._rev)

      that.db.bulkDocs(data)
        .then(res => console.log(res))
        .catch(err => alert(err))
    }
  }
}
</script>

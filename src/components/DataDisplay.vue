<template>
  <div>
    <v-container>
      <v-btn large block @click="$router.go(-1)" color="warning">
        <v-icon>keyboard_arrow_left</v-icon>
        <span>{{ $t('Go back') }}</span>
      </v-btn>
    </v-container>
    <v-container>
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title primary-title dark color="primary">
            <v-btn icon>
              <v-icon>save</v-icon>
            </v-btn>
            <span>{{ $t("Save") }}</span>
          </v-card-title>
        </v-toolbar>

        <v-container>
          <v-form>
            <v-alert type="info" :value="true">
              {{ $t('In order to save your data, just copy and paste the following data in an text editor (like notepad), and then save it as *.json file') }}.
            </v-alert>
            <v-alert type="warning" :value="true">
              {{ $t('This is only the data for the current session X', {name: $store.state[$store.state.manager.current].doc.name}) }}.<br />
              {{ $t('You have to do that for each session if you want to save all of them') }}.
            </v-alert>
            <v-container>
              <v-checkbox
                :label="$t('Show it human-readable ?')"
                v-model="pretify"
              ></v-checkbox>
            </v-container>
            <v-text-field multi-line v-model="jsonText" label="Here are your data"></v-text-field>
          </v-form>
        </v-container>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'DataDisplay',
  data () {
    return {
      json: [],
      pretify: true
    }
  },
  mounted () {
    let that = this

    this.$store.state[this.$store.state.manager.current].$db
      .allDocs({include_docs: true})
      .then(res => {
        that.json = []
        res.rows.forEach(e => that.json.push(e.doc))
      })
      .catch(err => alert('IKE0010:\n' + err))
  },
  computed: {
    jsonText () {
      return JSON.stringify(this.json, null, (this.pretify) ? '\t' : '')
    }
  }
}
</script>

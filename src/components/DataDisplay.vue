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
              <v-icon>save</v-icon>
            </v-btn>
            <span>{{ $t("Save") }}</span>
          </v-card-title>
        </v-toolbar>

        <v-container>
          <v-form>
            <v-alert type="info" v-bind:value="true">
              {{ $t('In order to save your data, just copy and paste the following data in an text editor (like notepad), and then save it as *.json file') }}.
            </v-alert>
            <v-checkbox
              v-bind:label="$t('Show it human-readable ?')"
              v-model="pretify"
            ></v-checkbox>
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

    this.db.allDocs({include_docs: true}, function (err, doc) {
      if (err) {
        alert(err)
      } else {
        that.json = doc.rows
      }
    })
  },
  computed: {
    jsonText () {
      return JSON.stringify(this.json, null, (this.pretify) ? '\t' : '')
    }
  }
}
</script>

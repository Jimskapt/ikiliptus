<template>
  <div>
    <v-container>
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title primary-title dark color="primary" v-if="!thereIsID">
            <v-btn icon>
              <v-icon>add</v-icon>
            </v-btn>
            <span>{{ $t('Create a new session') }}</span>
          </v-card-title>
          <v-card-title primary-title dark color="primary" v-else>
            <v-btn icon>
              <v-icon>edit</v-icon>
            </v-btn>
            <span>{{ $t('Edit a session') }}</span>
          </v-card-title>
        </v-toolbar>

        <v-container>
          <v-container>
            <v-list two-line subheader style="border:1px solid grey;">
              <v-list-tile avatar>
                <v-list-tile-avatar>
                  <div v-bind:style="'width:100%; height:100%; border-radius:10px; background-color:' + newSessionColor"></div>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>{{newSessionName}}</v-list-tile-title>
                  <v-list-tile-sub-title>{{newSessionRemote}}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-container>

          <v-form>
            <v-text-field
              v-bind:label="$t('Name')"
              v-model="newSessionName"
              prepend-icon="label"
              v-on:change="refreshNewSessionColor"
            ></v-text-field>

            <v-text-field
              v-bind:label="$t('Color')"
              v-model="newSessionColor"
              prepend-icon="invert_colors"
              v-on:change="colorChange"
            ></v-text-field>

            <v-text-field
              v-bind:label="$t('Server URI of CouchDB')"
              v-model="newSessionRemote"
              prepend-icon="storage"
            ></v-text-field>

            <v-btn color="error" v-on:click="$router.go(-1)">
              <v-icon>clear</v-icon>
              <span>{{ $t("Abort") }}</span>
            </v-btn>
            <v-btn color="success" v-on:click="save">
              <v-icon>done</v-icon>
              <span>{{ $t("OK") }}</span>
            </v-btn>
          </v-form>
        </v-container>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import tools from '../tools/index.js'

export default {
  name: 'SessionEditor',
  props: ['id'],
  data () {
    return {
      hasSelectedColor: false,
      newSessionName: '',
      newSessionColor: '',
      newSessionRemote: '',
      dbData: {}
    }
  },
  methods: {
    nothing () {},
    refreshNewSessionColor () {
      if (!this.hasSelectedColor) {
        this.newSessionColor = tools.computeColorFromText(this.newSessionName)
      }
    },
    colorChange () {
      if (this.newSessionColor === '') {
        this.hasSelectedColor = false
      } else {
        this.hasSelectedColor = true
      }
      this.refreshNewSessionColor()
    },
    save () {
      let that = this
      if (this.thereIsID) {
        this.db.db
          .put(that.newData, function (err, res) {
            if (err) {
              alert('IKE0020:\n' + err)
            } else {
              if (that.newData._id === that.db.current._id) {
                that.$vuetify.theme.primary = that.newData.color

                console.log(that.newData.remote)
                if (that.newData.remote === '' && that.db.current.$remote !== undefined && that.db.current.$remote !== null) {
                  that.db.current.$remote.cancel()
                }
              }

              that.$router.go(-1)
            }
          })
          .catch(err => { alert('IKE0021:\n' + err) })
      } else {
        this.db.db
          .post(that.newData, function (err, res) {
            if (err) {
              alert('IKE0023:\n' + err)
            } else {
              that.$router.go(-1)
            }
          })
          .catch(err => { alert('IKE0024:\n' + err) })
      }
    }
  },
  computed: {
    newData () {
      let result = this.dbData

      result.name = this.newSessionName
      result.color = this.newSessionColor
      result.remote = this.newSessionRemote

      return result
    },
    thereIsID () {
      return (this.id !== null && this.id !== undefined && this.id !== '' && this.id !== '0')
    }
  },
  mounted () {
    if (this.thereIsID) {
      this.hasSelectedColor = true

      this.db.db
        .get(this.id)
        .then(doc => {
          this.dbData = doc

          this.newSessionName = doc.name
          this.newSessionColor = doc.color
          this.refreshNewSessionColor()
          this.newSessionRemote = doc.remote
        })
        .catch(err => { alert('IKE0025:\n' + err) })
    }
  }
}
</script>

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
            <div style="border:1px solid grey;">
              <v-subheader>{{ $t('Preview') }}</v-subheader>
              <v-list two-line subheader>
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
            </div>
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

            <v-container>
              <v-card>
                <v-toolbar dark color="primary">
                  <v-card-title primary-title dark color="primary">
                    <v-btn icon>
                      <v-icon>subtitles</v-icon>
                    </v-btn>
                    <span>{{ $t('Custom fields') }}</span>
                  </v-card-title>
                </v-toolbar>

                <v-expansion-panel>
                  <v-expansion-panel-content
                    v-for="(item, i) in dbDataFields.fields"
                    v-bind:key="'panel-' + i"
                    v-bind:value="fieldView === 'panel-' + i"
                  >
                    <div slot="header" v-on:click="toggleFieldSettings(i)">
                      <v-icon v-if="item.icon && item.type !== 'checkbox'">{{item.icon}}</v-icon>
                      <span>{{item.label}} ({{item.name}})</span>
                    </div>
                    <v-container>

                      <v-container>
                        <div style="border:1px solid grey;padding:10px;">
                          <v-subheader>{{ $t('Preview') }}</v-subheader>
                          <custom-field
                            v-bind:settings="item"
                            v-bind:disabled="true"
                          ></custom-field>
                        </div>
                      </v-container>

                      <v-btn block color="error" v-on:click="removeField(item)">
                        <v-icon>delete</v-icon>
                        <span>{{ $t("Delete") }}</span>
                      </v-btn>

                      <v-text-field
                        v-bind:label="$t('Name')"
                        prepend-icon="vpn_key"
                        v-model="item.name"
                      ></v-text-field>

                      <v-text-field
                        v-bind:label="$t('Icon')"
                        prepend-icon="filter_frames"
                        v-model="item.icon"
                        v-if="item.type !== 'checkbox'"
                      ></v-text-field>

                      <v-text-field
                        v-bind:label="$t('Label')"
                        prepend-icon="label_outline"
                        v-model="item.label"
                      ></v-text-field>

                      <v-select
                        v-bind:items="['textfield', 'checkbox']"
                        v-bind:label="$t('Field type')"
                        prepend-icon="widgets"
                        v-model="item.type"
                        single-line
                      ></v-select>

                    </v-container>
                  </v-expansion-panel-content>
                </v-expansion-panel>

                <v-card-actions>
                  <v-btn block color="primary" v-on:click="addField">
                    <v-icon>add</v-icon>
                    <span>{{ $t('Add a field') }}</span>
                  </v-btn>
                </v-card-actions>

              </v-card>
            </v-container>
          </v-form>
        </v-container>
        <v-card-actions>
          <v-btn block color="error" v-on:click="$router.go(-1)">
            <v-icon>clear</v-icon>
            <span>{{ $t("Abort") }}</span>
          </v-btn>
          <v-btn block color="success" v-on:click="save">
            <v-icon>done</v-icon>
            <span>{{ $t("OK") }}</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import tools from '../tools/index.js'
import CustomField from '@/components/CustomField'

export default {
  name: 'SessionEditor',
  props: ['id'],
  components: {
    CustomField: CustomField
  },
  data () {
    return {
      hasSelectedColor: false,
      newSessionName: '',
      newSessionColor: '',
      newSessionRemote: '',
      dbData: {},
      fieldView: '',
      dbDataFields: {
        _id: 'custom_fields',
        fields: []
      }
    }
  },
  methods: {
    addField () {
      let alphabet = 'abcdefghijklmnopqrstuvwxyz'
      let randomName = ''
      for (let i = 0; i < 10; i++) {
        randomName += alphabet[Math.floor(Math.random() * alphabet.length)]
      }
      this.dbDataFields.fields.push({
        icon: 'texture',
        name: randomName,
        label: randomName,
        type: 'textfield'
      })
    },
    removeField (field) {
      this.dbDataFields.fields = this.dbDataFields.fields.filter(e => e !== field)
    },
    refreshNewSessionColor () {
      if (!this.hasSelectedColor) {
        this.newSessionColor = tools.computeColorFromText(this.newSessionName)
      }
      this.fieldView = ''
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
      let goBack = false
      let dbID = that.id

      new Promise((resolve, reject) => {
        if (that.thereIsID) {
          that.$sessions.db
            .put(that.newData, function (err, res) {
              if (err) {
                throw new Error(err)
              } else {
                if (that.newData._id === that.$sessions.current._id) {
                  that.$vuetify.theme.primary = that.newData.color

                  if (that.newData.remote === '' && that.$sessions.current.$remote !== undefined && that.$sessions.current.$remote !== null) {
                    that.$sessions.current.$remote.cancel()
                  }
                }

                goBack = true
                resolve()
              }
            })
            .catch(err => { throw new Error(err) })
        } else {
          that.$sessions.db
            .post(that.newData, function (err, res) {
              if (err) {
                throw new Error(err)
              } else {
                dbID = res.id
                goBack = true
                resolve()
              }
            })
            .catch(err => { throw new Error(err) })
        }
      })
        .then(() => {
          that.$sessions.mount(dbID)
            .put(that.dbDataFields)
            .catch(err => { throw new Error(err) })

          if (goBack) {
            that.$router.go(-1)
          }
        })
        .catch(err => { alert('IKE0037:\n' + err) })
    },
    toggleFieldSettings (fieldID) {
      if (this.fieldView === 'panel-' + fieldID) {
        this.fieldView = ''
      } else {
        this.fieldView = 'panel-' + fieldID
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

      this.$sessions.db
        .get(this.id)
        .then(doc => {
          this.dbData = doc

          this.newSessionName = doc.name
          this.newSessionColor = doc.color
          this.refreshNewSessionColor()
          this.newSessionRemote = doc.remote
        })
        .catch(err => { alert('IKE0025:\n' + err) })

      let that = this
      this.$sessions.mount(this.id)
        .get('custom_fields')
        .then(doc => {
          that.dbDataFields = doc
        })
    }
  }
}
</script>

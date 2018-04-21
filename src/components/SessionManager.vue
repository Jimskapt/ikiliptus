<template>
  <div>
    <v-container>
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title primary-title dark color="primary">
            <v-btn icon>
              <v-icon>folder</v-icon>
            </v-btn>
            <span>{{ $t('Session manager') }}</span>
          </v-card-title>
        </v-toolbar>

        <v-container>
          <v-btn color="primary" :to="{name: 'SessionEditor', params: {id: '0'}}">
            <v-icon>add</v-icon>
            <span>{{ $t('Create a new session') }}</span>
          </v-btn>

          <v-list two-line subheader>
            <v-subheader>{{ $t('Available sessions') }}</v-subheader>
            <template v-for="session in $sessions.available">
              <v-divider :key="'divider-' + session._id"></v-divider>
              <v-list-tile avatar :key="'list-' + session._id" @click="$sessions.setCurrent(session, $vuetify)">
                <v-list-tile-avatar>
                  <div
                    :style="'cursor:pointer; width:100%; height:100%; border-radius:10px; background-color:' + session.color"
                  ></div>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title style="font-weight:bold;">{{session.name}}</v-list-tile-title>
                  <v-list-tile-sub-title>{{session.remote}}</v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-layout row>
                    <v-flex xs6>
                      <v-btn flat icon @click.stop="goToEdit(session._id)">
                        <v-icon>edit</v-icon>
                      </v-btn>
                    </v-flex>
                    <v-flex xs6>
                      <v-btn flat icon @click.stop="askToDelete(session)" :disabled="session._id === 'ikiliptus'">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-flex>
                  </v-layout>
                </v-list-tile-action>
              </v-list-tile>
            </template>
          </v-list>
        </v-container>
      </v-card>
    </v-container>

    <v-dialog v-model="confirmDeleteDialog" v-if="deleteConfirmObj !== null && deleteConfirmObj !== undefined">
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title>
            {{$t('Confirm the delete')}}
          </v-card-title>
        </v-toolbar>
        <v-card-text>
          <h2>
            <i18n path="Deleting X session">
              <v-chip color="red" text-color="white">{{ deleteConfirmObj.name }}</v-chip>
            </i18n>
          </h2>
          <v-alert type="info" :value="true">
            {{ $t('Please type the name of the session in the following field in order to confirm the delete') }}.
          </v-alert>
          <v-text-field
            :label="$t('Session name')"
            v-model="typedDeleteConfirm"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn block color="success" @click="deleteConfirmObj=null;typedDeleteConfirm=null;confirmDeleteDialog=false;">{{$t('Abort')}}</v-btn>
          <v-btn block color="error" @click="confirmDeleteSession">{{$t('OK')}}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import PouchDB from 'pouchdb-browser'

export default {
  name: 'SessionManager',
  data () {
    return {
      available: [],
      confirmDeleteDialog: false,
      deleteConfirmObj: null,
      typedDeleteConfirm: null
    }
  },
  methods: {
    nothing () {},
    goToEdit (id) {
      this.$router.push({name: 'SessionEditor', params: {id: id}})
    },
    askToDelete (obj) {
      this.deleteConfirmObj = obj
      this.confirmDeleteDialog = true
    },
    confirmDeleteSession () {
      if (this.typedDeleteConfirm === this.deleteConfirmObj.name) {
        let that = this

        this.$sessions.db
          .remove(that.deleteConfirmObj)
          .then(result => {
            if (that.$sessions.current._id === that.deleteConfirmObj._id) {
              that.$sessions.available.forEach(e => {
                if (e._id === 'ikiliptus') {
                  that.$sessions.setCurrent(e, that.$vuetify)
                }
              })
            }

            new PouchDB(that.deleteConfirmObj._id.split('-').join(''))
              .destroy()
              .catch(err => { alert('IKE0028:\n' + err) })

            that.deleteConfirmObj = null
            that.typedDeleteConfirm = null
            that.confirmDeleteDialog = false

            that.$sessions
              .refresh()
              .then(() => {
                that.$forceUpdate()
              })
              .catch(err => { alert('IKE0029:\n' + err) })
          })
          .catch(err => { alert('IKE0026:\n' + err) })
      }
    }
  },
  mounted () {
    let that = this
    this.$sessions
      .refresh()
      .then(res => that.$forceUpdate())
      .catch(err => { alert('IKE0027:\n' + err) })
  }
}
</script>

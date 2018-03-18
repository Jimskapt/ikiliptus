<template>
  <div>

    <v-container>
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title primary-title dark color="primary">
            <v-btn icon>
              <v-icon>alarm</v-icon>
            </v-btn>
            <span>{{ $t("Live Counter") }}</span>
          </v-card-title>
        </v-toolbar>

        <v-container>
          <activity v-if="runningCounter" v-bind:id="currentID" v-bind:locked="['from','to']"></activity>
          <v-alert v-else color="info" outline icon="info" v-bind:value="true">
            {{ $t("Counter is not started") }}.
          </v-alert>

        </v-container>

        <v-card-actions>
          <v-btn v-on:click="startCounter" v-bind:disabled="runningCounter" color="green">
            <v-icon>play_arrow</v-icon>
            <span>{{ $t("START") }}</span>
          </v-btn>
          <v-btn v-on:click="stopCounter" v-bind:disabled="!runningCounter" color="red">
            <v-icon>stop</v-icon>
            <span>{{ $t("STOP") }}</span>
          </v-btn>
          <v-btn v-on:click="nextCounter" v-bind:disabled="!runningCounter" color="blue">
            <v-icon>skip_next</v-icon>
            <span>{{ $t("NEXT") }}</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>

    <v-container>
      <v-card>
          <div v-if="staged.length > 0">
            <v-toolbar dark color="secondary">
              <v-card-title>
                <v-btn icon>
                  <v-icon>inbox</v-icon>
                </v-btn>
                <span>{{ $t("Activities awaiting classification") }}</span>
              </v-card-title>
            </v-toolbar>

            <v-list v-bind:expand="true" two-line subheader>
              <template v-for="item in staged">
                <v-list-tile v-bind:key="item._id">
                  <v-list-tile-content>
                    <v-list-tile-title><router-link v-bind:to="{name:'Activity', params: {id: item._id}}">{{item.start}} > {{item.stop}}</router-link></v-list-tile-title>
                    <v-list-tile-sub-title>
                      <v-chip small disabled v-if="item.medium && item.medium !== ''">
                        <v-avatar>
                          <v-icon>phone</v-icon>
                        </v-avatar>
                        <span>{{item.medium}}</span>
                      </v-chip>
                      <v-chip small disabled v-if="item.actor && item.actor !== ''">
                        <v-avatar>
                          <v-icon>people</v-icon>
                        </v-avatar>
                        <span>{{item.actor}}</span>
                      </v-chip>
                    </v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-btn icon ripple v-on:click="dialog = true">
                      <v-icon>archive</v-icon>
                    </v-btn>
                  </v-list-tile-action>
                </v-list-tile>
                <v-divider v-bind:key="'separator-' + item._id"></v-divider>
              </template>
            </v-list>

          </div>
      </v-card>
    </v-container>

    <v-dialog v-model="dialog">
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title><v-btn icon><v-icon>archive</v-icon></v-btn> {{ $t("Classify an activity") }}</v-card-title>
        </v-toolbar>

        <v-container>
          <v-expansion-panel>
            <v-expansion-panel-content v-bind:value="true">
              <div slot="header">
                <v-icon>search</v-icon>
                <span>{{ $t("Subject already existing") }}</span>
              </div>
              <v-container>
                <v-select
                  v-bind:items="subjects_list"
                  v-model="dialog_subject"
                  v-bind:label="$t('Subject')"
                  autocomplete
                ></v-select>
              </v-container>
            </v-expansion-panel-content>
            <v-expansion-panel-content>
              <div slot="header">
                <v-icon>create</v-icon>
                <span>{{ $t("Create a new subject") }}</span>
              </div>
              <v-container>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab repellendus, modi facilis ullam consectetur esse, labore molestias est, obcaecati blanditiis aliquam nesciunt dolorum? Nesciunt, iure? Dolorum vel tenetur iste consectetur.</p>
              </v-container>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-container>

        <v-card-actions>
          <v-btn v-on:click="dialog = false" color="red">
            <v-icon>clear</v-icon>
            <span>{{ $t("Abort") }}</span>
          </v-btn>
          <v-btn v-on:click="dialog = false" color="green">
            <v-icon>done</v-icon>
            <span>{{ $t("OK") }}</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import Activity from '@/components/Activity'

export default {
  name: 'LiveCounter',
  data () {
    return {
      currentID: '',
      runningCounter: false,
      nextAction: '',
      staged: [],
      dialog: false,
      subjects_list: [],
      dialog_subject: ''
    }
  },
  methods: {
    startCounter () {
      let that = this
      this.db.post({start: new Date()}, {}, function (err, res) {
        if (err) {
          alert(err)
        }

        if (res.ok === true) {
          that.currentID = res.id
          that.runningCounter = true
          that.fetchAllStaged()
        } else {
          alert('Not OK !', res)
        }
      })
    },
    stopCounter () {
      this.runningCounter = false
      this.eventBus.$emit('setStop', new Date())
    },
    liveSaveConfirm () {
      this.currentID = ''
      if (this.nextAction === 'start') {
        this.startCounter()
        this.nextAction = ''
      }
      this.fetchAllStaged()
    },
    nextCounter () {
      this.stopCounter()
      this.nextAction = 'start'
    },
    fetchAllStaged () {
      let that = this
      this.db
        .query('all_subjects/all_subjects', {include_docs: true})
        .then(res => {
          that.staged = []
          res.rows.forEach(e => {
            that.staged.push(e.doc)
          })
        })
        .catch(err => {
          if (err.status !== 404) {
            alert(err)
          } else {
            // the view has not been created to the moment, retrying later ...
            setTimeout(that.fetchAllStaged(), 1000)
          }
        })
    }
  },
  mounted () {
    this.fetchAllStaged()

    let that = this
    this.eventBus
      .$on('dbupdate', function (data) {
        that.fetchAllStaged()
      })
      .$on('saveconfirm', function (data) {
        that.liveSaveConfirm()
      })
  },
  destroyed () {
    this.eventBus.$off(['dbupdate', 'saveconfirm'])
  },
  components: {
    'activity': Activity
  }
}
</script>

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
          <activity v-if="runningCounter" v-bind:id="currentID" v-bind:locked="['from','to']" v-bind:showCounter="true"></activity>
          <v-alert v-else color="info" outline icon="info" v-bind:value="true">
            {{ $t("Counter is not started") }}.
          </v-alert>

        </v-container>

        <v-card-actions>
          <v-btn v-on:click="startCounter" v-bind:disabled="runningCounter" color="success">
            <v-icon>play_arrow</v-icon>
            <span>{{ $t("START") }}</span>
          </v-btn>
          <v-btn v-on:click="stopCounter" v-bind:disabled="!runningCounter" color="error">
            <v-icon>stop</v-icon>
            <span>{{ $t("STOP") }}</span>
          </v-btn>
          <v-btn v-on:click="nextCounter" v-bind:disabled="!runningCounter" color="warning">
            <v-icon>skip_next</v-icon>
            <span>{{ $t("NEXT") }}</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>

    <v-container>
      <v-card>
          <div v-if="activities.length > 0">
            <v-toolbar dark color="secondary">
              <v-card-title>
                <v-btn icon>
                  <v-icon>inbox</v-icon>
                </v-btn>
                <span>{{ $t("Last activities") }}</span>
              </v-card-title>
            </v-toolbar>

            <v-list v-bind:expand="true" two-line subheader>
              <template v-for="item in activities">
                <v-list-tile v-bind:key="item._id">
                  <v-list-tile-content>
                    <v-list-tile-title>
                      <router-link v-bind:to="{name:'Activity', params: {id: item._id}}">
                        <span v-if="item.subject">
                          {{item.subject}}
                        </span>
                        <span v-else>
                          <span v-if="item.start_date != item.stop_date">
                          {{$t('From')}}
                          {{ $moment(item.start_date, 'YYYY-MM-DD').format($t('date_format')) }}
                          {{ $moment(item.start_hour + ':' + item.start_seconds, 'HH:mm:ss', 'HH:mm:ss').format($t('hour_format')) }}
                          {{$t('To').toLowerCase()}}
                          {{ $moment(item.stop_date, 'YYYY-MM-DD').format($t('date_format')) }}
                          {{ $moment(item.stop_hour + ':' + item.stop_seconds, 'HH:mm:ss').format($t('hour_format')) }}
                          </span>
                          <span v-else>
                            {{ $moment(item.start_date, 'YYYY-MM-DD').format($t('date_format')) }} :
                            {{$t('From').toLowerCase()}}
                            {{ $moment(item.start_hour + ':' + item.start_seconds, 'HH:mm:ss', 'HH:mm:ss').format($t('hour_format')) }}
                            {{$t('To').toLowerCase()}}
                            {{ $moment(item.stop_hour + ':' + item.stop_seconds, 'HH:mm:ss').format($t('hour_format')) }}
                          </span>
                        </span>
                      </router-link>
                    </v-list-tile-title>
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
                    <v-btn flat icon v-on:click="nextCounter(item)" v-bind:disabled="runningCounter">
                      <v-icon>content_copy</v-icon>
                    </v-btn>
                    <v-btn flat icon v-on:click="ask_delete_activity(item)">
                      <v-icon>delete</v-icon>
                    </v-btn>
                  </v-list-tile-action>
                </v-list-tile>
                <v-divider v-bind:key="'separator-' + item._id"></v-divider>
              </template>
            </v-list>

          </div>
      </v-card>
    </v-container>

    <v-dialog v-model="asked_delete" max-width="290">
      <v-card>
        <v-card-title class="headline">{{$t('Confirm the delete')}}</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" v-on:click="asked_delete_document=null;asked_delete=false;">{{$t('Abort')}}</v-btn>
          <v-btn color="error" v-on:click="confirm_delete_activity">{{$t('OK')}}</v-btn>
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
      activities: [],
      dialog: false,
      subjects_list: [],
      dialog_subject: '',
      asked_delete: false,
      asked_delete_document: null
    }
  },
  methods: {
    startCounter (document) {
      let that = this

      if (document === undefined) {
        document = {}
      }

      delete document._id
      delete document._rev
      let now = new Date()
      document.start_date = this.$moment(now).format('YYYY-MM-DD')
      document.start_hour = this.$moment(now).format('HH:mm')
      document.start_seconds = now.getSeconds()
      delete document.stop_date
      delete document.stop_hour
      if (!document.data_type) {
        document.data_type = 'subject'
      }
      if (!document.data_version) {
        document.data_version = 1
      }

      this.db.post(document, {}, function (err, res) {
        if (err) {
          alert(err)
        }

        if (res.ok === true) {
          that.currentID = res.id
          that.runningCounter = true
          that.fetchAllSubjects()
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
        this.startCounter(this.nextActionDocument)
        this.nextAction = ''
        this.nextActionDocument = undefined
      }
      this.fetchAllSubjects()
    },
    nextCounter (document) {
      this.nextAction = 'start'
      this.nextActionDocument = document

      if (this.runningCounter) {
        this.stopCounter(document)
      } else {
        this.liveSaveConfirm()
      }
    },
    fetchAllSubjects () {
      let that = this
      this.db
        .query('all_activities/all_activities', {include_docs: true})
        .then(res => {
          that.activities = []
          res.rows
            .filter(e => e.doc.stop_date !== undefined && e.doc.stop_hour !== undefined)
            .sort((a, b) => {
              let bTime = that.$moment(b.doc.stop_date + ' ' + b.doc.stop_hour + ':' + b.doc.stop_seconds, 'YYYY-MM-DD HH:mm:ss').toDate()
              let aTime = that.$moment(a.doc.stop_date + ' ' + a.doc.stop_hour + ':' + a.doc.stop_seconds, 'YYYY-MM-DD HH:mm:ss').toDate()

              return bTime - aTime
            })
            .forEach(e => {
              that.activities.push(e.doc)
            })
        })
        .catch(err => alert(err))
    },
    ask_delete_activity (document) {
      this.asked_delete = true
      this.asked_delete_document = document
    },
    confirm_delete_activity () {
      this.db
        .remove(this.asked_delete_document)
        .then(() => {
          this.asked_delete = false
          this.asked_delete_document = null
        })
        .catch(err => alert(err))
    }
  },
  mounted () {
    let that = this
    this.eventBus
      .$on('dbupdate', function (data) {
        that.fetchAllSubjects()
      })
      .$on('saveconfirm', function (data) {
        that.liveSaveConfirm()
      })

    // we defer the request because the view could be created, on page load.
    setTimeout(function () {
      that.fetchAllSubjects()

      // searching unstopped activities, and using the first of them in the live counter
      that.db
        .query('all_activities/all_activities', {include_docs: true})
        .then(res => {
          let unstoppedList = res.rows.filter(e => e.doc.stop_date === undefined || e.doc.stop_hour === undefined)
          if (unstoppedList.length > 0) {
            that.currentID = unstoppedList[0].doc._id
            that.runningCounter = true
          }
        })
        .catch(err => alert(err))
    }, 750)
  },
  destroyed () {
    this.eventBus.$off(['dbupdate', 'saveconfirm'])
  },
  components: {
    'activity': Activity
  }
}
</script>

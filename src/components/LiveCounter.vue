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
          <v-progress-linear v-bind:indeterminate="true" v-if="!loaded"></v-progress-linear>
          <div v-else>
            <div v-if="runningCounter">
              <v-layout row>
                <v-spacer></v-spacer>
                <v-btn v-on:click="eventBus.$emit('save', new Date())" color="primary">
                  <v-icon>save</v-icon>
                  <span>{{ $t("Save") }}</span>
                </v-btn>
              </v-layout>
              <activity v-bind:id="currentID" v-bind:locked="['stop_date','stop_hour']" v-bind:showCounter="true"></activity>
            </div>
            <v-alert v-else color="info" outline icon="info" v-bind:value="true">
              {{ $t("Counter is not started") }}.
            </v-alert>
          </div>
        </v-container>

        <v-card-actions v-if="loaded">
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
        <v-toolbar dark color="secondary">
          <v-card-title>
            <v-btn icon>
              <v-icon>inbox</v-icon>
            </v-btn>
            <span>{{ $t("Last activities") }}</span>
          </v-card-title>
        </v-toolbar>

        <v-container v-if="!loaded">
          <v-progress-linear v-bind:indeterminate="true"></v-progress-linear>
        </v-container>
        <v-list dense two-line subheader v-else>

          <v-container class="text-xs-center">
            <v-text-field
              v-bind:label="$t('Search')"
              v-model="activitiesSearch"
              prepend-icon="search"
              append-icon="close"
              v-bind:append-icon-cb="() => {activitiesSearch=''}"
            ></v-text-field>
            <v-pagination v-bind:length="pagesCount" v-model="lastActivitiesPage" v-if="searchedActivities.length > 0"></v-pagination>
          </v-container>

          <v-divider></v-divider>

          <template v-for="item in paginatedActivities">
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
                  <v-chip small disabled>
                    <v-avatar>
                      <v-icon>alarm</v-icon>
                    </v-avatar>
                    <span>{{ deltaTime(item) }}</span>
                  </v-chip>
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
                <v-layout row>
                  <v-flex xs6>
                    <v-btn flat icon v-on:click="nextCounter(item);goToTop();" v-bind:disabled="runningCounter">
                      <v-icon>content_copy</v-icon>
                    </v-btn>
                  </v-flex>
                  <v-flex xs6>
                    <v-btn flat icon v-on:click="ask_delete_activity(item)">
                      <v-icon>delete</v-icon>
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-list-tile-action>
            </v-list-tile>
            <v-divider v-bind:key="'separator-' + item._id"></v-divider>
          </template>
        </v-list>
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
      asked_delete_document: null,
      lastActivitiesPage: 1,
      activitiesPerPage: 30,
      activitiesSearch: '',
      loaded: false
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
      delete document.stop_seconds
      if (!document.data_type) {
        document.data_type = 'subject'
      }
      if (!document.data_version) {
        document.data_version = 1
      }

      this.db.kernel
        .post(document, {}, function (err, res) {
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
        .catch(err => alert(err))
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

      that.loaded = false

      that.db.checkAndCreateViews()
        .then(() => {
          that.db.kernel
            .query('all_activities/all_activities', {include_docs: true})
            .then(res => {
              that.activities = []

              let sorted = res.rows
                .filter(e => e.doc.stop_date !== undefined && e.doc.stop_hour !== undefined)
                .sort((a, b) => {
                  let bTime = that.$moment(b.doc.stop_date + ' ' + b.doc.stop_hour + ':' + b.doc.stop_seconds, 'YYYY-MM-DD HH:mm:ss').toDate()
                  let aTime = that.$moment(a.doc.stop_date + ' ' + a.doc.stop_hour + ':' + a.doc.stop_seconds, 'YYYY-MM-DD HH:mm:ss').toDate()

                  return bTime - aTime
                })

              for (let i = 0; i < sorted.length; i++) {
                that.activities.push(sorted[i].doc)
              }

              that.loaded = true
            })
            .catch(err => alert(err))
        })
        .catch(err => alert(err))
    },
    ask_delete_activity (document) {
      this.asked_delete = true
      this.asked_delete_document = document
    },
    confirm_delete_activity () {
      this.db.kernel
        .remove(this.asked_delete_document)
        .then(() => {
          this.asked_delete = false
          this.asked_delete_document = null

          this.fetchAllSubjects()
        })
        .catch(err => alert(err))
    },
    deltaTime (activity) {
      let delta = this.$moment(activity.stop_date + ' ' + activity.stop_hour + ':' + activity.stop_seconds, 'YYYY-MM-DD HH:mm:ss').toDate()
      delta -= this.$moment(activity.start_date + ' ' + activity.start_hour + ':' + activity.start_seconds, 'YYYY-MM-DD HH:mm:ss').toDate()

      let way = +1
      let offset = new Date().getTimezoneOffset() / 60
      if (offset < 0) {
        way = -1
        offset *= -1
      }

      delta += way * this.$moment('1990-01-01 ' + offset + ':00:00', 'YYYY-MM-DD HH:mm:ss').toDate()

      if (this.$moment(delta).format('HH') === '00') {
        return this.$moment(delta).format('mm:ss')
      } else {
        return this.$moment(delta).format('HH:mm:ss')
      }
    },
    goToTop () {
      window.scrollTo(0, 0)
    }
  },
  computed: {
    searchedActivities () {
      if (this.activities === undefined || this.activities === null || this.activities === []) {
        return []
      }

      return this.activities.filter(e => e.subject.includes(this.activitiesSearch))
    },
    paginatedActivities () {
      let result = []

      if (this.searchedActivities === undefined || this.searchedActivities === null || this.searchedActivities === []) {
        return result
      }

      for (let i = 0; i < this.activitiesPerPage && ((this.lastActivitiesPage - 1) * this.activitiesPerPage + i) < this.searchedActivities.length; i++) {
        result.push(this.searchedActivities[(this.lastActivitiesPage - 1) * this.activitiesPerPage + i])
      }

      return result
    },
    pagesCount () {
      if (this.searchedActivities === undefined || this.searchedActivities === null || this.searchedActivities === []) {
        return 1
      }

      return parseInt(Math.ceil(this.searchedActivities.length / this.activitiesPerPage))
    }
  },
  mounted () {
    let that = this
    that.eventBus
      .$on('dbupdate', function (data) {
        that.fetchAllSubjects()
      })
      .$on('saveconfirm', function (data) {
        that.liveSaveConfirm()
      })

    that.fetchAllSubjects()

    // searching unstopped activities, and using the first of them in the live counter
    that.db.kernel
      .query('all_activities/all_activities', {include_docs: true})
      .then(res => {
        let unstoppedList = res.rows.filter(e => e.doc.stop_date === undefined || e.doc.stop_hour === undefined)
        if (unstoppedList.length > 0) {
          that.currentID = unstoppedList[0].doc._id
          that.runningCounter = true
        }
      })
      .catch(err => alert(err))
  },
  destroyed () {
    this.eventBus.$off(['dbupdate', 'saveconfirm'])
  },
  components: {
    'activity': Activity
  }
}
</script>

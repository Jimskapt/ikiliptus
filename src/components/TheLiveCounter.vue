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
          <v-progress-linear :indeterminate="true" v-if="!loaded"></v-progress-linear>
          <div v-else>
            <div v-if="runningCounter">

              <v-container grid-list-md>
                <v-layout row>
                  <v-flex xs6>
                    <v-btn block @click="stopCounter" :disabled="!runningCounter" color="error">
                      <v-icon>stop</v-icon>
                      <span>{{ $t("STOP") }}</span>
                    </v-btn>
                  </v-flex>
                  <v-flex xs6>
                    <v-btn block @click="nextCounter" :disabled="!runningCounter" color="warning">
                      <v-icon>skip_next</v-icon>
                      <span>{{ $t("NEXT") }}</span>
                    </v-btn>
                  </v-flex>
                </v-layout>

                <v-btn block @click="$eventBus.$emit('save', {origin: 'save', time: new Date()})" color="primary">
                  <v-icon>save</v-icon>
                  <span>{{ $t("Save") }}</span>
                </v-btn>
              </v-container>

              <activity-form :id="currentID" :locked="['stop_date','stop_hour']" :showCounter="true"></activity-form>

              <v-btn block @click="$eventBus.$emit('save', {origin: 'save', time: new Date()})" color="primary">
                <v-icon>save</v-icon>
                <span>{{ $t("Save") }}</span>
              </v-btn>

            </div>
            <v-alert v-else color="info" outline icon="info" :value="true">
              {{ $t("Counter is not started") }}.
            </v-alert>
          </div>
        </v-container>

        <v-card-actions v-if="loaded">
          <v-btn block @click="startCounter(undefined, new Date())" :disabled="runningCounter" color="primary">
            <v-icon>play_arrow</v-icon>
            <span>{{ $t("START") }}</span>
          </v-btn>
          <v-btn block @click="stopCounter" :disabled="!runningCounter" color="error">
            <v-icon>stop</v-icon>
            <span>{{ $t("STOP") }}</span>
          </v-btn>
          <v-btn block @click="nextCounter" :disabled="!runningCounter" color="warning">
            <v-icon>skip_next</v-icon>
            <span>{{ $t("NEXT") }}</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>

    <v-container>
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title>
            <v-btn icon>
              <v-icon>inbox</v-icon>
            </v-btn>
            <span>{{ $t("Last activities") }}</span>
          </v-card-title>
        </v-toolbar>

        <v-container v-if="!loaded">
          <v-progress-linear :indeterminate="true"></v-progress-linear>
        </v-container>
        <v-list three-line subheader v-else>

          <div class="text-xs-center" style="padding:10px;">
            <v-text-field
              :label="$t('Search')"
              v-model="activitiesSearch"
              prepend-icon="search"
              append-icon="close"
              :append-icon-cb="() => {activitiesSearch=''}"
            ></v-text-field>
            <v-pagination :length="pagesCount" v-model="lastActivitiesPage" v-if="searchedActivities.length > 0"></v-pagination>
          </div>

          <v-divider></v-divider>

          <template v-for="item in paginatedActivities">
            <v-list-tile @click="$router.push({name:'Activity', params: {id: item._id}})" :key="item._id">
              <v-list-tile-content>
                <v-list-tile-title style="font-weight:bold;">
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
                </v-list-tile-title>
                <v-list-tile-sub-title>
                  <v-layout row>
                    <v-chip small outline color="primary" disabled>
                      <v-avatar>
                        <v-icon>alarm</v-icon>
                      </v-avatar>
                      <span>{{ deltaTime(item) }}</span>
                    </v-chip>
                    <v-chip small dark outline disabled v-for="category in item.categories" v-bind:key="'chip-' + item._id + '-' + category">
                      <v-avatar>
                        <v-icon>move_to_inbox</v-icon>
                      </v-avatar>
                      <span>{{ category }}</span>
                    </v-chip>
                  </v-layout>
                </v-list-tile-sub-title>
                <v-list-tile-sub-title>
                  <v-layout row>
                    <v-chip small disabled v-if="item[field.name] && item[field.name] !== '' && field.type !== 'checkbox'" v-for="field in $sessions.available[$sessions.current].$customFields.fields" v-bind:key="'chip-' + item._id + '-' + field.name">
                      <v-avatar>
                        <v-icon>{{field.icon}}</v-icon>
                      </v-avatar>
                      <span>{{item[field.name]}}</span>
                    </v-chip>
                  </v-layout>
                </v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-layout row>
                  <v-flex xs6>
                    <v-btn flat icon @click.stop="copyActivity(item);goToTop();">
                      <v-icon>content_copy</v-icon>
                    </v-btn>
                  </v-flex>
                  <v-flex xs6>
                    <v-btn flat icon @click.stop="askDeleteActivity(item)">
                      <v-icon>delete</v-icon>
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-list-tile-action>
            </v-list-tile>
            <v-divider :key="'divider-' + item._id"></v-divider>
          </template>
        </v-list>
      </v-card>
    </v-container>

    <v-dialog v-model="askedDelete">
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title>{{ $t('Confirm the delete') }}</v-card-title>
        </v-toolbar>
        <v-card-text>
          <p>{{ $t('Please confirm the delete of this activity') }}.</p>
        </v-card-text>
        <v-card-actions>
          <v-btn block color="success" @click="askedDeleteDocument=null;askedDelete=false;">
            <v-icon>close</v-icon>
            {{$t('Abort')}}
          </v-btn>
          <v-btn block color="error" @click="confirmDeleteActivity">
            <v-icon>delete</v-icon>
            {{$t('Delete')}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="askedCopy">
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title>{{ $t('Confirm the copy') }}</v-card-title>
        </v-toolbar>
        <v-card-text>
          <p>{{ $t('Please confirm the copy of the activity in the current activity') }}.</p>
        </v-card-text>
        <v-card-actions>
          <v-btn block color="success" @click="askedCopyDocument=null;askedCopy=false;">
            <v-icon>close</v-icon>
            {{$t('Abort')}}
          </v-btn>
          <v-btn block color="primary" @click="confirmActivityCopy">
            <v-icon>content_copy</v-icon>
            {{$t('Copy')}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import Vue from 'vue'
import tools from '../tools/index.js'
import ActivityForm from '@/components/ActivityForm'

export default {
  name: 'TheLiveCounter',
  components: {
    activityForm: ActivityForm
  },
  data () {
    return {
      currentID: '',
      runningCounter: false,
      nextAction: '',
      activities: [],
      dialog: false,
      askedDelete: false,
      askedDeleteDocument: null,
      askedCopy: false,
      askedCopyDocument: null,
      lastActivitiesPage: 1,
      activitiesPerPage: 10,
      activitiesSearch: '',
      loaded: false
    }
  },
  methods: {
    startCounter (document, now) {
      let that = this

      if (document === undefined) {
        document = {}
      }

      delete document._id
      delete document._rev
      if (now === undefined || now === null) {
        now = new Date()
      }
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

      this.$sessions.available[this.$sessions.current].$db
        .post(document, {}, function (err, res) {
          if (err) {
            alert('IKE0013:\n' + err)
          }

          if (res.ok === true) {
            that.currentID = res.id
            that.runningCounter = true
            that.fetchAllSubjects()
          } else {
            alert('IKE0014:\n' + res)
          }
        })
        .catch(err => alert('IKE0015:\n' + err))
    },
    stopCounter () {
      this.runningCounter = false
      this.$eventBus.$emit('setStop', new Date())
    },
    liveSaveConfirm (payload) {
      if (payload !== undefined) {
        if (payload.origin === 'stop') {
          this.currentID = ''
        }
      }
      if (this.nextAction === 'start') {
        this.startCounter(this.nextActionDocument, new Date())
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
    copyActivity (document) {
      if (this.runningCounter) {
        this.askedCopyDocument = document
        this.askedCopy = true
      } else {
        this.nextCounter(document)
      }
    },
    fetchAllSubjects () {
      let that = this

      that.loaded = false

      that.$sessions.checkAndCreateViews()
        .then(() => {
          that.$sessions.available[that.$sessions.current].$db
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
            .catch(err => alert('IKE0016:\n' + err))
        })
        .catch(err => alert('IKE0017:\n' + err))
    },
    askDeleteActivity (document) {
      this.askedDelete = true
      this.askedDeleteDocument = document
    },
    confirmDeleteActivity () {
      let that = this

      this.$sessions.available[this.$sessions.current].$db
        .remove(this.askedDeleteDocument)
        .then(() => {
          that.askedDelete = false
          that.askedDeleteDocument = null

          that.fetchAllSubjects()
        })
        .catch(err => alert('IKE0018:\n' + err))
    },
    confirmActivityCopy () {
      let that = this
      let document = this.askedCopyDocument

      delete document._id
      delete document._rev
      delete document.start_date
      delete document.start_hour
      delete document.start_seconds
      delete document.stop_date
      delete document.stop_hour
      delete document.stop_seconds
      if (!document.data_type) {
        document.data_type = 'subject'
      }
      if (!document.data_version) {
        document.data_version = 1
      }

      this.$sessions.available[this.$sessions.current].$db
        .get(that.currentID, function (err, doc) {
          return new Promise((resolve, reject) => {
            if (err) {
              throw new Error(err)
            } else {
              Object.keys(doc).forEach(key => {
                if (document[key] === undefined) {
                  that.$set(document, key, doc[key])
                }
              })
              resolve()
            }
          })
        })
        .then(() => {
          that.$sessions.available[that.$sessions.current].$db
            .put(document, {}, function (err, res) {
              if (err) {
                alert('IKE0036:\n' + err)
              }

              if (res.ok === true) {
                that.fetchAllSubjects()
                that.askedCopyDocument = null
                that.askedCopy = false
              } else {
                alert('IKE0035:\n' + res)
              }
            })
            .catch(err => alert('IKE0034:\n' + err))
        })
        .catch(err => { alert('IKE0033:\n' + err) })
    },
    deltaTime (activity) {
      return tools.deltaT(
        this.$moment,
        activity.start_date,
        activity.start_hour,
        activity.start_seconds,
        activity.stop_date,
        activity.stop_hour,
        activity.stop_seconds,
        true)
    },
    goToTop () {
      window.scrollTo(0, 0)
    }
  },
  watch: {
    activitiesSearch (newValue, oldValue) {
      tools.setCookie('research', newValue)
    }
  },
  computed: {
    searchedActivities () {
      if (this.activities === undefined || this.activities === null || this.activities === []) {
        return []
      }

      let searchText = this.activitiesSearch
      let res = this.activities

      /*
TESTS :

// should match :
stop:2018/04/04
start:2018/04/04
start>2018/04/04
start<2018/04/04
start>=2018/04/04
start<=2018/04/04
start:04/04/2018
start>04/04/2018
start<04/04/2018
start:2018/04/04 04:04:04
start:2018/04/04 04:04
start:2018/04/04 04:04:04 PM
start:2018/04/04 04:04 PM
start:2018/04/04 04:04:04 AM
start:2018/04/04 04:04 AM
start:2018/04/04 4:4
start:2018/04/04 4:4:4
start:2018/04/04 14:14:14
start:today
start:today 14:14:14
start:now

// should fail :
test:2018/04/04
start!2018/04/04
start2018/04/04
start:test
start:4854
start:test4854
start:test/4854
start:test/48:54
start:now 14:14:14
      */

      if (searchText !== undefined && searchText !== null && searchText.trim() !== '') {
        let dayRegex = this.$t('date_format').split('DD').join('[0-9]{1,2}').split('MM').join('[0-9]{1,2}').split('YYYY').join('[0-9]{4}')
        let hourRegex = this.$t('hour_format').split('hh').join('[0-9]{1,2}').split('HH').join('[0-9]{1,2}').split('mm').join('[0-9]{1,2}').split('ss').join('[0-9]{1,2}').split('A').join('A|PM')

        let dateRegex = '((start)|(stop))(:|<=?|>=?)((((' + dayRegex + ')|(today))( ' + hourRegex + ')?)|(now))'
        let dateMatch = searchText.match(new RegExp(dateRegex, 'g'))

        let operations = {}
        let that = this

        let dayFormat = 'DD/MM/YYYY'
        let hourFormat = dayFormat + ' HH:mm:ss'

        if (dateMatch !== null && dateMatch.length > 0) {
          dateMatch.forEach(match => {
            searchText = searchText.split(match).join('').trim()

            let items = new RegExp(dateRegex, 'g').exec(match)

            if (items !== null) {
              let field = items[1]
              let operator = items[4]
              let time = items[5]

              if (time === 'now') {
                time = that.$moment().format(hourFormat)
              } else if (time.includes('today')) {
                time = time.split('today').join(that.$moment().format(dayFormat))
              }

              if (time.length === dayFormat.length) {
                time = that.$moment(time, dayFormat).format(hourFormat)
              }

              Vue.set(operations, field, {
                operator: operator,
                time: time,
                $time: that.$moment(time, hourFormat)
              })
            }
          })
        }

        /*
TESTS :

// should match :
subject:test
subject:=test
subject:test175
subject:"test bis"
medium:test
medium:"test bis"
actor:test
actor:"test bis"

// should fail :
subject:test bis
      */
        let metadataRegex = '((subject)|(medium)|(actor))(:=?)(("[^"]+")|([^\n ]+))'
        let metadataMatch = searchText.match(new RegExp(metadataRegex, 'g'))

        if (metadataMatch !== null && metadataMatch.length > 0) {
          metadataMatch.forEach(match => {
            searchText = searchText.split(match).join('').trim()

            let items = new RegExp(metadataRegex, 'g').exec(match)

            if (items !== null) {
              let field = items[1]
              let operator = items[5]
              let metadata = items[6]
              metadata = metadata.split('"').join('')

              Vue.set(operations, field, {
                operator: operator,
                metadata: metadata
              })
            }
          })
        }

        /*
TESTS :

// should match :
categories:=aaa
categories:aaa
categories:"aaa"
categories:"a a a"
categories:aaa,bbb,ccc
categories:"a a a",bbb
categories:"a a a","b b b"

// should fail :
categories:a a a, b b b
categories:"a a a", bbb
categories:aaa, bbb ,ccc
categories:aaa, bbb ,ccc test
      */
        let categoriesRegex = '(categories)(:=?)((,?(("[^"]+")|([^ \n]+)))+)'
        let categoriesMatch = searchText.match(new RegExp(categoriesRegex, 'g'))

        if (categoriesMatch !== null && categoriesMatch.length > 0) {
          categoriesMatch.forEach(match => {
            searchText = searchText.split(match).join('').trim()

            let items = new RegExp(categoriesRegex, 'g').exec(match)

            if (items !== null) {
              let field = items[1]
              let operator = items[2]
              let categories = items[3]
              categories = categories
                .split(',')
                .map(e => e.split('"').join('').trim())

              Vue.set(operations, field, {
                operator: operator,
                categories: categories
              })
            }
          })
        }

        let voluntaryRegex = '(!?)(voluntary)'
        let voluntaryMatch = searchText.match(new RegExp(voluntaryRegex, 'g'))

        if (voluntaryMatch !== null && voluntaryMatch.length > 0) {
          voluntaryMatch.forEach(match => {
            searchText = searchText.split(match).join('').trim()

            let items = new RegExp(voluntaryRegex, 'g').exec(match)

            if (items !== null) {
              let field = items[2]
              let operator = items[1]
              let value = (operator === '!') ? '' : true

              Vue.set(operations, field, {
                operator: operator,
                value: value
              })
            }
          })
        }

        if (Object.keys(operations).length > 0) {
          res = res.filter(e => {
            let check = true

            if (operations.start !== undefined) {
              let elementDate = e.start_date + ' ' + e.start_hour + ':' + ((e.start_seconds === undefined) ? '00' : e.start_seconds)
              elementDate = that.$moment(elementDate, 'YYYY-MM-DD HH:mm:ss')

              if (operations.start.operator === ':') {
                check &= elementDate === operations.start.$time
              } else if (operations.start.operator === '>') {
                check &= elementDate > operations.start.$time
              } else if (operations.start.operator === '<') {
                check &= elementDate < operations.start.$time
              } else if (operations.start.operator === '>=') {
                check &= elementDate >= operations.start.$time
              } else if (operations.start.operator === '<=') {
                check &= elementDate <= operations.start.$time
              }
            }

            if (operations.stop !== undefined) {
              let elementDate = e.stop_date + ' ' + e.stop_hour + ':' + ((e.stop_seconds === undefined) ? '00' : e.stop_seconds)
              elementDate = that.$moment(elementDate, 'YYYY-MM-DD HH:mm:ss')

              if (operations.stop.operator === ':') {
                check &= elementDate === operations.stop.$time
              } else if (operations.stop.operator === '>') {
                check &= elementDate > operations.stop.$time
              } else if (operations.stop.operator === '<') {
                check &= elementDate < operations.stop.$time
              } else if (operations.stop.operator === '>=') {
                check &= elementDate >= operations.stop.$time
              } else if (operations.stop.operator === '<=') {
                check &= elementDate <= operations.stop.$time
              }
            }

            if (operations.subject !== undefined) {
              if (e.subject) {
                if (operations.subject.operator === ':') {
                  check &= e.subject.includes(operations.subject.metadata)
                } else if (operations.subject.operator === ':=') {
                  check &= e.subject === operations.subject.metadata
                }
              } else {
                check = false
              }
            }

            // TODO : allow custom fields, here !
            if (operations.medium !== undefined) {
              if (e.medium) {
                if (operations.medium.operator === ':') {
                  check &= e.medium.includes(operations.medium.metadata)
                } else if (operations.medium.operator === ':=') {
                  check &= e.medium === operations.medium.metadata
                }
              } else {
                check = false
              }
            }

            if (operations.actor !== undefined) {
              if (e.actor) {
                if (operations.actor.operator === ':') {
                  check &= e.actor.includes(operations.actor.metadata)
                } else if (operations.actor.operator === ':=') {
                  check &= e.actor === operations.actor.metadata
                }
              } else {
                check = false
              }
            }

            if (operations.categories !== undefined) {
              if (e.categories && e.categories.length > 0) {
                if (operations.categories.operator === ':') {
                  operations.categories.categories.forEach(category => {
                    check &= e.categories.includes(category)
                  })
                } else if (operations.categories.operator === ':=') {
                  check &= e.categories.every(e => operations.categories.categories.includes(e))
                }
              } else {
                check = false
              }
            }

            if (operations.voluntary !== undefined) {
              if (e.voluntary !== undefined) {
                check &= e.voluntary === operations.voluntary.value
              } else {
                check = false
              }
            }

            return check
          })
        }
      }

      searchText = searchText.trim()

      return res
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
    this.$eventBus
      .$on('saveconfirm', this.liveSaveConfirm)
      .$on('dbupdate', this.fetchAllSubjects)

    this.fetchAllSubjects()

    let cookies = tools.getCookies()
    if (cookies.research) {
      this.activitiesSearch = cookies.research
    }

    // searching unstopped activities, and using the first of them in the live counter
    let that = this
    this.$sessions.checkAndCreateViews()
      .then(() => {
        that.$sessions.available[that.$sessions.current].$db
          .query('all_activities/all_activities', {include_docs: true})
          .then(res => {
            let unstoppedList = res.rows.filter(e => e.doc.stop_date === undefined || e.doc.stop_hour === undefined)
            if (unstoppedList.length > 0) {
              that.currentID = unstoppedList[0].doc._id
              that.runningCounter = true
            }
          })
          .catch(err => alert('IKE0019:\n' + err))
      })
  },
  destroyed () {
    this.$eventBus
      .$off('saveconfirm', this.saveConfirmation)
      .$off('dbupdate', this.fetchAllSubjects)
  }
}
</script>

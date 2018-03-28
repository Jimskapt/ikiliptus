<template>
  <v-form>

    <p style="font-size:48px;text-align:center;">
      {{ timeAgo }}
    </p>

    <v-layout row>
      <v-flex xs6>
        <span v-if="!locked.includes('start_date')">
          <v-menu
            ref="startDateMenu"
            v-bind:close-on-content-click="false"
            v-model="startDateMenu"
            v-bind:return-value.sync="startDateMenu"
            full-width
          >
            <v-text-field
              v-bind:label="$t('From')"
              v-model="newStartDateDisplay"
              prepend-icon="event"
              slot="activator"
              readonly
              append-icon="close"
              v-bind:append-icon-cb="() => {newStartDate=null}"
            ></v-text-field>
            <v-date-picker v-model="newStartDate" no-title scrollable full-width>
              <v-spacer></v-spacer>
              <v-btn color="error" v-on:click="startDateMenu = false">{{$t('Abort')}}</v-btn>
              <v-btn color="success" v-on:click="$refs.startDateMenu.save(newStartDate)">{{$t('OK')}}</v-btn>
            </v-date-picker>
          </v-menu>
        </span>
        <span v-else>
          <v-text-field
            v-bind:label="$t('From')"
            v-model="newStartDateDisplay"
            prepend-icon="event"
            disabled
            readonly
          ></v-text-field>
        </span>
      </v-flex>
      <v-flex xs6>
        <span v-if="!locked.includes('start_hour')">
          <v-menu
            ref="startHourMenu"
            v-bind:close-on-content-click="false"
            v-model="startHourMenu"
            v-bind:return-value.sync="startHourMenu"
            full-width
          >
            <v-text-field
              v-bind:label="$t('From')"
              v-model="newStartHourDisplay"
              prepend-icon="schedule"
              slot="activator"
              readonly
              append-icon="close"
              v-bind:append-icon-cb="() => {newStartHour=null}"
            ></v-text-field>
            <v-time-picker scrollable full-width
              v-model="newStartHour"
              v-on:change="$refs.startHourMenu.save(newStartHour)"
            ></v-time-picker>
          </v-menu>
        </span>
        <span v-else>
          <v-text-field
            v-bind:label="$t('From')"
            v-model="newStartHourDisplay"
            prepend-icon="schedule"
            disabled
            readonly
          ></v-text-field>
        </span>
      </v-flex>
    </v-layout>

    <v-layout row wrap>
      <v-flex xs6>
        <span v-if="!locked.includes('stop_date')">
          <v-menu
            ref="stopDateMenu"
            v-bind:close-on-content-click="false"
            v-model="stopDateMenu"
            v-bind:return-value.sync="stopDateMenu"
            full-width
          >
            <v-text-field
              v-bind:label="$t('To')"
              v-model="newStopDateDisplay"
              prepend-icon="event"
              slot="activator"
              readonly
              append-icon="close"
              v-bind:append-icon-cb="() => {newStopDate=null}"
            ></v-text-field>
            <v-date-picker v-model="newStopDate" no-title scrollable full-width>
              <v-spacer></v-spacer>
              <v-btn color="error" v-on:click="stopDateMenu = false">{{$t('Abort')}}</v-btn>
              <v-btn color="success" v-on:click="$refs.stopDateMenu.save(newStopDate)">{{$t('OK')}}</v-btn>
            </v-date-picker>
          </v-menu>
        </span>
        <span v-else>
          <v-text-field
            v-bind:label="$t('To')"
            v-model="newStopDateDisplay"
            prepend-icon="event"
            disabled
            readonly
          ></v-text-field>
        </span>
      </v-flex>
      <v-flex xs6>
        <span v-if="!locked.includes('stop_hour')">
          <v-menu
            ref="stopHourMenu"
            v-bind:close-on-content-click="false"
            v-model="stopHourMenu"
            v-bind:return-value.sync="stopHourMenu"
            full-width
          >
            <v-text-field
              v-bind:label="$t('To')"
              v-model="newStopHourDisplay"
              prepend-icon="schedule"
              slot="activator"
              readonly
              append-icon="close"
              v-bind:append-icon-cb="() => {newStopHour=null}"
            ></v-text-field>
            <v-time-picker scrollable full-width
              v-model="newStopHour"
              v-on:change="$refs.stopHourMenu.save(newStopHour)"
            ></v-time-picker>
          </v-menu>
        </span>
        <span v-else>
          <v-text-field
            v-bind:label="$t('To')"
            v-model="newStopHourDisplay"
            prepend-icon="schedule"
            disabled
            readonly
          ></v-text-field>
        </span>
      </v-flex>
    </v-layout>

    <v-text-field
      v-bind:label="$t('Subject')"
      v-model="newSubject"
      prepend-icon="label"
      v-on:input="showSubjects = true"
      append-icon="close"
      v-bind:append-icon-cb="() => {newSubject=''}"
    ></v-text-field>

    <v-card v-if="showSubjects && subjects_founds && subjects_founds.length > 0">
      <v-toolbar dark dense color="secondary">
        <v-toolbar-side-icon><v-icon>lightbulb_outline</v-icon></v-toolbar-side-icon>
        <v-toolbar-title class="white--text">Suggestions</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon v-on:click="showSubjects = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-list dense>
        <template v-for="found in subjects_founds">
          <v-list-tile v-bind:key="'subject_suggest:' + found" v-on:click="newSubject = found">
            <v-list-tile-action><v-icon>label_outline</v-icon></v-list-tile-action>
            <v-list-tile-content>{{found}}</v-list-tile-content>
          </v-list-tile>
          <v-divider v-bind:key="'separator:' + found"></v-divider>
        </template>
      </v-list>
    </v-card>

    <v-select
      v-bind:label="$t('Categories')"
      v-on:input="showCategories = true"
      v-model="newCategories"
      prepend-icon="move_to_inbox"
      chips
      tags
      clearable
    >
      <template slot="selection" slot-scope="data">
        <v-chip small close v-on:input="removeCategory(data.item)">
          <strong>{{data.item}}</strong>
        </v-chip>
      </template>
    </v-select>

    <v-card v-if="showCategories && categories_list && categories_list.length > 0">
      <v-toolbar dark dense color="secondary">
        <v-toolbar-side-icon><v-icon>lightbulb_outline</v-icon></v-toolbar-side-icon>
        <v-toolbar-title class="white--text">Suggestions</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon v-on:click="showCategories = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-list dense v-if="categories_list && categories_list.length > 0">
        <template v-for="found in categories_founds">
          <v-list-tile v-bind:key="'categories_suggest:' + found" v-on:click="newCategories.push(found)">
            <v-list-tile-action><v-icon>move_to_inbox</v-icon></v-list-tile-action>
            <v-list-tile-content>{{found}}</v-list-tile-content>
          </v-list-tile>
          <v-divider v-bind:key="'separator:' + found"></v-divider>
        </template>
      </v-list>
    </v-card>

    <v-checkbox
      v-bind:label="$t('Voluntary')"
      v-model="newVoluntary"
      v-bind:disabled="locked.includes('voluntary')"
    ></v-checkbox>

    <v-layout row>
      <v-flex xs6>
        <v-text-field
          v-if="!newVoluntary"
          v-bind:label="$t('Medium')"
          v-model="newMedium"
          prepend-icon="phone"
          v-bind:disabled="locked.includes('medium')"
          v-on:input="showMediums = true"
          append-icon="close"
          v-bind:append-icon-cb="() => {newMedium=''}"
        ></v-text-field>
      </v-flex>
      <v-flex xs6>
        <v-text-field
          v-if="!newVoluntary"
          v-bind:label="$t('Actor')"
          v-model="newActor"
          prepend-icon="people"
          v-bind:disabled="locked.includes('actor')"
          v-on:input="showActors = true"
          append-icon="close"
          v-bind:append-icon-cb="() => {newActor=''}"
        ></v-text-field>
      </v-flex>
    </v-layout>

    <v-card v-if="showMediums && mediums_founds && mediums_founds.length > 0">
      <v-toolbar dark dense color="secondary">
        <v-toolbar-side-icon><v-icon>lightbulb_outline</v-icon></v-toolbar-side-icon>
        <v-toolbar-title class="white--text">Suggestions</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon v-on:click="showMediums = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-list dense>
        <template v-for="found in mediums_founds">
          <v-list-tile v-bind:key="'medium_suggest:' + found" v-on:click="newMedium = found">
            <v-list-tile-action><v-icon>phone</v-icon></v-list-tile-action>
            <v-list-tile-content>{{found}}</v-list-tile-content>
          </v-list-tile>
          <v-divider v-bind:key="'separator:' + found"></v-divider>
        </template>
      </v-list>
    </v-card>

    <v-container v-if="showActors && actors_founds && actors_founds.length > 0">
      <v-toolbar dark dense color="secondary">
        <v-toolbar-side-icon><v-icon>lightbulb_outline</v-icon></v-toolbar-side-icon>
        <v-toolbar-title class="white--text">Suggestions</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon v-on:click="showActors = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-list dense>
        <template v-for="found in actors_founds">
          <v-list-tile v-bind:key="'actor_suggest:' + found" v-on:click="newActor = found">
            <v-list-tile-action><v-icon>people</v-icon></v-list-tile-action>
            <v-list-tile-content>{{found}}</v-list-tile-content>
          </v-list-tile>
          <v-divider v-bind:key="'separator:' + found"></v-divider>
        </template>
      </v-list>
    </v-container>

    <v-text-field
      v-bind:label="$t('Details')"
      v-model="newDetails"
      prepend-icon="comment"
      v-bind:disabled="locked.includes('details')"
      multi-line
      append-icon="close"
      v-bind:append-icon-cb="() => {newDetails=''}"
    ></v-text-field>

    <v-snackbar v-bind:timeout="1000" top v-model="saveConfirmed" color="success">
      <v-icon dark>done</v-icon>
      {{ $t('Save confirmed') }}
      <v-btn flat v-on:click="saveConfirmed = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-form>
</template>

<script>
export default {
  name: 'Interval',
  props: {
    id: {
      type: String,
      required: true
    },
    locked: {
      type: Array,
      required: false,
      default () {
        return []
      }
    },
    showCounter: {
      type: Boolean,
      required: false,
      default () {
        return false
      }
    }
  },
  data () {
    return {
      startDateMenu: false,
      newStartDate: null,
      startHourMenu: false,
      newStartHour: null,
      stopDateMenu: false,
      newStartSeconds: null,
      newStopDate: null,
      stopHourMenu: false,
      newStopHour: null,
      newStopSeconds: null,
      newVoluntary: '',
      newMedium: '',
      newActor: '',
      newDetails: '',
      newSubject: '',
      newCategories: [],
      showSubjects: false,
      showActors: false,
      showCategories: false,
      showMediums: false,
      subjects_list: [],
      mediums_list: [],
      actors_list: [],
      categories_list: [],
      timeAgo: '00:00:00',
      dbData: {},
      saveConfirmed: false
    }
  },
  methods: {
    save () {
      let that = this
      this.db.kernel
        .put(this.newData, function (err, res) {
          if (err) {
            alert(err)
          } else {
            that.eventBus.$emit('saveconfirm')
            that.refreshData()
          }
        })
        .catch(err => { alert(err) })
    },
    setStop (args) {
      if (args === undefined) {
        args = new Date()
      }

      this.newStopDate = this.$moment(args).format('YYYY-MM-DD')
      this.newStopHour = this.$moment(args).format('HH:mm')
      this.newStopSeconds = args.getSeconds()

      this.save()
    },
    refreshData () {
      let that = this

      this.db.kernel
        .get(this.id, function (err, doc) {
          if (err) {
            alert(err)
          } else {
            that.dbData = doc

            if (doc.start_date) {
              that.newStartDate = doc.start_date
            }
            if (doc.start_hour) {
              that.newStartHour = doc.start_hour
            }
            if (doc.start_seconds) {
              that.newStartSeconds = doc.start_seconds
            }
            if (doc.stop_date) {
              that.newStopDate = doc.stop_date
            }
            if (doc.stop_hour) {
              that.newStopHour = doc.stop_hour
            }
            if (doc.stop_seconds) {
              that.newStopSeconds = doc.stop_seconds
            }
            if (doc.subject) {
              that.newSubject = doc.subject
            }
            if (doc.categories) {
              that.newCategories = doc.categories
            }
            if (doc.voluntary) {
              that.newVoluntary = doc.voluntary
            }
            if (doc.medium) {
              that.newMedium = doc.medium
            }
            if (doc.actor) {
              that.newActor = doc.actor
            }
            if (doc.details) {
              that.newDetails = doc.details
            }
          }
        })
        .catch(err => { alert(err) })
    },
    fetchAutocompleteData () {
      let that = this

      this.db.kernel
        .query('subjects_powers/subjects_powers', {group: true})
        .then(res => {
          that.subjects_list = []
          res.rows.forEach(e => {
            that.subjects_list.push(e.key)
          })
        })
        .catch(err => { alert(err) })

      this.db.kernel
        .query('mediums_powers/mediums_powers', {group: true})
        .then(res => {
          that.mediums_list = []
          res.rows.forEach(e => {
            that.mediums_list.push(e.key)
          })
        })
        .catch(err => { alert(err) })

      this.db.kernel
        .query('actors_powers/actors_powers', {group: true})
        .then(res => {
          that.actors_list = []
          res.rows.forEach(e => {
            that.actors_list.push(e.key)
          })
        })
        .catch(err => { alert(err) })

      this.db.kernel
        .query('categories_powers/categories_powers', {group: true})
        .then(res => {
          that.categories_list = []
          res.rows.forEach(e => {
            that.categories_list.push(e.key)
          })
        })
        .catch(err => { alert(err) })
    },
    find_text (array, value) {
      if (value.trim() === '' || array === undefined) {
        return []
      }

      return array.filter(e => e.toLowerCase().includes(value.trim().toLowerCase()) && e !== value)
    },
    removeCategory (value) {
      this.newCategories.splice(this.newCategories.indexOf(value), 1)
    },
    refreshCounter () {
      if (this.newStartDate !== null && this.newStartHour !== null && this.newStartSeconds !== null) {
        let now = new Date()
        if (this.newStopDate !== null && this.newStopHour !== null && this.newStopSeconds !== null) {
          now = this.$moment(this.newStopDate + ' ' + this.newStopHour + ':' + this.newStopSeconds, 'YYYY-MM-DD HH:mm:ss').toDate()
        }
        let delta = now
        delta -= this.$moment(this.newStartDate + ' ' + this.newStartHour + ':' + this.newStartSeconds, 'YYYY-MM-DD HH:mm:ss').toDate()
        // delta -= now.getTimezoneOffset() * 60 * 1000
        this.timeAgo = this.$moment(delta).format('HH:mm:ss')
      }
    },
    saveconfirmed () {
      this.saveConfirmed = true
    }
  },
  computed: {
    newData () {
      let result = this.dbData

      if (this.newStartDate !== null && this.newStartDate !== undefined) {
        result.start_date = this.newStartDate
      }
      if (this.newStartHour !== null && this.newStartHour !== undefined) {
        result.start_hour = this.newStartHour
      }
      if (this.newStartSeconds !== null && this.newStartSeconds !== undefined) {
        result.start_seconds = this.newStartSeconds
      }
      if (this.newStopDate !== null && this.newStopDate !== undefined) {
        result.stop_date = this.newStopDate
      }
      if (this.newStopHour !== null && this.newStopHour !== undefined) {
        result.stop_hour = this.newStopHour
      }
      if (this.newStopSeconds !== null && this.newStopSeconds !== undefined) {
        result.stop_seconds = this.newStopSeconds
      }
      if (this.newSubject !== null && this.newSubject !== undefined) {
        result.subject = this.newSubject
      }
      if (this.newCategories !== null && this.newCategories !== undefined) {
        result.categories = this.newCategories
      }
      if (this.newVoluntary !== null && this.newVoluntary !== undefined) {
        result.voluntary = this.newVoluntary
      }
      if (this.newMedium !== null && this.newMedium !== undefined) {
        result.medium = this.newMedium
      }
      if (this.newActor !== null && this.newActor !== undefined) {
        result.actor = this.newActor
      }
      if (this.newDetails !== null && this.newDetails !== undefined) {
        result.details = this.newDetails
      }

      return result
    },
    subjects_founds () {
      return this.find_text(this.subjects_list, this.newSubject)
    },
    mediums_founds () {
      return this.find_text(this.mediums_list, this.newMedium)
    },
    actors_founds () {
      return this.find_text(this.actors_list, this.newActor)
    },
    categories_founds () {
      return this.categories_list.filter(e => !this.newCategories.includes(e))
    },
    newStartDateDisplay () {
      if (this.newStartDate && this.newStartDate != null) {
        return this.$moment(this.newStartDate, 'YYYY-MM-DD').format(this.$t('date_format'))
      }

      return ''
    },
    newStartHourDisplay () {
      if (this.newStartHour && this.newStartHour != null) {
        return this.$moment(this.newStartHour + ':' + this.newStartSeconds, 'HH:mm:ss').format(this.$t('hour_format'))
      }

      return ''
    },
    newStopDateDisplay () {
      if (this.newStopDate && this.newStopDate != null) {
        return this.$moment(this.newStopDate, 'YYYY-MM-DD').format(this.$t('date_format'))
      }

      return ''
    },
    newStopHourDisplay () {
      if (this.newStopHour && this.newStopHour != null) {
        return this.$moment(this.newStopHour + ':' + this.newStopSeconds, 'HH:mm:ss').format(this.$t('hour_format'))
      }

      return ''
    }
  },
  mounted () {
    this.eventBus.$on('setStop', this.setStop)
    this.eventBus.$on('save', this.save)
    this.eventBus.$on('saveconfirm', this.saveconfirmed)

    this.refreshData()

    let that = this
    setTimeout(() => {
      if (that.newStopDate === null && that.newStopHour === null && that.newStopSeconds === null) {
        setInterval(that.refreshCounter, 1000)
      } else {
        that.refreshCounter()
      }
    }, 750)

    // we defer the request because the views could be created, on page load.
    setTimeout(this.fetchAutocompleteData, 750)
  },
  destroyed () {
    this.eventBus.$off('setStop')
    this.eventBus.$off('save')
    this.eventBus.$off('saveconfirm')
  }
}
</script>

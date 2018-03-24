<template>
  <v-form>

    <p style="font-size:48px;text-align:center;" v-if="showCounter">
      {{ timeAgo }}
    </p>

    <v-layout row wrap>
      <v-flex xs6>
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
          ></v-text-field>
          <v-date-picker v-model="newStartDate" no-title scrollable full-width>
            <v-spacer></v-spacer>
            <v-btn color="red" v-on:click="startDateMenu = false">{{$t('Abort')}}</v-btn>
            <v-btn color="green" v-on:click="$refs.startDateMenu.save(newStartDate)">{{$t('OK')}}</v-btn>
          </v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs6>
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
          ></v-text-field>
          <v-time-picker scrollable full-width
            v-model="newStartHour"
            v-on:change="$refs.startHourMenu.save(newStartHour)"
          ></v-time-picker>
        </v-menu>
      </v-flex>
    </v-layout>

    <v-layout row wrap>
      <v-flex xs6>
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
          ></v-text-field>
          <v-date-picker v-model="newStopDate" no-title scrollable full-width>
            <v-spacer></v-spacer>
            <v-btn color="red" v-on:click="stopDateMenu = false">{{$t('Abort')}}</v-btn>
            <v-btn color="green" v-on:click="$refs.stopDateMenu.save(newStopDate)">{{$t('OK')}}</v-btn>
          </v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs6>
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
          ></v-text-field>
          <v-time-picker scrollable full-width
            v-model="newStopHour"
            v-on:change="$refs.stopHourMenu.save(newStopHour)"
          ></v-time-picker>
        </v-menu>
      </v-flex>
    </v-layout>

    <v-text-field
      v-bind:label="$t('Subject')"
      v-model="newSubject"
      prepend-icon="label"
    ></v-text-field>

    <v-container v-if="subjects_founds && subjects_founds.length > 0">
      <v-list dense>
        <template v-for="found in subjects_founds">
          <v-list-tile v-bind:key="'subject_suggest:' + found" v-on:click="newSubject = found">
            <v-list-tile-action><v-icon>label_outline</v-icon></v-list-tile-action>
            <v-list-tile-content>{{found}}</v-list-tile-content>
          </v-list-tile>
          <v-divider v-bind:key="'separator:' + found"></v-divider>
        </template>
      </v-list>
    </v-container>

    <v-select
      v-bind:label="$t('Categories')"
      v-model="newCategories"
      prepend-icon="move_to_inbox"
      chips
      tags
      clearable
    >
      <template slot="selection" slot-scope="data">
        <v-chip close v-on:input="removeCategory(data.item)">
          <strong>{{data.item}}</strong>
        </v-chip>
      </template>
    </v-select>

    <v-container v-if="categories_list && categories_list.length > 0">
      <v-list dense>
        <template v-for="found in categories_founds">
          <v-list-tile v-bind:key="'categories_suggest:' + found" v-on:click="newCategories.push(found)">
            <v-list-tile-action><v-icon>move_to_inbox</v-icon></v-list-tile-action>
            <v-list-tile-content>{{found}}</v-list-tile-content>
          </v-list-tile>
          <v-divider v-bind:key="'separator:' + found"></v-divider>
        </template>
      </v-list>
    </v-container>

    <v-checkbox
      v-bind:label="$t('Voluntary')"
      v-model="newVoluntary"
      v-bind:disabled="locked.includes('voluntary')"
    ></v-checkbox>

    <v-text-field
      v-if="!newVoluntary"
      v-bind:label="$t('Medium')"
      v-model="newMedium"
      prepend-icon="phone"
      v-bind:disabled="locked.includes('medium')"
    ></v-text-field>

    <v-container v-if="mediums_founds && mediums_founds.length > 0">
      <v-list dense>
        <template v-for="found in mediums_founds">
          <v-list-tile v-bind:key="'medium_suggest:' + found" v-on:click="newMedium = found">
            <v-list-tile-action><v-icon>phone</v-icon></v-list-tile-action>
            <v-list-tile-content>{{found}}</v-list-tile-content>
          </v-list-tile>
          <v-divider v-bind:key="'separator:' + found"></v-divider>
        </template>
      </v-list>
    </v-container>

    <v-text-field
      v-if="!newVoluntary"
      v-bind:label="$t('Actor')"
      v-model="newActor"
      prepend-icon="people"
      v-bind:disabled="locked.includes('actor')"
    ></v-text-field>

    <v-container v-if="actors_founds && actors_founds.length > 0">
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
    ></v-text-field>
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
      rev: '',
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
      subjects_list: [],
      mediums_list: [],
      actors_list: [],
      categories_list: [],
      timeAgo: ''
    }
  },
  methods: {
    save () {
      let that = this
      this.db.put(this.newData, function (err, res) {
        if (err) {
          alert(err)
        } else {
          that.eventBus.$emit('saveconfirm')
        }
      })
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

      this.db.get(this.id, function (err, doc) {
        if (err) {
          alert(err)
        } else {
          that.rev = doc._rev

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
    },
    fetchAutocompleteData () {
      let that = this

      this.db
        .query('subjects_powers/subjects_powers', {group: true})
        .then(res => {
          that.subjects_list = []
          res.rows.forEach(e => {
            that.subjects_list.push(e.key)
          })
        })
        .catch(err => { alert(err) })

      this.db
        .query('mediums_powers/mediums_powers', {group: true})
        .then(res => {
          that.mediums_list = []
          res.rows.forEach(e => {
            that.mediums_list.push(e.key)
          })
        })
        .catch(err => { alert(err) })

      this.db
        .query('actors_powers/actors_powers', {group: true})
        .then(res => {
          that.actors_list = []
          res.rows.forEach(e => {
            that.actors_list.push(e.key)
          })
        })
        .catch(err => { alert(err) })

      this.db
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
      if (this.newStartDate && this.newStartHour && this.newStartSeconds) {
        let now = new Date()
        let delta = now
        delta -= this.$moment(this.newStartDate + ' ' + this.newStartHour + ':' + this.newStartSeconds, 'YYYY-MM-DD HH:mm:ss').toDate()
        delta += now.getTimezoneOffset() * 60 * 1000
        this.timeAgo = this.$moment(delta).format('HH:mm:ss')
      }
    }
  },
  computed: {
    newData () {
      let result = {
        _id: this.id,
        _rev: this.rev,
        data_type: 'subject',
        data_version: 1
      }

      if (this.newStartDate) {
        result.start_date = this.newStartDate
      }
      if (this.newStartHour) {
        result.start_hour = this.newStartHour
      }
      if (this.newStartSeconds) {
        result.start_seconds = this.newStartSeconds
      }
      if (this.newStopDate) {
        result.stop_date = this.newStopDate
      }
      if (this.newStopHour) {
        result.stop_hour = this.newStopHour
      }
      if (this.newStopSeconds) {
        result.stop_seconds = this.newStopSeconds
      }
      if (this.newSubject) {
        result.subject = this.newSubject
      }
      if (this.newCategories) {
        result.categories = this.newCategories
      }
      if (this.newVoluntary) {
        result.voluntary = this.newVoluntary
      }
      if (this.newMedium) {
        result.medium = this.newMedium
      }
      if (this.newActor) {
        result.actor = this.newActor
      }
      if (this.newDetails) {
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

    this.refreshData()

    if (this.showCounter) {
      setInterval(this.refreshCounter, 1000)
    }

    // we defer the request because the views could be created, on page load.
    setTimeout(this.fetchAutocompleteData, 750)
  },
  destroyed () {
    this.eventBus.$off('setStop')
  }
}
</script>

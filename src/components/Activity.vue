<template>
  <v-form>

    <v-text-field
      v-bind:label="$t('From')"
      v-model="newStart"
      prepend-icon="play_arrow"
      v-bind:disabled="locked.includes('from')"
    ></v-text-field>

    <v-text-field
      v-bind:label="$t('To')"
      v-model="newStop"
      prepend-icon="stop"
      v-bind:disabled="locked.includes('to')"
    ></v-text-field>

    <v-text-field
      v-bind:label="$t('Subject')"
      v-model="newSubject"
      prepend-icon="label"
    ></v-text-field>

    <v-container v-if="subjects_founds && subjects_founds.length > 0">
      <v-list dense v-if="subjects_founds">
        <template v-for="found in subjects_founds">
          <v-list-tile v-bind:key="'medium_suggest:' + found" v-on:click="newSubject = found">
            <v-list-tile-action><v-icon>label_outline</v-icon></v-list-tile-action>
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
    }
  },
  data () {
    return {
      rev: '',
      newStart: '',
      newStop: '',
      newVoluntary: '',
      newMedium: '',
      newActor: '',
      newDetails: '',
      newSubject: '',
      subjects_list: [],
      mediums_list: [],
      actors_list: []
    }
  },
  methods: {
    setStop (args) {
      if (args !== undefined) {
        this.newStop = args
      }

      let that = this
      this.db.put(this.newData, function (err, res) {
        if (err) {
          alert(err)
        } else {
          that.eventBus.$emit('saveconfirm')
        }
      })
    },
    refreshData () {
      let that = this

      this.db.get(this.id, function (err, doc) {
        if (err) {
          alert(err)
        } else {
          that.rev = doc._rev

          if (doc.start) {
            that.newStart = doc.start
          }
          if (doc.stop) {
            that.newStop = doc.stop
          }
          if (doc.subject) {
            that.newSubject = doc.subject
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
    },
    find_text (array, value) {
      if (value.trim() === '' || array === undefined) {
        return []
      }

      return array.filter(e => e.toLowerCase().includes(value.trim().toLowerCase()) && e !== value)
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

      if (this.newStart) {
        result.start = this.newStart
      }
      if (this.newStop) {
        result.stop = this.newStop
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
      if (this.newSubject) {
        result.subject = this.newSubject
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
    }
  },
  mounted () {
    this.eventBus.$on('setStop', this.setStop)
    this.eventBus.$on('save', this.setStop)

    this.refreshData()

    // we defer the request because the views could be created, on page load.
    setTimeout(this.fetchAutocompleteData, 750)
  },
  destroyed () {
    this.eventBus.$off('setStop')
  }
}
</script>

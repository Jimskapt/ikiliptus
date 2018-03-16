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
    <v-select
      v-bind:label="$t('Subject')"
      v-bind:items="subjects_list"
      v-model="newSubject"
      prepend-icon="label"
      autocomplete
    ></v-select>
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
    <v-text-field
      v-if="!newVoluntary"
      v-bind:label="$t('Actor')"
      v-model="newActor"
      prepend-icon="people"
      v-bind:disabled="locked.includes('actor')"
    ></v-text-field>
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
      subjects_list: []
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
    }
  },
  mounted () {
    this.eventBus.$on('setStop', this.setStop)
    this.eventBus.$on('save', this.setStop)

    this.refreshData()

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
  },
  destroyed () {
    this.eventBus.$off('setStop')
  }
}
</script>

<style scoped>
table {
  border-collapse: collapse;
  margin: 15px;
}
td {
  border: 1px solid black;
  padding-left: 5px;
  padding-right: 5px;
}
</style>

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
              v-bind:append-icon-cb="() => {dbData.start_date=null}"
            ></v-text-field>
            <v-date-picker
              v-model="dbData.start_date"
              no-title
              scrollable
              full-width
              v-bind:locale="$settings.locale.get()"
              v-bind:first-day-of-week="parseInt($t('vuetify_first-day-of-week'))"
            >
              <v-btn block color="error" v-on:click="startDateMenu = false">{{$t('Abort')}}</v-btn>
              <v-btn block color="success" v-on:click="$refs.startDateMenu.save(dbData.start_date)">{{$t('OK')}}</v-btn>
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
              v-bind:append-icon-cb="() => {dbData.start_hour=null}"
            ></v-text-field>
            <v-time-picker
              scrollable
              full-width
              v-model="dbData.start_hour"
              v-on:change="$refs.startHourMenu.save(dbData.start_hour)"
              v-bind:format="$t('vuetify_clock_format')"
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
              v-bind:append-icon-cb="() => {dbData.stop_date=null}"
            ></v-text-field>
            <v-date-picker
              v-model="dbData.stop_date"
              no-title
              scrollable
              full-width
              v-bind:locale="$settings.locale.get()"
              v-bind:first-day-of-week="parseInt($t('vuetify_first-day-of-week'))"
            >
              <v-spacer></v-spacer>
              <v-btn color="error" v-on:click="stopDateMenu = false">{{$t('Abort')}}</v-btn>
              <v-btn color="success" v-on:click="$refs.stopDateMenu.save(dbData.stop_date)">{{$t('OK')}}</v-btn>
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
              v-bind:append-icon-cb="() => {dbData.stop_hour=null}"
            ></v-text-field>
            <v-time-picker
              scrollable
              full-width
              v-model="dbData.stop_hour"
              v-on:change="$refs.stopHourMenu.save(dbData.stop_hour)"
              v-bind:format="$t('vuetify_clock_format')"
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
      v-model="dbData.subject"
      prepend-icon="label"
      v-on:input="showSuggestions.subject = true"
      append-icon="close"
      v-bind:append-icon-cb="() => {dbData.subject=''}"
    ></v-text-field>

    <suggestions-list
      name="subject"
      v-bind:show="showSuggestions.subject"
      v-bind:list="subjectsFound"
      v-on:suggestionhide="suggestionhide"
      v-on:suggestionselect="suggestionselect"
    ></suggestions-list>

    <v-layout>
      <v-btn icon v-on:click="showSuggestions.categories = true">
        <v-icon>move_to_inbox</v-icon>
      </v-btn>
      <v-select
        v-bind:label="$t('Categories')"
        v-on:input="showSuggestions.categories = true"
        v-model="dbData.categories"
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
    </v-layout>

    <suggestions-list
      name="categories"
      v-bind:show="showSuggestions.categories"
      v-bind:list="categoriesFound"
      v-on:suggestionhide="suggestionhide"
      v-on:suggestionselect="suggestionselect"
    ></suggestions-list>

    <template v-for="item in customFields">
      <!--
      <v-checkbox
        v-bind:key="'checkbox-' + i"
        v-bind:label="item.label"
        v-model="dbData[item.name]"
        v-if="item.type === 'checkbox'"
      ></v-checkbox>
      <v-text-field
        v-bind:key="'textfield-' + i"
        v-bind:label="item.label"
        v-bind:prepend-icon="item.icon"
        v-model="dbData[item.name]"
        v-else
      ></v-text-field>
      -->
      <custom-field
        v-bind:key="'custom-' + item.name"
        v-bind:settings="item"
        v-bind:value="dbData[item.name]"
        v-on:customfieldchange="customfieldchange"
      ></custom-field>
    </template>

    <v-text-field
      v-bind:label="$t('Details')"
      v-model="dbData.details"
      prepend-icon="comment"
      v-bind:disabled="locked.includes('details')"
      multi-line
      append-icon="close"
      v-bind:append-icon-cb="() => {dbData.details=''}"
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
import tools from '../tools/index.js'
import CustomField from '@/components/CustomField'
import SuggestionsList from '@/components/SuggestionsList'

export default {
  name: 'ActivityForm',
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
      startHourMenu: false,
      stopDateMenu: false,
      stopHourMenu: false,
      showSuggestions: {
        subject: false,
        categories: false
      },
      subjectsList: [],
      mediumsList: [],
      actorsList: [],
      categoriesList: [],
      timeAgo: '00:00:00',
      dbData: {
        data_type: 'subject',
        data_version: 1,
        start_date: null,
        start_hour: null,
        start_seconds: null,
        stop_date: null,
        stop_hour: null,
        stop_seconds: null,
        subject: '',
        categories: [],
        details: ''
      },
      saveConfirmed: false,
      customFields: []
    }
  },
  methods: {
    save (payload) {
      let that = this
      this.$sessions.current.db
        .put(this.dbData, function (err, res) {
          if (err) {
            alert('IKE0001:\n' + err)
          } else {
            if (payload !== undefined) {
              that.$eventBus.$emit('saveconfirm', payload.origin)
            } else {
              that.$eventBus.$emit('saveconfirm')
            }
          }
        })
        .catch(err => { alert('IKE0002:\n' + err) })
    },
    suggestionhide (field) {
      this.$set(this.showSuggestions, field, false)
    },
    suggestionselect (payload) {
      if (payload !== undefined && payload.field !== undefined && payload.value !== undefined) {
        if (payload.field === 'categories') {
          this.dbData[payload.field].push(payload.value)
        } else {
          this.$set(this.dbData, payload.field, payload.value)
          this.$set(this.showSuggestions, payload.field, false)
        }
      }
    },
    customfieldchange (payload) {
      if (payload !== undefined && payload.field !== undefined && payload.value !== undefined) {
        this.$set(this.dbData, payload.field, payload.value)
      }
    },
    setStop (args) {
      if (args === undefined) {
        args = new Date()
      }

      this.dbData.stop_date = this.$moment(args).format('YYYY-MM-DD')
      this.dbData.stop_hour = this.$moment(args).format('HH:mm')
      this.dbData.stop_seconds = args.getSeconds()

      this.save({origin: 'stop'})
    },
    refreshData (relaunchCounter) {
      let that = this
      this.$sessions.current.db
        .get(this.id, function (err, doc) {
          if (err) {
            alert('IKE0003:\n' + err)
          } else {
            Object.keys(doc).forEach(key => {
              that.$set(that.dbData, key, doc[key])
            })
          }
        })
        .catch(err => { alert('IKE0004:\n' + err) })
    },
    fetchAutocompleteData () {
      let that = this

      this.$sessions.current.db
        .query('subjects_powers/subjects_powers', {group: true})
        .then(res => {
          that.subjectsList = []
          res.rows.forEach(e => {
            that.subjectsList.push(e.key)
          })
        })
        .catch(err => { alert('IKE0005:\n' + err) })

      this.$sessions.current.db
        .query('mediums_powers/mediums_powers', {group: true})
        .then(res => {
          that.mediumsList = []
          res.rows.forEach(e => {
            that.mediumsList.push(e.key)
          })
        })
        .catch(err => { alert('IKE0006:\n' + err) })

      this.$sessions.current.db
        .query('actors_powers/actors_powers', {group: true})
        .then(res => {
          that.actorsList = []
          res.rows.forEach(e => {
            that.actorsList.push(e.key)
          })
        })
        .catch(err => { alert('IKE0007:\n' + err) })

      this.$sessions.current.db
        .query('categories_powers/categories_powers', {group: true})
        .then(res => {
          that.categoriesList = []
          res.rows.forEach(e => {
            that.categoriesList.push(e.key)
          })
        })
        .catch(err => { alert('IKE0008:\n' + err) })
    },
    findText (array, value) {
      if (value === undefined || array === undefined) {
        return []
      }

      if (value.trim() === '') {
        return []
      }

      return array.filter(e => e.toLowerCase().includes(value.trim().toLowerCase()) && e !== value)
    },
    removeCategory (value) {
      this.dbData.categories.splice(this.dbData.categories.indexOf(value), 1)
    },
    refreshCounter () {
      this.timeAgo = tools.deltaT(
        this.$moment,
        this.dbData.start_date,
        this.dbData.start_hour,
        this.dbData.start_seconds,
        this.dbData.stop_date,
        this.dbData.stop_hour,
        this.dbData.stop_seconds)
    },
    saveconfirmed () {
      this.saveConfirmed = true
    }
  },
  computed: {
    subjectsFound () {
      return this.findText(this.subjectsList, this.dbData.subject)
    },
    categoriesFound () {
      return this.categoriesList.filter(e => !this.dbData.categories.includes(e))
    },
    newStartDateDisplay () {
      if (this.dbData.start_date && this.dbData.start_date != null) {
        return this.$moment(this.dbData.start_date, 'YYYY-MM-DD').format(this.$t('date_format'))
      }

      return ''
    },
    newStartHourDisplay () {
      if (this.dbData.start_hour && this.dbData.start_hour != null) {
        return this.$moment(this.dbData.start_hour + ':' + this.dbData.start_seconds, 'HH:mm:ss').format(this.$t('hour_format'))
      }

      return ''
    },
    newStopDateDisplay () {
      if (this.dbData.stop_date && this.dbData.stop_date != null) {
        return this.$moment(this.dbData.stop_date, 'YYYY-MM-DD').format(this.$t('date_format'))
      }

      return ''
    },
    newStopHourDisplay () {
      if (this.dbData.stop_hour && this.dbData.stop_hour != null) {
        return this.$moment(this.dbData.stop_hour + ':' + this.dbData.stop_seconds, 'HH:mm:ss').format(this.$t('hour_format'))
      }

      return ''
    }
  },
  mounted () {
    this.$eventBus.$on('setStop', this.setStop)
    this.$eventBus.$on('save', this.save)
    this.$eventBus.$on('saveconfirm', this.saveconfirmed)

    this.refreshData()

    let that = this
    setTimeout(() => {
      if (that.dbData.stop_date === null && that.dbData.stop_hour === null && that.dbData.stop_seconds === null) {
        setInterval(that.refreshCounter, 1000)
      } else {
        that.refreshCounter()
      }
    }, 750)

    this.$sessions.checkAndCreateViews()
      .then(() => {
        that.fetchAutocompleteData()

        that.$sessions.current.db
          .get('custom_fields')
          .then(doc => {
            that.customFields = doc.fields

            doc.fields.forEach(field => {
              if (that.dbData[field.name] === undefined) {
                that.$set(that.dbData, field.name, '')
              }
            })
          })
      })
  },
  components: {
    suggestionsList: SuggestionsList,
    customField: CustomField
  },
  destroyed () {
    this.$eventBus
      .$off('setStop', this.setStop)
      .$off('save', this.save)
      .$off('saveconfirm', this.saveconfirmed)
  }
}
</script>

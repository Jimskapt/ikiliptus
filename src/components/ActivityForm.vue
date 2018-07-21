<template>
  <v-form>
    <!-- <pre>{{dbData}}</pre> -->
    <p style="font-size:48px;text-align:center;">
      {{ timeAgo }}
    </p>

    <v-layout row>
      <v-flex xs6>
        <time-selector type="day" :label="$t('From')" v-model="dbData.start_date" :disabled="locked.includes('start_date')"></time-selector>
      </v-flex>
      <v-flex xs6>
        <time-selector type="hour" :label="$t('From')" v-model="dbData.start_hour" :seconds="dbData.start_seconds" :disabled="locked.includes('start_hour')"></time-selector>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex xs6>
        <time-selector type="day" :label="$t('To')" v-model="dbData.stop_date" :disabled="locked.includes('stop_date')"></time-selector>
      </v-flex>
      <v-flex xs6>
        <time-selector type="hour" :label="$t('To')" v-model="dbData.stop_hour" :seconds="dbData.stop_seconds" :disabled="locked.includes('stop_hour')"></time-selector>
      </v-flex>
    </v-layout>

    <v-text-field
      :label="$t('Subject')"
      v-model="dbData.subject"
      prepend-icon="label"
      append-icon="close"
      :append-icon-cb="() => {dbData.subject=''}"
    ></v-text-field>

    <suggestions-list
      name="subject"
      :list="subjectsFound"
      v-model="dbData.subject"
    ></suggestions-list>

    <v-select
      ref="categories"
      :label="$t('Categories')"
      v-model="dbData.categories"
      prepend-icon="move_to_inbox"
      chips
      tags
      clearable
    >
      <template slot="selection" slot-scope="data">
        <v-chip small close @input="removeCategory(data.item)">
          <strong>{{data.item}}</strong>
        </v-chip>
      </template>
    </v-select>

    <suggestions-list
      name="categories"
      :list="categoriesFound"
      v-model="dbData.categories"
    ></suggestions-list>

    <template v-for="item in $store.state[$store.state.manager.current].customFields.fields">
      <custom-field
        :key="'custom-' + item.name"
        :settings="item"
        v-model="dbData[item.name]"
      ></custom-field>
    </template>

    <v-text-field
      :label="$t('Details')"
      v-model="dbData.details"
      prepend-icon="comment"
      :disabled="locked.includes('details')"
      multi-line
      append-icon="close"
      :append-icon-cb="() => {dbData.details=''}"
    ></v-text-field>

    <v-snackbar :timeout="1000" top v-model="saveConfirmed" color="success">
      <v-icon dark>done</v-icon>
      {{ $t('Save confirmed') }}
      <v-btn flat @click="saveConfirmed = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-form>
</template>

<script>
import tools from '../tools';
import CustomField from '@/components/CustomField';
import TimeSelector from '@/components/TimeSelector';
import SuggestionsList from '@/components/SuggestionsList';

export default {
  name: 'ActivityForm',
  components: {
    suggestionsList: SuggestionsList,
    customField: CustomField,
    timeSelector: TimeSelector,
  },
  props: {
    id: {
      required: true,
    },
    locked: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },
    showCounter: {
      type: Boolean,
      required: false,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      subjectsList: [],
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
        details: '',
      },
      saveConfirmed: false,
    };
  },
  methods: {
    save(payload) {
      const that = this;

      this.$store
        .dispatch(
          this.$store.getters['manager/current']._id + '/saveActivity',
          {doc: that.dbData},
          {root: true})
        .then(() => {
          if (payload !== undefined && payload.origin !== undefined) {
            that.$eventBus.$emit('saveconfirm', payload);
          } else {
            that.$eventBus.$emit('saveconfirm');
          }
        })
        .catch((err) => { alert('IKE0046:\n' + err); });
    },
    setStop(args) {
      if (args === undefined) {
        args = new Date();
      }

      this.dbData.stop_date = this.$moment(args).format('YYYY-MM-DD');
      this.dbData.stop_hour = this.$moment(args).format('HH:mm');
      this.dbData.stop_seconds = args.getSeconds();

      this.save({origin: 'stop'});
    },
    refreshData() {
      if (this.id !== undefined) {
        this.$set(  this,
                    'dbData',
                    this.$store.getters[
                      this.$store.state.manager.current + '/activitiesByID'
                    ][this.id],
                );
      }
    },
    fetchAutocompleteData() {
      const that = this;

      this.$store.state[this.$store.state.manager.current].$db
        .query('subjects_powers/subjects_powers', {group: true})
        .then((res) => {
          that.subjectsList = [];
          res.rows.forEach((e) => {
            that.subjectsList.push(e.key);
          });
        });
        // .catch(err => { alert('IKE0005:\n' + err) })

      this.$store.state[this.$store.state.manager.current].$db
        .query('categories_powers/categories_powers', {group: true})
        .then((res) => {
          that.categoriesList = [];
          res.rows.forEach((e) => {
            that.categoriesList.push(e.key);
          });
        });
        // .catch(err => { alert('IKE0008:\n' + err) })
    },
    findText(array, value) {
      if (value === undefined || array === undefined) {
        return [];
      }

      if (value.trim() === '') {
        return [];
      }

      return array.filter((e) => {
        return e.toLowerCase().includes(value.trim().toLowerCase()) && e !== value;
      });
    },
    removeCategory(value) {
      this.dbData.categories.splice(this.dbData.categories.indexOf(value), 1);
    },
    refreshCounter() {
      this.timeAgo = tools.deltaT(
        this.$moment,
        this.dbData.start_date,
        this.dbData.start_hour,
        this.dbData.start_seconds,
        this.dbData.stop_date,
        this.dbData.stop_hour,
        this.dbData.stop_seconds);
    },
    saveconfirmed() {
      this.saveConfirmed = true;
    },
  },
  computed: {
    subjectsFound() {
      return this
        .findText(this.subjectsList, this.dbData.subject)
        .sort((a, b) => { return a.toLowerCase().localeCompare(b.toLowerCase()); });
    },
    categoriesFound() {
      return this.categoriesList
        .filter((e) => { return !this.dbData.categories.includes(e); })
        .sort((a, b) => { return a.toLowerCase().localeCompare(b.toLowerCase()); });
    },
    newStartDateDisplay() {
      if (this.dbData.start_date && this.dbData.start_date != null) {
        return this.$moment(this.dbData.start_date, 'YYYY-MM-DD').format(this.$t('date_format'));
      }

      return '';
    },
    newStartHourDisplay() {
      if (this.dbData.start_hour && this.dbData.start_hour != null) {
        return this.$moment(
          this.dbData.start_hour + ':' + this.dbData.start_seconds,
          'HH:mm:ss',
        ).format(this.$t('hour_format'));
      }

      return '';
    },
    newStopDateDisplay() {
      if (this.dbData.stop_date && this.dbData.stop_date != null) {
        return this.$moment(this.dbData.stop_date, 'YYYY-MM-DD').format(this.$t('date_format'));
      }

      return '';
    },
    newStopHourDisplay() {
      if (this.dbData.stop_hour && this.dbData.stop_hour != null) {
        return this.$moment(
          this.dbData.stop_hour + ':' + this.dbData.stop_seconds,
          'HH:mm:ss',
        ).format(this.$t('hour_format'));
      }

      return '';
    },
  },
  watch: {
    id(newValue, oldValue) {
      this.refreshData();
    },
  },
  mounted() {
    this.$eventBus.$on('setStop', this.setStop);
    this.$eventBus.$on('save', this.save);
    this.$eventBus.$on('saveconfirm', this.saveconfirmed);

    this.refreshData();

    const that = this;
    setTimeout(() => {
      if (  that.dbData.stop_date === null &&
            that.dbData.stop_hour === null &&
            that.dbData.stop_seconds === null) {
        setInterval(that.refreshCounter, 1000);
      } else {
        that.refreshCounter();
      }
    }, 750);

    that.fetchAutocompleteData();
    that.$store.state[that.$store.state.manager.current].customFields.fields.forEach((field) => {
      if (that.dbData[field.name] === undefined) {
        that.$set(that.dbData, field.name, '');
      }
    });
  },
  destroyed() {
    this.$eventBus
      .$off('setStop', this.setStop)
      .$off('save', this.save)
      .$off('saveconfirm', this.saveconfirmed);
  },
};
</script>

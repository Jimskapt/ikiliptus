<template>
  <div>
    <template v-if="!disabled">
      <v-menu
        ref="showMenu"
        v-bind:close-on-content-click="false"
        v-model="showMenu"
        v-bind:return-value.sync="showMenu"
        full-width
      >
        <template v-if="type === 'day'">
          <v-text-field
            v-bind:label="label"
            v-model="dayDisplay"
            prepend-icon="event"
            slot="activator"
            readonly
            append-icon="close"
            v-bind:append-icon-cb="() => {$emit('change', null)}"
          ></v-text-field>
          <v-date-picker
            v-model="copyValue"
            no-title
            scrollable
            full-width
            v-bind:locale="$settings.locale.get()"
            v-bind:first-day-of-week="parseInt($t('vuetify_first-day-of-week'))"
          >
            <v-btn block color="error" v-on:click="showMenu = false">{{$t('Abort')}}</v-btn>
            <v-btn block color="success" v-on:click="$refs.showMenu.save(copyValue)">{{$t('OK')}}</v-btn>
          </v-date-picker>
        </template>
        <template v-else>
          <v-text-field
            v-bind:label="label"
            v-model="hourDisplay"
            prepend-icon="schedule"
            slot="activator"
            readonly
            append-icon="close"
            v-bind:append-icon-cb="() => {$emit('change', null)}"
          ></v-text-field>
          <v-time-picker
            scrollable
            full-width
            v-model="copyValue"
            v-on:change="$refs.showMenu.save(copyValue)"
            v-bind:format="$t('vuetify_clock_format')"
          ></v-time-picker>
        </template>
      </v-menu>
    </template>
    <template v-else>
      <v-text-field
        v-bind:label="label"
        v-model="dayDisplay"
        prepend-icon="event"
        disabled
        readonly
        v-if="type === 'day'"
      ></v-text-field>
      <v-text-field
        v-bind:label="label"
        v-model="hourDisplay"
        prepend-icon="schedule"
        disabled
        readonly
        v-else
      ></v-text-field>
    </template>
  </div>
</template>

<script>
export default {
  name: 'TimeSelector',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: ['type', 'label', 'disabled', 'value', 'seconds'],
  data () {
    return {
      showMenu: false,
      copyValue: this.value
    }
  },
  watch: {
    copyValue (newValue) {
      this.$emit('change', newValue)
    }
  },
  computed: {
    dayDisplay () {
      if (this.value && this.value != null) {
        return this.$moment(this.value, 'YYYY-MM-DD').format(this.$t('date_format'))
      }

      return ''
    },
    hourDisplay () {
      if (this.value && this.value != null) {
        return this.$moment(this.value + ':' + this.seconds, 'HH:mm:ss').format(this.$t('hour_format'))
      }

      return ''
    }
  }
}
</script>

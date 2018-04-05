<template>
  <div>

    <v-container>
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title primary-title dark color="primary">
            <v-btn icon>
              <v-icon>trending_up</v-icon>
            </v-btn>
            <span>{{ $t("Analytics") }}</span>
          </v-card-title>
        </v-toolbar>

        <v-container>
          <v-layout row>
            <v-flex>
              <v-switch v-bind:label="$t('From')" v-model="from"></v-switch>
            </v-flex>
            <v-flex>
              <span v-if="from">
                <v-layout row>
                  <v-flex xs6>
                    <v-menu
                      ref="fromDateMenu"
                      v-bind:close-on-content-click="false"
                      v-model="fromDateMenu"
                      v-bind:return-value.sync="fromDateMenu"
                      full-width
                    >
                      <v-text-field
                        v-bind:label="$t('From')"
                        v-model="fromDateDisplay"
                        prepend-icon="event"
                        slot="activator"
                        readonly
                        append-icon="close"
                        v-bind:append-icon-cb="() => {fromDate=null}"
                      ></v-text-field>
                      <v-date-picker v-model="fromDate" no-title scrollable full-width>
                        <v-spacer></v-spacer>
                        <v-btn color="error" v-on:click="fromDateMenu = false">{{$t('Abort')}}</v-btn>
                        <v-btn color="success" v-on:click="$refs.fromDateMenu.save(fromDate)">{{$t('OK')}}</v-btn>
                      </v-date-picker>
                    </v-menu>
                  </v-flex>
                  <v-flex xs6>
                    <v-menu
                      ref="fromHourMenu"
                      v-bind:close-on-content-click="false"
                      v-model="fromHourMenu"
                      v-bind:return-value.sync="fromHourMenu"
                      full-width
                    >
                      <v-text-field
                        v-bind:label="$t('From')"
                        v-model="fromHourDisplay"
                        prepend-icon="schedule"
                        slot="activator"
                        readonly
                        append-icon="close"
                        v-bind:append-icon-cb="() => {fromHour=null}"
                      ></v-text-field>
                      <v-time-picker scrollable full-width
                        v-model="fromHour"
                        v-on:change="$refs.fromHourMenu.save(fromHour)"
                      ></v-time-picker>
                    </v-menu>
                  </v-flex>
                </v-layout>
              </span>
              <span v-else>{{ $t('anytime') }}</span>
            </v-flex>
          </v-layout>

          <v-layout row>
            <v-flex>
              <v-switch v-bind:label="$t('To')" v-model="to"></v-switch>
            </v-flex>
            <v-flex>
              <span v-if="to">
                <v-layout row>
                  <v-flex xs6>
                    <v-menu
                      ref="toDateMenu"
                      v-bind:close-on-content-click="false"
                      v-model="toDateMenu"
                      v-bind:return-value.sync="toDateMenu"
                      full-width
                    >
                      <v-text-field
                        v-bind:label="$t('To')"
                        v-model="toDateDisplay"
                        prepend-icon="event"
                        slot="activator"
                        readonly
                        append-icon="close"
                        v-bind:append-icon-cb="() => {toDate=null}"
                      ></v-text-field>
                      <v-date-picker v-model="toDate" no-title scrollable full-width>
                        <v-spacer></v-spacer>
                        <v-btn color="error" v-on:click="toDateMenu = false">{{$t('Abort')}}</v-btn>
                        <v-btn color="success" v-on:click="$refs.toDateMenu.save(toDate)">{{$t('OK')}}</v-btn>
                      </v-date-picker>
                    </v-menu>
                  </v-flex>
                  <v-flex xs6>
                    <v-menu
                      ref="toHourMenu"
                      v-bind:close-on-content-click="false"
                      v-model="toHourMenu"
                      v-bind:return-value.sync="toHourMenu"
                      full-width
                    >
                      <v-text-field
                        v-bind:label="$t('To')"
                        v-model="toHourDisplay"
                        prepend-icon="schedule"
                        slot="activator"
                        readonly
                        append-icon="close"
                        v-bind:append-icon-cb="() => {toHour=null}"
                      ></v-text-field>
                      <v-time-picker scrollable full-width
                        v-model="toHour"
                        v-on:change="$refs.toHourMenu.save(toHour)"
                      ></v-time-picker>
                    </v-menu>
                  </v-flex>
                </v-layout>
              </span>
              <span v-else>{{ $t('anytime') }}</span>
            </v-flex>
          </v-layout>

          <v-btn icon v-on:click="randomize">
            <v-icon>shuffle</v-icon>
          </v-btn>

          <v-divider></v-divider>

          <bar-chart v-bind:chart-data="activitiesCollection" v-bind:height="100"></bar-chart>
          <bar-chart v-bind:chart-data="durationsCollection" v-bind:height="100" v-bind:options="hoursOptions"></bar-chart>
        </v-container>
      </v-card>
    </v-container>

  </div>
</template>

<script>
import Vue from 'vue'
import { Bar, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  name: 'Analytics',
  data () {
    let that = this

    return {
      from: false,
      to: false,
      fromDateMenu: false,
      fromHourMenu: false,
      fromDate: '1990-01-01',
      fromHour: '00:00',
      toDateMenu: false,
      toHourMenu: false,
      toDate: '1990-01-01',
      toHour: '00:00',
      randomizedData: {},
      hoursOptions: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                callback (value, index, values) {
                  return that.secondsDurationToFormatedHours(value)
                }
              }
            }
          ]
        },
        tooltips: {
          callbacks: {
            label (tooltipItem, data) {
              return that.secondsDurationToFormatedHours(tooltipItem.yLabel)
            }
          }
        }
      }
    }
  },
  methods: {
    randomize () {
      let date = (2000 + Math.floor(Math.random() * 18)) + '-' + Math.floor(Math.random() * 12) + '-' + Math.floor(Math.random() * 28)
      let hours = Math.floor(Math.random() * 800)
      let minutes = Math.floor(Math.random() * 59)
      let seconds = Math.floor(Math.random() * 59)
      let duration = hours * 3600 + minutes * 60 + seconds
      let result = {
        count: (Math.floor(Math.random() * 40) + 1),
        duration: duration
      }
      Vue.set(this.randomizedData, date, result)
    },
    secondsDurationToFormatedHours (value) {
      let hours = Math.floor(this.$moment.duration(value, 'seconds').asHours())
      let minutes = Math.floor(this.$moment.duration(value - hours * 3600, 'seconds').asMinutes())
      let seconds = Math.floor(this.$moment.duration(value - hours * 3600 - minutes * 60, 'seconds').asSeconds())

      let result = ''
      if (hours < 10) {
        result += '00'
      } else if (hours < 100) {
        result += '0'
      }
      result += hours + ':'
      if (minutes < 10) {
        result += '0'
      }
      result += minutes + ':'
      if (seconds < 10) {
        result += '0'
      }
      result += seconds

      return result
    }
  },
  computed: {
    fromDateDisplay () {
      if (this.fromDate && this.fromDate != null) {
        return this.$moment(this.fromDate, 'YYYY-MM-DD').format(this.$t('date_format'))
      }

      return ''
    },
    fromHourDisplay () {
      if (this.fromHour && this.fromHour != null) {
        return this.$moment(this.fromHour + ':00', 'HH:mm:ss').format(this.$t('hour_format'))
      }

      return ''
    },
    toDateDisplay () {
      if (this.toDate && this.toDate != null) {
        return this.$moment(this.toDate, 'YYYY-MM-DD').format(this.$t('date_format'))
      }

      return ''
    },
    toHourDisplay () {
      if (this.toHour && this.toHour != null) {
        return this.$moment(this.toHour + ':00', 'HH:mm:ss').format(this.$t('hour_format'))
      }

      return ''
    },
    activitiesCollection () {
      let labels = []
      Object.keys(this.randomizedData).forEach(key => {
        labels.push(key)
      })
      labels.sort()

      let counts = []
      labels.forEach(key => {
        counts.push(this.randomizedData[key].count)
      })

      return {
        labels: labels,
        datasets: [
          {
            label: 'activities',
            backgroundColor: '#0000FF',
            data: counts
          }
        ]
      }
    },
    durationsCollection () {
      let labels = []
      Object.keys(this.randomizedData).forEach(key => {
        labels.push(key)
      })
      labels.sort()

      let durations = []
      labels.forEach(key => {
        durations.push(this.randomizedData[key].duration)
      })

      return {
        labels: labels,
        datasets: [
          {
            label: 'durations',
            backgroundColor: '#00FF00',
            data: durations
          }
        ]
      }
    }
  },
  components: {
    barChart: {
      extends: Bar,
      mixins: [reactiveProp],
      props: ['options'],
      mounted () {
        this.renderChart(this.chartData, this.options)
      }
    }
  },
  mounted () {
    this.randomize()
    this.randomize()
    this.randomize()
  }
}
</script>

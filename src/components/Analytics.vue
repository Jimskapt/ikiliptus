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
            <v-flex>
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
          </v-layout>

          <v-divider></v-divider>

          <line-chart v-bind:chart-data="activitiesCollection" v-bind:height="150" v-bind:options="activitiesOptions"></line-chart>
        </v-container>
      </v-card>
    </v-container>

  </div>
</template>

<script>
import Vue from 'vue'
import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  name: 'Analytics',
  data () {
    let that = this

    return {
      from: false,
      to: false,
      fromDateMenu: false,
      fromDate: null,
      toDateMenu: false,
      toDate: null,
      activitiesOptions: {
        scales: {
          yAxes: [
            {
              id: 'time-axis',
              type: 'linear',
              position: 'left',
              ticks: {
                beginAtZero: true,
                callback (value, index, values) {
                  return that.secondsDurationToFormatedHours(value)
                }
              }
            },
            {
              id: 'counter-axis',
              type: 'linear',
              position: 'right',
              ticks: {
                beginAtZero: true
              }
            }
          ]
        },
        tooltips: {
          callbacks: {
            label (tooltipItem, data) {
              if (tooltipItem.datasetIndex === 0) {
                return that.secondsDurationToFormatedHours(tooltipItem.yLabel)
              } else {
                return tooltipItem.yLabel
              }
            }
          }
        }
      },
      activitiesPerDay: {},
      durationsPerDay: {}
    }
  },
  methods: {
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
    toDateDisplay () {
      if (this.toDate && this.toDate != null) {
        return this.$moment(this.toDate, 'YYYY-MM-DD').format(this.$t('date_format'))
      }

      return ''
    },
    activitiesCollection () {
      let that = this

      let labels = []
      Object.keys(this.activitiesPerDay).forEach(dateString => {
        let date = that.$moment(dateString, 'YYYY-MM-DD')
        let inject = true

        if (that.from && that.fromDate !== null && that.fromDate !== undefined) {
          if (date < that.$moment(that.fromDate, 'YYYY-MM-DD')) {
            inject = false
          }
        }
        if (that.to && that.toDate !== null && that.toDate !== undefined) {
          if (date > that.$moment(that.toDate, 'YYYY-MM-DD')) {
            inject = false
          }
        }

        if (inject) {
          labels.push(dateString)
        }
      })
      let durations = []
      let counter = []

      labels.forEach(label => {
        if (that.durationsPerDay[label] === undefined) {
          durations.push(0)
        } else {
          durations.push(that.durationsPerDay[label])
        }

        if (that.activitiesPerDay[label] === undefined) {
          counter.push(0)
        } else {
          counter.push(that.activitiesPerDay[label])
        }
      })

      return {
        labels: labels,
        datasets: [
          {
            label: that.$t('Total durations per day'),
            borderColor: '#0000FF',
            fill: false,
            yAxisID: 'time-axis',
            data: durations
          },
          {
            label: that.$t('Total activities per day'),
            borderColor: '#00FFFF',
            fill: false,
            yAxisID: 'counter-axis',
            data: counter
          }
        ]
      }
    }
  },
  components: {
    lineChart: {
      extends: Line,
      mixins: [reactiveProp],
      props: ['options'],
      mounted () {
        this.renderChart(this.chartData, this.options)
      }
    }
  },
  mounted () {
    let that = this
    this.db.checkAndCreateViews()
      .then(() => {
        that.db.kernel
          .query('activities_per_day/activities_per_day', {group: true})
          .then(res => {
            that.activitiesPerDay = {}
            res.rows.forEach(e => {
              Vue.set(that.activitiesPerDay, e.key, e.value)
            })
          })
      })
      .then(() => {
        that.db.kernel
          .query('duration_per_day/duration_per_day', {group: true})
          .then(res => {
            that.durationsPerDay = {}
            res.rows.forEach(e => {
              Vue.set(that.durationsPerDay, e.key, e.value)
            })
          })
      })
  }
}
</script>

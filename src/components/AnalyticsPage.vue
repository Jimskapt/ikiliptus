<template>
  <div>
    <v-container>
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title primary-title dark color="primary">
            <v-btn icon>
              <v-icon>search</v-icon>
            </v-btn>
            <span>{{ $t("Search") }}</span>
          </v-card-title>
        </v-toolbar>

        <v-container>
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
            <v-date-picker
              v-model="fromDate"
              no-title
              scrollable
              full-width
              v-bind:locale="$settings.locale.get()"
              v-bind:first-day-of-week="parseInt($t('vuetify_first-day-of-week'))"
            >
              <v-spacer></v-spacer>
              <v-btn color="error" v-on:click="fromDateMenu = false">{{$t('Abort')}}</v-btn>
              <v-btn color="success" v-on:click="$refs.fromDateMenu.save(fromDate)">{{$t('OK')}}</v-btn>
            </v-date-picker>
          </v-menu>

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
            <v-date-picker
              v-model="toDate"
              no-title
              scrollable
              full-width
              v-bind:locale="$settings.locale.get()"
              v-bind:first-day-of-week="parseInt($t('vuetify_first-day-of-week'))"
            >
              <v-spacer></v-spacer>
              <v-btn color="error" v-on:click="toDateMenu = false">{{$t('Abort')}}</v-btn>
              <v-btn color="success" v-on:click="$refs.toDateMenu.save(toDate)">{{$t('OK')}}</v-btn>
            </v-date-picker>
          </v-menu>

        </v-container>

        <div v-if="customFields.length > 0">
          <v-divider></v-divider>
          <v-container>
            <template v-for="(item, i) in customFields">
              <v-layout row v-bind:key="'row-' + i">
                <v-flex xs1>
                  <v-switch v-model="customSettings[item.name].enabled"></v-switch>
                </v-flex>
                <v-flex xs11>
                  <custom-field
                    v-bind:key="'custom-' + item.name"
                    v-bind:settings="item"
                    v-bind:value="customSettings[item.name].value"
                    v-bind:disabled="!customSettings[item.name].enabled"
                    v-on:customfieldchange="customfieldchange"
                  ></custom-field>
                </v-flex>
              </v-layout>
            </template>
          </v-container>
        </div>
      </v-card>
    </v-container>

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

        <v-tabs v-model="viewTab" dark color="primary" slider-color="secondary">
          <v-tab>
            <v-icon>timeline</v-icon>
            <span>&nbsp;{{ $t('Global') }}</span>
          </v-tab>
          <v-tab-item>
            <v-container>
              <h2 style="text-align:center;margin-top:20px;">{{ $t('Activities') }} :</h2>
              <line-chart v-bind:chart-data="activitiesCollection" v-bind:height="350" v-bind:options="activitiesOptions"></line-chart>
            </v-container>
          </v-tab-item>
          <v-tab>
            <v-icon>label_outline</v-icon>
            <span>&nbsp;{{ $t('Categories') }}</span>
          </v-tab>
          <v-tab-item>
            <v-container>
              <h2 style="text-align:center;margin-top:20px;">{{ $t('Categories') }} :</h2>
              <pie-chart v-bind:chart-data="categoriesCollection" v-bind:height="350" v-bind:options="categoriesOptions"></pie-chart>

              <p></p>
              <v-divider></v-divider>

              <h2 style="text-align:center;margin-top:20px;">{{ $t('Categories per day') }} :</h2>
              <bar-chart v-bind:chart-data="categoriesPerDayCollection" v-bind:height="350" v-bind:options="categoriesPerDayOptions"></bar-chart>
            </v-container>
          </v-tab-item>
        </v-tabs>

      </v-card>
    </v-container>

  </div>
</template>

<script>
import Vue from 'vue'
import tools from '../tools/index.js'
import CustomField from '@/components/CustomField'
import { Line, Pie, Bar, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  name: 'AnalyticsPage',
  components: {
    customField: CustomField,
    lineChart: {
      extends: Line,
      mixins: [reactiveProp],
      props: ['options'],
      mounted () {
        this.renderChart(this.chartData, this.options)
      }
    },
    pieChart: {
      extends: Pie,
      mixins: [reactiveProp],
      props: ['options'],
      mounted () {
        this.renderChart(this.chartData, this.options)
      }
    },
    barChart: {
      extends: Bar,
      mixins: [reactiveProp],
      props: ['options'],
      mounted () {
        this.renderChart(this.chartData, this.options)
      }
    }
  },
  data () {
    let that = this

    return {
      from: false,
      to: false,
      fromDateMenu: false,
      fromDate: null,
      toDateMenu: false,
      toDate: null,
      wantVoluntary: true,
      wantNotVoluntary: true,
      activities: [],
      viewTab: null,
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
      categoriesOptions: {
        legend: {
          display: false
        },
        tooltips: {
          callbacks: {
            label (tooltipItem, data) {
              if (tooltipItem.datasetIndex === 0) {
                return data.labels[tooltipItem.index] + ' : ' +
                that.secondsDurationToFormatedHours(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index])
              } else {
                return data.labels[tooltipItem.index] + ' : ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
              }
            }
          }
        }
      },
      categoriesPerDayOptions: {
        legend: {
          display: false
        },
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
            }
          ]
        },
        tooltips: {
          callbacks: {
            label (tooltipItem, data) {
              return data.datasets[tooltipItem.datasetIndex].label + ' : ' +
              that.secondsDurationToFormatedHours(tooltipItem.yLabel)
            }
          }
        }
      },
      activitiesPerDay: {},
      durationsPerDay: {},
      durationsPerCategory: {},
      durationsPerCategoryAndDay: {},
      categoriesPowers: {},
      customFields: [],
      customSettings: {}
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
    },
    customfieldchange (payload) {
      if (payload !== undefined && payload.field !== undefined && payload.value !== undefined) {
        this.customSettings[payload.field].value = payload.value
      }
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
    filteredActivities () {
      let that = this
      return this.activities.filter(activity => {
        let result = true

        if (that.fromDate !== null && that.fromDate !== undefined && activity.start_date !== undefined) {
          result &= (that.$moment(activity.start_date, 'YYYY-MM-DD') >= that.$moment(that.fromDate, 'YYYY-MM-DD'))
        }

        if (that.toDate !== null && that.toDate !== undefined && activity.stop_date !== undefined) {
          result &= (that.$moment(activity.stop_date, 'YYYY-MM-DD') < that.$moment(that.toDate, 'YYYY-MM-DD'))
        }

        that.customFields.forEach(customField => {
          if (that.customSettings[customField.name].enabled) {
            if (activity[customField.name] !== undefined) {
              let value = that.customSettings[customField.name].value
              if (customField.type === 'checkbox' && value === false) {
                value = ''
              }
              result &= (activity[customField.name] === value)
            } else {
              result &= false
            }
          }
        })

        return result
      })
    },
    categoriesCollection () {
      let that = this

      let data = {}
      this.filteredActivities.forEach(activity => {
        if (activity.start_date && activity.start_hour && activity.stop_date && activity.stop_hour && activity.categories && activity.categories.length > 0) {
          activity.categories.forEach(category => {
            let deltaT = tools.deltaT(
              that.$moment,
              activity.start_date,
              activity.start_hour,
              activity.start_seconds,
              activity.stop_date,
              activity.stop_hour,
              activity.stop_seconds)
            let $deltaT = that.$moment.duration(deltaT)

            let newDuration = $deltaT.get('hours') * 3600 + $deltaT.get('minutes') * 60 + $deltaT.get('seconds')

            if (data[category] !== undefined) {
              newDuration += data[category]
            }

            Vue.set(data, category, newDuration)
          })
        }
      })

      let labels = Object.keys(data)
      labels = labels.sort((a, b) => data[b] - data[a])

      let durations = []
      let colors = []
      labels.forEach(e => {
        durations.push(data[e])
        colors.push(tools.computeColorFromText(e))
      })

      return {
        labels: labels,
        datasets: [
          {
            label: that.$t('Total duration per category'),
            backgroundColor: colors,
            borderColor: '#555',
            data: durations
          }
        ]
      }
    },
    categoriesPerDayCollection () {
      let that = this

      let data = {}
      this.filteredActivities.forEach(activity => {
        if (activity.start_date && activity.start_hour && activity.stop_date && activity.stop_hour && activity.categories && activity.categories.length > 0) {
          activity.categories.forEach(category => {
            let deltaT = tools.deltaT(
              that.$moment,
              activity.start_date,
              activity.start_hour,
              activity.start_seconds,
              activity.stop_date,
              activity.stop_hour,
              activity.stop_seconds)
            let $deltaT = that.$moment.duration(deltaT)

            let newDuration = $deltaT.get('hours') * 3600 + $deltaT.get('minutes') * 60 + $deltaT.get('seconds')

            if (data[category] === undefined) {
              Vue.set(data, category, {})
            }

            if (data[category][activity.start_date] !== undefined) {
              newDuration += data[category][activity.start_date]
            }

            Vue.set(data[category], activity.start_date, newDuration)
          })
        }
      })

      let labels = []
      Object.keys(data).forEach(category => {
        Object.keys(data[category]).forEach(day => {
          if (!labels.includes(day)) {
            labels.push(day)
          }
        })
      })
      labels.sort()

      let datasets = []
      Object.keys(data).forEach(category => {
        let obj = {
          label: category,
          backgroundColor: tools.computeColorFromText(category),
          borderColor: '#555',
          borderWidth: 1,
          stack: 'Stack 0',
          data: []
        }
        labels.forEach(day => {
          if (data[category][day] === undefined) {
            obj.data.push(0)
          } else {
            obj.data.push(data[category][day])
          }
        })
        datasets.push(obj)
      })

      return {
        labels: labels,
        datasets: datasets
      }
    },
    activitiesCollection () {
      let that = this

      let data = {}
      this.filteredActivities.forEach(activity => {
        if (activity.start_date && activity.start_hour && activity.stop_date && activity.stop_hour) {
          let deltaT = tools.deltaT(
            that.$moment,
            activity.start_date,
            activity.start_hour,
            activity.start_seconds,
            activity.stop_date,
            activity.stop_hour,
            activity.stop_seconds)
          let $deltaT = that.$moment.duration(deltaT)

          let newDuration = $deltaT.get('hours') * 3600 + $deltaT.get('minutes') * 60 + $deltaT.get('seconds')
          let newCounter = 1
          if (data[activity.start_date] !== undefined) {
            newDuration += data[activity.start_date].duration
            newCounter = data[activity.start_date].count + 1
          }
          Vue.set(data, activity.start_date, {
            duration: newDuration,
            count: newCounter
          })
        }
      })

      let labels = Object.keys(data)
      labels.sort()
      let durations = []
      let counter = []

      labels.forEach(label => {
        if (data[label] === undefined || data[label].duration === undefined) {
          durations.push(0)
        } else {
          durations.push(data[label].duration)
        }

        if (data[label] === undefined || data[label].count === undefined) {
          counter.push(0)
        } else {
          counter.push(data[label].count)
        }
      })

      return {
        labels: labels,
        datasets: [
          {
            label: that.$t('Total durations per day'),
            borderColor: that.$vuetify.theme.primary,
            fill: false,
            yAxisID: 'time-axis',
            data: durations
          },
          {
            label: that.$t('Total activities per day'),
            borderColor: that.$vuetify.theme.secondary,
            fill: false,
            yAxisID: 'counter-axis',
            data: counter
          }
        ]
      }
    }
  },
  mounted () {
    let that = this
    that.$sessions.checkAndCreateViews()
      .then(() => {
        that.$sessions.current.db
          .query('all_activities/all_activities', {include_docs: true})
          .then(res => {
            that.activities = []

            let filtered = res.rows
              .filter(e => e.doc.stop_date !== undefined && e.doc.stop_hour !== undefined)

            for (let i = 0; i < filtered.length; i++) {
              that.activities.push(filtered[i].doc)
            }

            that.loaded = true
          })
          .catch(err => alert('IKE0030:\n' + err))

        that.$sessions.current.db
          .get('custom_fields')
          .then(doc => {
            that.customFields = doc.fields

            that.customSettings = {}
            doc.fields.forEach(field => {
              Vue.set(that.customSettings, field.name, {
                enabled: false,
                value: ((field.type === 'checkbox') ? false : '')
              })
            })
          })
      })
      .catch(err => alert('IKE0031:\n' + err))
  }
}
</script>

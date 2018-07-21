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
          <time-selector type="day" :label="$t('From')" v-model="fromDate"></time-selector>
          <time-selector type="day" :label="$t('To')" v-model="toDate"></time-selector>
        </v-container>

        <div v-if="customSettings !== undefined && Object.keys(customSettings).length > 0">
          <v-divider></v-divider>
          <v-container>
            <template v-for="(item, i) in $store.state[$store.state.manager.current].customFields.fields">
              <v-layout align-baseline row :key="'row-' + i">
                <v-flex xs2 sm1>
                  <v-switch v-model="customSettings[item.name].enabled"></v-switch>
                </v-flex>
                <v-flex xs10 sm11>
                  <custom-field
                    :key="'custom-' + item.name"
                    :settings="item"
                    :disabled="!customSettings[item.name].enabled"
                    v-model="customSettings[item.name].value"
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
              <line-chart :chart-data="activitiesCollection" :height="350" :options="activitiesOptions"></line-chart>
            </v-container>
          </v-tab-item>
          <v-tab>
            <v-icon>label_outline</v-icon>
            <span>&nbsp;{{ $t('Categories') }}</span>
          </v-tab>
          <v-tab-item>
            <v-container>
              <h2 style="text-align:center;margin-top:20px;">{{ $t('Categories') }} :</h2>
              <pie-chart :chart-data="categoriesCollection" :height="350" :options="categoriesOptions"></pie-chart>

              <p></p>
              <v-divider></v-divider>

              <h2 style="text-align:center;margin-top:20px;">{{ $t('Categories per day') }} :</h2>
              <bar-chart :chart-data="categoriesPerDayCollection" :height="350" :options="categoriesPerDayOptions"></bar-chart>
            </v-container>
          </v-tab-item>
        </v-tabs>

      </v-card>
    </v-container>

  </div>
</template>

<script>
import Vue from 'vue';
import tools from '../tools';
import CustomField from '@/components/CustomField';
import TimeSelector from '@/components/TimeSelector';
import { Line, Pie, Bar, mixins } from 'vue-chartjs';
const { reactiveProp } = mixins;

export default {
  name: 'AnalyticsPage',
  components: {
    customField: CustomField,
    timeSelector: TimeSelector,
    lineChart: {
      extends: Line,
      mixins: [reactiveProp],
      props: ['options'],
      mounted() {
        this.renderChart(this.chartData, this.options);
      },
    },
    pieChart: {
      extends: Pie,
      mixins: [reactiveProp],
      props: ['options'],
      mounted() {
        this.renderChart(this.chartData, this.options);
      },
    },
    barChart: {
      extends: Bar,
      mixins: [reactiveProp],
      props: ['options'],
      mounted() {
        this.renderChart(this.chartData, this.options);
      },
    },
  },
  data() {
    const that = this;

    return {
      from: false,
      to: false,
      fromDateMenu: false,
      fromDate: null,
      toDateMenu: false,
      toDate: null,
      wantVoluntary: true,
      wantNotVoluntary: true,
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
                callback(value, index, values) {
                  return that.secondsDurationToFormatedHours(value);
                },
              },
            },
            {
              id: 'counter-axis',
              type: 'linear',
              position: 'right',
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
        tooltips: {
          callbacks: {
            label(tooltipItem, data) {
              if (tooltipItem.datasetIndex === 0) {
                return that.secondsDurationToFormatedHours(tooltipItem.yLabel);
              } else {
                return tooltipItem.yLabel;
              }
            },
          },
        },
      },
      categoriesOptions: {
        legend: {
          display: false,
        },
        tooltips: {
          callbacks: {
            label(tooltipItem, data) {
              if (tooltipItem.datasetIndex === 0) {
                return data.labels[tooltipItem.index] + ' : ' +
                  that.secondsDurationToFormatedHours(
                    data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]);
              } else {
                return data.labels[tooltipItem.index] + ' : ' +
                  data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
              }
            },
          },
        },
      },
      categoriesPerDayOptions: {
        legend: {
          display: false,
        },
        scales: {
          yAxes: [
            {
              id: 'time-axis',
              type: 'linear',
              position: 'left',
              ticks: {
                beginAtZero: true,
                callback(value, index, values) {
                  return that.secondsDurationToFormatedHours(value);
                },
              },
            },
          ],
        },
        tooltips: {
          callbacks: {
            label(tooltipItem, data) {
              return data.datasets[tooltipItem.datasetIndex].label + ' : ' +
              that.secondsDurationToFormatedHours(tooltipItem.yLabel);
            },
          },
        },
      },
      activitiesPerDay: {},
      durationsPerDay: {},
      durationsPerCategory: {},
      durationsPerCategoryAndDay: {},
      categoriesPowers: {},
      customSettings: {},
    };
  },
  methods: {
    secondsDurationToFormatedHours(value) {
      const hours = Math.floor(this.$moment.duration(value, 'seconds').asHours());
      const minutes = Math.floor(
        this.$moment.duration(value - hours * 3600, 'seconds').asMinutes());
      const seconds = Math.floor(
        this.$moment.duration(value - hours * 3600 - minutes * 60, 'seconds').asSeconds());

      let result = '';
      if (hours < 10) {
        result += '00';
      } else if (hours < 100) {
        result += '0';
      }
      result += hours + ':';
      if (minutes < 10) {
        result += '0';
      }
      result += minutes + ':';
      if (seconds < 10) {
        result += '0';
      }
      result += seconds;

      return result;
    },
  },
  computed: {
    activities() {
      return this.$store.getters[
        this.$store.getters['manager/current']._id + '/activitiesSortedByTime'
      ] || [];
    },
    filteredActivities() {
      const that = this;
      return this.activities.filter((activity) => {
        let result = true;

        if (  that.fromDate !== null &&
              that.fromDate !== undefined &&
              activity.start_date !== undefined) {
          result &=
            (that.$moment(activity.start_date, 'YYYY-MM-DD') >= that.$moment(that.fromDate, 'YYYY-MM-DD'));
        }

        if (  that.toDate !== null &&
              that.toDate !== undefined &&
              activity.stop_date !== undefined) {
          result &=
            (that.$moment(activity.stop_date, 'YYYY-MM-DD') < that.$moment(that.toDate, 'YYYY-MM-DD'));
        }

        that.$store.state[
          that.$store.state.manager.current
        ].customFields.fields.forEach((customField) => {
          if (that.customSettings[customField.name] !== undefined) {
            if (that.customSettings[customField.name].enabled) {
              if (activity[customField.name] !== undefined) {
                let value = that.customSettings[customField.name].value;
                if (customField.type === 'checkbox' && value === false) {
                  value = '';
                }
                result &= (activity[customField.name] === value);
              } else {
                result &= false;
              }
            }
          }
        });

        return result;
      });
    },
    categoriesCollection() {
      const that = this;

      const data = {};
      this.filteredActivities.forEach((activity) => {
        if (  activity.start_date &&
              activity.start_hour &&
              activity.stop_date &&
              activity.stop_hour &&
              activity.categories &&
              activity.categories.length > 0) {
          activity.categories.forEach((category) => {
            const deltaT = tools.deltaT(
              that.$moment,
              activity.start_date,
              activity.start_hour,
              activity.start_seconds,
              activity.stop_date,
              activity.stop_hour,
              activity.stop_seconds);
            const $deltaT = that.$moment.duration(deltaT);

            let newDuration = $deltaT.get('hours') * 3600;
            newDuration += $deltaT.get('minutes') * 60;
            newDuration += $deltaT.get('seconds');

            if (data[category] !== undefined) {
              newDuration += data[category];
            }

            Vue.set(data, category, newDuration);
          });
        }
      });

      let labels = Object.keys(data);
      labels = labels.sort((a, b) => data[b] - data[a]);

      const durations = [];
      const colors = [];
      labels.forEach((e) => {
        durations.push(data[e]);
        colors.push(tools.computeColorFromText(e));
      });

      return {
        labels: labels,
        datasets: [
          {
            label: that.$t('Total duration per category'),
            backgroundColor: colors,
            borderColor: '#555',
            data: durations,
          },
        ],
      };
    },
    categoriesPerDayCollection() {
      const that = this;

      const data = {};
      this.filteredActivities.forEach((activity) => {
        if (  activity.start_date &&
              activity.start_hour &&
              activity.stop_date &&
              activity.stop_hour &&
              activity.categories &&
              activity.categories.length > 0) {
          activity.categories.forEach((category) => {
            const deltaT = tools.deltaT(
              that.$moment,
              activity.start_date,
              activity.start_hour,
              activity.start_seconds,
              activity.stop_date,
              activity.stop_hour,
              activity.stop_seconds);
            const $deltaT = that.$moment.duration(deltaT);

            let newDuration = $deltaT.get('hours') * 3600;
            newDuration += $deltaT.get('minutes') * 60;
            newDuration += $deltaT.get('seconds');

            if (data[category] === undefined) {
              Vue.set(data, category, {});
            }

            if (data[category][activity.start_date] !== undefined) {
              newDuration += data[category][activity.start_date];
            }

            Vue.set(data[category], activity.start_date, newDuration);
          });
        }
      });

      const labels = [];
      Object.keys(data).forEach((category) => {
        Object.keys(data[category]).forEach((day) => {
          if (!labels.includes(day)) {
            labels.push(day);
          }
        });
      });
      labels.sort();

      const datasets = [];
      Object.keys(data).forEach((category) => {
        const obj = {
          label: category,
          backgroundColor: tools.computeColorFromText(category),
          borderColor: '#555',
          borderWidth: 1,
          stack: 'Stack 0',
          data: [],
        };
        labels.forEach((day) => {
          if (data[category][day] === undefined) {
            obj.data.push(0);
          } else {
            obj.data.push(data[category][day]);
          }
        });
        datasets.push(obj);
      });

      return {
        labels: labels,
        datasets: datasets,
      };
    },
    activitiesCollection() {
      const that = this;

      const data = {};
      this.filteredActivities.forEach((activity) => {
        if (  activity.start_date &&
              activity.start_hour &&
              activity.stop_date &&
              activity.stop_hour) {
          const deltaT = tools.deltaT(
            that.$moment,
            activity.start_date,
            activity.start_hour,
            activity.start_seconds,
            activity.stop_date,
            activity.stop_hour,
            activity.stop_seconds);
          const $deltaT = that.$moment.duration(deltaT);

          let newDuration = $deltaT.get('hours') * 3600;
          newDuration += $deltaT.get('minutes') * 60;
          newDuration += $deltaT.get('seconds');
          let newCounter = 1;
          if (data[activity.start_date] !== undefined) {
            newDuration += data[activity.start_date].duration;
            newCounter = data[activity.start_date].count + 1;
          }
          Vue.set(data, activity.start_date, {
            duration: newDuration,
            count: newCounter,
          });
        }
      });

      const labels = Object.keys(data);
      labels.sort();
      const durations = [];
      const counter = [];

      labels.forEach((label) => {
        if (data[label] === undefined || data[label].duration === undefined) {
          durations.push(0);
        } else {
          durations.push(data[label].duration);
        }

        if (data[label] === undefined || data[label].count === undefined) {
          counter.push(0);
        } else {
          counter.push(data[label].count);
        }
      });

      return {
        labels: labels,
        datasets: [
          {
            label: that.$t('Total durations per day'),
            borderColor: that.$vuetify.theme.primary,
            fill: false,
            yAxisID: 'time-axis',
            data: durations,
          },
          {
            label: that.$t('Total activities per day'),
            borderColor: that.$vuetify.theme.secondary,
            fill: false,
            yAxisID: 'counter-axis',
            data: counter,
          },
        ],
      };
    },
  },
  mounted() {
    const that = this;

    setTimeout(() => {
      Vue.set(that, 'customSettings', {});
      that.$store.state[
        that.$store.getters['manager/current']._id
      ].customFields.fields.forEach((field) => {
        Vue.set(that.customSettings, field.name, {
          enabled: false,
          value: ((field.type === 'checkbox') ? false : ''),
        });
      });
    }, 500);
  },
};
</script>

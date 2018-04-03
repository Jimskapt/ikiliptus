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

          <v-divider></v-divider>
        </v-container>
      </v-card>
    </v-container>

  </div>
</template>

<script>
export default {
  name: 'Analytics',
  data () {
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
      toHour: '00:00'
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
    }
  }
}
</script>

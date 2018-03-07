<template>
  <div>

    <v-container>
      <v-card>
        <v-card-title primary-title dark color="primary">{{ $t("Live Counter") }}</v-card-title>

        <v-container>
          <div v-if="current !== null">
            <activity v-bind:start="current.start" v-bind:locked="['from','to']"></activity>
          </div>
          <p v-else>{{ $t("Counter is not started") }}.</p>
        </v-container>

        <v-card-actions>
          <v-btn v-on:click="startCounter" v-bind:disabled="current !== null" color="green">
            <span>{{ $t("START") }}</span>
            <v-icon>play_arrow</v-icon>
          </v-btn>
          <v-btn v-on:click="stopCounter" v-bind:disabled="current === null" color="red">
            <span>{{ $t("STOP") }}</span>
            <v-icon>stop</v-icon>
          </v-btn>
          <v-btn v-on:click="nextCounter" v-bind:disabled="current === null" color="blue">
            <span>{{ $t("NEXT") }}</span>
            <v-icon>skip_next</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>

    <v-container>
      <v-card>
          <div v-if="staged.length > 0">
            <v-card-title>{{ $t("Activities awaiting classification") }}</v-card-title>

            <v-list v-bind:expand="true" two-line subheader>
              <v-list-tile v-for="item in staged" v-bind:key="item._id">
                <v-list-tile-content>
                  <v-list-tile-title>{{item.start}} > {{item.stop}}</v-list-tile-title>
                  <v-list-tile-sub-title>
                    <v-chip small disabled v-if="item.medium && item.medium !== ''">
                      <v-avatar>
                        <v-icon>phone</v-icon>
                      </v-avatar>
                      <span>{{item.medium}}</span>
                    </v-chip>
                    <v-chip small disabled v-if="item.medium && item.actor !== ''">
                      <v-avatar>
                        <v-icon>people</v-icon>
                      </v-avatar>
                      <span>{{item.actor}}</span>
                    </v-chip>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-btn icon ripple>
                    <v-icon>archive</v-icon>
                  </v-btn>
                </v-list-tile-action>
                <!--
                <activity
                  v-bind:start="new Date(item.start)"
                  v-bind:stop="(item.stop == 'null' || item.stop == null) ? null : new Date(item.stop)"
                  v-bind:voluntary="item.voluntary"
                  v-bind:medium="item.medium"
                  v-bind:actor="item.actor"
                  v-bind:details="item.details"
                ></activity>
                -->
              </v-list-tile>
            </v-list>

          </div>
      </v-card>
    </v-container>

  </div>
</template>

<script>
import Activity from '@/components/Activity'

export default {
  name: 'LiveCounter',
  data () {
    return {
      current: null,
      staged: []
    }
  },
  methods: {
    startCounter () {
      this.current = {
        start: new Date()
      }

      let that = this
      this.db.post(this.current, {}, function (err, res) {
        if (err) {
          alert(err)
        }

        if (res.ok === true) {
          that.current._id = res.id
          that.current._rev = res.rev

          that.fetchAllStaged()
        } else {
          alert('Not OK !')
          console.log(res)
        }
      })
    },
    stopCounter () {
      this.current.stop = new Date()
      this.db.put(this.current, function (err, res) {
        if (err) {
          alert(err)
        }
      })

      this.fetchAllStaged()

      this.current = null
    },
    nextCounter () {
      this.stopCounter()
      this.startCounter()
    },
    fetchAllStaged () {
      let that = this

      this.db.allDocs({include_docs: true}, function (err, doc) {
        if (err != null) {
          alert(err)
        } else {
          that.staged = []
          doc.rows.forEach(e => {
            that.staged.push(e.doc)
          })
        }
      })
    }
  },
  mounted () {
    this.fetchAllStaged()
  },
  components: {
    'activity': Activity
  }
}
</script>

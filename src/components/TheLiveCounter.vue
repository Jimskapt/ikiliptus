<template>
  <div>

    <!-- <pre>{{$store.getters.current.activities}}</pre> -->
    <v-container>
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title primary-title dark color="primary">
            <v-btn icon>
              <v-icon>alarm</v-icon>
            </v-btn>
            <span>{{ $t("Live Counter") }}</span>
          </v-card-title>
        </v-toolbar>

        <v-container>
          <v-progress-linear :indeterminate="true" v-if="!loaded"></v-progress-linear>
          <div v-else>
            <div v-if="currentID !== null">

              <v-container grid-list-md>
                <v-layout row>
                  <v-flex xs6>
                    <v-btn block @click="stopCounter" :disabled="currentID === null" color="error">
                      <v-icon>stop</v-icon>
                      <span>{{ $t("STOP") }}</span>
                    </v-btn>
                  </v-flex>
                  <v-flex xs6>
                    <v-btn block @click="nextCounter" :disabled="currentID === null" color="warning">
                      <v-icon>skip_next</v-icon>
                      <span>{{ $t("NEXT") }}</span>
                    </v-btn>
                  </v-flex>
                </v-layout>

                <v-btn block @click="$eventBus.$emit('save', {origin: 'save', time: new Date()})" color="primary">
                  <v-icon>save</v-icon>
                  <span>{{ $t("Save") }}</span>
                </v-btn>
              </v-container>

              <activity-form :id="currentID" :locked="['stop_date','stop_hour']" :showCounter="true"></activity-form>

              <v-btn block @click="$eventBus.$emit('save', {origin: 'save', time: new Date()})" color="primary">
                <v-icon>save</v-icon>
                <span>{{ $t("Save") }}</span>
              </v-btn>

            </div>
            <v-alert v-else color="info" outline icon="info" :value="true">
              {{ $t("Counter is not started") }}.
            </v-alert>
          </div>
        </v-container>

        <v-card-actions v-if="loaded">
          <v-btn block @click="startCounter(undefined, new Date())" :disabled="currentID !== null" color="primary">
            <v-icon>play_arrow</v-icon>
            <span>{{ $t("START") }}</span>
          </v-btn>
          <v-btn block @click="stopCounter" :disabled="currentID === null" color="error">
            <v-icon>stop</v-icon>
            <span>{{ $t("STOP") }}</span>
          </v-btn>
          <v-btn block @click="nextCounter" :disabled="currentID === null" color="warning">
            <v-icon>skip_next</v-icon>
            <span>{{ $t("NEXT") }}</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>

    <v-container>
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title>
            <v-btn icon>
              <v-icon>inbox</v-icon>
            </v-btn>
            <span>{{ $t("Last activities") }}</span>
          </v-card-title>
        </v-toolbar>

        <v-container v-if="!loaded">
          <v-progress-linear :indeterminate="true"></v-progress-linear>
        </v-container>
        <v-list three-line subheader v-else>

          <div class="text-xs-center" style="padding:10px;">
            <v-text-field
              :label="$t('Search')"
              v-model="activitiesSearch"
              prepend-icon="search"
              append-icon="close"
              :append-icon-cb="() => {activitiesSearch=''}"
            ></v-text-field>
            <v-pagination :length="pagesCount" v-model="lastActivitiesPage" v-if="searchedActivities.length > 0"></v-pagination>
          </div>

          <v-divider></v-divider>

          <template v-for="item in paginatedActivities">
            <v-list-tile @click="$router.push({name:'Activity', params: {id: item._id}})" :key="item._id">
              <v-list-tile-content>
                <v-list-tile-title style="font-weight:bold;">
                  <span v-if="item.subject">
                    {{item.subject}}
                  </span>
                  <span v-else>
                    <span v-if="item.start_date != item.stop_date">
                    {{ $t('From') }}
                    {{ $moment(item.start_date, 'YYYY-MM-DD').format($t('date_format')) }}
                    {{ $moment(item.start_hour + ':' + item.start_seconds, 'HH:mm:ss', 'HH:mm:ss').format($t('hour_format')) }}
                    {{ $t('To').toLowerCase() }}
                    {{ $moment(item.stop_date, 'YYYY-MM-DD').format($t('date_format')) }}
                    {{ $moment(item.stop_hour + ':' + item.stop_seconds, 'HH:mm:ss').format($t('hour_format')) }}
                    </span>
                    <span v-else>
                      {{ $moment(item.start_date, 'YYYY-MM-DD').format($t('date_format')) }} :
                      {{ $t('From').toLowerCase() }}
                      {{ $moment(item.start_hour + ':' + item.start_seconds, 'HH:mm:ss', 'HH:mm:ss').format($t('hour_format')) }}
                      {{ $t('To').toLowerCase() }}
                      {{ $moment(item.stop_hour + ':' + item.stop_seconds, 'HH:mm:ss').format($t('hour_format')) }}
                    </span>
                  </span>
                </v-list-tile-title>
                <v-list-tile-sub-title>
                  <v-layout row>
                    <v-chip small outline color="primary" disabled>
                      <v-avatar>
                        <v-icon>alarm</v-icon>
                      </v-avatar>
                      <span>{{ deltaTime(item) }}</span>
                    </v-chip>
                    <v-chip small dark outline disabled v-for="category in item.categories" v-bind:key="'chip-' + item._id + '-' + category">
                      <v-avatar>
                        <v-icon>move_to_inbox</v-icon>
                      </v-avatar>
                      <span>{{ category }}</span>
                    </v-chip>
                  </v-layout>
                </v-list-tile-sub-title>
                <v-list-tile-sub-title>
                  <v-layout row>
                    <v-chip small disabled v-if="item[field.name] && item[field.name] !== '' && field.type !== 'checkbox'" v-for="field in $store.state[$store.state.manager.current].customFields.fields" v-bind:key="'chip-' + item._id + '-' + field.name">
                      <v-avatar>
                        <v-icon>{{field.icon}}</v-icon>
                      </v-avatar>
                      <span>{{item[field.name]}}</span>
                    </v-chip>
                  </v-layout>
                </v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-layout row>
                  <v-flex xs6>
                    <v-btn flat icon @click.stop="copyActivity(Object.assign({}, item));goToTop();">
                      <v-icon>content_copy</v-icon>
                    </v-btn>
                  </v-flex>
                  <v-flex xs6>
                    <v-btn flat icon @click.stop="askDeleteActivity(item)">
                      <v-icon>delete</v-icon>
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-list-tile-action>
            </v-list-tile>
            <v-divider :key="'divider-' + item._id"></v-divider>
          </template>
        </v-list>
      </v-card>
    </v-container>

    <v-dialog v-model="askedDelete">
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title>{{ $t('Confirm the delete') }}</v-card-title>
        </v-toolbar>
        <v-card-text>
          <p>{{ $t('Please confirm the delete of this activity') }}.</p>
        </v-card-text>
        <v-card-actions>
          <v-btn block color="success" @click="askedDeleteDocument=null;askedDelete=false;">
            <v-icon>close</v-icon>
            {{ $t('Abort') }}
          </v-btn>
          <v-btn block color="error" @click="confirmDeleteActivity">
            <v-icon>delete</v-icon>
            {{ $t('Delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="askedCopy">
      <v-card>
        <v-toolbar dark color="primary">
          <v-card-title>{{ $t('Confirm the copy') }}</v-card-title>
        </v-toolbar>
        <v-card-text>
          <p>{{ $t('Please confirm the copy of the activity in the current activity') }}.</p>
        </v-card-text>
        <v-card-actions>
          <v-btn block color="success" @click="askedCopyDocument=null;askedCopy=false;">
            <v-icon>close</v-icon>
            {{ $t('Abort') }}
          </v-btn>
          <v-btn block color="primary" @click="confirmActivityCopy">
            <v-icon>content_copy</v-icon>
            {{ $t('Copy') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import Vue from 'vue';
import tools from '../tools';
import ActivityForm from '@/components/ActivityForm';

export default {
  name: 'TheLiveCounter',
  components: {
    activityForm: ActivityForm,
  },
  data() {
    return {
      nextAction: '',
      activities: [],
      dialog: false,
      askedDelete: false,
      askedDeleteDocument: null,
      askedCopy: false,
      askedCopyDocument: null,
      lastActivitiesPage: 1,
      activitiesPerPage: 10,
      activitiesSearch: '',
      loaded: true,
      currentID: null,
    };
  },
  methods: {
    startCounter(document, now) {
      const that = this;

      if (document === undefined) {
        document = {};
      }
      if (now === undefined || now === null) {
        now = new Date();
      }

      Vue.delete(document, '_id');
      Vue.delete(document, '_rev');
      Vue.set(document, 'start_date', this.$moment(now).format('YYYY-MM-DD'));
      Vue.set(document, 'start_hour', this.$moment(now).format('HH:mm'));
      Vue.set(document, 'start_seconds', now.getSeconds());
      Vue.delete(document, 'stop_date');
      Vue.delete(document, 'stop_hour');
      Vue.delete(document, 'stop_seconds');
      if (!document.data_type) {
        Vue.set(document, 'data_type', 'subject');
      }
      if (!document.data_version) {
        Vue.set(document, 'data_version', 1);
      }

      this.$store
        .dispatch(  this.$store.getters['manager/current']._id + '/saveActivity',
                    {doc: document},
                    {root: true})
        .then((res) => { that.currentID = res.id; })
        .catch((err) => { alert('IKE0045:\n' + err); });
    },
    stopCounter() {
      this.$eventBus.$emit('setStop', new Date());
    },
    liveSaveConfirm(payload) {
      if (payload !== undefined) {
        if (payload.origin === 'stop') {
          this.currentID = null;
        }
      }
      if (this.nextAction === 'start') {
        this.startCounter(this.nextActionDocument, new Date());
        this.nextAction = '';
        this.nextActionDocument = undefined;
      }
    },
    nextCounter(document) {
      this.nextAction = 'start';
      this.nextActionDocument = document;

      if (this.currentID !== null) {
        this.stopCounter(document);
      } else {
        this.liveSaveConfirm();
      }
    },
    copyActivity(document) {
      if (this.currentID !== null) {
        this.askedCopyDocument = document;
        this.askedCopy = true;
      } else {
        this.nextCounter(document);
      }
    },
    askDeleteActivity(document) {
      this.askedDelete = true;
      this.askedDeleteDocument = document;
    },
    confirmDeleteActivity() {
      const that = this;
      this.$store.dispatch( this.$store.getters['manager/current']._id + '/deleteActivity',
                            {doc: that.askedDeleteDocument},
                            {root: true})
        .then(() => {
          that.askedDelete = false;
          that.askedDeleteDocument = null;
        })
        .catch((err) => { alert('IKE0052:\n' + err); });
    },
    confirmActivityCopy() {
      const that = this;
      const document = {};
      Object.assign(document, this.askedCopyDocument);

      Vue.delete(document, '_id');
      Vue.delete(document, '_rev');
      Vue.delete(document, 'start_date');
      Vue.delete(document, 'start_hour');
      Vue.delete(document, 'start_seconds');
      Vue.delete(document, 'stop_date');
      Vue.delete(document, 'stop_hour');
      Vue.delete(document, 'stop_seconds');
      if (document.data_type === undefined) {
        document.data_type = 'subject';
      }
      if (document.data_version === undefined) {
        document.data_version = 1;
      }

      this.$store
        .dispatch(  this.$store.getters['manager/current']._id + '/saveActivity',
                    {doc: document},
                    {root: true})
        .then(() => {
          that.askedCopy = false;
          that.askedCopyDocument = null;
        })
        .catch((err) => {alert('IKE0047:\n' + err); });
    },
    deltaTime(activity) {
      return tools.deltaT(
        this.$moment,
        activity.start_date,
        activity.start_hour,
        activity.start_seconds,
        activity.stop_date,
        activity.stop_hour,
        activity.stop_seconds,
        true);
    },
    goToTop() {
      window.scrollTo(0, 0);
    },
  },
  watch: {
    activitiesSearch(newValue, oldValue) {
      tools.setCookie('research', newValue);
    },
  },
  computed: {
    searchedActivities() {
      if (  this.activities === undefined ||
            this.activities === null ||
            this.activities === []) {
        return [];
      }

      let searchText = this.activitiesSearch;
      let res = this.$store.getters[
        this.$store.state.manager.current + '/finishedActivities'
      ] || [];

      /*
TESTS :

// should match :
stop:2018/04/04
start:2018/04/04
start>2018/04/04
start<2018/04/04
start>=2018/04/04
start<=2018/04/04
start:04/04/2018
start>04/04/2018
start<04/04/2018
start:2018/04/04 04:04:04
start:2018/04/04 04:04
start:2018/04/04 04:04:04 PM
start:2018/04/04 04:04 PM
start:2018/04/04 04:04:04 AM
start:2018/04/04 04:04 AM
start:2018/04/04 4:4
start:2018/04/04 4:4:4
start:2018/04/04 14:14:14
start:today
start:today 14:14:14
start:now

// should fail :
test:2018/04/04
start!2018/04/04
start2018/04/04
start:test
start:4854
start:test4854
start:test/4854
start:test/48:54
start:now 14:14:14
      */

      if (searchText !== undefined && searchText !== null && searchText.trim() !== '') {
        let dayRegex = this.$t('date_format');
        dayRegex = dayRegex.split('DD').join('[0-9]{1,2}');
        dayRegex = dayRegex.split('MM').join('[0-9]{1,2}');
        dayRegex = dayRegex.split('YYYY').join('[0-9]{4}');
        let hourRegex = this.$t('hour_format');
        hourRegex = hourRegex.split('hh').join('[0-9]{1,2}');
        hourRegex = hourRegex.split('HH').join('[0-9]{1,2}');
        hourRegex = hourRegex.split('mm').join('[0-9]{1,2}');
        hourRegex = hourRegex.split('ss').join('[0-9]{1,2}');
        hourRegex = hourRegex.split('A').join('A|PM');

        let dateRegex = '((start)|(stop))(:|<=?|>=?)';
        dateRegex += '((((' + dayRegex + ')|(today))( ' + hourRegex + ')?)|(now))';
        const dateMatch = searchText.match(new RegExp(dateRegex, 'g'));

        const operations = {};
        const that = this;

        const dayFormat = 'DD/MM/YYYY';
        const hourFormat = dayFormat + ' HH:mm:ss';

        if (dateMatch !== null && dateMatch.length > 0) {
          dateMatch.forEach((match) => {
            searchText = searchText.split(match).join('').trim();

            const items = new RegExp(dateRegex, 'g').exec(match);

            if (items !== null) {
              const field = items[1];
              const operator = items[4];
              let time = items[5];

              if (time === 'now') {
                time = that.$moment().format(hourFormat);
              } else if (time.includes('today')) {
                time = time.split('today').join(that.$moment().format(dayFormat));
              }

              if (time.length === dayFormat.length) {
                time = that.$moment(time, dayFormat).format(hourFormat);
              }

              Vue.set(operations, field, {
                operator: operator,
                time: time,
                $time: that.$moment(time, hourFormat),
              });
            }
          });
        }

        /*
TESTS :

// should match :
subject:test
subject:=test
subject:test175
subject:"test bis"
medium:test
medium:"test bis"
actor:test
actor:"test bis"

// should fail :
subject:test bis
      */
        const metadataRegex = '((subject)|(medium)|(actor))(:=?)(("[^"]+")|([^\n ]+))';
        const metadataMatch = searchText.match(new RegExp(metadataRegex, 'g'));

        if (metadataMatch !== null && metadataMatch.length > 0) {
          metadataMatch.forEach((match) => {
            searchText = searchText.split(match).join('').trim();

            const items = new RegExp(metadataRegex, 'g').exec(match);

            if (items !== null) {
              const field = items[1];
              const operator = items[5];
              let metadata = items[6];
              metadata = metadata.split('"').join('');

              Vue.set(operations, field, {
                operator: operator,
                metadata: metadata,
              });
            }
          });
        }

        /*
TESTS :

// should match :
categories:=aaa
categories:aaa
categories:"aaa"
categories:"a a a"
categories:aaa,bbb,ccc
categories:"a a a",bbb
categories:"a a a","b b b"

// should fail :
categories:a a a, b b b
categories:"a a a", bbb
categories:aaa, bbb ,ccc
categories:aaa, bbb ,ccc test
      */
        const categoriesRegex = '(categories)(:=?)((,?(("[^"]+")|([^ \n]+)))+)';
        const categoriesMatch = searchText.match(new RegExp(categoriesRegex, 'g'));

        if (categoriesMatch !== null && categoriesMatch.length > 0) {
          categoriesMatch.forEach((match) => {
            searchText = searchText.split(match).join('').trim();

            const items = new RegExp(categoriesRegex, 'g').exec(match);

            if (items !== null) {
              const field = items[1];
              const operator = items[2];
              let categories = items[3];
              categories = categories
                .split(',')
                .map((e) => e.split('"').join('').trim());

              Vue.set(operations, field, {
                operator: operator,
                categories: categories,
              });
            }
          });
        }

        const voluntaryRegex = '(!?)(voluntary)';
        const voluntaryMatch = searchText.match(new RegExp(voluntaryRegex, 'g'));

        if (voluntaryMatch !== null && voluntaryMatch.length > 0) {
          voluntaryMatch.forEach((match) => {
            searchText = searchText.split(match).join('').trim();

            const items = new RegExp(voluntaryRegex, 'g').exec(match);

            if (items !== null) {
              const field = items[2];
              const operator = items[1];
              const value = (operator === '!') ? '' : true;

              Vue.set(operations, field, {
                operator: operator,
                value: value,
              });
            }
          });
        }

        if (Object.keys(operations).length > 0) {
          res = res.filter((e) => {
            let check = true;

            if (operations.start !== undefined) {
              let elementDate = e.start_date + ' ' + e.start_hour + ':';
              elementDate += ((e.start_seconds === undefined) ? '00' : e.start_seconds);
              elementDate = that.$moment(elementDate, 'YYYY-MM-DD HH:mm:ss');

              if (operations.start.operator === ':') {
                check &= (elementDate === operations.start.$time);
              } else if (operations.start.operator === '>') {
                check &= (elementDate > operations.start.$time);
              } else if (operations.start.operator === '<') {
                check &= (elementDate < operations.start.$time);
              } else if (operations.start.operator === '>=') {
                check &= (elementDate >= operations.start.$time);
              } else if (operations.start.operator === '<=') {
                check &= (elementDate <= operations.start.$time);
              }
            }

            if (operations.stop !== undefined) {
              let elementDate = e.stop_date + ' ' + e.stop_hour + ':';
              elementDate += ((e.stop_seconds === undefined) ? '00' : e.stop_seconds);
              elementDate = that.$moment(elementDate, 'YYYY-MM-DD HH:mm:ss');

              if (operations.stop.operator === ':') {
                check &= (elementDate === operations.stop.$time);
              } else if (operations.stop.operator === '>') {
                check &= (elementDate > operations.stop.$time);
              } else if (operations.stop.operator === '<') {
                check &= (elementDate < operations.stop.$time);
              } else if (operations.stop.operator === '>=') {
                check &= (elementDate >= operations.stop.$time);
              } else if (operations.stop.operator === '<=') {
                check &= (elementDate <= operations.stop.$time);
              }
            }

            if (operations.subject !== undefined) {
              if (e.subject) {
                if (operations.subject.operator === ':') {
                  check &= (e.subject.includes(operations.subject.metadata));
                } else if (operations.subject.operator === ':=') {
                  check &= (e.subject === operations.subject.metadata);
                }
              } else {
                check = false;
              }
            }

            // TODO : allow custom fields, here !
            if (operations.medium !== undefined) {
              if (e.medium) {
                if (operations.medium.operator === ':') {
                  check &= (e.medium.includes(operations.medium.metadata));
                } else if (operations.medium.operator === ':=') {
                  check &= (e.medium === operations.medium.metadata);
                }
              } else {
                check = false;
              }
            }

            if (operations.actor !== undefined) {
              if (e.actor) {
                if (operations.actor.operator === ':') {
                  check &= (e.actor.includes(operations.actor.metadata));
                } else if (operations.actor.operator === ':=') {
                  check &= (e.actor === operations.actor.metadata);
                }
              } else {
                check = false;
              }
            }

            if (operations.categories !== undefined) {
              if (e.categories && e.categories.length > 0) {
                if (operations.categories.operator === ':') {
                  operations.categories.categories.forEach((category) => {
                    check &= (e.categories.includes(category));
                  });
                } else if (operations.categories.operator === ':=') {
                  check &= (e.categories.every((el) => {
                    return operations.categories.categories.includes(el);
                  }));
                }
              } else {
                check = false;
              }
            }

            if (operations.voluntary !== undefined) {
              if (e.voluntary !== undefined) {
                check &= (e.voluntary === operations.voluntary.value);
              } else {
                check = false;
              }
            }

            return check;
          });
        }
      }

      searchText = searchText.trim();

      return res;
    },
    paginatedActivities() {
      const result = [];

      if (  this.searchedActivities === undefined ||
            this.searchedActivities === null ||
            this.searchedActivities === []) {
        return result;
      }

      for ( let i = 0;
            i < this.activitiesPerPage &&
            ((this.lastActivitiesPage - 1) * this.activitiesPerPage + i) < this.searchedActivities.length;
            i++) {
        result.push(
          this.searchedActivities[(this.lastActivitiesPage - 1) * this.activitiesPerPage + i]);
      }

      return result;
    },
    pagesCount() {
      if (  this.searchedActivities === undefined ||
            this.searchedActivities === null ||
            this.searchedActivities === []) {
        return 1;
      }

      return parseInt(Math.ceil(this.searchedActivities.length / this.activitiesPerPage), 10);
    },
  },
  mounted() {
    this.$eventBus
      .$on('saveconfirm', this.liveSaveConfirm);
      /*
      TODO
      .$on('dbupdate', this.fetchAllSubjects)
      */

    const cookies = tools.getCookies();
    if (cookies.research) {
      this.activitiesSearch = cookies.research;
    }

    setTimeout(() => {
      const running = this.$store.getters[
        this.$store.state.manager.current + '/runningActivities'
      ] || [];
      if (running.length > 0) {
        this.currentID = running[0]._id;
      }
    }, 500);
  },
  destroyed() {
    this.$eventBus
      .$off('saveconfirm', this.saveConfirmation);
      /*
      TODO
      .$off('dbupdate', this.fetchAllSubjects)
      */
  },
};
</script>

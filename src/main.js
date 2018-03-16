// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

import PouchDB from 'pouchdb-browser'
import Vuetify from 'vuetify'

import App from './App'
import router from './router'
import i18n from './locales/index'

import 'vuetify/dist/vuetify.min.css'

Vue.config.productionTip = false

let db = new PouchDB('ikiliptus')

db
  .query('all_subjects/all_subjects')
  .then(res => {})
  .catch(() => {
    /* eslint-disable */
    var ddoc = {
      _id: '_design/all_subjects',
      views: {
        all_subjects: {
          map: function (doc) {
  if (doc.data_type) {
    if (doc.data_type === 'subject') {
      emit(doc._id, true);
    }
  }
}.toString()
        }
      }
    }
    /* eslint-enable */

    db
      .put(ddoc)
      .then(() => {})
      .catch(function (err) {
        alert(err)
      })
  })

db
  .query('subjects_powers/subjects_powers')
  .then(res => {})
  .catch(() => {
    /* eslint-disable */
    var ddoc = {
      _id: '_design/subjects_powers',
      views: {
        subjects_powers: {
          map: function (doc) {
  if(doc.subject) {
    emit(doc.subject, 1);
  }
}.toString(),
          reduce: function(keys, values, rereduce) {
  return sum(values);
}.toString()
        }
      }
    }
    /* eslint-enable */

    db
      .put(ddoc)
      .then(() => {})
      .catch(function (err) {
        alert(err)
      })
  })

let remoteCouch = new PouchDB('http://localhost:5984/ikiliptus')

let eventBus = new Vue()

Vue.use(Vuetify)

Vue.prototype.eventBus = eventBus
Vue.prototype.db = db

db
  .sync(remoteCouch, {live: true})
  .on('complete', function () {
    console.log('Sync on local CouchDB success.')
    eventBus.$emit('dbupdate')
  })
  .on('error', function (err) {
    console.log('ERROR while sync on local couchDB :', err)
  })
  .on('change', function (change) {
    console.log('Sync event : ', change)
    eventBus.$emit('dbupdate', change)
  })

/* eslint-disable no-new, no-unused-vars */
let VM = new Vue({
  el: '#app',
  router,
  i18n,
  components: { App },
  template: '<App/>'
})

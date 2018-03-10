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

let db = {
  activities: new PouchDB('activities'),
  subjects: new PouchDB('subjects')
}

let remoteCouch = {
  activities: new PouchDB('http://localhost:5984/activities'),
  subjects: new PouchDB('http://localhost:5984/subjects')
}

let eventBus = new Vue()

Vue.use(Vuetify)

Vue.prototype.eventBus = eventBus
Vue.prototype.db = db

Object.keys(db).forEach(key => {
  db[key]
    .sync(remoteCouch[key], {live: true})
    .on('complete', function () {
      console.log('Sync ' + key + ' on local CouchDB success.')
      eventBus.$emit('dbupdate')
    })
    .on('error', function (err) {
      console.log('ERROR while sync ' + key + ' on local couchDB :', err)
    })
    .on('change', function (change) {
      console.log('Sync ' + key + ' event : ', change)
      eventBus.$emit('dbupdate', change)
    })
})

/* eslint-disable no-new, no-unused-vars */
let VM = new Vue({
  el: '#app',
  router,
  i18n,
  components: { App },
  template: '<App/>'
})

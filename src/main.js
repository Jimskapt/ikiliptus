// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

import PouchDB from 'pouchdb-browser'
import Vuetify from 'vuetify'

import App from './App'
import router from './router'
import i18n from './locales'
import DB from './database'

import 'vuetify/dist/vuetify.min.css'

Vue.config.productionTip = false

Vue.use(Vuetify)

let eventBus = new Vue()

Vue.prototype.eventBus = eventBus
Vue.prototype.db = DB

let remoteCouch = new PouchDB('http://localhost:5984/ikiliptus')

DB
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

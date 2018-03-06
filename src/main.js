// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import PouchDB from 'pouchdb-browser'

Vue.config.productionTip = false

let db = new PouchDB('ikiliptus')
let remoteCouch = new PouchDB('http://localhost:5984/ikiliptus')

db
  .sync(remoteCouch, {live: true})
  .on('complete', function () {
    console.log('Sync on local CouchDB success.')
  })
  .on('error', function (err) {
    console.log('ERROR while sync on local couchDB :', err)
  })
  .on('change', function (change) {
    console.log('Sync event : ', change)
  })

Vue.prototype.db = db

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

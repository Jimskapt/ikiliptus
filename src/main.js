// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

import Vuetify from 'vuetify'
import VueMoment from 'vue-moment'

import App from './App'
import router from './router'
import i18n from './locales'
import Settings from './settings'
import store from './store'
import eventbus from './eventbus'

import 'vuetify/dist/vuetify.min.css'

Vue.config.productionTip = false

Vue.use(Vuetify)
Vue.use(VueMoment)

Vue.prototype.$eventBus = eventbus
Vue.prototype.$settings = Settings
Vue.prototype.$settings.eventBus = Vue.prototype.eventBus
Vue.prototype.$settings.momentJS = Vue.prototype.$moment
Vue.prototype.$settings.i18n = i18n
Vue.prototype.$settings.load()

/* eslint-disable no-new, no-unused-vars */
let VM = new Vue({
  el: '#app',
  router,
  i18n,
  store,
  components: { App },
  template: '<App/>'
})

Vue.prototype.$settings.vuetify = VM.$vuetify

import '@babel/polyfill';
import './registerServiceWorker';
import './plugins/vuetify.js';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import './plugins/moment.js';

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './i18n';
import eventbus from './eventbus';
import settings from './settings';

Vue.prototype.$eventBus = eventbus;
Vue.prototype.$settings = settings;
Vue.prototype.$settings.eventBus = Vue.prototype.$eventBus;

Vue.config.productionTip = true;

new Vue({
  router: router,
  store: store,
  i18n: i18n,
  render: (h) => h(App),
}).$mount('#app');

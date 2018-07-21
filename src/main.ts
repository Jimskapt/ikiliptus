import '@babel/polyfill';
import './registerServiceWorker';
import './plugins/vuetify';
import 'material-design-icons-iconfont/dist/material-design-icons.css';

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
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app');

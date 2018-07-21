import Vue from 'vue';
import Router from 'vue-router';
import SettingsPage from './components/SettingsPage.vue';
import DataLoader from './components/DataLoader.vue';
import TheLiveCounter from './components/TheLiveCounter.vue';
import DataDisplay from './components/DataDisplay.vue';
import ActivityEditor from './components/ActivityEditor.vue';
import DataUpgrade from './components/DataUpgrade.vue';
import AnalyticsPage from './components/AnalyticsPage.vue';
import SessionManager from './components/SessionManager.vue';
import SessionEditor from './components/SessionEditor.vue';

Vue.use(Router);

export default new Router({
  mode: 'hash',
  base: __dirname,
  routes: [
    {
      path: '/',
      name: 'Home',
      redirect: {
        name: 'SessionManager',
      },
    },
    {
      path: '/live_counter',
      name: 'LiveCounter',
      component: TheLiveCounter,
    },
    {
      path: '/activity/:id',
      name: 'Activity',
      component: ActivityEditor,
      props: true,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: SettingsPage,
    },
    {
      path: '/save',
      name: 'Save',
      component: DataDisplay,
    },
    {
      path: '/load',
      name: 'Load',
      component: DataLoader,
    },
    {
      path: '/data_upgrade',
      name: 'DataUpgrade',
      component: DataUpgrade,
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: AnalyticsPage,
    },
    {
      path: '/sessions',
      name: 'SessionManager',
      component: SessionManager,
    },
    {
      path: '/session/:id',
      name: 'SessionEditor',
      component: SessionEditor,
      props: true,
    },
  ],
});

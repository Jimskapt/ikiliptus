import Vue from 'vue'
import Router from 'vue-router'
import SettingsPage from '@/components/SettingsPage'
import DataLoader from '@/components/DataLoader'
import TheLiveCounter from '@/components/TheLiveCounter'
import DataDisplay from '@/components/DataDisplay'
import ActivityEditor from '@/components/ActivityEditor'
import DataUpgrade from '@/components/DataUpgrade'
import AnalyticsPage from '@/components/AnalyticsPage'
import SessionManager from '@/components/SessionManager'
import SessionEditor from '@/components/SessionEditor'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      redirect: {
        name: 'SessionManager'
      }
    },
    {
      path: '/live_counter',
      name: 'LiveCounter',
      component: TheLiveCounter
    },
    {
      path: '/activity/:id',
      name: 'Activity',
      component: ActivityEditor,
      props: true
    },
    {
      path: '/settings',
      name: 'Settings',
      component: SettingsPage
    },
    {
      path: '/save',
      name: 'Save',
      component: DataDisplay
    },
    {
      path: '/load',
      name: 'Load',
      component: DataLoader
    },
    {
      path: '/data_upgrade',
      name: 'DataUpgrade',
      component: DataUpgrade
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: AnalyticsPage
    },
    {
      path: '/sessions',
      name: 'SessionManager',
      component: SessionManager
    },
    {
      path: '/session/:id',
      name: 'SessionEditor',
      component: SessionEditor,
      props: true
    }
  ],
  mode: 'hash',
  base: __dirname
})

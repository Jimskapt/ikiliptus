import Vue from 'vue'
import Router from 'vue-router'
import Settings from '@/components/Settings'
import DataLoader from '@/components/DataLoader'
import LiveCounter from '@/components/LiveCounter'
import DataDisplay from '@/components/DataDisplay'
import ActivityEditor from '@/components/ActivityEditor'
import DataUpgrade from '@/components/DataUpgrade'
import Analytics from '@/components/Analytics'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: {
        name: 'LiveCounter'
      }
    },
    {
      path: '/live_counter',
      name: 'LiveCounter',
      component: LiveCounter
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
      component: Settings
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
      component: Analytics
    }
  ],
  mode: 'hash',
  base: __dirname
})

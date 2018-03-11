import Vue from 'vue'
import Router from 'vue-router'
import Settings from '@/components/Settings'
import LiveCounter from '@/components/LiveCounter'
import ActivityEditor from '@/components/ActivityEditor'

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
    }
  ],
  mode: 'history'
})

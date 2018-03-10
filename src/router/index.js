import Vue from 'vue'
import Router from 'vue-router'
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
    }
  ],
  mode: 'history'
})

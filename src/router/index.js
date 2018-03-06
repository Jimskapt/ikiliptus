import Vue from 'vue'
import Router from 'vue-router'
import LiveCounter from '@/components/LiveCounter'

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
    }
  ],
  mode: 'history'
})

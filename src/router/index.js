import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import LiveCounter from '@/components/LiveCounter'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/live_counter',
      name: 'LiveCounter',
      component: LiveCounter
    }
  ],
  mode: 'history'
})

import Vue from 'vue'
import VueI18n from 'vue-i18n'

import enUS from './en_US.json'
import frFR from './fr_FR.json'

Vue.use(VueI18n)

let cookies = {}
document.cookie
  .split(';')
  .map(e => {
    return e
      .split('=')
      .map(e2 => e2.trim())
  })
  .forEach(e => {
    cookies[e[0]] = e[1]
  })

if (cookies['locale'] === undefined) {
  cookies['locale'] = 'en_US'
  document.cookie = 'locale=' + cookies['locale']
}

const i18n = new VueI18n({
  'locale': cookies.locale,
  messages: {
    'en_US': enUS,
    'fr_FR': frFR
  }
})

export default i18n

import Vue from 'vue'
import VueI18n from 'vue-i18n'

import enUS from './en_US.json'
import frFR from './fr_FR.json'

Vue.use(VueI18n)

const i18n = new VueI18n({
  'locale': 'en_US',
  messages: {
    'en_US': enUS,
    'fr_FR': frFR
  }
})

export default i18n

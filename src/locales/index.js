import Vue from 'vue'
import VueI18n from 'vue-i18n'

import enUS from './en-US.json'
import frFR from './fr-FR.json'

Vue.use(VueI18n)

const i18n = new VueI18n({
  'locale': 'en-US',
  messages: {
    'en-US': enUS,
    'fr-FR': frFR
  }
})

export default i18n

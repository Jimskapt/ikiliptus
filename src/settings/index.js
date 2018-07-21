import tools from '../tools'

let settings = {
  i18n: null,
  eventBus: null,
  databases: null,
  vuetify: null,
  momentJS: null,
  locale: {
    value: 'en-US',
    get () {
      return this.value
    },
    set (value) {
      if (value !== '' && value !== this.value) {
        tools.setCookie('locale', value)

        this.value = value

        settings.i18n.locale = this.value
        settings.momentJS.locale(this.value)
      }
    }
  },
  load () {
    let cookies = tools.getCookies()

    if (cookies.locale !== undefined) {
      this.locale.set(cookies.locale)
    }
  }
}

export default settings

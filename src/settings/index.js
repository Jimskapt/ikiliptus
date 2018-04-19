import tools from '../tools/index.js'

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

    if (cookies.last_session !== undefined) {
      let that = this
      this.databases
        .refresh()
        .then(() => {
          that.databases.available.forEach(e => {
            if (e._id === cookies.last_session) {
              that.databases.setCurrent(e, that.vuetify)
            }
          })
        })
    }
  }
}

export default settings

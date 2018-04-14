import tools from '../tools/index.js'

let settings = {
  i18n: null,
  eventBus: null,
  DB: null,
  vuetify: null,
  momentJS: null,
  locale: {
    value: 'en_US',
    get () {
      return this.value
    },
    set (value) {
      if (value !== '' && value !== this.value) {
        tools.setCookie('locale', value)

        this.value = value

        settings.i18n.locale = this.value
        settings.momentJS.locale(this.value.split('_').join('-'))
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
      this.DB
        .refresh()
        .then(() => {
          that.DB.available.forEach(e => {
            if (e._id === cookies.last_session) {
              that.DB.setCurrent(e, that.vuetify)
            }
          })
        })
    }
  }
}

export default settings

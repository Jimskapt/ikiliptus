import tools from '../tools/index.js'

let settings = {
  i18n: null,
  eventBus: null,
  DB: null,
  vuetify: null,
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
      }
    }
  },
  load () {
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

import PouchDB from 'pouchdb-browser'

let settings = {
  i18n: null,
  eventBus: null,
  DB: null,
  locale: {
    value: 'en_US',
    get () {
      return this.value
    },
    set (value) {
      if (value !== '' && value !== this.value) {
        let oneYearFromNow = new Date()
        oneYearFromNow.setTime(oneYearFromNow.getTime() + 365 * 24 * 60 * 60 * 1000)

        document.cookie = 'locale=' + value + '; expires=' + oneYearFromNow.toUTCString()

        this.value = value

        settings.i18n.locale = this.value
      }
    }
  },
  remoteCouch: {
    path: '',
    value: null,
    get () {
      return this.path
    },
    set (value) {
      if (value !== '' && value !== this.value) {
        if (this.value !== null) {
          this.value.cancel()
        }

        let oneYearFromNow = new Date()
        oneYearFromNow.setTime(oneYearFromNow.getTime() + 365 * 24 * 60 * 60 * 1000)

        document.cookie = 'remote_couch=' + value + '; expires=' + oneYearFromNow.toUTCString()

        this.path = value
        this.value = settings.DB.sync(new PouchDB(this.path), {live: true})

        this.value
          .on('complete', function () {
            console.log('Sync on local CouchDB success.')
            settings.eventBus.$emit('dbupdate')
          })
          .on('error', function (err) {
            console.log('ERROR while sync on local couchDB :', err)
          })
          .on('change', function (change) {
            console.log('Sync event : ', change)
            settings.eventBus.$emit('dbupdate', change)
          })
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

    if (cookies.remote_couch !== undefined) {
      this.remoteCouch.set(cookies.remote_couch)
    }

    if (cookies.locale !== undefined) {
      this.locale.set(cookies.locale)
    }
  }
}

export default settings

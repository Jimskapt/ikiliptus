import Vue from 'vue'

export default {
  setCookie (key, value) {
    let oneYearFromNow = new Date()
    oneYearFromNow.setTime(oneYearFromNow.getTime() + 365 * 24 * 60 * 60 * 1000)

    value = value.split('=').join('\\=')

    document.cookie = key + '=' + value + '; expires=' + oneYearFromNow.toUTCString()
  },
  getCookies () {
    let result = {}

    document.cookie
      .split(';')
      .map(e => {
        return e
          .split('\\=')
          .join('|-|/|')
          .split('=')
          .map(e2 => e2.trim().split('|-|/|').join('='))
      })
      .forEach(e => {
        Vue.set(result, e[0], e[1])

        // fix for keep compatiblity of the data with older versions
        if (e[0] === 'locale') {
          Vue.set(result, e[0], e[1].split('_').join('-'))
        }
      })

    return result
  },
  computeColorFromText (text) {
    let value = 0
    for (let i = 0; i < text.length; i++) {
      value = text.charCodeAt(i) + ((value << 5) - value)
    }

    let result = '#'
    for (let i = 0; i < 3; i++) {
      let current = (value >> (i * 8)) & 0xFF
      result += ('00' + current.toString(16)).substr(-2)
    }

    return result
  },
  deltaT ($moment, startDate, startHour, startSeconds, stopDate, stopHour, stopSeconds, hideHoursIfZero) {
    if (stopDate === undefined) {
      stopDate = null
    }
    if (stopHour === undefined) {
      stopHour = null
    }
    if (stopSeconds === undefined) {
      stopSeconds = null
    }
    if (hideHoursIfZero === undefined) {
      hideHoursIfZero = false
    }

    if (startDate !== null && startHour !== null && startSeconds !== null) {
      let now = new Date()
      if (stopDate !== null && stopHour !== null && stopSeconds !== null) {
        now = $moment(stopDate + ' ' + stopHour + ':' + stopSeconds, 'YYYY-MM-DD HH:mm:ss').toDate()
      }
      let delta = now
      delta -= $moment(startDate + ' ' + startHour + ':' + startSeconds, 'YYYY-MM-DD HH:mm:ss').toDate()

      let way = +1
      let offset = new Date().getTimezoneOffset() / 60
      if (offset < 0) {
        way = -1
        offset *= -1
      }

      delta += way * $moment('1990-01-01 ' + offset + ':00:00', 'YYYY-MM-DD HH:mm:ss').toDate()

      let diff = $moment(delta)

      if (diff.hours() > 0 || !hideHoursIfZero) {
        return diff.format('HH:mm:ss')
      } else {
        return diff.format('mm:ss')
      }
    } else {
      return '00:00:00'
    }
  }
}

export default {
  setCookie (key, value) {
    let oneYearFromNow = new Date()
    oneYearFromNow.setTime(oneYearFromNow.getTime() + 365 * 24 * 60 * 60 * 1000)

    document.cookie = key + '=' + value + '; expires=' + oneYearFromNow.toUTCString()
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
  }
}

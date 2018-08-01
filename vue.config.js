// https://github.com/vuejs/vue-cli/blob/dev/docs/config/README.md
// https://www.jakelprice.com/article/vuejs-and-cordova-file-not-supported-a-workaround

module.exports = {
  pluginOptions: {
    enableInSFC: false,
  },

  baseUrl: '',
  outputDir: './www',
  assetsDir: undefined,
  runtimeCompiler: true,
  productionSourceMap: undefined,
  parallel: undefined,
  css: undefined,

  pwa: {
    name: 'Ikiliptus'
  }
}

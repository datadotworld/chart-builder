const { defineConfig } = require('cypress')

module.exports = defineConfig({
  blockHosts: ['*.google-analytics.com', '*.mxpnl.com'],

  hosts: {
    'api.data.world': '127.0.0.1'
  },

  reporter: 'junit',

  reporterOptions: {
    mochaFile: 'cypress/junit-results/my-test-output.xml',
    toConsole: true
  },

  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:3500'
  },

  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack'
    }
  }
})

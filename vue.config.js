const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  devServer: {
    host: '0.0.0.0',
    // https:true,
    port: 80,
    historyApiFallback: true,
    allowedHosts: "all"
  }
})
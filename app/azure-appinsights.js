const appInsights = require('applicationinsights')
const applicationVersion = require('./application-version')

const { packageData, buildNumber } = applicationVersion
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  // eslint-disable-next-line no-console
  console.log('Enabling azure application insights')
  appInsights.setup().setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C).start()
  appInsights.defaultClient.context.tags['ai.cloud.role'] = packageData.name
  appInsights.defaultClient.context.tags['ai.application.ver'] = buildNumber
  module.exports = appInsights.defaultClient
} else {
  module.exports = null
}

const config = require('../../../config')
const requestPromise = require('request-promise')

const SERVICE = 'assisted-prison-visits'
const CHANNEL = 'digital'
const DATA_TYPE = 'transactions-by-channel'
const PERIOD = 'day'

module.exports = function (startOfDayDate, submittedClaimCount) {
  var timestamp = startOfDayDate.toJSON()

  var payload = {
    _id: getId(timestamp),
    _timestamp: timestamp,
    service: SERVICE,
    channel: CHANNEL,
    count: submittedClaimCount,
    dataType: DATA_TYPE,
    period: PERIOD
  }

  var options = {
    method: 'POST',
    uri: config.PERFORMANCE_PLATFORM_URL,
    body: payload,
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${config.PERFORMANCE_PLATFORM_BEARER_TOKEN}`
    },
    json: true
  }

  return requestPromise(options)
}

function getId (timestamp) {
  return Buffer.from(`${timestamp}-${SERVICE}-${PERIOD}-${DATA_TYPE}-${CHANNEL}`).toString('base64')
}

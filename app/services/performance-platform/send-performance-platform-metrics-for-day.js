const config = require('../../../config')
const axios = require('axios')

const SERVICE = 'assisted-prison-visits'
const CHANNEL = 'digital'
const DATA_TYPE = 'transactions-by-channel'
const PERIOD = 'day'

module.exports = function (startOfDayDate, submittedClaimCount) {
  const timestamp = startOfDayDate.toJSON()

  const payload = {
    _id: getId(timestamp),
    _timestamp: timestamp,
    service: SERVICE,
    channel: CHANNEL,
    count: submittedClaimCount,
    dataType: DATA_TYPE,
    period: PERIOD
  }

  const options = {
    method: 'POST',
    url: config.PERFORMANCE_PLATFORM_URL,
    data: payload,
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${config.PERFORMANCE_PLATFORM_BEARER_TOKEN}`
    }
  }

  return axios(options)
}

function getId (timestamp) {
  return Buffer.from(`${timestamp}-${SERVICE}-${PERIOD}-${DATA_TYPE}-${CHANNEL}`).toString('base64')
}

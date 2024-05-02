const moment = require('moment')
const updateTopupsProcessedPayment = require('../../../data/update-topups-processed-payment')

module.exports = function updateAllTopupsProcessedPayment(claimIds) {
  const promises = []

  const now = moment().format('YYYY-MM-DD HH:mm:ss.SSS')
  if (claimIds) {
    for (let i = 0; i < claimIds.length; i += 1) {
      const claimId = claimIds[i]
      promises.push(updateTopupsProcessedPayment(claimId, now))
    }
  }

  return Promise.all(promises)
}

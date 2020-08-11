const updateTopupsProcessedPayment = require('../../data/update-topups-processed-payment')
const moment = require('moment')

module.exports = function updateAllTopupsProcessedPayment (claimIds) {
  var promises = []

  var now = moment().format('YYYY-MM-DD HH:mm:ss.SSS')
  if (claimIds) {
    for (var i = 0; i < claimIds.length; i++) {
      var claimId = claimIds[i]
      promises.push(updateTopupsProcessedPayment(claimId, now))
    }
  }

  return Promise.all(promises)
}

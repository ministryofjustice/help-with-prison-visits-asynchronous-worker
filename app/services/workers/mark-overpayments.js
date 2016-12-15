const config = require('../../../config')
const moment = require('moment')
const getAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmount = require('../data/get-advance-claims-over-specified-date-and-claim-expense-amount')
const updateOverpaymentStatus = require('../data/update-overpayment-status')
const Promise = require('bluebird')

module.exports.execute = function () {
  var date = moment().subtract(config.MARK_AS_OVERPAYMENT_DAYS, 'd').toDate()
  return getAdvanceClaimsOverSpecifiedDateAndClaimExpenseAmount(date, 'APPROVED')
    .then(function (claims) {
      return updateAllAdvanceClaimThatAreOverpaid(claims)
    })
}

function updateAllAdvanceClaimThatAreOverpaid (claims) {
  var promises = []

  claims.forEach(function (claim) {
    promises.push(updateIndividualStatusToOverpaid(claim))
  })

  return Promise.all(promises)
}

function updateIndividualStatusToOverpaid (claim) {
  return updateOverpaymentStatus(claim.ClaimId, claim.Reference, claim.Amount, config.MARK_AS_OVERPAYMENT_DAYS)
}

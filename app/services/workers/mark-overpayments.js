const config = require('../../../config')
const dateFormatter = require('../date-formatter')
const getAdvanceClaimsTotalExpenseApprovedCostBeforeDate = require('../data/get-advance-claims-total-expense-approved-cost-before-date')
const updateOverpaymentStatus = require('../data/update-overpayment-status')
const log = require('../log')

const markOverpayments = () => {
  log.info('Mark overpayments')
  const date = dateFormatter.now().subtract(config.MARK_AS_OVERPAYMENT_DAYS, 'd').toDate()
  return getAdvanceClaimsTotalExpenseApprovedCostBeforeDate(date, 'APPROVED').then(claims => {
    return updateAllAdvanceClaimThatAreOverpaid(claims)
  })
}

function updateAllAdvanceClaimThatAreOverpaid(claims) {
  const promises = []

  claims.forEach(claim => {
    promises.push(updateIndividualStatusToOverpaid(claim))
  })

  return Promise.all(promises)
}

function updateIndividualStatusToOverpaid(claim) {
  return updateOverpaymentStatus(claim.ClaimId, claim.Reference, claim.Amount, config.MARK_AS_OVERPAYMENT_DAYS)
}

module.exports = {
  markOverpayments,
}

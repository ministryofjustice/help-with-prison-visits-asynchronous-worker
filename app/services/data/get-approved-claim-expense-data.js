const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (claimId) {
  var claimExpenses

  // Get all Claim expenses from database for specified claim id
  return knex('IntSchema.ClaimExpense')
    .where('IntSchema.ClaimExpense.ClaimId', claimId)
    .then(function (claimExpenseData) {
      claimExpenses = claimExpenseData

      return getClaimantData(claimId)
    })
    .then(function (visitorData) {
      return {
        claimantData: visitorData,
        claimExpenseData: claimExpenses
      }
    })
}

function getClaimantData (claimId) {
  var visitor

  return knex('IntSchema.Visitor')
    .join('IntSchema.Claim', 'IntSchema.Visitor.EligibilityId', '=', 'IntSchema.Claim.EligibilityId')
    .where('IntSchema.Claim.ClaimId', claimId)
    .select('FirstName', 'Note')
    .first()
    .then(function (visitorData) {
      visitor = visitorData
    })
    .then(function () {
      return knex('IntSchema.ClaimBankDetail')
        .where('ClaimId', claimId)
        .first()
    })
    .then(function (bankDetails) {
      var accountNumberLastFourDigits = (bankDetails && bankDetails.AccountNumber
        ? bankDetails.AccountNumber.substr(bankDetails.AccountNumber.length - 4)
        : '')
      var visitorFirstName = (visitor && visitor.FirstName
        ? visitor.FirstName
        : '')
      var caseworkerNote = (visitor && visitor.Note
        ? visitor.Note
        : '')

      return {
        'VisitorFirstName': visitorFirstName,
        'AccountNumberLastFourDigits': accountNumberLastFourDigits,
        'CaseworkerNote': caseworkerNote
      }
    })
}

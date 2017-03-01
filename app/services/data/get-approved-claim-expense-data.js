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
    .join('IntSchema.Prisoner', 'IntSchema.Visitor.EligibilityId', '=', 'IntSchema.Prisoner.EligibilityId')
    .where('IntSchema.Claim.ClaimId', claimId)
    .select('Visitor.FirstName AS FirstName', 'Note', 'PaymentMethod', 'Town', 'NameOfPrison')
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
      var paymentMethod = (visitor && visitor.PaymentMethod
        ? visitor.PaymentMethod
        : '')
      var caseworkerNote = (visitor && visitor.Note
        ? visitor.Note
        : '')
      var town = (visitor && visitor.Town
        ? visitor.Town
        : '')
      var prison = (visitor && visitor.NameOfPrison
        ? visitor.NameOfPrison
        : '')

      return {
        'VisitorFirstName': visitorFirstName,
        'PaymentMethod': paymentMethod,
        'AccountNumberLastFourDigits': accountNumberLastFourDigits,
        'CaseworkerNote': caseworkerNote,
        'Town': town,
        'Prison': prison
      }
    })
}

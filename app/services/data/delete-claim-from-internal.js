const Promise = require('bluebird')
const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (eligibilityId, claimId, deleteEligibility) {
  return Promise.all([
    deleteInternal('ClaimEscort', 'ClaimId', claimId),
    deleteInternal('ClaimDeduction', 'ClaimId', claimId),
    deleteInternal('ClaimEvent', 'ClaimId', claimId),
    deleteInternal('ClaimChild', 'ClaimId', claimId),
    deleteInternal('ClaimBankDetail', 'ClaimId', claimId)])
    .then(function () {
      return deleteInternal('ClaimDocument', 'ClaimId', claimId) // Events reference ClaimDocumentId
    })
    .then(function () {
      return deleteInternal('ClaimExpense', 'ClaimId', claimId) // Documents reference ClaimExpenseId
    })
    .then(function () {
      return deleteInternal('Claim', 'ClaimId', claimId)
    })
    .then(function () {
      if (deleteEligibility) {
        return Promise.all([
          deleteInternal('ClaimDocument', 'EligibilityId', eligibilityId),
          deleteInternal('Visitor', 'EligibilityId', eligibilityId),
          deleteInternal('Prisoner', 'EligibilityId', eligibilityId),
          deleteInternal('Benefit', 'EligibilityId', eligibilityId)])
          .then(function () {
            return deleteInternal('Eligibility', 'EligibilityId', eligibilityId)
          })
      } else {
        return Promise.resolve()
      }
    })
}

function deleteInternal (table, column, value) {
  return knex(`IntSchema.${table}`).where(column, value).del()
}

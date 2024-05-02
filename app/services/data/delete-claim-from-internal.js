const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (eligibilityId, claimId, deleteEligibility) {
  return Promise.all([
    deleteInternal('ClaimEscort', 'ClaimId', claimId),
    deleteInternal('ClaimDeduction', 'ClaimId', claimId),
    deleteInternal('ClaimEvent', 'ClaimId', claimId),
    deleteInternal('ClaimChild', 'ClaimId', claimId),
    deleteInternal('ClaimBankDetail', 'ClaimId', claimId),
  ])
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
          deleteInternal('EligibleChild', 'EligibilityId', eligibilityId),
          deleteInternal('Benefit', 'EligibilityId', eligibilityId),
        ]).then(function () {
          return deleteInternal('Eligibility', 'EligibilityId', eligibilityId)
        })
      }
      return Promise.resolve()
    })
}

function deleteInternal(table, column, value) {
  const db = getDatabaseConnector()

  return db(`IntSchema.${table}`).where(column, value).del()
}

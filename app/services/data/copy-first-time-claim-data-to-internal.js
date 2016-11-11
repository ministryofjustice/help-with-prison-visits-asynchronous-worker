const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../constants/status-enum')

module.exports = function (data) {
  var newEligibilityId
  var newClaimId

  // Delete Ids and non-IntSchema columns from ExtSchema data
  delete data.Eligibility.EligibilityId
  data.Eligibility.Status = statusEnum.NEW

  return knex('IntSchema.Eligibility').insert(data.Eligibility).returning('EligibilityId')
    .then(function (insertedEligibilityIds) {
      newEligibilityId = insertedEligibilityIds[0]

      delete data.Claim.ClaimId
      delete data.Claim.Reference
      data.Claim.EligibilityId = newEligibilityId
      data.Claim.Status = statusEnum.NEW

      return knex('IntSchema.Claim').insert(data.Claim).returning('ClaimId')
    })
    .then(function (insertedClaimIds) {
      newClaimId = insertedClaimIds[0]

      delete data.ClaimBankDetail.ClaimBankDetailId
      data.ClaimBankDetail.ClaimId = newClaimId

      return knex('IntSchema.ClaimBankDetail').insert(data.ClaimBankDetail)
    })
    .then(function () {
      data.ClaimExpenses.forEach(function (claimExpense) {
        delete claimExpense.ClaimExpenseId
        delete claimExpense.IsEnabled
        claimExpense.ClaimId = newClaimId
        claimExpense.Cost = parseFloat(claimExpense.Cost).toFixed(2)
      })

      return knex('IntSchema.ClaimExpense').insert(data.ClaimExpenses)
    })
    .then(function () {
      data.ClaimChildren.forEach(function (claimChild) {
        delete claimChild.ClaimChildId
        delete claimChild.IsEnabled
        claimChild.ClaimId = newClaimId
      })

      return knex('IntSchema.ClaimChild').insert(data.ClaimChildren)
    })
    .then(function () {
      data.ClaimDocument.forEach(function (claimDocument) {
        delete claimDocument.ClaimDocumentId
        claimDocument.ClaimId = newClaimId
      })

      return knex('IntSchema.ClaimDocument').insert(data.ClaimDocument)
    })
    .then(function () {
      delete data.Visitor.VisitorId
      delete data.Visitor.Reference
      data.Visitor.EligibilityId = newEligibilityId

      return knex('IntSchema.Visitor').insert(data.Visitor)
    })
    .then(function () {
      delete data.Prisoner.PrisonerId
      delete data.Prisoner.Reference
      data.Prisoner.EligibilityId = newEligibilityId

      return knex('IntSchema.Prisoner').insert(data.Prisoner)
    })
    .then(function () {
      return newClaimId
    })
}

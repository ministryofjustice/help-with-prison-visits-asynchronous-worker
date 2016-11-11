const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (reference, claimId) {
  return knex('ExtSchema.ClaimBankDetail').where('ClaimId', claimId).del()
    .then(function () {
      return knex('ExtSchema.ClaimDocument').where('ClaimId', claimId).del()
    })
    .then(function () {
      return knex('ExtSchema.ClaimExpense').where('ClaimId', claimId).del()
    })
    .then(function () {
      return knex('ExtSchema.ClaimChild').where('ClaimId', claimId).del()
    })
    .then(function () {
      return knex('ExtSchema.Claim').where('ClaimId', claimId).del()
    })
    .then(function () {
      return knex('ExtSchema.Visitor').where('Reference', reference).del()
    })
    .then(function () {
      return knex('ExtSchema.Prisoner').where('Reference', reference).del()
    })
    .then(function () {
      return knex('ExtSchema.Eligibility').where('Reference', reference).del()
    })
}

const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../constants/status-enum')

module.exports = function (data) {
  return copyEligibilityDataIfPresent(data)
    .then(function () { return copyClaimData(data) })
}

function copyEligibilityDataIfPresent (data) {
  if (data.Eligibility) {
    data.Eligibility.Status = statusEnum.NEW

    return knex('IntSchema.Eligibility').insert(data.Eligibility)
      .then(function () {
        return knex('IntSchema.Visitor').insert(data.Visitor)
      })
      .then(function () {
        return knex('IntSchema.Prisoner').insert(data.Prisoner)
      })
  } else {
    return Promise.resolve()
  }
}

function copyClaimData (data) {
  data.Claim.Status = statusEnum.NEW
  data.ClaimDocument.forEach(function (document) {
    if (document.DocumentStatus !== 'uploaded') {
      data.Claim.Status = statusEnum.PENDING
    }
  })

  return knex('IntSchema.Claim').insert(data.Claim)
    .then(function () {
      return knex('IntSchema.ClaimBankDetail').insert(data.ClaimBankDetail)
    })
    .then(function () {
      data.ClaimExpenses.forEach(function (claimExpense) {
        claimExpense.Cost = parseFloat(claimExpense.Cost).toFixed(2)
      })
      return knex('IntSchema.ClaimExpense').insert(data.ClaimExpenses)
    })
    .then(function () {
      return knex('IntSchema.ClaimChild').insert(data.ClaimChildren)
    })
    .then(function () {
      return knex('IntSchema.ClaimDocument').insert(data.ClaimDocument)
    })
}

const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../constants/status-enum')
const paymentMethodEnum = require('../../constants/payment-method-enum')
const claimEventEnum = require('../../constants/claim-event-enum')
const insertClaimEvent = require('./insert-claim-event')
const updateContactDetails = require('./update-contact-details')

module.exports = function (data, additionalData) {
  return copyEligibilityDataIfPresent(data)
    .then(function () { return copyClaimData(data, additionalData) })
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

function copyClaimData (data, additionalData) {
  data.Claim.Status = statusEnum.NEW
  data.ClaimDocument.forEach(function (document) {
    if (document.DocumentStatus !== 'uploaded') {
      data.Claim.Status = statusEnum.PENDING
    }
  })

  return knex('IntSchema.Claim').insert(data.Claim)
    .then(function () {
      if (data.Claim.PaymentMethod !== paymentMethodEnum.PAYOUT.value) {
        return knex('IntSchema.ClaimBankDetail').insert(data.ClaimBankDetail)
      } else {
        return Promise.resolve()
      }
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
    .then(function () {
      return knex('IntSchema.ClaimEscort').insert(data.ClaimEscort)
    })
    .then(function () {
      return insertClaimEvent(data.Claim.Reference, data.Claim.EligibilityId, data.Claim.ClaimId, null, claimEventEnum.CLAIM_SUBMITTED.value, additionalData, null, true)
    })
    .then(function () {
      if (data.EligibilityVisitorUpdateContactDetail) {
        return insertClaimEvent(data.Claim.Reference, data.Claim.EligibilityId, data.Claim.ClaimId, null, claimEventEnum.CONTACT_DETAILS_UPDATED.value, null, null, true)
          .then(function () {
            return updateContactDetails(data.EligibilityVisitorUpdateContactDetail)
          })
      }
    })
}

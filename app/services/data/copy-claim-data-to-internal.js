const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../constants/status-enum')
const paymentMethodEnum = require('../../constants/payment-method-enum')
const claimEventEnum = require('../../constants/claim-event-enum')
const insertClaimEvent = require('./insert-claim-event')
const updateContactDetails = require('./update-contact-details')
const log = require('../log')

module.exports = function (data, additionalData) {
  return knex.transaction(function (trx) {
    return copyEligibilityDataIfPresent(data, trx)
      .then(function () { return copyClaimData(data, additionalData, trx) })
  })
  .then(function () {
    log.info(`Claim with ${data.Claim.ClaimId} copied to internal`)
  })
  .catch(function(error) {
    log.error(`ERROR copying claim with ${data.Claim.ClaimId} to internal`)
    throw error
  })
}

function copyEligibilityDataIfPresent (data, trx) {
  if (data.Eligibility) {
    data.Eligibility.Status = statusEnum.NEW
    return knex('IntSchema.Eligibility').insert(data.Eligibility).transacting(trx)
      .then(function () {
        return knex('IntSchema.Visitor').insert(data.Visitor).transacting(trx)
      })
      .then(function () {
        return knex('IntSchema.Prisoner').insert(data.Prisoner).transacting(trx)
      })
      .then(function () {
        return knex('IntSchema.Benefit').insert(data.Benefit).transacting(trx)
      })
  } else {
    return Promise.resolve()
  }
}

function copyClaimData (data, additionalData, trx) {
  data.Claim.Status = statusEnum.NEW
  data.ClaimDocument.forEach(function (document) {
    if (document.DocumentStatus !== 'uploaded') {
      data.Claim.Status = statusEnum.PENDING
    }
  })

  return knex('IntSchema.Claim').insert(data.Claim).transacting(trx)
    .then(function () {
      if (data.Claim.PaymentMethod !== paymentMethodEnum.PAYOUT.value) {
        return knex('IntSchema.ClaimBankDetail').insert(data.ClaimBankDetail).transacting(trx)
      } else {
        return Promise.resolve()
      }
    })
    .then(function () {
      data.ClaimExpenses.forEach(function (claimExpense) {
        claimExpense.Cost = parseFloat(claimExpense.Cost).toFixed(2)
      })
      return knex('IntSchema.ClaimExpense').insert(data.ClaimExpenses).transacting(trx)
    })
    .then(function () {
      return knex('IntSchema.ClaimChild').insert(data.ClaimChildren).transacting(trx)
    })
    .then(function () {
      return knex('IntSchema.ClaimDocument').insert(data.ClaimDocument).transacting(trx)
    })
    .then(function () {
      return knex('IntSchema.ClaimEscort').insert(data.ClaimEscort).transacting(trx)
    })
    .then(function () {
      return insertClaimEvent(data.Claim.Reference, data.Claim.EligibilityId, data.Claim.ClaimId, null, claimEventEnum.CLAIM_SUBMITTED.value, additionalData, null, true).transacting(trx)
    })
    .then(function () {
      if (data.EligibilityVisitorUpdateContactDetail) {
        return insertClaimEvent(data.Claim.Reference, data.Claim.EligibilityId, data.Claim.ClaimId, null, claimEventEnum.CONTACT_DETAILS_UPDATED.value, null, null, true).transacting(trx)
          .then(function () {
            return updateContactDetails(data.EligibilityVisitorUpdateContactDetail).transacting(trx)
          })
          .then(trx.commit)
          .catch(trx.rollback)
      }
    })
}

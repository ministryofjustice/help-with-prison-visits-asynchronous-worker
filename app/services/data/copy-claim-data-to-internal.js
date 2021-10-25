const statusEnum = require('../../constants/status-enum')
const paymentMethodEnum = require('../../constants/payment-method-enum')
const claimEventEnum = require('../../constants/claim-event-enum')
const insertClaimEvent = require('./insert-claim-event')
const updateContactDetails = require('./update-contact-details')

module.exports = function (data, additionalData, trx) {
  return copyEligibilityDataIfPresent(data, trx)
    .then(function () { return copyClaimData(data, additionalData, trx) })
}

function copyEligibilityDataIfPresent (data, trx) {
  if (data.Eligibility) {
    data.Eligibility.Status = statusEnum.NEW
    return trx('IntSchema.Eligibility').insert(data.Eligibility)
      .then(function () {
        return trx('IntSchema.Visitor').insert(data.Visitor)
      })
      .then(function () {
        return trx('IntSchema.Prisoner').insert(data.Prisoner)
      })
      .then(function () {
        if (data.EligibleChild && data.EligibleChild.length > 0) {
          return trx('IntSchema.EligibleChild').insert(data.EligibleChild)
        } else {
          return Promise.resolve()
        }
      })
      .then(function () {
        if (data.Benefit) {
          return trx('IntSchema.Benefit').insert(data.Benefit)
        } else {
          return Promise.resolve()
        }
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

  return trx('IntSchema.Claim').insert(data.Claim)
    .then(function () {
      if (data.Claim.PaymentMethod !== paymentMethodEnum.PAYOUT.value) {
        return trx('IntSchema.ClaimBankDetail').insert(data.ClaimBankDetail)
      } else {
        return Promise.resolve()
      }
    })
    .then(function () {
      data.ClaimExpenses.forEach(function (claimExpense) {
        claimExpense.Cost = parseFloat(claimExpense.Cost).toFixed(2)
      })
      if (data.ClaimExpenses.length > 0) {
        return trx('IntSchema.ClaimExpense').insert(data.ClaimExpenses)
      } else {
        return Promise.resolve()
      }
    })
    .then(function () {
      if (data.ClaimChildren.length > 0) {
        return trx('IntSchema.ClaimChild').insert(data.ClaimChildren)
      } else {
        return Promise.resolve()
      }
    })
    .then(function () {
      if (data.ClaimDocument.length > 0) {
        return trx('IntSchema.ClaimDocument').insert(data.ClaimDocument)
      } else {
        return Promise.resolve()
      }
    })
    .then(function () {
      if (data.ClaimEscort && data.ClaimEscort.length > 0) {
        return trx('IntSchema.ClaimEscort').insert(data.ClaimEscort)
      } else {
        return Promise.resolve()
      }
    })
    .then(function () {
      return insertClaimEvent(data.Claim.Reference, data.Claim.EligibilityId, data.Claim.ClaimId, null, claimEventEnum.CLAIM_SUBMITTED.value, additionalData, null, true, trx)
    })
    .then(function () {
      if (data.EligibilityVisitorUpdateContactDetail) {
        return insertClaimEvent(data.Claim.Reference, data.Claim.EligibilityId, data.Claim.ClaimId, null, claimEventEnum.CONTACT_DETAILS_UPDATED.value, null, null, true, trx)
          .then(function () {
            return updateContactDetails(data.EligibilityVisitorUpdateContactDetail, trx)
          })
      }
    })
}

const statusEnum = require('../../constants/status-enum')
const paymentMethodEnum = require('../../constants/payment-method-enum')
const claimEventEnum = require('../../constants/claim-event-enum')
const insertClaimEvent = require('./insert-claim-event')
const updateContactDetails = require('./update-contact-details')

module.exports = (data, additionalData, trx) => {
  return copyEligibilityDataIfPresent(data, trx).then(() => {
    return copyClaimData(data, additionalData, trx)
  })
}

function copyEligibilityDataIfPresent(data, trx) {
  if (data.Eligibility) {
    data.Eligibility.Status = statusEnum.NEW
    return trx('IntSchema.Eligibility')
      .insert(data.Eligibility)
      .then(() => {
        return trx('IntSchema.Visitor').insert(data.Visitor)
      })
      .then(() => {
        return trx('IntSchema.Prisoner').insert(data.Prisoner)
      })
      .then(() => {
        if (data.EligibleChild && data.EligibleChild.length > 0) {
          return trx('IntSchema.EligibleChild').insert(data.EligibleChild)
        }
        return Promise.resolve()
      })
      .then(() => {
        if (data.Benefit) {
          return trx('IntSchema.Benefit').insert(data.Benefit)
        }
        return Promise.resolve()
      })
  }
  return Promise.resolve()
}

function copyClaimData(data, additionalData, trx) {
  data.Claim.Status = statusEnum.NEW
  data.ClaimDocument.forEach(document => {
    if (document.DocumentStatus !== 'uploaded') {
      data.Claim.Status = statusEnum.PENDING
    }
  })

  return trx('IntSchema.Claim')
    .insert(data.Claim)
    .then(() => {
      if (data.Claim.PaymentMethod !== paymentMethodEnum.PAYOUT.value) {
        return trx('IntSchema.ClaimBankDetail').insert(data.ClaimBankDetail)
      }
      return Promise.resolve()
    })
    .then(() => {
      data.ClaimExpenses.forEach(claimExpense => {
        claimExpense.Cost = parseFloat(claimExpense.Cost).toFixed(2)
      })
      if (data.ClaimExpenses.length > 0) {
        return trx('IntSchema.ClaimExpense').insert(data.ClaimExpenses)
      }
      return Promise.resolve()
    })
    .then(() => {
      if (data.ClaimChildren.length > 0) {
        return trx('IntSchema.ClaimChild').insert(data.ClaimChildren)
      }
      return Promise.resolve()
    })
    .then(() => {
      if (data.ClaimDocument.length > 0) {
        return trx('IntSchema.ClaimDocument').insert(data.ClaimDocument)
      }
      return Promise.resolve()
    })
    .then(() => {
      if (data.ClaimEscort && data.ClaimEscort.length > 0) {
        return trx('IntSchema.ClaimEscort').insert(data.ClaimEscort)
      }
      return Promise.resolve()
    })
    .then(() => {
      return insertClaimEvent(
        data.Claim.Reference,
        data.Claim.EligibilityId,
        data.Claim.ClaimId,
        null,
        claimEventEnum.CLAIM_SUBMITTED.value,
        additionalData,
        null,
        true,
        trx,
      )
    })
    .then(() => {
      if (data.EligibilityVisitorUpdateContactDetail) {
        return insertClaimEvent(
          data.Claim.Reference,
          data.Claim.EligibilityId,
          data.Claim.ClaimId,
          null,
          claimEventEnum.CONTACT_DETAILS_UPDATED.value,
          null,
          null,
          true,
          trx,
        ).then(() => {
          return updateContactDetails(data.EligibilityVisitorUpdateContactDetail, trx)
        })
      }
      return Promise.resolve()
    })
}

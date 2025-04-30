const config = require('../../../config')
const sendNotification = require('../notify/send-notification')
const getApprovedClaimExpenseData = require('../data/get-approved-claim-expense-data')
const getEnabledClaimDeductions = require('../data/get-enabled-claim-deductions')
const getApprovedClaimDetailsString = require('../notify/helpers/get-approved-claim-details-string')
const prisonsEnum = require('../../constants/prisons-enum')
const enumHelper = require('../../constants/helpers/enum-helper')
const paymentMethodEnum = require('../../constants/payment-method-enum')

module.exports.execute = task => {
  const { claimId } = task
  const { reference } = task
  let claimExpenseData
  let claimantData

  return getApprovedClaimExpenseData(claimId)
    .then(expenseData => {
      claimExpenseData = expenseData.claimExpenseData
      claimantData = expenseData.claimantData

      return getEnabledClaimDeductions(claimId)
    })
    .then(claimDeductions => {
      const firstName = claimantData.VisitorFirstName || ''
      const accountLastFourDigits = claimantData.AccountNumberLastFourDigits || ''
      const caseworkerNote = claimantData.CaseworkerNote || ''
      const paymentMethod = claimantData.PaymentMethod || ''
      const isAdvanceClaim = claimantData.IsAdvanceClaim
      const town = claimantData.Town || ''
      const prison = claimantData.Prison ? enumHelper.getKeyByValue(prisonsEnum, claimantData.Prison).displayName : ''

      const personalisation = standardPersonalisationElements(firstName, reference, town, prison, caseworkerNote)
      let emailTemplateId

      if (paymentMethod === paymentMethodEnum.DIRECT_BANK_PAYMENT.value) {
        personalisation.account_last_four_digits = accountLastFourDigits
        if (isAdvanceClaim) {
          emailTemplateId = config.NOTIFY_ACCEPTED_CLAIM_ADVANCE_BANK_EMAIL_TEMPLATE_ID
        } else {
          personalisation.claim_details = getApprovedClaimDetailsString(claimExpenseData, claimDeductions)
          personalisation.approved_amount = getTotalApprovedAmount(claimExpenseData, claimDeductions)
          emailTemplateId = config.NOTIFY_ACCEPTED_CLAIM_BANK_EMAIL_TEMPLATE_ID
        }
      } else if (paymentMethod === paymentMethodEnum.PAYOUT.value) {
        if (isAdvanceClaim) {
          emailTemplateId = config.NOTIFY_ACCEPTED_CLAIM_ADVANCE_PAYOUT_EMAIL_TEMPLATE_ID
        } else {
          personalisation.claim_details = getApprovedClaimDetailsString(claimExpenseData, claimDeductions)
          personalisation.approved_amount = getTotalApprovedAmount(claimExpenseData, claimDeductions)
          emailTemplateId = config.NOTIFY_ACCEPTED_CLAIM_PAYOUT_EMAIL_TEMPLATE_ID
        }
      } else if (paymentMethod === paymentMethodEnum.MANUALLY_PROCESSED.value) {
        emailTemplateId = config.NOTIFY_ACCEPTED_CLAIM_MANUAL_EMAIL_TEMPLATE_ID
      } else {
        return Promise.reject(new Error('No payment method found'))
      }

      const emailAddress = task.additionalData
      return sendNotification(emailTemplateId, emailAddress, personalisation)
    })
}

function getTotalApprovedAmount(claimExpenses, claimDeductions) {
  let totalApprovedAmount = 0

  claimExpenses.forEach(claimExpense => {
    totalApprovedAmount += claimExpense.ApprovedCost
  })

  claimDeductions.forEach(claimDeduction => {
    totalApprovedAmount -= claimDeduction.Amount
  })

  return `£${totalApprovedAmount.toFixed(2)}`
}

function formatCaseworkerNote(caseworkerNote) {
  if (caseworkerNote) {
    const result = []
    const newLine = '\r\n'

    // Extra new line at start and end to create gap between note and adjacent sections
    result.push(newLine)
    result.push('Note from case worker:')
    result.push(`"${caseworkerNote}"`)
    result.push(newLine)

    return result.join(newLine)
  }
  return ''
}

function standardPersonalisationElements(firstName, reference, town, prison, caseworkerNote) {
  return {
    first_name: firstName,
    reference,
    start_town: town,
    prison,
    caseworker_note: formatCaseworkerNote(caseworkerNote),
  }
}

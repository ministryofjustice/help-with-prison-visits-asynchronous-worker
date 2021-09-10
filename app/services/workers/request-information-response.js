const moveClaimDocumentsToInternal = require('../data/move-claim-documents-to-internal')
const getAllClaimData = require('../data/get-all-claim-data')
const updateClaimStatus = require('../data/update-claim-status')
const insertClaimEvent = require('../data/insert-claim-event')
const updateBankDetails = require('../data/update-bank-details')
const generateClaimUpdatedString = require('../notify/helpers/generate-claim-updated-string')
const autoApprovalProcess = require('../auto-approval/auto-approval-process')
const getVisitorEmailAddress = require('../data/get-visitor-email-address')
const insertTask = require('../data/insert-task')
const tasksEnum = require('../../constants/tasks-enum')
const statusEnum = require('../../constants/status-enum')
const claimEventEnum = require('../../constants/claim-event-enum')
const paymentMethodEnum = require('../../constants/payment-method-enum')
const transactionHelper = require('./helpers/transaction-helper')
const log = require('../log')

module.exports.execute = function (task) {
  const reference = task.reference
  const eligibilityId = task.eligibilityId
  const claimId = task.claimId
  const note = task.additionalData
  let updatedDocuments
  let status
  let originalStatus
  let claimBankDetailId

  return moveClaimDocumentsToInternal(reference, eligibilityId, claimId)
    .then(function (newDocuments) { updatedDocuments = newDocuments })
    .then(function () {
      log.info('getAllClaimData')
      return getAllClaimData('IntSchema', reference, eligibilityId, claimId)
    })
    .then(function (claimData) {
      status = getStatusForUpdatedClaim(claimData)
      originalStatus = claimData.Claim.Status
      if (claimData.Claim.PaymentMethod === paymentMethodEnum.DIRECT_BANK_PAYMENT.value) {
        claimBankDetailId = claimData.ClaimBankDetail.ClaimBankDetailId
      }
    })
    .then(function () {
      log.info('updateBankDetailsAndRemoveOldFromExternal')
      return updateBankDetailsAndRemoveOldFromExternal(reference, eligibilityId, claimId, originalStatus, claimBankDetailId)
    })
    .then(function () {
      log.info('updateClaimStatus')
      return updateClaimStatus(claimId, status)
    })
    .then(function () {
      log.info('insertClaimEventForUpdate')
      return insertClaimEventForUpdate(reference, eligibilityId, claimId, updatedDocuments)
    })
    .then(function () {
      log.info('insertClaimEventForNote')
      return insertClaimEventForNote(reference, eligibilityId, claimId, note)
    })
    .then(function () {
      log.info('insertTaskRequestInformationResponseSubmittedNotification')
      return insertTaskRequestInformationResponseSubmittedNotification(reference, eligibilityId, claimId)
    })
    .then(function () {
      log.info('callAutoApprovalIfClaimIsNew')
      return callAutoApprovalIfClaimIsNew(reference, eligibilityId, claimId, status)
    })
}

function getStatusForUpdatedClaim (claimData) {
  if (claimData.Claim.DateReviewed) {
    return statusEnum.UPDATED
  } else {
    return statusEnum.NEW
  }
}

function insertClaimEventForNote (reference, eligibilityId, claimId, note) {
  if (note) {
    return insertClaimEvent(reference, eligibilityId, claimId, null, claimEventEnum.MESSAGE.value, null, note, false)
  } else {
    return Promise.resolve()
  }
}

function insertClaimEventForUpdate (reference, eligibilityId, claimId, updatedDocuments) {
  if (updatedDocuments && updatedDocuments.length > 0) {
    return insertClaimEvent(reference, eligibilityId, claimId, null, claimEventEnum.CLAIM_UPDATED.value, null, generateClaimUpdatedString(updatedDocuments), true)
  } else {
    return Promise.resolve()
  }
}

function callAutoApprovalIfClaimIsNew (reference, eligibilityId, claimId, status) {
  if (status === statusEnum.NEW) {
    return autoApprovalProcess(reference, eligibilityId, claimId)
  } else {
    return Promise.resolve()
  }
}

function updateBankDetailsAndRemoveOldFromExternal (reference, eligibilityId, claimId, status, claimBankDetailId) {
  if (status === statusEnum.REQUEST_INFO_PAYMENT) {
    let newBankDetails
    return getAllClaimData('ExtSchema', reference, eligibilityId, claimId)
      .then(function (claimData) { newBankDetails = claimData.ClaimBankDetail })
      .then(function () { return updateBankDetails(claimBankDetailId, reference, claimId, newBankDetails.SortCode, newBankDetails.AccountNumber, newBankDetails.NameOnAccount, newBankDetails.RollNumber) })
      .then(function () { return insertClaimEvent(reference, eligibilityId, claimId, null, claimEventEnum.BANK_DETAILS_UPDATED.value, null, null, true) })
      .then(function () { return transactionHelper(eligibilityId, claimId) })
  } else {
    return Promise.resolve()
  }
}

function insertTaskRequestInformationResponseSubmittedNotification (reference, eligibilityId, claimId) {
  return getVisitorEmailAddress('IntSchema', reference, eligibilityId)
    .then(function (emailAddress) {
      return insertTask(reference, eligibilityId, claimId, tasksEnum.REQUEST_INFORMATION_RESPONSE_SUBMITTED_NOTIFICATION, emailAddress)
    })
}

const getAllClaimData = require('../data/get-all-claim-data')
const copyClaimDataToInternal = require('../data/copy-claim-data-to-internal')
const deleteClaimFromExternal = require('../data/delete-claim-from-external')
const calculateCarExpenseCosts = require('../distance-checker/calculate-car-expense-costs')
const insertTask = require('../data/insert-task')
const getVisitorEmailAddress = require('../data/get-visitor-email-address')
const tasksEnum = require('../../constants/tasks-enum')
const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const log = require('../log')

module.exports.execute = function (task) {
  var reference = task.reference
  var eligibilityId = task.eligibilityId
  var claimId = task.claimId
  var claimData

  return getAllClaimData('ExtSchema', reference, eligibilityId, claimId)
    .then(function (data) { claimData = data })
    .then(function () {
      return knex.transaction(function (trx) {
        return copyClaimDataToInternal(claimData, task.additionalData, trx)
          .then(function () {
            return deleteClaimFromExternal(eligibilityId, claimId, trx)
          })
      })
      .then(function () {
        log.info(`Claim with ClaimId: ${claimData.Claim.ClaimId} copied to internal`)
      })
      .catch(function (error) {
        log.error(`ERROR copying claim with ClaimId: ${claimData.Claim.ClaimId} to internal`)
        throw error
      })
    })
    .then(function () { return calculateCarExpenseCosts(reference, eligibilityId, claimId) })
    // autoApprovalProcess Removed in APVS0115
    .then(function () { return insertTaskSendClaimNotification(reference, eligibilityId, claimId) })
    .then(function () { return insertTask(reference, eligibilityId, claimId, tasksEnum.DWP_CHECK) })
}

function insertTaskSendClaimNotification (reference, eligibilityId, claimId) {
  return getVisitorEmailAddress('IntSchema', reference, eligibilityId)
    .then(function (emailAddress) {
      return insertTask(reference, eligibilityId, claimId, tasksEnum.SEND_CLAIM_NOTIFICATION, emailAddress)
    })
}
